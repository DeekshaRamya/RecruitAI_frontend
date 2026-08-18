import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  BookOpen,
  Calendar,
  Eye,
  UserPlus,
  Trash2,
  Users,
  Search,
  X,
  SlidersHorizontal,
  User,
  Mail,
  Phone,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import api from '../../api';

// ActionButton with loading state support
const ActionButton = ({ onClick, disabled, isLoading, loadingText, title, icon: Icon, iconSize = 14, className = '', children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || isLoading}
    title={title}
    className={`cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
  >
    {isLoading ? (
      <>
        <Loader2 size={iconSize} className="animate-spin" />
        <span>{loadingText || 'Loading...'}</span>
      </>
    ) : (
      <>
        {Icon && <Icon size={iconSize} />}
        <span>{children}</span>
      </>
    )}
  </button>
);

// CANDIDATE DETAILS MODAL COMPONENT
const CandidateDetailsModal = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dash-dark-purple/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-[24px] border border-dash-border-gray shadow-2xl w-full max-w-lg p-6 flex flex-col gap-5"
      >
        <div className="flex items-center justify-between border-b border-dash-border-gray/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-dash-primary-purple text-white flex items-center justify-center font-extrabold text-base shadow-sm">
              {item.candidateName ? item.candidateName[0] : 'C'}
            </div>
            <div>
              <h3 className="font-outfit font-extrabold text-base text-dash-dark-purple">
                {item.candidateName || 'Candidate Information'}
              </h3>
              <span className="text-xs text-dash-light-purple font-medium">
                Candidate ID: {item.candidateId}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-dash-light-purple hover:bg-dash-soft-pink hover:text-dash-dark-purple transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section 1: Candidate Info */}
        <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray/40 rounded-2xl p-4 flex flex-col gap-2.5">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-dash-primary-purple">
            Candidate Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Full Name</p>
              <p className="font-bold text-dash-dark-purple">{item.candidateName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Email Address</p>
              <p className="font-bold text-dash-dark-purple">{item.candidateEmail || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Phone Number</p>
              <p className="font-bold text-dash-dark-purple">{item.candidatePhone || 'Not Provided'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Candidate ID</p>
              <p className="font-mono text-[11px] font-semibold text-dash-dark-purple truncate">{item.candidateId}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Assessment Info */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col gap-2.5">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-dash-primary-purple">
            Assessment Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Assessment Name</p>
              <p className="font-bold text-dash-dark-purple">{item.assessmentName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Assessment ID</p>
              <p className="font-mono text-[11px] font-semibold text-dash-dark-purple truncate">{item.assessmentId}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Assigned Date & Time</p>
              <p className="font-bold text-dash-dark-purple">
                {item.assignedAt ? new Date(item.assignedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Due Date</p>
              <p className="font-bold text-dash-dark-purple">
                {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'No Due Date'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Current Status</p>
              <span className="font-bold text-dash-primary-purple uppercase text-[11px]">{item.status}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Score</p>
              <p className="font-bold text-dash-dark-purple">
                {item.score !== null && item.score !== undefined ? `${item.score}%` : 'Pending Completion'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-dash-dark-purple text-white font-bold text-xs hover:bg-dash-primary-purple transition-all cursor-pointer border-none"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ASSIGNED CANDIDATES MODAL COMPONENT
const AssignedCandidatesModal = ({
  assessment,
  assignments = [],
  onClose,
  fetchAssignments,
  showToast,
  onAssignClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState(null);

  if (!assessment) return null;

  const asmAssignments = assignments.filter(
    (a) => String(a.assessmentId) === String(assessment.id) || String(a.assessment_id) === String(assessment.id)
  );

  const filtered = asmAssignments.filter((a) => {
    const name = (a.candidateName || '').toLowerCase();
    const email = (a.candidateEmail || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = name.includes(q) || email.includes(q);

    if (!matchesSearch) return false;
    if (statusFilter !== 'ALL' && (a.status || '').toUpperCase() !== statusFilter) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN_PROGRESS':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'EXPIRED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'SCHEDULED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dash-dark-purple/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-[24px] border border-dash-border-gray shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-dash-border-gray/40 flex items-center justify-between bg-dash-light-blue-bg/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md bg-dash-primary-purple/10 text-dash-primary-purple border border-dash-primary-purple/20">
                  Assigned Candidate Details
                </span>
                <span className="text-xs text-dash-light-purple font-semibold">
                  Assessment ID: {assessment.id}
                </span>
              </div>
              <h2 className="font-outfit font-extrabold text-xl text-dash-dark-purple mt-1">
                {assessment.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-dash-light-purple hover:bg-dash-soft-pink hover:text-dash-dark-purple transition-all cursor-pointer border-none bg-transparent"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex flex-col gap-5">
            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-dash-light-blue-bg/30 border border-dash-border-gray/40">
                <p className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider">Total Assigned</p>
                <p className="text-xl font-extrabold text-dash-dark-purple mt-0.5">{asmAssignments.length}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/50">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">In Progress</p>
                <p className="text-xl font-extrabold text-amber-700 mt-0.5">
                  {asmAssignments.filter(a => a.status === 'IN_PROGRESS').length}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/50">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Completed</p>
                <p className="text-xl font-extrabold text-emerald-700 mt-0.5">
                  {asmAssignments.filter(a => a.status === 'COMPLETED').length}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200/50">
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Expired / Locked</p>
                <p className="text-xl font-extrabold text-rose-700 mt-0.5">
                  {asmAssignments.filter(a => a.status === 'EXPIRED').length}
                </p>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 border border-slate-200/60 p-3 rounded-2xl">
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-light-purple" />
                <input
                  type="text"
                  placeholder="Search candidate name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-dash-border-gray rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <SlidersHorizontal size={14} className="text-dash-light-purple" />
                <span className="text-xs font-bold text-dash-light-purple">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-bold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            </div>

            {/* Candidates Table */}
            {filtered.length === 0 ? (
              <div className="p-12 text-center border border-dash-border-gray/50 rounded-2xl bg-slate-50/50">
                <User size={32} className="mx-auto text-dash-light-purple/50 mb-2" />
                <p className="font-bold text-sm text-dash-dark-purple">
                  No candidate has been assigned to this assessment.
                </p>
                <p className="text-xs text-dash-light-purple mt-1">
                  Assign this assessment to candidates using the "Assign" button.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-dash-border-gray/60 rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-dash-border-gray/50 text-[11px] font-extrabold text-dash-light-purple uppercase tracking-wider">
                      <th className="py-3 px-4">Candidate Details</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Assigned On</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dash-border-gray/30 text-xs font-semibold text-dash-dark-purple">
                    {filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-dash-primary-purple/15 text-dash-primary-purple flex items-center justify-center font-bold text-xs shrink-0">
                              {item.candidateName ? item.candidateName[0] : 'C'}
                            </div>
                            <div>
                              <p className="font-bold text-dash-dark-purple">{item.candidateName || 'Candidate'}</p>
                              <p className="text-[11px] text-dash-light-purple font-medium flex items-center gap-1.5 mt-0.5">
                                <Mail size={11} /> {item.candidateEmail}
                              </p>
                              {item.candidatePhone && (
                                <p className="text-[10px] text-dash-light-purple/80 font-medium flex items-center gap-1.5">
                                  <Phone size={10} /> {item.candidatePhone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border uppercase tracking-wider ${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-dash-light-purple">
                          {item.assignedAt ? new Date(item.assignedAt).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-dash-light-purple">
                          {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'None'}
                        </td>
                        <td className="py-3.5 px-4">
                          {item.score !== null && item.score !== undefined ? (
                            <span className="font-extrabold text-dash-primary-purple bg-dash-primary-purple/10 px-2 py-0.5 rounded-md">
                              {item.score}%
                            </span>
                          ) : (
                            <span className="text-dash-light-purple/60 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedCandidateDetail(item)}
                              className="px-2.5 py-1.5 rounded-xl bg-dash-primary-purple/10 border border-dash-primary-purple/30 text-dash-primary-purple font-bold text-xs hover:bg-dash-primary-purple hover:text-white transition-all cursor-pointer"
                            >
                              Details
                            </button>
                            <ActionButton
                              onClick={async () => {
                                try {
                                  await api.delete(`/api/assignments/${item.id}`);
                                  if (showToast) showToast('Assignment deleted successfully.');
                                  if (fetchAssignments) await fetchAssignments();
                                } catch (err) {
                                  console.error('Failed to delete assignment:', err);
                                  if (showToast) showToast('Failed to delete assignment.');
                                }
                              }}
                              loadingText="Deleting..."
                              icon={Trash2}
                              iconSize={12}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 font-bold text-xs hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                              title="Delete Assignment"
                            >
                              Delete
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Candidate Details Panel Modal */}
      {selectedCandidateDetail && (
        <CandidateDetailsModal
          item={selectedCandidateDetail}
          onClose={() => setSelectedCandidateDetail(null)}
        />
      )}
    </AnimatePresence>
  );
};

// ACTIVE ASSESSMENTS TAB COMPONENT
export const ActiveAssessmentsTab = ({
  savedAssessments,
  setSavedAssessments,
  setGeneratedQuestions,
  assignments = [],
  fetchAssignments,
  showToast,
  setActiveTab,
  onAssignClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingAssignedModalAssessment, setViewingAssignedModalAssessment] = useState(null);

  const handlePreviewAssessment = (asm) => {
    if (setGeneratedQuestions) {
      setGeneratedQuestions(asm.questions || []);
    }
    setActiveTab('preview-questions');
    showToast(`Loaded question preview for "${asm.name}".`);
  };

  const handleDeleteAssessment = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${name}"?`);
    if (!confirmDelete) return;

    try {
      await api.delete(`/api/assessment/${id}`);
      setSavedAssessments(prev => prev.filter(asm => asm.id !== id));
      showToast(`Assessment "${name}" deleted successfully.`);
    } catch (err) {
      console.error("Failed to delete assessment from backend:", err);
      showToast("Error deleting assessment.");
    }
  };

  const validActiveAssessments = (() => {
    const raw = (Array.isArray(savedAssessments) ? savedAssessments : []).filter(asm => {
      if (!asm || !asm.id || !asm.name) return false;
      const st = (asm.status || 'Active').toUpperCase();
      return st === 'ACTIVE' || st === 'CREATED';
    });
    const seenIds = new Set();
    const seenNames = new Set();
    return raw.filter(asm => {
      const idKey = asm.id ? String(asm.id) : null;
      const nameKey = asm.name ? String(asm.name).trim().toLowerCase() : null;
      if (idKey && seenIds.has(idKey)) return false;
      if (nameKey && seenNames.has(nameKey)) return false;
      if (idKey) seenIds.add(idKey);
      if (nameKey) seenNames.add(nameKey);
      return true;
    });
  })();

  const filteredAssessments = validActiveAssessments.filter(asm => {
    const query = searchQuery.toLowerCase();
    const nameMatch = asm.name && asm.name.toLowerCase().includes(query);
    const subjectMatch = Array.isArray(asm.subjects) && asm.subjects.some(sub => sub.toLowerCase().includes(query));
    return nameMatch || subjectMatch;
  });

  const getSubjectBadgeClass = (subject) => {
    switch (subject.toLowerCase()) {
      case 'python':
        return 'bg-dash-primary-purple/10 text-dash-primary-purple border-dash-primary-purple/20';
      case 'sql':
        return 'bg-blue-50 text-blue-600 border-blue-200/50';
      case 'aptitude':
        return 'bg-amber-50 text-amber-600 border-amber-200/50';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy':
        return 'text-green-600 bg-green-50 border-green-200/50';
      case 'Medium':
        return 'text-amber-600 bg-amber-50 border-amber-200/50';
      case 'Hard':
        return 'text-rose-600 bg-rose-50 border-rose-200/50';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Search & Actions Bar */}
      <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dash-light-purple transition-colors duration-300 group-focus-within:text-dash-primary-purple" size={16} />
          <input
            type="text"
            placeholder="Search active assessments by name or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-dash-dark-purple placeholder-dash-light-purple/60 focus:outline-none focus:border-dash-primary-purple transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dash-light-purple hover:text-dash-dark-purple">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Saved Assessments */}
      {filteredAssessments.length === 0 ? (
        <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-12 text-center flex flex-col items-center justify-center min-h-[350px] shadow-sm">
          <div className="p-4 rounded-full bg-dash-light-blue-bg text-dash-primary-purple mb-4">
            <BookOpen size={36} className="animate-pulse" />
          </div>
          <h3 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple">
            {searchQuery ? "No Assessments Found" : "No active assessments available."}
          </h3>
          <p className="text-xs text-dash-light-purple font-medium mt-2 max-w-sm leading-relaxed">
            {searchQuery
              ? `No active assessments match "${searchQuery}". Try refining your search query.`
              : 'No active assessments have been found in the system.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAssessments.map((asm) => {
            const asmAssignments = assignments.filter(
              (a) => String(a.assessmentId) === String(asm.id) || String(a.assessment_id) === String(asm.id)
            );

            return (
              <motion.div
                key={asm.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-dash-white-card border border-dash-border-gray hover:border-dash-primary-purple/40 rounded-[24px] p-6 shadow-sm flex flex-col justify-between gap-5 transition-all duration-300 relative group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <h4 className="font-outfit font-extrabold text-base text-dash-dark-purple leading-snug group-hover:text-dash-primary-purple transition-colors duration-200 truncate max-w-[200px]" title={asm.name}>
                      {asm.name}
                    </h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 uppercase tracking-wider ${getDifficultyColor(asm.difficulty)}`}>
                      {asm.difficulty}
                    </span>
                  </div>

                  {/* Creation Date */}
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-dash-light-purple mb-4">
                    <Calendar size={12} />
                    <span>Created: {asm.createdDate}</span>
                  </div>

                  {/* Subject Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4.5">
                    {asm.subjects.map(sub => (
                      <span key={sub} className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${getSubjectBadgeClass(sub)}`}>
                        {sub}
                      </span>
                    ))}
                  </div>

                  {/* Meta items */}
                  <div className="grid grid-cols-2 gap-3.5 bg-dash-light-blue-bg/25 border border-dash-border-gray/30 p-3 rounded-xl mb-3 text-xs font-semibold text-dash-dark-purple">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-dash-primary-purple" />
                      <span>{asm.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-dash-primary-purple" />
                      <span>{asm.questionsCount} Questions</span>
                    </div>
                  </div>

                  {/* Candidates Assigned Details Section */}
                  {(() => {
                    if (asmAssignments.length === 0) {
                      return (
                        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 my-2 text-center">
                          <p className="text-[11px] text-slate-500 font-medium">
                            No candidate has been assigned to this assessment.
                          </p>
                        </div>
                      );
                    }

                    if (asmAssignments.length === 1) {
                      const singleAssigned = asmAssignments[0];
                      return (
                        <div className="bg-dash-light-blue-bg/40 border border-dash-primary-purple/20 rounded-xl p-3 my-2 flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-dash-primary-purple/15 text-dash-primary-purple flex items-center justify-center font-bold text-xs shrink-0">
                                <User size={13} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-dash-dark-purple truncate" title={singleAssigned.candidateName}>
                                  {singleAssigned.candidateName || 'Assigned Candidate'}
                                </p>
                                <p className="text-[10px] text-dash-light-purple font-medium truncate" title={singleAssigned.candidateEmail}>
                                  {singleAssigned.candidateEmail}
                                </p>
                              </div>
                            </div>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider shrink-0 ${singleAssigned.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                              singleAssigned.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                singleAssigned.status === 'EXPIRED' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                  'bg-indigo-50 text-indigo-600 border-indigo-200'
                              }`}>
                              {singleAssigned.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-dash-light-purple border-t border-dash-border-gray/30 pt-1.5 mt-1">
                            <span>Assigned: {singleAssigned.assignedAt ? new Date(singleAssigned.assignedAt).toLocaleDateString() : 'Recent'}</span>
                            <button
                              onClick={() => setViewingAssignedModalAssessment(asm)}
                              className="text-dash-primary-purple font-bold hover:underline cursor-pointer border-none bg-transparent"
                            >
                              View Details &rarr;
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="bg-dash-primary-purple/10 border border-dash-primary-purple/20 rounded-xl p-3 my-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-dash-primary-purple text-white">
                            <Users size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-dash-dark-purple">
                              Assigned Candidates: {asmAssignments.length}
                            </p>
                            <p className="text-[10px] text-dash-light-purple font-medium">
                              {asmAssignments.filter(a => a.status === 'COMPLETED').length} Completed, {asmAssignments.filter(a => a.status === 'IN_PROGRESS').length} In Progress
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setViewingAssignedModalAssessment(asm)}
                          className="px-2.5 py-1.5 rounded-lg bg-dash-primary-purple text-white font-bold text-[10px] hover:bg-dash-dark-purple transition-colors cursor-pointer border-none shadow-sm"
                        >
                          View List &rarr;
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Card Actions */}
                <div className="border-t border-dash-border-gray/30 pt-4 mt-1">
                  <div className="flex items-center justify-between gap-2.5 w-full">
                    <button
                      onClick={() => handlePreviewAssessment(asm)}
                      className="flex-1 py-2.5 rounded-xl border border-dash-primary-purple/30 bg-dash-primary-purple/10 hover:bg-dash-primary-purple/20 text-dash-primary-purple font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Preview Questions</span>
                    </button>

                    <button
                      onClick={() => onAssignClick(asm)}
                      className="flex-1 py-2.5 rounded-xl bg-dash-primary-purple/10 border border-dash-primary-purple/20 hover:bg-dash-primary-purple/20 text-dash-primary-purple font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus size={13} />
                      <span>Assign</span>
                    </button>

                    <button
                      onClick={() => handleDeleteAssessment(asm.id, asm.name)}
                      className="p-2.5 rounded-xl border border-red-100 hover:border-red-200 bg-red-50/30 hover:bg-red-50 text-red-600 transition-all duration-200 flex items-center justify-center cursor-pointer"
                      title="Delete Assessment"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal for viewing all assigned candidates */}
      {viewingAssignedModalAssessment && (
        <AssignedCandidatesModal
          assessment={viewingAssignedModalAssessment}
          assignments={assignments}
          onClose={() => setViewingAssignedModalAssessment(null)}
          fetchAssignments={fetchAssignments}
          showToast={showToast}
          onAssignClick={onAssignClick}
        />
      )}
    </div>
  );
};

export const ExpiredAssessmentsTab = ({
  assignments = [],
  fetchAssignments,
  showToast,
  savedAssessments = [],
  onAssignClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const expiredAssignments = useMemo(() => {
    const list = Array.isArray(assignments) ? assignments : [];
    const now = Date.now();
    return list.filter(a => {
      if (!a) return false;
      const st = (a.status || '').toUpperCase();
      if (st === 'EXPIRED') return true;

      if (st !== 'COMPLETED' && st !== 'SUBMITTED') {
        const endTimeVal = a.endTime || a.end_time || a.dueDate || a.due_date;
        if (endTimeVal && new Date(endTimeVal).getTime() < now) {
          return true;
        }
      }
      return false;
    });
  }, [assignments]);

  const filteredExpired = expiredAssignments.filter(a => {
    const q = searchQuery.toLowerCase();
    const candName = (a.candidateName || a.candidate?.full_name || a.candidate?.name || '').toLowerCase();
    const candEmail = (a.candidateEmail || a.candidate?.email || '').toLowerCase();
    const asmName = (a.assessmentName || a.assessment?.name || '').toLowerCase();
    return candName.includes(q) || candEmail.includes(q) || asmName.includes(q);
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      {/* Tab Header */}
      <div className="flex items-center justify-between bg-dash-white-card border border-dash-border-gray/50 rounded-[20px] p-5 shadow-sm">
        <div>
          <h2 className="font-outfit font-bold text-lg text-dash-dark-purple leading-tight flex items-center gap-2">
            <Clock size={20} className="text-rose-500" />
            <span>Expired Candidates & Assessments</span>
          </h2>
          <p className="text-xs text-dash-light-purple font-semibold mt-1">
            Track candidates whose assigned assessments have passed their expiration window or due date.
          </p>
        </div>
        <button
          onClick={fetchAssignments}
          className="p-2 border border-dash-border-gray hover:bg-dash-light-blue-bg/40 rounded-xl text-dash-dark-purple font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer bg-white"
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[28px] p-6 shadow-sm overflow-hidden flex flex-col gap-5">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dash-light-purple" />
          <input
            type="text"
            placeholder="Search candidate name, email, or assessment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-dash-border-gray rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple"
          />
        </div>

        {/* Content */}
        {filteredExpired.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
            <AlertCircle size={36} className="text-dash-light-purple/40" />
            <h4 className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple">No Expired Assessments</h4>
            <p className="text-xs text-dash-light-purple font-medium max-w-xs">
              {searchQuery ? `No expired assessments match "${searchQuery}".` : 'There are currently no expired candidate assessments.'}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dash-border-gray/25 text-[10px] text-dash-light-purple font-extrabold uppercase tracking-wider">
                  <th className="pb-3.5 pl-2">Candidate Name</th>
                  <th className="pb-3.5">Assessment Name</th>
                  <th className="pb-3.5">Assigned Date</th>
                  <th className="pb-3.5">Expiration Date</th>
                  <th className="pb-3.5">Status</th>
                  <th className="pb-3.5 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dash-border-gray/10 text-xs font-semibold">
                {filteredExpired.map((a) => {
                  const candidateName = a.candidateName || a.candidate?.full_name || a.candidate?.name || 'Candidate';
                  const candidateEmail = a.candidateEmail || a.candidate?.email || '';
                  const assessmentName = a.assessmentName || a.assessment?.name || 'Assessment';
                  const rawAssigned = a.assignedAt || a.assigned_at || a.created_at;
                  const rawExp = a.dueDate || a.due_date || a.endTime || a.end_time;

                  const assignedFormatted = rawAssigned ? new Date(rawAssigned).toLocaleString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : 'N/A';

                  const expFormatted = rawExp ? new Date(rawExp).toLocaleString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : 'Expired';

                  return (
                    <tr key={a.id} className="hover:bg-rose-50/20 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="flex flex-col">
                          <span className="text-dash-dark-purple font-bold text-xs">{candidateName}</span>
                          {candidateEmail && <span className="text-[10px] text-dash-light-purple font-medium">{candidateEmail}</span>}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dash-light-blue-bg/60 border border-dash-border-gray text-dash-primary-purple font-bold text-xs">
                          {assessmentName}
                        </span>
                      </td>
                      <td className="py-4 text-dash-light-purple">
                        {assignedFormatted}
                      </td>
                      <td className="py-4 text-rose-600 font-bold">
                        {expFormatted}
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-rose-50 border border-rose-200 text-rose-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Expired
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <div className="flex items-center justify-end gap-2">
                          <ActionButton
                            onClick={async () => {
                              try {
                                await api.delete(`/api/assignments/${a.id}`);
                                if (showToast) showToast('Expired assignment deleted successfully.');
                                if (fetchAssignments) await fetchAssignments();
                              } catch (err) {
                                console.error('Failed to delete expired assignment:', err);
                                if (showToast) showToast('Failed to delete assignment.');
                              }
                            }}
                            loadingText="Deleting..."
                            icon={Trash2}
                            iconSize={12}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 font-bold text-xs hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                            title="Delete Assignment"
                          >
                            Delete
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveAssessmentsTab;
