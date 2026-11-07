export type AcademicSession = 'Fall' | 'Spring';

export type SubjectType = 'Theory Only' | 'Theory + Lab';

export type PaperCategory = 'Theory' | 'Lab';

export type ExaminationType =
  | 'Midterm Theory'
  | 'Final Theory'
  | 'Final Lab'
  | 'Midterm Examination'
  | 'Final Examination'
  | 'Quiz'
  | 'Assignment'
  | 'Other';

export type PaperStatus = 'Pending' | 'In Progress' | 'Created' | 'Reviewed' | 'Finalized';

export interface ClassRecord {
  id: string; // Unique ID, e.g. "CLASS_BSCS_F2026_S1_SEC-A_ICT"
  programName: string; // e.g. "BS Computer Science"
  department: string; // e.g. "Department of Computing"
  academicSession: AcademicSession; // e.g. "Fall" or "Spring"
  academicYear: string; // e.g. "2026"
  semester: number; // e.g. 1 to 8
  section: string; // e.g. "A", "B"
  subjectName: string; // e.g. "Information and Communication Technology (ICT)"
  subjectCode: string; // e.g. "ICT-101"
  subjectType: SubjectType; // "Theory Only" or "Theory + Lab"
  hasSeparateCohortPapers?: boolean; // When Fall & Spring students sit together in same class, generate separate papers
  studentCount: number; // Number of students enrolled in this section
  isSample?: boolean; // Flag to distinguish sample data from user imported data
}

export interface StatusHistoryEntry {
  id: string;
  paperId: string;
  fromStatus: PaperStatus | 'Initialized';
  toStatus: PaperStatus;
  timestamp: string; // ISO date string
  remarks?: string;
  updatedBy?: string;
}

export interface PaperAttachment {
  name: string;
  size: number;
  type: string;
  url?: string;
  dataUrl?: string;
  uploadedAt: string;
}

export interface ExaminationPaper {
  id: string; // Unique requirement key e.g. "PAPER_BSCS_F2026_S1_SEC-A_ICT_Fall_MidtermTheory"
  classId: string; // Reference to ClassRecord.id
  programName: string;
  academicSession: AcademicSession; // Session cohort this paper is created for (Fall vs Spring)
  cohortSession?: 'Fall Cohort' | 'Spring Cohort' | 'General';
  academicYear: string;
  semester: number;
  section: string;
  subjectName: string;
  subjectCode: string;
  subjectType: SubjectType;
  examinationType: ExaminationType;
  paperCategory: PaperCategory; // "Theory" or "Lab"
  status: PaperStatus;
  creationDate?: string; // Auto-set when marked as Created
  examinationDate?: string; // Optional target examination date
  lastUpdatedDate: string;
  remarks: string;
  attachment?: PaperAttachment;
  isSample?: boolean;
}

export interface AppSettings {
  portalTitle: string; // e.g. "Rizwan's Personal Class Paper Portal"
  universityName?: string; // Optional reference label
  academicYear: string;
  activeSession: AcademicSession;
  primarySubject: string;
  primarySubjectCode: string;
  primarySubjectType: SubjectType;
  lecturerName: string;
  isInitialSetupCompleted: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  timestamp: string;
  paperId?: string;
  classId?: string;
  read: boolean;
}

export interface ColumnMapping {
  studentName?: string;
  regNumber?: string;
  program: string;
  semester: string;
  session: string;
  section: string;
  subject: string;
  subjectCode?: string;
  subjectType?: string;
  department?: string;
}

export interface ExcelImportRawRow {
  [key: string]: string | number | undefined;
}

export interface ExcelImportSummary {
  totalRowsProcessed: number;
  uniqueStudentsCount: number;
  uniqueClassesIdentified: number;
  newClassesAdded: number;
  existingClassesUpdated: number;
  paperRequirementsGenerated: number;
}
