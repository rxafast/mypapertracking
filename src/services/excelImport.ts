import * as XLSX from 'xlsx';
import { AcademicSession, ClassRecord, ColumnMapping, ExcelImportRawRow, ExcelImportSummary, SubjectType } from '../types';
import { generateClassId, StorageService } from './storage';

export class ExcelImportService {
  /**
   * Parse an uploaded Excel/CSV file into raw row objects and column names
   */
  static async parseFile(file: File): Promise<{
    columns: string[];
    rows: ExcelImportRawRow[];
    autoMapping: ColumnMapping;
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convert sheet to JSON array of objects
          const rawRows: ExcelImportRawRow[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          if (rawRows.length === 0) {
            reject(new Error('The uploaded file contains no data rows.'));
            return;
          }

          // Extract headers from first row keys
          const columns = Object.keys(rawRows[0]);
          const autoMapping = this.autoDetectColumns(columns);

          resolve({
            columns,
            rows: rawRows,
            autoMapping,
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Smart header detector matching common column names
   */
  static autoDetectColumns(columns: string[]): ColumnMapping {
    const findCol = (keywords: string[]) => {
      return (
        columns.find((col) =>
          keywords.some((kw) => col.toLowerCase().replace(/[^a-z0-9]/g, '').includes(kw.toLowerCase().replace(/[^a-z0-9]/g, '')))
        ) || ''
      );
    };

    return {
      studentName: findCol(['student', 'name', 'full name', 'student_name']),
      regNumber: findCol(['reg', 'registration', 'roll', 'id', 'reg_no', 'roll_no']),
      program: findCol(['program', 'degree', 'discipline', 'prog', 'department']),
      semester: findCol(['semester', 'sem', 'term']),
      session: findCol(['session', 'intake', 'academic session']),
      section: findCol(['section', 'sec']),
      subject: findCol(['subject', 'course', 'course name', 'subject name']),
      subjectCode: findCol(['code', 'course code', 'subject code']),
      subjectType: findCol(['subject type', 'type', 'lab', 'has lab', 'practical']),
      department: findCol(['department', 'dept', 'faculty']),
    };
  }

  /**
   * Process rows using confirmed column mappings to build unique Class records
   */
  static processImport(
    rows: ExcelImportRawRow[],
    mapping: ColumnMapping,
    defaultYear: string,
    defaultSession: AcademicSession,
    defaultSubject: string,
    defaultSubjectCode: string,
    defaultSubjectType: SubjectType = 'Theory + Lab'
  ): {
    uniqueClasses: ClassRecord[];
    summary: ExcelImportSummary;
  } {
    const studentRegs = new Set<string>();
    const classMap = new Map<string, { record: ClassRecord; studentCount: number }>();

    rows.forEach((row, index) => {
      // Extract values with fallbacks
      const studentName = mapping.studentName ? String(row[mapping.studentName] || '').trim() : '';
      const regNo = mapping.regNumber ? String(row[mapping.regNumber] || '').trim() : `STD-${index + 1}`;

      if (regNo) studentRegs.add(regNo);

      const programRaw = mapping.program ? String(row[mapping.program] || '').trim() : 'BS Computer Science';
      const semesterRaw = mapping.semester ? parseInt(String(row[mapping.semester] || '1').replace(/\D/g, ''), 10) || 1 : 1;

      let sessionRaw: AcademicSession = defaultSession;
      if (mapping.session && row[mapping.session]) {
        const sessVal = String(row[mapping.session]).trim().toLowerCase();
        if (sessVal.includes('spring')) sessionRaw = 'Spring';
        else if (sessVal.includes('fall')) sessionRaw = 'Fall';
      }

      const sectionRaw = mapping.section ? String(row[mapping.section] || 'A').trim().toUpperCase() : 'A';
      const subjectRaw = mapping.subject ? String(row[mapping.subject] || '').trim() || defaultSubject : defaultSubject;
      const subjectCodeRaw = mapping.subjectCode
        ? String(row[mapping.subjectCode] || '').trim() || defaultSubjectCode
        : defaultSubjectCode;

      let subjectTypeRaw: SubjectType = defaultSubjectType;
      if (mapping.subjectType && row[mapping.subjectType]) {
        const typeVal = String(row[mapping.subjectType]).trim().toLowerCase();
        if (typeVal.includes('only') || typeVal === 'theory' || typeVal === 'no' || typeVal === 'false') {
          subjectTypeRaw = 'Theory Only';
        } else if (typeVal.includes('lab') || typeVal === 'yes' || typeVal === 'true') {
          subjectTypeRaw = 'Theory + Lab';
        }
      }

      const departmentRaw = mapping.department
        ? String(row[mapping.department] || '').trim()
        : `Department of ${programRaw.replace(/^(BS|MS|BBA)\s*/i, '') || 'Computing'}`;

      const classId = generateClassId(programRaw, sessionRaw, defaultYear, semesterRaw, sectionRaw, subjectCodeRaw);

      if (classMap.has(classId)) {
        const existing = classMap.get(classId)!;
        existing.studentCount += 1;
      } else {
        classMap.set(classId, {
          record: {
            id: classId,
            programName: programRaw,
            department: departmentRaw,
            academicSession: sessionRaw,
            academicYear: defaultYear,
            semester: semesterRaw,
            section: sectionRaw,
            subjectName: subjectRaw,
            subjectCode: subjectCodeRaw,
            subjectType: subjectTypeRaw,
            studentCount: 1,
            isSample: false,
          },
          studentCount: 1,
        });
      }
    });

    // Extract unique classes with accurate student counts
    const uniqueClasses: ClassRecord[] = Array.from(classMap.values()).map((item) => ({
      ...item.record,
      studentCount: item.studentCount,
    }));

    // Merge with existing classes in storage without duplicating
    const existingClasses = StorageService.getClasses();
    const existingPapers = StorageService.getPapers();

    const existingClassMap = new Map<string, ClassRecord>();
    existingClasses.forEach((c) => existingClassMap.set(c.id, c));

    let newClassesAdded = 0;
    let existingClassesUpdated = 0;

    uniqueClasses.forEach((c) => {
      if (existingClassMap.has(c.id)) {
        // Update existing class student count & details
        const prev = existingClassMap.get(c.id)!;
        existingClassMap.set(c.id, {
          ...prev,
          studentCount: Math.max(prev.studentCount, c.studentCount),
          subjectName: c.subjectName || prev.subjectName,
          subjectType: c.subjectType || prev.subjectType,
          isSample: false,
        });
        existingClassesUpdated++;
      } else {
        existingClassMap.set(c.id, c);
        newClassesAdded++;
      }
    });

    const finalClasses = Array.from(existingClassMap.values());
    StorageService.saveClasses(finalClasses);

    // Auto-generate missing paper requirements (Theory vs Lab)
    const { updatedPapers, newRequirementsAdded } = StorageService.ensurePaperRequirementsForClasses(
      finalClasses,
      existingPapers
    );

    const summary: ExcelImportSummary = {
      totalRowsProcessed: rows.length,
      uniqueStudentsCount: studentRegs.size || rows.length,
      uniqueClassesIdentified: uniqueClasses.length,
      newClassesAdded,
      existingClassesUpdated,
      paperRequirementsGenerated: newRequirementsAdded,
    };

    return {
      uniqueClasses: finalClasses,
      summary,
    };
  }
}
