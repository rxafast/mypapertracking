import React from 'react';
import {
  GraduationCap,
  Users,
  FileCheck2,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  Check,
  Zap,
  FlaskConical,
  BookOpen,
} from 'lucide-react';
import { AppSettings, ClassRecord, ExaminationPaper, PaperStatus } from '../types';

interface DashboardViewProps {
  classes: ClassRecord[];
  papers: ExaminationPaper[];
  settings: AppSettings;
  onNavigateTo: (tab: any) => void;
  onQuickUpdateStatus: (paperId: string, newStatus: PaperStatus, term: 'Midterm' | 'Final') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  classes,
  papers,
  settings,
  onNavigateTo,
  onQuickUpdateStatus,
}) => {
  // Filter papers for active academic year & current selected session cohort
  const activePapers = papers.filter(
    (p) => p.academicYear === settings.academicYear
  );

  const currentCohortPapers = activePapers.filter(
    (p) => p.academicSession === settings.activeSession
  );

  const totalRequired = currentCohortPapers.length;
  const createdCount = currentCohortPapers.filter(
    (p) => p.status === 'Created' || p.status === 'Reviewed' || p.status === 'Finalized'
  ).length;
  const pendingCount = currentCohortPapers.filter((p) => p.status === 'Pending').length;
  const inProgressCount = currentCohortPapers.filter((p) => p.status === 'In Progress').length;
  const finalizedCount = currentCohortPapers.filter((p) => p.status === 'Finalized').length;

  const completionPercentage = totalRequired > 0 ? Math.round((createdCount / totalRequired) * 100) : 0;

  // Theory vs Lab statistics for current cohort
  const theoryPapers = currentCohortPapers.filter((p) => p.paperCategory === 'Theory');
  const labPapers = currentCohortPapers.filter((p) => p.paperCategory === 'Lab');

  const totalTheoryRequired = theoryPapers.length;
  const totalLabRequired = labPapers.length;

  const theoryCreated = theoryPapers.filter(
    (p) => p.status === 'Created' || p.status === 'Reviewed' || p.status === 'Finalized'
  ).length;
  const labCreated = labPapers.filter(
    (p) => p.status === 'Created' || p.status === 'Reviewed' || p.status === 'Finalized'
  ).length;

  const pendingTheory = theoryPapers.filter((p) => p.status === 'Pending' || p.status === 'In Progress').length;
  const pendingLab = labPapers.filter((p) => p.status === 'Pending' || p.status === 'In Progress').length;

  // Active classes count
  const activeClasses = classes.filter((c) => c.academicYear === settings.academicYear);
  const uniquePrograms = Array.from(new Set(activeClasses.map((c) => c.programName)));
  const totalStudents = activeClasses.reduce((acc, c) => acc + c.studentCount, 0);

  // Program-wise preparation breakdown
  const programStats = uniquePrograms.map((prog) => {
    const progPapers = currentCohortPapers.filter((p) => p.programName === prog);
    const progCreated = progPapers.filter(
      (p) => p.status === 'Created' || p.status === 'Reviewed' || p.status === 'Finalized'
    ).length;
    const progTotal = progPapers.length;
    const progPct = progTotal > 0 ? Math.round((progCreated / progTotal) * 100) : 0;
    return {
      programName: prog,
      total: progTotal,
      created: progCreated,
      pending: progPapers.filter((p) => p.status === 'Pending' || p.status === 'In Progress').length,
      percentage: progPct,
    };
  });

  // Urgent pending list across all active papers
  const urgentPendingPapers = activePapers
    .filter((p) => p.status === 'Pending' || p.status === 'In Progress')
    .sort((a, b) => (b.paperCategory === 'Lab' ? 1 : 0) - (a.paperCategory === 'Lab' ? 1 : 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                Welcome Rizwan · {settings.activeSession} {settings.academicYear} Cohort Papers
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Class Paper Preparation Dashboard
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Managing exam papers for {uniquePrograms.length} degree programs ({activeClasses.length} class sections).
              <strong className="text-amber-300 font-semibold block mt-1">
                📌 Fall & Spring students sit together in your lectures, but separate examination papers are created and tracked for each session cohort.
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTo('import')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Import Excel Roster
            </button>
            <button
              onClick={() => onNavigateTo('papers')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-colors flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              Manage Papers
            </button>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Required Papers */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">{settings.activeSession} Papers Required</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
              {totalRequired}
            </div>
            <span className="text-xs text-slate-400 font-mono">{activeClasses.length} Combined Classes</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>{totalStudents} Enrolled Students</span>
            <span className="text-indigo-400 font-medium">100% Tracked</span>
          </div>
        </div>

        {/* Card 2: Papers Created */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Papers Created / Ready</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              {createdCount}
            </div>
            <span className="text-xs text-emerald-400/80 font-mono font-semibold">{finalizedCount} Finalized</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Progress Status</span>
            <span className="text-emerald-400 font-semibold">{completionPercentage}% Ready</span>
          </div>
        </div>

        {/* Card 3: Pending Papers */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Papers</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">
              {pendingCount}
            </div>
            <span className="text-xs text-indigo-400 font-mono">{inProgressCount} In Progress</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Action Required</span>
            <button
              onClick={() => onNavigateTo('pending')}
              className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
            >
              View Checklist <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Overall Completion % */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Completion</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
                {completionPercentage}%
              </span>
              <span className="text-xs text-slate-400 font-mono">{createdCount}/{totalRequired}</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Target: 100%</span>
            <span className="text-slate-300 font-medium">
              {completionPercentage === 100 ? '🎉 Complete!' : `${100 - completionPercentage}% remaining`}
            </span>
          </div>
        </div>
      </div>

      {/* Theory vs Lab Examination Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Theory & Lab Papers for {settings.activeSession} Cohort
          </h3>
          <span className="text-xs text-slate-400">Final Lab Papers Compulsory for Theory + Lab Courses</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Theory Papers Panel */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-400" /> Theory Examination Papers
              </span>
              <span className="font-mono text-indigo-400 font-bold">
                {theoryCreated} / {totalTheoryRequired} Created
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Required</span>
                <span className="text-lg font-bold font-mono text-slate-100">{totalTheoryRequired}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Created</span>
                <span className="text-lg font-bold font-mono text-emerald-400">{theoryCreated}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Pending</span>
                <span className="text-lg font-bold font-mono text-rose-400">{pendingTheory}</span>
              </div>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${totalTheoryRequired > 0 ? Math.round((theoryCreated / totalTheoryRequired) * 100) : 0}%` }}
              />
            </div>
          </div>

          {/* Lab Papers Panel */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-purple-400" /> Final Lab Examination Papers
              </span>
              <span className="font-mono text-purple-400 font-bold">
                {labCreated} / {totalLabRequired} Created
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Required</span>
                <span className="text-lg font-bold font-mono text-slate-100">{totalLabRequired}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Created</span>
                <span className="text-lg font-bold font-mono text-emerald-400">{labCreated}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Pending</span>
                <span className="text-lg font-bold font-mono text-rose-400">{pendingLab}</span>
              </div>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all"
                style={{ width: `${totalLabRequired > 0 ? Math.round((labCreated / totalLabRequired) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Papers Action Area & Program Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Pending Papers Action List</h3>
                <p className="text-xs text-slate-400">Immediate examination paper requirements needing preparation</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTo('pending')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View Full Checklist ({pendingCount}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {urgentPendingPapers.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-200">No Pending Papers!</h4>
              <p className="text-xs text-slate-400">All required examination papers for {settings.academicYear} have been created.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {urgentPendingPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-100 truncate">{paper.programName}</span>
                      <span className="text-xs text-slate-500 font-mono">
                        Sem {paper.semester} (Sec {paper.section})
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                        {paper.cohortSession || `${paper.academicSession} Cohort`}
                      </span>
                      {paper.paperCategory === 'Lab' && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                          FINAL LAB
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="text-indigo-300 font-medium">{paper.examinationType}</span>
                      <span>·</span>
                      <span>{paper.subjectName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onQuickUpdateStatus(paper.id, 'In Progress', paper.term)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                        paper.status === 'In Progress'
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => onQuickUpdateStatus(paper.id, 'Created', paper.term)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark Created
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Program Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100">Program Breakdown</h3>
            <span className="text-xs font-mono text-slate-400">{programStats.length} Programs</span>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {programStats.map((stat, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="truncate max-w-[170px]">{stat.programName}</span>
                  <span className="font-mono text-indigo-400">{stat.percentage}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>
                    Created: <strong className="text-emerald-400">{stat.created}</strong> / {stat.total}
                  </span>
                  <span>
                    Pending: <strong className="text-rose-400">{stat.pending}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
