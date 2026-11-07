import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, FileText, Printer, Filter, CheckCircle2 } from 'lucide-react';
import { ExportService } from '../services/exportService';
import { AppSettings, ClassRecord, ExaminationPaper } from '../types';

interface ReportsViewProps {
  papers: ExaminationPaper[];
  classes: ClassRecord[];
  settings: AppSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ papers, classes, settings }) => {
  const [reportType, setReportType] = useState<
    'complete' | 'pending' | 'program' | 'session' | 'exam'
  >('complete');
  const [selectedProgram, setSelectedProgram] = useState<string>('All');
  const [selectedSession, setSelectedSession] = useState<string>('All');
  const [selectedExamType, setSelectedExamType] = useState<string>('All');

  const uniquePrograms = Array.from(new Set(papers.map((p) => p.programName)));

  // Generate filtered dataset based on report type & filters
  const reportPapers = papers.filter((p) => {
    if (reportType === 'pending') {
      if (p.status !== 'Pending' && p.status !== 'In Progress') return false;
    }

    if (selectedProgram !== 'All' && p.programName !== selectedProgram) return false;
    if (selectedSession !== 'All' && p.academicSession !== selectedSession) return false;
    if (selectedExamType !== 'All' && p.examinationType !== selectedExamType) return false;

    return true;
  });

  const getReportTitle = () => {
    switch (reportType) {
      case 'complete':
        return 'Complete Paper Tracking Master Report';
      case 'pending':
        return 'Pending Examination Papers Audit Report';
      case 'program':
        return `Program-Wise Report (${selectedProgram})`;
      case 'session':
        return `Session Report (${selectedSession})`;
      case 'exam':
        return `Examination Type Report (${selectedExamType})`;
      default:
        return 'Paper Preparation Report';
    }
  };

  const handleDownloadExcel = () => {
    ExportService.exportToExcel(reportPapers, classes, settings, getReportTitle());
  };

  const handleDownloadPdf = () => {
    ExportService.exportToPdf(reportPapers, classes, settings, getReportTitle());
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Reports & Export Hub</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate formatted examination paper tracking reports for academic audit and Controller of Examinations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Download Excel
          </button>
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Report Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { key: 'complete', label: '1. Master Report', desc: 'All papers & statuses' },
          { key: 'pending', label: '2. Pending Report', desc: 'Pending & in progress' },
          { key: 'program', label: '3. Program Report', desc: 'Filter by degree' },
          { key: 'session', label: '4. Session Report', desc: 'Fall / Spring' },
          { key: 'exam', label: '5. Exam Type Report', desc: 'Midterm / Final' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setReportType(item.key as any)}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              reportType === item.key
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                : 'bg-neutral-900/50 backdrop-blur-md hover:bg-slate-800/80 text-slate-300 border-neutral-800'
            }`}
          >
            <span className="text-xs font-bold block">{item.label}</span>
            <span className="text-[10px] opacity-80 block mt-0.5">{item.desc}</span>
          </button>
        ))}
      </div>

      {/* Sub-Filters */}
      <div className="p-4 rounded-2xl bg-neutral-900/50 backdrop-blur-md border border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="text-slate-400 block mb-1">Filter Program</label>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-slate-200"
          >
            <option value="All">All Programs</option>
            {uniquePrograms.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Filter Session</label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-slate-200"
          >
            <option value="All">All Sessions</option>
            <option value="Fall">Fall</option>
            <option value="Spring">Spring</option>
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Filter Examination Type</label>
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="w-full px-3 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-slate-200"
          >
            <option value="All">All Exam Types</option>
            <option value="Midterm Examination">Midterm Examination</option>
            <option value="Final Examination">Final Examination</option>
            <option value="Quiz">Quiz</option>
            <option value="Assignment">Assignment</option>
          </select>
        </div>
      </div>

      {/* Printable / Live Preview Table */}
      <div className="p-6 rounded-2xl bg-neutral-900/50 backdrop-blur-md border border-neutral-800 space-y-4 print:p-0 print:border-none">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100">{getReportTitle()}</h3>
            <span className="text-xs text-slate-400">
              {settings.universityName} · Session: {settings.activeSession} {settings.academicYear}
            </span>
          </div>
          <span className="text-xs font-mono text-indigo-400 font-bold">
            {reportPapers.length} Records
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-neutral-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 text-slate-400 border-b border-neutral-800">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Program</th>
                <th className="p-3">Semester & Section</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Exam Type</th>
                <th className="p-3">Status</th>
                <th className="p-3">Creation Date</th>
                <th className="p-3">Exam Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono">
              {reportPapers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                    No matching report records found.
                  </td>
                </tr>
              ) : (
                reportPapers.map((paper, idx) => (
                  <tr key={paper.id} className="hover:bg-slate-800/40">
                    <td className="p-3 text-slate-500">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-100">{paper.programName}</td>
                    <td className="p-3">Sem {paper.semester} ({paper.section})</td>
                    <td className="p-3 text-slate-300">{paper.subjectName}</td>
                    <td className="p-3 text-indigo-300">{paper.examinationType}</td>
                    <td className="p-3 font-bold">{paper.status}</td>
                    <td className="p-3 text-slate-400">{paper.creationDate || '-'}</td>
                    <td className="p-3 text-amber-400">{paper.examinationDate || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
