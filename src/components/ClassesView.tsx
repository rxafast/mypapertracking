import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, GraduationCap, Users, Filter, BookOpen, AlertTriangle, X, FlaskConical } from 'lucide-react';
import { AcademicSession, ClassRecord, SubjectType } from '../types';
import { generateClassId } from '../services/storage';

interface ClassesViewProps {
  classes: ClassRecord[];
  onAddClass: (newClass: ClassRecord) => void;
  onUpdateClass: (updatedClass: ClassRecord) => void;
  onDeleteClass: (classId: string) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  classes,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSession, setFilterSession] = useState<string>('All');
  const [filterProgram, setFilterProgram] = useState<string>('All');
  const [filterSubjectType, setFilterSubjectType] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRecord | null>(null);

  // Delete Confirmation Dialog
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form fields state
  const [formProgram, setFormProgram] = useState('BS Computer Science');
  const [formDept, setFormDept] = useState('Department of Computer Science');
  const [formSession, setFormSession] = useState<AcademicSession>('Fall');
  const [formYear, setFormYear] = useState('2026');
  const [formSemester, setFormSemester] = useState<number>(1);
  const [formSection, setFormSection] = useState('A');
  const [formSubject, setFormSubject] = useState('Information and Communication Technology (ICT)');
  const [formSubjectCode, setFormSubjectCode] = useState('CS-101');
  const [formSubjectType, setFormSubjectType] = useState<SubjectType>('Theory + Lab');
  const [formStudents, setFormStudents] = useState<number>(50);

  const uniquePrograms = Array.from(new Set(classes.map((c) => c.programName)));

  // Filtered List
  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.section.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSession = filterSession === 'All' || c.academicSession === filterSession;
    const matchesProgram = filterProgram === 'All' || c.programName === filterProgram;
    const matchesType = filterSubjectType === 'All' || c.subjectType === filterSubjectType;

    return matchesSearch && matchesSession && matchesProgram && matchesType;
  });

  const openAddModal = () => {
    setEditingClass(null);
    setFormProgram('BS Computer Science');
    setFormDept('Department of Computer Science');
    setFormSession('Fall');
    setFormYear('2026');
    setFormSemester(1);
    setFormSection('A');
    setFormSubject('Information and Communication Technology (ICT)');
    setFormSubjectCode('CS-101');
    setFormSubjectType('Theory + Lab');
    setFormStudents(50);
    setIsModalOpen(true);
  };

  const openEditModal = (c: ClassRecord) => {
    setEditingClass(c);
    setFormProgram(c.programName);
    setFormDept(c.department);
    setFormSession(c.academicSession);
    setFormYear(c.academicYear);
    setFormSemester(c.semester);
    setFormSection(c.section);
    setFormSubject(c.subjectName);
    setFormSubjectCode(c.subjectCode);
    setFormSubjectType(c.subjectType || 'Theory + Lab');
    setFormStudents(c.studentCount);
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      const updated: ClassRecord = {
        ...editingClass,
        programName: formProgram,
        department: formDept,
        academicSession: formSession,
        academicYear: formYear,
        semester: formSemester,
        section: formSection,
        subjectName: formSubject,
        subjectCode: formSubjectCode,
        subjectType: formSubjectType,
        studentCount: formStudents,
      };
      onUpdateClass(updated);
    } else {
      const classId = generateClassId(formProgram, formSession, formYear, formSemester, formSection, formSubjectCode);
      const newClass: ClassRecord = {
        id: classId,
        programName: formProgram,
        department: formDept,
        academicSession: formSession,
        academicYear: formYear,
        semester: formSemester,
        section: formSection,
        subjectName: formSubject,
        subjectCode: formSubjectCode,
        subjectType: formSubjectType,
        studentCount: formStudents,
        isSample: false,
      };
      onAddClass(newClass);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Program & Class Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Maintain degree programs, academic sessions, semesters, sections, and Subject Types (Theory Only vs Theory + Lab).
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 self-start sm:self-center shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Class Section
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search program, subject..."
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
            <option value="All">All Academic Sessions</option>
            <option value="Fall">Fall Session</option>
            <option value="Spring">Spring Session</option>
          </select>
        </div>

        <div>
          <select
            value={filterSubjectType}
            onChange={(e) => setFilterSubjectType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="All">All Subject Types</option>
            <option value="Theory Only">Theory Only</option>
            <option value="Theory + Lab">Theory + Lab</option>
          </select>
        </div>
      </div>

      {/* Classes Table View */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100">Configured Class Sections</h3>
          <span className="text-xs font-mono text-slate-400">{filteredClasses.length} Total Records</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Program Name</th>
                <th className="p-3.5">Sem & Sec</th>
                <th className="p-3.5">Session / Year</th>
                <th className="p-3.5">Subject & Code</th>
                <th className="p-3.5">Subject Type</th>
                <th className="p-3.5">Students</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                    No matching class records found.
                  </td>
                </tr>
              ) : (
                filteredClasses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-slate-100">
                      <div className="flex items-center gap-2">
                        <span>{c.programName}</span>
                        {c.isSample && (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                            Sample
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        Sem {c.semester} - Sec {c.section}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-indigo-300">
                      {c.academicSession} {c.academicYear}
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-200">{c.subjectName}</div>
                      <span className="text-[10px] font-mono text-slate-400">{c.subjectCode}</span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono border ${
                          c.subjectType === 'Theory + Lab'
                            ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                            : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                        }`}
                      >
                        {c.subjectType}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{c.studentCount}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                          title="Edit Class"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(c.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Class"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">
                {editingClass ? 'Edit Class & Subject Type' : 'Add New Class Section'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Program / Degree Name *</label>
                <input
                  type="text"
                  required
                  value={formProgram}
                  onChange={(e) => setFormProgram(e.target.value)}
                  placeholder="e.g. BS Computer Science"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Subject Type Configuration Selector (Requirement #1) */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-200 block">Subject Type Configuration *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormSubjectType('Theory Only')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                      formSubjectType === 'Theory Only'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Theory Only
                    </div>
                    <span className="text-[10px] opacity-80 block mt-0.5">
                      Generates: Midterm Theory & Final Theory
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormSubjectType('Theory + Lab')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                      formSubjectType === 'Theory + Lab'
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5" /> Theory + Lab
                    </div>
                    <span className="text-[10px] opacity-80 block mt-0.5">
                      Generates: Midterm Theory, Final Theory & Final Lab
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Academic Session</label>
                  <select
                    value={formSession}
                    onChange={(e) => setFormSession(e.target.value as AcademicSession)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                  >
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Academic Year</label>
                  <input
                    type="text"
                    required
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Semester (1-8)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    required
                    value={formSemester}
                    onChange={(e) => setFormSemester(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Section</label>
                  <input
                    type="text"
                    required
                    value={formSection}
                    onChange={(e) => setFormSection(e.target.value.toUpperCase())}
                    placeholder="A, B..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Student Count</label>
                  <input
                    type="number"
                    min={1}
                    value={formStudents}
                    onChange={(e) => setFormStudents(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Subject Name *</label>
                  <input
                    type="text"
                    required
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Course Code</label>
                  <input
                    type="text"
                    value={formSubjectCode}
                    onChange={(e) => setFormSubjectCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                >
                  {editingClass ? 'Save Changes' : 'Create Class & Generate Papers'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-100">Confirm Class Deletion</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this class record? Deleting a class will also remove its associated examination paper requirements from tracking.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteClass(deletingId);
                  setDeletingId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md"
              >
                Delete Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
