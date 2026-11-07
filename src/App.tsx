import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AppSettings, ClassRecord, ExaminationPaper, NotificationItem, PaperStatus, StatusHistoryEntry } from './types';
import { StorageService } from './services/storage';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { ExcelImportView } from './components/ExcelImportView';
import { ClassesView } from './components/ClassesView';
import { PaperManagementView } from './components/PaperManagementView';
import { PendingPapersView } from './components/PendingPapersView';
import { PaperHistoryView } from './components/PaperHistoryView';
import { ReportsView } from './components/ReportsView';
import { SettingsModal } from './components/SettingsModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // App Core State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [classes, setClasses] = useState<ClassRecord[]>(() => StorageService.getClasses());
  const [papers, setPapers] = useState<ExaminationPaper[]>(() => StorageService.getPapers());
  const [history, setHistory] = useState<StatusHistoryEntry[]>(() => StorageService.getHistory());
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // UI Modals & Overlays
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(!settings.isInitialSetupCompleted);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Helper for Toasts
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Ensure papers exist for classes on boot
  useEffect(() => {
    const { updatedPapers } = StorageService.ensurePaperRequirementsForClasses(classes, papers);
    if (updatedPapers.length !== papers.length) {
      setPapers(updatedPapers);
    }
  }, [classes]);

  // Generate automated alerts for pending papers (no duplicates)
  useEffect(() => {
    const activeSessionPapers = papers.filter(
      (p) => p.academicSession === settings.activeSession && p.academicYear === settings.academicYear
    );

    const pendingPapers = activeSessionPapers.filter((p) => p.status === 'Pending' || p.status === 'In Progress');

    const notifs: NotificationItem[] = [];

    if (pendingPapers.length > 0) {
      notifs.push({
        id: `NOTIF_PENDING_${settings.activeSession}_${settings.academicYear}`,
        title: `${pendingPapers.length} Pending Examination Papers`,
        message: `You have ${pendingPapers.length} papers requiring preparation for ${settings.activeSession} ${settings.academicYear}.`,
        type: 'urgent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
      });
    }

    // Check for classes without paper records
    const classesWithoutPapers = classes.filter(
      (c) =>
        c.academicSession === settings.activeSession &&
        c.academicYear === settings.academicYear &&
        !papers.some((p) => p.classId === c.id)
    );

    if (classesWithoutPapers.length > 0) {
      notifs.push({
        id: `NOTIF_UNLINKED_CLASSES_${settings.activeSession}`,
        title: 'Classes Missing Paper Requirements',
        message: `${classesWithoutPapers.length} class section(s) currently have no paper tracking records.`,
        type: 'warning',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
      });
    }

    setNotifications(notifs);
  }, [papers, classes, settings.activeSession, settings.academicYear]);

  // Status Change Handler with History Audit Log & Confetti
  const handleUpdatePaperStatus = (
    paperId: string,
    newStatus: PaperStatus,
    remarks?: string,
    examDate?: string
  ) => {
    const paper = papers.find((p) => p.id === paperId);
    if (!paper) return;

    const prevStatus = paper.status;
    const todayStr = new Date().toISOString().split('T')[0];

    const updatedPaper: ExaminationPaper = {
      ...paper,
      status: newStatus,
      creationDate:
        newStatus === 'Created' || newStatus === 'Reviewed' || newStatus === 'Finalized'
          ? paper.creationDate || todayStr
          : paper.creationDate,
      examinationDate: examDate !== undefined ? examDate : paper.examinationDate,
      remarks: remarks !== undefined ? remarks : paper.remarks,
      lastUpdatedDate: todayStr,
    };

    const newPapers = papers.map((p) => (p.id === paperId ? updatedPaper : p));
    setPapers(newPapers);
    StorageService.savePapers(newPapers);

    // Audit History Entry
    const newHistoryItem: StatusHistoryEntry = {
      id: `HIST_${Date.now()}`,
      paperId,
      fromStatus: prevStatus,
      toStatus: newStatus,
      timestamp: new Date().toISOString(),
      remarks: remarks || `Paper status updated to ${newStatus}.`,
      updatedBy: settings.lecturerName,
    };

    const newHistory = [newHistoryItem, ...history];
    setHistory(newHistory);
    StorageService.saveHistory(newHistory);

    addToast(`Updated ${paper.programName} paper to "${newStatus}"`, 'success');

    // Check if 100% papers are completed and trigger celebratory confetti!
    const activePapers = newPapers.filter(
      (p) => p.academicSession === settings.activeSession && p.academicYear === settings.academicYear
    );
    const completedCount = activePapers.filter(
      (p) => p.status === 'Created' || p.status === 'Reviewed' || p.status === 'Finalized'
    ).length;

    if (activePapers.length > 0 && completedCount === activePapers.length) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      addToast('🎉 Outstanding! All required examination papers are prepared!', 'success');
    }
  };

  // Attachments Handler
  const handleSaveAttachment = (paperId: string, fileName: string) => {
    const newPapers = papers.map((p) => {
      if (p.id === paperId) {
        return {
          ...p,
          attachment: {
            name: fileName,
            size: 1024 * 150,
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            uploadedAt: new Date().toISOString(),
          },
        };
      }
      return p;
    });
    setPapers(newPapers);
    StorageService.savePapers(newPapers);
    addToast(`Attached file "${fileName}"`, 'success');
  };

  // Add Custom Paper
  const handleAddCustomPaperRequirement = (newPaper: ExaminationPaper) => {
    const updated = [newPaper, ...papers];
    setPapers(updated);
    StorageService.savePapers(updated);
    addToast(`Added paper requirement for ${newPaper.programName}`, 'success');
  };

  // Delete Paper
  const handleDeletePaperRequirement = (paperId: string) => {
    const updated = papers.filter((p) => p.id !== paperId);
    setPapers(updated);
    StorageService.savePapers(updated);
    addToast('Paper requirement deleted', 'info');
  };

  // Class Management Handlers
  const handleAddClass = (newClass: ClassRecord) => {
    const updatedClasses = [newClass, ...classes];
    setClasses(updatedClasses);
    StorageService.saveClasses(updatedClasses);

    const { updatedPapers } = StorageService.ensurePaperRequirementsForClasses(updatedClasses, papers);
    setPapers(updatedPapers);

    addToast(`Added class ${newClass.programName} (Sec ${newClass.section})`, 'success');
  };

  const handleUpdateClass = (updatedClass: ClassRecord) => {
    const updatedClasses = classes.map((c) => (c.id === updatedClass.id ? updatedClass : c));
    setClasses(updatedClasses);
    StorageService.saveClasses(updatedClasses);
    addToast(`Updated class ${updatedClass.programName}`, 'success');
  };

  const handleDeleteClass = (classId: string) => {
    const updatedClasses = classes.filter((c) => c.id !== classId);
    const updatedPapers = papers.filter((p) => p.classId !== classId);
    setClasses(updatedClasses);
    setPapers(updatedPapers);
    StorageService.saveClasses(updatedClasses);
    StorageService.savePapers(updatedPapers);
    addToast('Class record and associated papers removed', 'info');
  };

  // Excel Import Handler
  const handleImportCompleted = (newClasses: ClassRecord[]) => {
    setClasses(newClasses);

    const updatedPapers = StorageService.getPapers();
    setPapers(updatedPapers);

    addToast('Excel import complete! Classes & paper requirements updated.', 'success');
  };

  // Settings & Reset
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    addToast('Configuration saved', 'success');
  };

  const handleResetData = () => {
    const res = StorageService.resetToSampleData();
    setSettings(res.settings);
    setClasses(res.classes);
    setPapers(res.papers);
    setHistory(res.history);
    addToast('Reset to default sample dataset', 'info');
  };

  const handleImportBackup = (jsonStr: string) => {
    const ok = StorageService.importFullBackup(jsonStr);
    if (ok) {
      setSettings(StorageService.getSettings());
      setClasses(StorageService.getClasses());
      setPapers(StorageService.getPapers());
      setHistory(StorageService.getHistory());
      addToast('Backup restored successfully!', 'success');
    } else {
      addToast('Failed to parse backup JSON file', 'error');
    }
  };

  // Count active pending papers for sidebar badge
  const pendingCount = papers.filter(
    (p) =>
      p.academicSession === settings.activeSession &&
      p.academicYear === settings.academicYear &&
      (p.status === 'Pending' || p.status === 'In Progress')
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingCount={pendingCount}
        settings={settings}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Layout Wrapper */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <TopHeader
          settings={settings}
          onUpdateSettings={handleSaveSettings}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          notifications={notifications}
          onMarkNotificationRead={(id) =>
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
          }
          onClearNotifications={() => setNotifications([])}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              classes={classes}
              papers={papers}
              settings={settings}
              onNavigateTo={setActiveTab}
              onQuickUpdateStatus={handleUpdatePaperStatus}
            />
          )}

          {activeTab === 'import' && (
            <ExcelImportView settings={settings} onImportCompleted={handleImportCompleted} />
          )}

          {activeTab === 'classes' && (
            <ClassesView
              classes={classes}
              onAddClass={handleAddClass}
              onUpdateClass={handleUpdateClass}
              onDeleteClass={handleDeleteClass}
            />
          )}

          {activeTab === 'papers' && (
            <PaperManagementView
              papers={papers}
              onUpdatePaperStatus={handleUpdatePaperStatus}
              onSaveAttachment={handleSaveAttachment}
              onAddCustomPaperRequirement={handleAddCustomPaperRequirement}
              onDeletePaperRequirement={handleDeletePaperRequirement}
            />
          )}

          {activeTab === 'pending' && (
            <PendingPapersView papers={papers} onUpdatePaperStatus={handleUpdatePaperStatus} />
          )}

          {activeTab === 'history' && <PaperHistoryView history={history} papers={papers} />}

          {activeTab === 'reports' && (
            <ReportsView papers={papers} classes={classes} settings={settings} />
          )}

          {activeTab === 'settings' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-xl font-bold text-slate-100">System Preferences & Settings</h2>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
              >
                Open System Configuration Panel
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        classes={classes}
        papers={papers}
        onSelectPaper={(paper) => {
          setActiveTab('papers');
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetData={handleResetData}
        onImportBackup={handleImportBackup}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
