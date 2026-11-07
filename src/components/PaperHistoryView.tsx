import React, { useState } from 'react';
import { History, Search, ArrowRight, User, Calendar, Tag } from 'lucide-react';
import { ExaminationPaper, StatusHistoryEntry } from '../types';

interface PaperHistoryViewProps {
  history: StatusHistoryEntry[];
  papers: ExaminationPaper[];
}

export const PaperHistoryView: React.FC<PaperHistoryViewProps> = ({ history, papers }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Map history to paper metadata
  const enrichedHistory = history.map((h) => {
    const paper = papers.find((p) => p.id === h.paperId);
    return {
      ...h,
      paper,
    };
  });

  const filteredHistory = enrichedHistory.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.paper?.programName && item.paper.programName.toLowerCase().includes(term)) ||
      (item.paper?.subjectName && item.paper.subjectName.toLowerCase().includes(term)) ||
      (item.paper?.examinationType && item.paper.examinationType.toLowerCase().includes(term)) ||
      (item.remarks && item.remarks.toLowerCase().includes(term))
    );
  });

  // Sort descending by timestamp
  const sortedHistory = [...filteredHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Paper Preparation Audit History</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological activity timeline tracking every paper creation, review, and status update.
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search history log..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-2xl bg-neutral-900/50 backdrop-blur-md border border-neutral-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* History Timeline */}
      <div className="p-6 rounded-2xl bg-neutral-900/50 backdrop-blur-md border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100">Status Change Log</h3>
          <span className="text-xs font-mono text-slate-400">{sortedHistory.length} Total Events</span>
        </div>

        {sortedHistory.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No activity log records found.</div>
        ) : (
          <div className="relative border-l border-neutral-800 ml-4 space-y-6 pl-6 py-2">
            {sortedHistory.map((item) => (
              <div key={item.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-slate-900 shadow-xs" />

                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 hover:border-slate-700 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">
                        {item.paper?.programName || 'Examination Requirement'}
                      </span>
                      {item.paper && (
                        <span className="text-[10px] font-mono text-indigo-400">
                          Sem {item.paper.semester} ({item.paper.section})
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {/* Status Transition Badge */}
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.fromStatus}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                      {item.toStatus}
                    </span>
                  </div>

                  {item.paper && (
                    <div className="text-xs text-slate-300 font-medium">
                      {item.paper.subjectName} · <span className="text-slate-400">{item.paper.examinationType}</span>
                    </div>
                  )}

                  {item.remarks && (
                    <p className="text-xs text-slate-400 italic bg-neutral-900/50 backdrop-blur-md/60 p-2 rounded-lg border border-neutral-800/60">
                      "{item.remarks}"
                    </p>
                  )}

                  {item.updatedBy && (
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1">
                      <User className="w-3 h-3" /> Updated by {item.updatedBy}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
