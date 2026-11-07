import React, { useState } from 'react';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Paperclip,
  Calendar,
  Edit3,
  Plus,
  Trash2,
  ExternalLink,
  X,
  FileText,
  Tag,
  Check,
  FlaskConical,
  BookOpen,
} from 'lucide-react';
import { AcademicSession, ExaminationPaper, ExaminationType, PaperCategory, PaperStatus, SubjectType } from '../types';

interface PaperManagementViewProps {
  papers: ExaminationPaper[];
  onUpdatePaperStatus: (paperId: string, newStatus: PaperStatus, term: 'Midterm' | 'Final', remarks?: string, examDate?: string) => void;
  onSaveAttachment: (paperId: string, fileName: string, fileUrl?: string) => void;
  onAddCustomPaperRequirement: (newPaper: ExaminationPaper) => void;
  onDeletePaperRequirement: (paperId: string) => void;
}

export const PaperManagementView: React.FC<PaperManagementViewProps> = ({
  papers,
  onUpdatePaperStatus,
  onSaveAttachment,
  onAddCustomPaperRequirement,
  onDeletePaperRequirement,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState<string>('All');
  const [filterSession, setFilterSession] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Attachment Modal
  const [attachingPaper, setAttachingPaper] = useState<ExaminationPaper | null>(null);
  const [attachmentName, setAttachmentName] = useState('');

  // Remarks / Date Modal
  const [editingPaper, setEditingPaper] = useState<ExaminationPaper | null>(null);
  const [editStatus, setEditStatus] = useState<PaperStatus>('Pending');
  const [editTerm, setEditTerm] = useState<'Midterm' | 'Final'>('Midterm');
  const [editRemarks, setEditRemarks] = useState('');
  const [editExamDate, setEditExamDate] = useState('');

  // Add Paper Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addProgram, setAddProgram] = useState('BS Computer Science');
  const [addSession, setAddSession] = useState<AcademicSession>('Fall');
  const [addYear, setAddYear] = useState('2026');
  const [addSemester, setAddSemester] = useState<number>(1);
  const [addSection, setAddSection] = useState('A');
  const [addSubject, setAddSubject] = useState('Information and Communication Technology (ICT)');
  const [addSubjectCode, setAddSubjectCode] = useState('CS-101');
  const [addSubjectType, setAddSubjectType] = useState<SubjectType>('Theory + Lab');
  const [addExamType, setAddExamType] = useState<ExaminationType>('Midterm Theory');

  const uniquePrograms = Array.from(new Set(papers.map((p) => p.programName)));

  // Filtered List
  const filteredPapers = papers.filter((p) => {
    const matchesSearch =
      p.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.examinationType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.remarks && p.remarks.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesProgram = filterProgram === 'All' || p.programName === filterProgram;
    const matchesSession = filterSession === 'All' || p.academicSession === filterSession;
    const matchesCategory = filterCategory === 'All' || p.paperCategory === filterCategory;
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;

    return matchesSearch && matchesProgram && matchesSession && matchesCategory && matchesStatus;
  });

  const handleOpenEdit = (paper: ExaminationPaper) => {
    setEditingPaper(paper);
    setEditStatus(paper.status);
    setEditTerm(paper.term || 'Midterm');
    setEditRemarks(paper.remarks || '');
    setEditExamDate(paper.examinationDate || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPaper) {
      onUpdatePaperStatus(editingPaper.id, editStatus, editTerm, editRemarks, editExamDate);
      setEditingPaper(null);
    }
  };

  const handleOpenAttach = (paper: ExaminationPaper) => {
    setAttachingPaper(paper);
    setAttachmentName(paper.attachment?.name || `${paper.subjectCode}_${paper.examinationType.replace(/\s+/g, '_')}_Draft.docx`);
  };

  const handleSaveAttach = (e: React.FormEvent) => {
    e.preventDefault();
    if (attachingPaper && attachmentName) {
      onSaveAttachment(attachingPaper.id, attachmentName);
      setAttachingPaper(null);
    }
  };

  const handleSaveAddPaper = (e: React.FormEvent) => {
    e.preventDefault();
    const classId = `CLASS_${addProgram.replace(/[^A-Z0-9]/gi, '')}_${addSession}_${addYear}_S${addSemester}_SEC${addSection}_${addSubjectCode.replace(/[^A-Z0-9]/gi, '')}`;
    const paperId = `PAPER_${classId}_${addExamType.replace(/[^A-Z0-9]/gi, '')}`;

    const paperCategory: PaperCategory = addExamType.toLowerCase().includes('lab') ? 'Lab' : 'Theory';

    const newPaper: ExaminationPaper = {
      id: paperId,
      classId,
      programName: addProgram,
      academicSession: addSession,
      academicYear: addYear,
      semester: addSemester,
      section: addSection,
      subjectName: addSubject,
      subjectCode: addSubjectCode,
      subjectType: addSubjectType,
      examinationType: addExamType,
      paperCategory,
      status: 'Pending',
      lastUpdatedDate: new Date().toISOString().split('T')[0],
      remarks: 'Manually added custom examination requirement.',
    };

    onAddCustomPaperRequirement(newPaper);
    setIsAddModalOpen(false);
  };

  const getStatusBadge = (status: PaperStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'In Progress':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Created':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Reviewed':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Finalized':
        return 'bg-teal-500/10 text-teal-300 border-teal-500/20 font-bold';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Examination Paper Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track Theory & Lab papers independently (Midterm Theory, Final Theory, Final Lab) with 1-click status transitions.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 self-start sm:self-center shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Paper Requirement
        </button>
      </div>

      {/* Multi-Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative md:col-span-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search papers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="All">All Programs ({uniquePrograms.length})</option>
            {uniquePrograms.map((prog) => (
              <option key={prog} value={prog}>{prog}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="All">All Sessions</option>
            <option value="Fall">Fall</option>
            <option value="Spring">Spring</option>
          </select>
        </div>

        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="All">All Categories (Theory & Lab)</option>
            <option value="Theory">Theory Papers Only</option>
            <option value="Lab">Final Lab Papers Only</option>
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Created">Created</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Finalized">Finalized</option>
          </select>
        </div>
      </div>

      {/* Papers Grid Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Examination Papers Matrix
          </span>
          <span className="text-xs font-mono text-slate-400">{filteredPapers.length} Papers Listed</span>
        </div>

        {filteredPapers.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-xs">
            No papers match the current filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPapers.map((paper) => (
              <div
                key={paper.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between"
              >
                {/* Card Top Header */}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-300 font-mono">
                        {paper.programName}
                      </span>
                      {paper.paperCategory === 'Lab' ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1 font-mono">
                          <FlaskConical className="w-3 h-3" /> FINAL LAB
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 font-mono">
                          <BookOpen className="w-3 h-3" /> THEORY
                        </span>
                      )}
                    </div>

                    <span
                      className={`px-2.5 py-0.5 text-xs rounded-md border font-semibold ${getStatusBadge(
                        paper.status
                      )}`}
                    >
                      {paper.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
                    <span>{paper.examinationType}</span>
                    <span className="text-xs font-mono text-slate-400">
                      Sem {paper.semester} (Sec {paper.section})
                    </span>
                  </h3>

                  <p className="text-xs text-slate-300 font-medium">
                    {paper.subjectName} <span className="text-slate-500 font-mono">({paper.subjectCode})</span>
                  </p>
                </div>

                {/* Dates & Attachment details */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1.5 font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Session & Type:</span>
                    <span className="text-slate-200">
                      {paper.academicSession} {paper.academicYear} ({paper.subjectType || 'Theory + Lab'})
                    </span>
                  </div>
                  {paper.creationDate && (
                    <div className="flex justify-between">
                      <span>Created Date:</span>
                      <span className="text-emerald-400 font-semibold">{paper.creationDate}</span>
                    </div>
                  )}
                  {paper.examinationDate && (
                    <div className="flex justify-between">
                      <span>Target Exam Date:</span>
                      <span className="text-amber-400">{paper.examinationDate}</span>
                    </div>
                  )}
                  {paper.attachment && (
                    <div className="flex items-center justify-between text-indigo-400 pt-1 border-t border-slate-800">
                      <span className="flex items-center gap-1 text-[11px] truncate max-w-[200px]">
                        <Paperclip className="w-3 h-3" /> {paper.attachment.name}
                      </span>
                      <span className="text-[10px] text-slate-500">Attached</span>
                    </div>
                  )}
                </div>

                {paper.remarks && (
                  <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 leading-relaxed">
                    "{paper.remarks}"
                  </p>
                )}

                {/* 1-Click Status Quick Transitions */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(['Pending', 'In Progress', 'Created', 'Reviewed', 'Finalized'] as PaperStatus[]).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => onUpdatePaperStatus(paper.id, st)}
                          className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors border ${
                            paper.status === st
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                              : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => handleOpenAttach(paper)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800"
                      title="Attach Paper File"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(paper)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800"
                      title="Edit Remarks & Exam Date"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeletePaperRequirement(paper.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                      title="Delete Paper Requirement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Remarks / Exam Date Modal */}
      {editingPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Update Paper Details</h3>
              <button onClick={() => setEditingPaper(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Paper Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as PaperStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Created">Created</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Finalized">Finalized</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Paper Term</label>
                <select
                  value={editTerm}
                  onChange={(e) => setEditTerm(e.target.value as 'Midterm' | 'Final')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                >
                  <option value="Midterm">Midterm</option>
                  <option value="Final">Final</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Target Examination Date</label>
                <input
                  type="date"
                  value={editExamDate}
                  onChange={(e) => setEditExamDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Remarks & Preparation Notes</label>
                <textarea
                  rows={3}
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  placeholder="e.g. MCQs drafted, lab practical task sheet ready..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPaper(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  Save Paper Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attach File Modal */}
      {attachingPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Attach Draft Paper File</h3>
              <button onClick={() => setAttachingPaper(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAttach} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Attachment File Name</label>
                <input
                  type="text"
                  required
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="e.g. ICT_FinalLab_2026_Draft.docx"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAttachingPaper(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  Attach File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Paper Requirement Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Add Paper Requirement</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddPaper} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Program Name *</label>
                <input
                  type="text"
                  required
                  value={addProgram}
                  onChange={(e) => setAddProgram(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Academic Session</label>
                  <select
                    value={addSession}
                    onChange={(e) => setAddSession(e.target.value as AcademicSession)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                  >
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Exam Type</label>
                  <select
                    value={addExamType}
                    onChange={(e) => setAddExamType(e.target.value as ExaminationType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold"
                  >
                    <option value="Midterm Theory">Midterm Theory</option>
                    <option value="Final Theory">Final Theory</option>
                    <option value="Final Lab">Final Lab</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Assignment">Assignment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Subject Name *</label>
                  <input
                    type="text"
                    required
                    value={addSubject}
                    onChange={(e) => setAddSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Subject Type</label>
                  <select
                    value={addSubjectType}
                    onChange={(e) => setAddSubjectType(e.target.value as SubjectType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold"
                  >
                    <option value="Theory Only">Theory Only</option>
                    <option value="Theory + Lab">Theory + Lab</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  Add Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
