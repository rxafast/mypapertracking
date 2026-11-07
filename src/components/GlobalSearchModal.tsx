import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, FileCheck2, GraduationCap } from 'lucide-react';
import { ClassRecord, ExaminationPaper } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassRecord[];
  papers: ExaminationPaper[];
  onSelectPaper: (paper: ExaminationPaper) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  classes,
  papers,
  onSelectPaper,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matchedPapers = query.trim()
    ? papers.filter(
        (p) =>
          p.programName.toLowerCase().includes(query.toLowerCase()) ||
          p.subjectName.toLowerCase().includes(query.toLowerCase()) ||
          p.examinationType.toLowerCase().includes(query.toLowerCase()) ||
          p.status.toLowerCase().includes(query.toLowerCase())
      )
    : papers.slice(0, 5);

  const matchedClasses = query.trim()
    ? classes.filter(
        (c) =>
          c.programName.toLowerCase().includes(query.toLowerCase()) ||
          c.subjectName.toLowerCase().includes(query.toLowerCase()) ||
          c.section.toLowerCase().includes(query.toLowerCase())
      )
    : classes.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden space-y-4 p-4">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">
          <Search className="w-5 h-5 text-indigo-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search degree program, subject, exam paper or status..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results list */}
        <div className="max-h-96 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* Papers category */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Examination Papers ({matchedPapers.length})
            </span>
            {matchedPapers.length === 0 ? (
              <div className="p-4 text-center text-slate-500">No matching papers found.</div>
            ) : (
              matchedPapers.map((paper) => (
                <div
                  key={paper.id}
                  onClick={() => {
                    onSelectPaper(paper);
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800/80 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileCheck2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 truncate">{paper.programName}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Sem {paper.semester} ({paper.section})
                        </span>
                      </div>
                      <span className="text-slate-400">
                        {paper.examinationType} · {paper.subjectName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      {paper.status}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Classes category */}
          {matchedClasses.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                Classes & Programs ({matchedClasses.length})
              </span>
              {matchedClasses.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-slate-100">{c.programName}</span>
                      <p className="text-slate-400">
                        {c.academicSession} {c.academicYear} · Semester {c.semester} Section {c.section} ({c.studentCount} students)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
