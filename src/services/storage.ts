import { defaultSettings, sampleClasses, sampleHistory, samplePapers } from '../data/sampleData';
import {
  AcademicSession,
  AppSettings,
  ClassRecord,
  ExaminationPaper,
  ExaminationType,
  NotificationItem,
  PaperCategory,
  StatusHistoryEntry,
  SubjectType,
} from '../types';

const KEYS = {
  SETTINGS: 'rizwan_portal_settings_v3',
  CLASSES: 'rizwan_portal_classes_v3',
  PAPERS: 'rizwan_portal_papers_v3',
  HISTORY: 'rizwan_portal_history_v3',
  NOTIFICATIONS: 'rizwan_portal_notifications_v3',
};

export function generateClassId(
  programName: string,
  session: string,
  year: string,
  semester: number,
  section: string,
  subjectCode: string
): string {
  const clean = (s: string) => s.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `CLASS_${clean(programName)}_${year}_S${semester}_SEC${clean(section)}_${clean(subjectCode)}`;
}

export function generatePaperId(classId: string, sessionCohort: string, examType: string): string {
  const cleanType = examType.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const cleanCohort = sessionCohort.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `PAPER_${classId}_${cleanCohort}_${cleanType}`;
}

export class StorageService {
  // Settings
  static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...defaultSettings,
          ...parsed,
          portalTitle: parsed.portalTitle || "Rizwan's Personal Class Paper Portal",
          lecturerName: parsed.lecturerName || 'Rizwan',
        };
      }
    } catch (e) {
      console.error('Failed to load settings from storage', e);
    }
    return defaultSettings;
  }

  static saveSettings(settings: AppSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Classes
  static getClasses(): ClassRecord[] {
    try {
      const data = localStorage.getItem(KEYS.CLASSES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c) => ({
            ...c,
            subjectType: c.subjectType || 'Theory + Lab',
            hasSeparateCohortPapers: c.hasSeparateCohortPapers !== false,
          }));
        }
      }
    } catch (e) {
      console.error('Failed to load classes from storage', e);
    }
    this.saveClasses(sampleClasses);
    return sampleClasses;
  }

  static saveClasses(classes: ClassRecord[]): void {
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(classes));
  }

  // Papers
  static getPapers(): ExaminationPaper[] {
    try {
      const data = localStorage.getItem(KEYS.PAPERS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p) => ({
            ...p,
            subjectType: p.subjectType || 'Theory + Lab',
            paperCategory:
              p.paperCategory || (p.examinationType.toLowerCase().includes('lab') ? 'Lab' : 'Theory'),
          }));
        }
      }
    } catch (e) {
      console.error('Failed to load papers from storage', e);
    }
    this.savePapers(samplePapers);
    return samplePapers;
  }

  static savePapers(papers: ExaminationPaper[]): void {
    localStorage.setItem(KEYS.PAPERS, JSON.stringify(papers));
  }

  // History
  static getHistory(): StatusHistoryEntry[] {
    try {
      const data = localStorage.getItem(KEYS.HISTORY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load history from storage', e);
    }
    this.saveHistory(sampleHistory);
    return sampleHistory;
  }

  static saveHistory(history: StatusHistoryEntry[]): void {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
  }

  // Notifications
  static getNotifications(): NotificationItem[] {
    try {
      const data = localStorage.getItem(KEYS.NOTIFICATIONS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load notifications from storage', e);
    }
    return [];
  }

  static saveNotifications(notifications: NotificationItem[]): void {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }

  static getDeletedPaperIds(): Set<string> {
    try {
      const data = localStorage.getItem('rizwan_deleted_papers_v1');
      if (data) return new Set(JSON.parse(data));
    } catch (e) {}
    return new Set();
  }

  static addDeletedPaperId(paperId: string): void {
    const deleted = this.getDeletedPaperIds();
    deleted.add(paperId);
    localStorage.setItem('rizwan_deleted_papers_v1', JSON.stringify(Array.from(deleted)));
  }

  /**
   * Automatic Paper Requirements Generator
   * Generates separate papers for Fall and Spring cohorts when students sit together in the same classroom section!
   */
  static ensurePaperRequirementsForClasses(
    classes: ClassRecord[],
    existingPapers: ExaminationPaper[]
  ): { updatedPapers: ExaminationPaper[]; newRequirementsAdded: number } {
    const paperMap = new Map<string, ExaminationPaper>();
    const deletedIds = this.getDeletedPaperIds();

    existingPapers.forEach((p) => {
      // Apply validation: Midterm papers cannot be Lab
      if (p.term === 'Midterm' && p.paperCategory === 'Lab') {
        p.paperCategory = 'Theory';
      }
      paperMap.set(p.id, p);
    });
    let newRequirementsAdded = 0;

    classes.forEach((c) => {
      const subjectType: SubjectType = c.subjectType || 'Theory + Lab';

      // Determine sessions to generate for
      const targetSessions: AcademicSession[] = c.hasSeparateCohortPapers !== false ? ['Fall', 'Spring'] : [c.academicSession];

      targetSessions.forEach((sessionCohort) => {
        // Enforce Term/Category Rules
        const requiredExamSpecs: {
          examType: ExaminationType;
          term: 'Midterm' | 'Final';
          category: PaperCategory;
        }[] = [
          { examType: 'Midterm Theory', term: 'Midterm', category: 'Theory' },
          { examType: 'Final Theory', term: 'Final', category: 'Theory' },
        ];

        if (subjectType === 'Theory + Lab') {
          requiredExamSpecs.push({ examType: 'Final Lab', term: 'Final', category: 'Lab' });
        }

        requiredExamSpecs.forEach((spec) => {
          const paperId = generatePaperId(c.id, sessionCohort, spec.examType);
          
          if (!paperMap.has(paperId) && !deletedIds.has(paperId)) {
            const newPaper: ExaminationPaper = {
              id: paperId,
              classId: c.id,
              programName: c.programName,
              academicSession: sessionCohort,
              cohortSession: `${sessionCohort} Cohort`,
              academicYear: c.academicYear,
              semester: c.semester,
              section: c.section,
              subjectName: c.subjectName,
              subjectCode: c.subjectCode,
              subjectType: subjectType,
              examinationType: spec.examType,
              term: spec.term,
              paperCategory: spec.category,
              status: 'Pending',
              lastUpdatedDate: new Date().toISOString().split('T')[0],
              remarks: `Separate paper auto-generated for ${c.programName} (${sessionCohort} Cohort).`,
              isSample: c.isSample,
            };
            paperMap.set(paperId, newPaper);
            newRequirementsAdded++;
          }
        });
      });
    });

    const updatedPapers = Array.from(paperMap.values());
    this.savePapers(updatedPapers);
    return { updatedPapers, newRequirementsAdded };
  }

  // Reset to initial sample data
  static resetToSampleData(): {
    settings: AppSettings;
    classes: ClassRecord[];
    papers: ExaminationPaper[];
    history: StatusHistoryEntry[];
  } {
    this.saveSettings(defaultSettings);
    this.saveClasses(sampleClasses);
    this.savePapers(samplePapers);
    this.saveHistory(sampleHistory);
    this.saveNotifications([]);
    return {
      settings: defaultSettings,
      classes: sampleClasses,
      papers: samplePapers,
      history: sampleHistory,
    };
  }

  // Export full JSON snapshot
  static exportFullBackup(): string {
    const backupData = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      classes: this.getClasses(),
      papers: this.getPapers(),
      history: this.getHistory(),
    };
    return JSON.stringify(backupData, null, 2);
  }

  // Import full JSON snapshot
  static importFullBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.classes && parsed.papers) {
        if (parsed.settings) this.saveSettings(parsed.settings);
        this.saveClasses(parsed.classes);
        this.savePapers(parsed.papers);
        if (parsed.history) this.saveHistory(parsed.history);
        return true;
      }
    } catch (e) {
      console.error('Invalid backup JSON', e);
    }
    return false;
  }
}
