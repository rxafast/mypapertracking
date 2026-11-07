import { AppSettings, ClassRecord, ExaminationPaper, StatusHistoryEntry } from '../types';

export const defaultSettings: AppSettings = {
  portalTitle: "Rizwan's Personal Class Paper Portal",
  universityName: "Rizwan's Teaching Portal",
  academicYear: new Date().getFullYear().toString(),
  activeSession: 'Fall',
  primarySubject: '',
  primarySubjectCode: '',
  primarySubjectType: 'Theory + Lab',
  lecturerName: 'Rizwan',
  isInitialSetupCompleted: false,
};

export const sampleClasses: ClassRecord[] = [];

export const samplePapers: ExaminationPaper[] = [];

export const sampleHistory: StatusHistoryEntry[] = [];
