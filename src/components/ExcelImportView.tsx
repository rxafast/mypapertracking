import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Info,
  GraduationCap,
  Users,
  FileCheck2,
  Table as TableIcon,
  FlaskConical,
  BookOpen,
} from 'lucide-react';
import { ExcelImportService } from '../services/excelImport';
import { AcademicSession, AppSettings, ClassRecord, ColumnMapping, ExcelImportRawRow, ExcelImportSummary, SubjectType } from '../types';

interface ExcelImportViewProps {
  settings: AppSettings;
  onImportCompleted: (newClasses: ClassRecord[], summary: ExcelImportSummary) => void;
}

export const ExcelImportView: React.FC<ExcelImportViewProps> = ({ settings, onImportCompleted }) => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'complete'>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [rawColumns, setRawColumns] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<ExcelImportRawRow[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    program: '',
    semester: '',
    session: '',
    section: '',
    subject: '',
  });

  const [importYear, setImportYear] = useState<string>(settings.academicYear);
  const [importSession, setImportSession] = useState<AcademicSession>(settings.activeSession);
  const [importSubject, setImportSubject] = useState<string>(settings.primarySubject);
  const [importSubjectCode, setImportSubjectCode] = useState<string>(settings.primarySubjectCode);
  const [importSubjectType, setImportSubjectType] = useState<SubjectType>('Theory + Lab');

  const [summary, setSummary] = useState<ExcelImportSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Handle File selection
  const handleFileChange = async (file: File) => {
    if (!file) return;
    setErrorMsg('');
    setIsProcessing(true);
    setFileName(file.name);

    try {
      const parsed = await ExcelImportService.parseFile(file);
      setRawColumns(parsed.columns);
      setRawRows(parsed.rows);
      setMapping(parsed.autoMapping);
      setStep('mapping');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to read Excel file. Please ensure it is a valid .xlsx, .xls or .csv file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmMapping = () => {
    if (!mapping.program) {
      setErrorMsg('Please select a column for Program / Degree Name.');
      return;
    }
    setErrorMsg('');
    setStep('preview');
  };

  const handleExecuteImport = () => {
    setIsProcessing(true);
    try {
      const result = ExcelImportService.processImport(
        rawRows,
        mapping,
        importYear,
        importSession,
        importSubject,
        importSubjectCode,
        importSubjectType
      );
      setSummary(result.summary);
      onImportCompleted(result.uniqueClasses, result.summary);
      setStep('complete');
    } catch (err: any) {
      setErrorMsg('Import processing failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImport = () => {
    setStep('upload');
    setFileName('');
    setRawColumns([]);
    setRawRows([]);
    setSummary(null);
    setErrorMsg('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Excel / CSV Class Data Import</h1>
          <p className="text-xs text-slate-400 mt-1">
            Import student class lists, auto-detect Subject Types (Theory vs Lab), and auto-generate examination requirements without duplicating records.
          </p>
        </div>

        {step !== 'upload' && (
          <button
            onClick={resetImport}
            className="px-3.5 py-1.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-center"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Start Over
          </button>
        )}
      </div>

      {/* Progress Steps Indicator */}
      <div className="grid grid-cols-4 gap-2 py-2">
        {[
          { key: 'upload', label: '1. Select File' },
          { key: 'mapping', label: '2. Map Columns' },
          { key: 'preview', label: '3. Preview & Confirm' },
          { key: 'complete', label: '4. Done' },
        ].map((s) => {
          const isActive = step === s.key;
          const isDone =
            (s.key === 'upload' && step !== 'upload') ||
            (s.key === 'mapping' && (step === 'preview' || step === 'complete')) ||
            (s.key === 'preview' && step === 'complete');

          return (
            <div
              key={s.key}
              className={`p-2.5 rounded-2xl border text-center text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : isDone
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-neutral-900/50 backdrop-blur-md text-slate-500 border-neutral-800'
              }`}
            >
              {s.label}
            </div>
          );
        })}
      </div>

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: FILE UPLOAD */}
      {step === 'upload' && (
        <div className="space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-10 text-center bg-neutral-900/50 backdrop-blur-md/60 hover:bg-neutral-900/50 backdrop-blur-md transition-all cursor-pointer group"
          >
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              id="excel-file-input"
              className="hidden"
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
            />
            <label htmlFor="excel-file-input" className="cursor-pointer space-y-4 block">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 flex items-center justify-center mx-auto transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-200">
                  Click to upload or drag & drop Excel / CSV file
                </h3>
                <p className="text-xs text-slate-400">Supports .xlsx, .xls and .csv format</p>
              </div>
              <span className="inline-block px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors">
                Browse File
              </span>
            </label>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/50 backdrop-blur-md border border-neutral-800 space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Info className="w-4 h-4" />
              <span>Subject Type & Class Extraction Rules</span>
            </div>
            <p>
              Consolidates student rows into unique Class sections and generates exact exam requirements:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
              <li>
                <strong>Theory Only</strong>: Generates <em>Midterm Theory</em> & <em>Final Theory</em>.
              </li>
              <li>
                <strong>Theory + Lab</strong>: Generates <em>Midterm Theory</em>, <em>Final Theory</em>, & <em>Final Lab</em>.
              </li>
              <li>Re-importing updated student files will NEVER duplicate existing paper requirements or reset progress.</li>
            </ul>
          </div>
        </div>
      )}

      {/* STEP 2: COLUMN MAPPING */}
      {step === 'mapping' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
              <span>File: <strong>{fileName}</strong> ({rawRows.length} rows loaded)</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/50 backdrop-blur-md border border-neutral-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Confirm Column Mappings</h3>
            <p className="text-xs text-slate-400">
              Match your Excel headers to system fields. Missing columns will use default fallbacks.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Program Mapping */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Program / Degree Name *</span>
                  <span className="text-rose-400 font-normal">Required</span>
                </label>
                <select
                  value={mapping.program}
                  onChange={(e) => setMapping({ ...mapping, program: e.target.value })}
                  className="w-full px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select Excel Column --</option>
                  {rawColumns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Subject Type Column Mapping (Requirement #6) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-purple-300 flex items-center gap-1">
                  <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
                  Subject Type Column (Theory Only vs Theory + Lab)
                </label>
                <select
                  value={mapping.subjectType}
                  onChange={(e) => setMapping({ ...mapping, subjectType: e.target.value })}
                  className="w-full px-3 py-2 rounded-2xl bg-neutral-950 border border-purple-500/40 text-slate-200 text-xs focus:border-purple-500 focus:outline-none"
                >
                  <option value="">-- Select Excel Column (Optional / Manual Default below) --</option>
                  {rawColumns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Semester Mapping */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Semester Number</label>
                <select
                  value={mapping.semester}
                  onChange={(e) => setMapping({ ...mapping, semester: e.target.value })}
                  className="w-full px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select Excel Column (Default: 1) --</option>
                  {rawColumns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Section Mapping */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Section (e.g. A, B)</label>
                <select
                  value={mapping.section}
                  onChange={(e) => setMapping({ ...mapping, section: e.target.value })}
                  className="w-full px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select Excel Column (Default: A) --</option>
                  {rawColumns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Session Mapping */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Academic Session (Fall/Spring)</label>
                <select
                  value={mapping.session}
                  onChange={(e) => setMapping({ ...mapping, session: e.target.value })}
                  className="w-full px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select Excel Column (Default: {settings.activeSession}) --</option>
                  {rawColumns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Subject Mapping */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Subject / Course Name</label>
                <select
                  value={mapping.subject}
                  onChange={(e) => setMapping({ ...mapping, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select Excel Column (Default: {settings.primarySubject}) --</option>
                  {rawColumns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Import Context Overrides */}
          <div className="p-6 rounded-2xl bg-neutral-900/50 backdrop-blur-md border border-neutral-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Default Target Context</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Academic Year</label>
                <input
                  type="text"
                  value={importYear}
                  onChange={(e) => setImportYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Session</label>
                <select
                  value={importSession}
                  onChange={(e) => setImportSession(e.target.value as AcademicSession)}
                  className="w-full px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-slate-200 text-xs"
                >
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Default Subject Name</label>
                <input
                  type="text"
                  value={importSubject}
                  onChange={(e) => setImportSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-purple-300 font-bold block mb-1">Default Subject Type</label>
                <select
                  value={importSubjectType}
                  onChange={(e) => setImportSubjectType(e.target.value as SubjectType)}
                  className="w-full px-3 py-2 rounded-2xl bg-neutral-950 border border-purple-500/40 text-purple-200 font-bold text-xs"
                >
                  <option value="Theory + Lab">Theory + Lab (Generates Final Lab)</option>
                  <option value="Theory Only">Theory Only (No Lab)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={resetImport}
              className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmMapping}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2"
            >
              Continue to Preview <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PREVIEW & CONFIRM */}
      {step === 'preview' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-neutral-900/50 backdrop-blur-md border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Excel Data Sample Preview</h3>
                <p className="text-xs text-slate-400">First 5 rows from your file mapped to class entities & subject types</p>
              </div>
              <span className="text-xs font-mono text-indigo-400">{rawRows.length} Total Rows</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-neutral-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 text-slate-400 border-b border-neutral-800">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Program</th>
                    <th className="p-3">Semester</th>
                    <th className="p-3">Section</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Subject Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono">
                  {rawRows.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3 text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-100">
                        {mapping.program ? String(row[mapping.program] || 'N/A') : 'BS Computer Science'}
                      </td>
                      <td className="p-3">{mapping.semester ? String(row[mapping.semester] || '1') : '1'}</td>
                      <td className="p-3">{mapping.section ? String(row[mapping.section] || 'A') : 'A'}</td>
                      <td className="p-3 text-slate-300">
                        {mapping.subject ? String(row[mapping.subject] || importSubject) : importSubject}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          {importSubjectType}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep('mapping')}
              className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Back to Mapping
            </button>

            <button
              onClick={handleExecuteImport}
              disabled={isProcessing}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              {isProcessing ? (
                <>Processing Import...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Confirm & Process Class Import
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: COMPLETE SUMMARY */}
      {step === 'complete' && summary && (
        <div className="p-8 rounded-2xl bg-neutral-900/50 backdrop-blur-md border border-neutral-800 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-100">Import Processed Successfully!</h2>
            <p className="text-xs text-slate-400">Class records and paper tracking requirements have been updated.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto py-2">
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[11px] text-slate-400 block mb-1">Rows Processed</span>
              <span className="text-xl font-bold font-mono text-slate-100">{summary.totalRowsProcessed}</span>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[11px] text-slate-400 block mb-1">Unique Classes</span>
              <span className="text-xl font-bold font-mono text-indigo-400">{summary.uniqueClassesIdentified}</span>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[11px] text-slate-400 block mb-1">New Classes</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{summary.newClassesAdded}</span>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="text-[11px] text-slate-400 block mb-1">Papers Generated</span>
              <span className="text-xl font-bold font-mono text-amber-400">{summary.paperRequirementsGenerated}</span>
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={resetImport}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Import Another File
            </button>
            <button
              onClick={() => onImportCompleted([], summary)}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20"
            >
              View Tracked Papers
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
