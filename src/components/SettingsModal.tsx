import React, { useState } from 'react';
import { Settings, Download, Upload, RefreshCw, X, Check, BookOpen, User } from 'lucide-react';
import { AcademicSession, AppSettings, SubjectType } from '../types';
import { StorageService } from '../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onResetData: () => void;
  onImportBackup: (jsonStr: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetData,
  onImportBackup,
}) => {
  const [portalTitle, setPortalTitle] = useState(settings.portalTitle || "Rizwan's Personal Class Paper Portal");
  const [lecturerName, setLecturerName] = useState(settings.lecturerName || 'Rizwan');
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [activeSession, setActiveSession] = useState<AcademicSession>(settings.activeSession);
  const [primarySubject, setPrimarySubject] = useState(settings.primarySubject);
  const [primarySubjectCode, setPrimarySubjectCode] = useState(settings.primarySubjectCode);
  const [primarySubjectType, setPrimarySubjectType] = useState<SubjectType>(settings.primarySubjectType || 'Theory + Lab');

  const [msg, setMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      portalTitle,
      lecturerName,
      academicYear,
      activeSession,
      primarySubject,
      primarySubjectCode,
      primarySubjectType,
      isInitialSetupCompleted: true,
    });
    setMsg('Portal settings saved!');
    setTimeout(() => {
      setMsg('');
      onClose();
    }, 1000);
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rizwan_Paper_Portal_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onImportBackup(content);
      setMsg('Data restored successfully!');
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Personal Portal Configuration</h3>
              <p className="text-xs text-slate-400">Rizwan's Class Paper Preparation Portal Settings</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {msg && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4" /> {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Portal Name / Title *</label>
            <input
              type="text"
              required
              value={portalTitle}
              onChange={(e) => setPortalTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-slate-200 text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Your Name</label>
              <input
                type="text"
                required
                value={lecturerName}
                onChange={(e) => setLecturerName(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-slate-200 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Active Academic Year</label>
              <input
                type="text"
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-slate-200 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Active Session</label>
              <select
                value={activeSession}
                onChange={(e) => setActiveSession(e.target.value as AcademicSession)}
                className="w-full px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-slate-200 text-xs"
              >
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Primary Course</label>
              <input
                type="text"
                required
                value={primarySubject}
                onChange={(e) => setPrimarySubject(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Course Code</label>
              <input
                type="text"
                value={primarySubjectCode}
                onChange={(e) => setPrimarySubjectCode(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-slate-200 text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
            >
              Save Configuration
            </button>
          </div>
        </form>

        {/* Data Management & Backup/Restore Section */}
        <div className="pt-4 border-t border-neutral-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Data Backup & Synchronization
          </h4>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportBackup}
              className="px-3.5 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" /> Export JSON Backup
            </button>

            <label className="px-3.5 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-emerald-400" /> Restore JSON Backup
              <input type="file" accept=".json" className="hidden" onChange={handleImportBackup} />
            </label>

            <button
              onClick={onResetData}
              className="px-3.5 py-2 rounded-2xl bg-neutral-950 border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 text-xs font-semibold flex items-center gap-1.5 ml-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
