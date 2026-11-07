import React, { useState } from 'react';
import { Clock, Filter, AlertCircle, ArrowUpDown, Check, Calendar, ChevronRight, FlaskConical, BookOpen } from 'lucide-react';
import { AcademicSession, ExaminationPaper, ExaminationType, PaperStatus } from '../types';

interface PendingPapersViewProps {
  papers: ExaminationPaper[];
  onUpdatePaperStatus: (paperId: string, newStatus: PaperStatus) => void;
}

export const PendingPapersView: React.FC<PendingPapersViewProps> = ({ papers, onUpdatePaperStatus }) => {
  const [filterSession, setFilterSession] = useState<string>('All');
  const [filterYear, setFilterYear] = useState<string>('All');
  const [filterProgram, setFilterProgram] = useState<string>('All');
  const [filterSemester, setFilterSemester] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All'); // Requirement #5: All, Theory Papers, Lab Papers
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('PendingAndProgress');
  const [sortBy, setSortBy] = useState<'examDate' | 'program' | 'status' | 'category'>('category');

  const uniquePrograms = Array.from(new Set(papers.map((p) => p.programName)));
  const uniqueYears = Array.from(new Set(papers.map((p) => p.academicYear)));

  // Filter papers
  const pendingPapers = papers.filter((p) => {
    const matchesSession = filterSession === 'All' || p.academicSession === filterSession;
    const matchesYear = filterYear === 'All' || p.academicYear === filterYear;
    const matchesProgram = filterProgram === 'All' || p.programName === filterProgram;
    const matchesSemester = filterSemester === 'All' || p.semester.toString() === filterSemester;
    const matchesCategory = filterCategory === 'All' || p.paperCategory === filterCategory;
    const matchesType = filterType === 'All' || p.examinationType === filterType;

    let matchesStatus = true;
    if (filterStatus === 'PendingAndProgress') {
      matchesStatus = p.status === 'Pending' || p.status === 'In Progress';
    } else if (filterStatus !== 'All') {
      matchesStatus = p.status === filterStatus;
    }

    return (
      matchesSession &&
      matchesYear &&
      matchesProgram &&
      matchesSemester &&
      matchesCategory &&
      matchesType &&
      matchesStatus
    );
  });

  // Sort papers (putting pending Lab papers upfront if sorted by category)
  const sortedPapers = [...pendingPapers].sort((a, b) => {
    if (sortBy === 'category') {
      return (b.paperCategory === 'Lab' ? 1 : 0) - (a.paperCategory === 'Lab' ? 1 : 0);
    } else if (sortBy === 'examDate') {
      if (!a.examinationDate) return 1;
      if (!b.examinationDate) return -1;
      return a.examinationDate.localeCompare(b.examinationDate);
    } else if (sortBy === 'program') {
      return a.programName.localeCompare(b.programName);
    } else {
      return a.status.localeCompare(b.status);
    }
  });

  const pendingLabCount = papers.filter(
    (p) => p.paperCategory === 'Lab' && (p.status === 'Pending' || p.status === 'In Progress')
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Pending Papers Control Desk</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Dedicated tracking checklist highlighting pending Theory and Final Lab papers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingLabCount > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold font-mono flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5" /> {pendingLabCount} Pending Lab Papers
            </span>
          )}
          <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold font-mono">
            {sortedPapers.length} Total Pending
          </span>
        </div>
      </div>

      {/* Prominent Pending Lab Papers Reminder Alert Box */}
      {pendingLabCount > 0 && (
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/50 text-purple-200 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-100">Lab Exam Preparation Reminder</span>
              <p className="text-purple-300/80">
                You have <strong>{pendingLabCount} Final Lab Paper(s)</strong> currently pending preparation for Theory + Lab courses.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterCategory('Lab')}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shrink-0 transition-colors"
          >
            Show Pending Lab Papers Only
          </button>
        </div>
      )}

      {/* Comprehensive Filter Toolbar (Requirement #5) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-indigo-400" /> Multi-Attribute Filters
          </span>
          <span className="text-slate-500 font-mono text-[11px]">Active Results: {sortedPapers.length}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {/* Category Filter (Requirement #5) */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-purple-500/40 text-purple-300 font-semibold text-xs"
          >
            <option value="All">All Categories (Theory & Lab)</option>
            <option value="Theory">Theory Papers</option>
            <option value="Lab">Lab Papers Only</option>
          </select>

          {/* Session */}
          <select
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
          >
            <option value="All">All Sessions</option>
            <option value="Fall">Fall</option>
            <option value="Spring">Spring</option>
          </select>

          {/* Year */}
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
          >
            <option value="All">All Years</option>
            {uniqueYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Program */}
          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
          >
            <option value="All">All Programs</option>
            {uniquePrograms.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Semester */}
          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
          >
            <option value="All">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s.toString()}>Semester {s}</option>
            ))}
          </select>

          {/* Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
          >
            <option value="All">All Exam Types</option>
            <option value="Midterm Theory">Midterm Theory</option>
            <option value="Final Theory">Final Theory</option>
            <option value="Final Lab">Final Lab</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-indigo-500/40 text-indigo-300 font-semibold text-xs"
          >
            <option value="category">Sort: Lab Papers First</option>
            <option value="examDate">Sort: Exam Date</option>
            <option value="program">Sort: Program</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>
      </div>

      {/* Main Pending Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Category & Status</th>
                <th className="p-3.5">Program & Section</th>
                <th className="p-3.5">Session / Year</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Exam Requirement</th>
                <th className="p-3.5">Target Date</th>
                <th className="p-3.5 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {sortedPapers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500 text-xs">
                    🎉 Excellent! No pending examination papers found matching these filters.
                  </td>
                </tr>
              ) : (
                sortedPapers.map((paper) => (
                  <tr key={paper.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        {paper.paperCategory === 'Lab' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1 font-mono">
                            <FlaskConical className="w-3 h-3" /> FINAL LAB
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-mono">
                            THEORY
                          </span>
                        )}

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            paper.status === 'Pending'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          }`}
                        >
                          {paper.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-100">
                      <div>{paper.programName}</div>
                      <span className="text-[10px] font-mono text-slate-400">
                        Semester {paper.semester} (Sec {paper.section})
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-indigo-300">
                      {paper.academicSession} {paper.academicYear}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-200">{paper.subjectName}</div>
                      <span className="text-[10px] font-mono text-slate-400">{paper.subjectCode}</span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-200">{paper.examinationType}</td>
                    <td className="p-3.5 font-mono">
                      {paper.examinationDate ? (
                        <span className="text-amber-400 font-semibold">{paper.examinationDate}</span>
                      ) : (
                        <span className="text-slate-500">Not set</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {paper.status === 'Pending' && (
                          <button
                            onClick={() => onUpdatePaperStatus(paper.id, 'In Progress')}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold border border-slate-700"
                          >
                            Start Draft
                          </button>
                        )}
                        <button
                          onClick={() => onUpdatePaperStatus(paper.id, 'Created')}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Mark Created
                        </button>
                      </div>
                    </td>
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
