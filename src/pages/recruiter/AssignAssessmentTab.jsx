import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Send,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  Users,
  User,
  Search,
  X,
  SlidersHorizontal,
  Mail,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Loader2,
  Trash2,
  ChevronRight,
  Layers,
  Sparkles,
  Check,
  Building2,
  HelpCircle,
  FileCheck2,
  Info
} from 'lucide-react';
import api from '../../api';

// Helper ActionButton
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

const AssignAssessmentTab = ({
  savedAssessments = [],
  candidates = [],
  candidateGroups = [],
  assignments = [],
  fetchAssignments,
  showToast,
  setActiveTab,
  initialSelectedAssessment = null,
  initialSelectedCandidate = null
}) => {
  // 1. Assessment Selection State
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(
    initialSelectedAssessment?.id || savedAssessments[0]?.id || ''
  );

  // 2. Target Mode: 'INDIVIDUAL' or 'GROUP'
  const [assignMode, setAssignMode] = useState('INDIVIDUAL');

  // 3. Selection State
  const [selectedCandidateEmails, setSelectedCandidateEmails] = useState(
    initialSelectedCandidate?.email ? [initialSelectedCandidate.email] : []
  );
  const [selectedGroupId, setSelectedGroupId] = useState('');

  // 4. Scheduling & Validity
  const defaultStartDate = new Date().toISOString().slice(0, 16);
  const defaultDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [startTimeInput, setStartTimeInput] = useState(defaultStartDate);
  const [dueDateInput, setDueDateInput] = useState(defaultDueDate);
  const [customNote, setCustomNote] = useState('');

  // 5. Filters
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  const [assessmentSearchQuery, setAssessmentSearchQuery] = useState('');
  const [assignmentSearchQuery, setAssignmentSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial selections if props change
  useEffect(() => {
    if (initialSelectedAssessment?.id) {
      setSelectedAssessmentId(initialSelectedAssessment.id);
    }
  }, [initialSelectedAssessment]);

  useEffect(() => {
    if (initialSelectedCandidate?.email) {
      setSelectedCandidateEmails([initialSelectedCandidate.email]);
      setAssignMode('INDIVIDUAL');
    }
  }, [initialSelectedCandidate]);

  useEffect(() => {
    if (!selectedGroupId && candidateGroups.length > 0) {
      setSelectedGroupId(candidateGroups[0].id);
    }
  }, [candidateGroups, selectedGroupId]);

  // Selected assessment object
  const selectedAssessment = useMemo(() => {
    return savedAssessments.find(a => String(a.id) === String(selectedAssessmentId)) || savedAssessments[0];
  }, [savedAssessments, selectedAssessmentId]);

  // Selected group object
  const selectedGroup = useMemo(() => {
    return candidateGroups.find(g => String(g.id) === String(selectedGroupId));
  }, [candidateGroups, selectedGroupId]);

  // Filtered candidate list
  const filteredCandidates = useMemo(() => {
    const q = candidateSearchQuery.toLowerCase();
    return candidates.filter(c => {
      const name = (c.full_name || c.name || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const role = (c.role || c.job_title || '').toLowerCase();
      return name.includes(q) || email.includes(q) || role.includes(q);
    });
  }, [candidates, candidateSearchQuery]);

  // Filtered assessments list
  const filteredAssessments = useMemo(() => {
    const q = assessmentSearchQuery.toLowerCase();
    return savedAssessments.filter(a => {
      const name = (a.name || '').toLowerCase();
      const subs = Array.isArray(a.subjects) ? a.subjects.join(' ').toLowerCase() : '';
      return name.includes(q) || subs.includes(q);
    });
  }, [savedAssessments, assessmentSearchQuery]);

  // Helper to extract candidate objects from a group
  const getGroupCandidates = (grp) => {
    if (!grp) return [];

    // 1. If candidateIds array exists
    const candIds = grp.candidateIds || grp.candidate_ids || [];
    if (Array.isArray(candIds) && candIds.length > 0) {
      const matched = candidates.filter(c =>
        candIds.includes(c.id) ||
        candIds.includes(String(c.id)) ||
        candIds.includes(Number(c.id)) ||
        candIds.includes(c.email)
      );
      if (matched.length > 0) return matched;

      // If IDs are email strings
      if (candIds.every(id => typeof id === 'string' && id.includes('@'))) {
        return candIds.map(email => ({ email, full_name: email, name: email }));
      }
    }

    // 2. If candidates or members array contains objects
    const directList = grp.candidates || grp.members || [];
    if (Array.isArray(directList) && directList.length > 0) {
      if (typeof directList[0] === 'object') {
        return directList;
      }
      return candidates.filter(c => directList.includes(c.id) || directList.includes(c.email));
    }

    // 3. Match by groupId or group name on candidate objects
    const matchedByGroupId = candidates.filter(c =>
      String(c.groupId) === String(grp.id) ||
      String(c.group_id) === String(grp.id) ||
      (c.group && (c.group === grp.name || c.group.id === grp.id || c.group.name === grp.name)) ||
      (c.batch && (c.batch === grp.name || c.batch.id === grp.id || c.batch.name === grp.name))
    );
    if (matchedByGroupId.length > 0) return matchedByGroupId;

    return [];
  };

  const getGroupMemberCount = (grp) => {
    if (!grp) return 0;
    if (Array.isArray(grp.candidateIds) && grp.candidateIds.length > 0) return grp.candidateIds.length;
    if (Array.isArray(grp.candidate_ids) && grp.candidate_ids.length > 0) return grp.candidate_ids.length;
    if (grp.candidate_count !== undefined && grp.candidate_count !== null) return grp.candidate_count;
    if (grp.candidates_count !== undefined && grp.candidates_count !== null) return grp.candidates_count;
    return getGroupCandidates(grp).length;
  };

  // Total recipient count calculation
  const targetRecipientEmails = useMemo(() => {
    if (assignMode === 'INDIVIDUAL') {
      return selectedCandidateEmails;
    }
    if (assignMode === 'GROUP' && selectedGroup) {
      const groupCandidates = getGroupCandidates(selectedGroup);
      const emails = groupCandidates.map(c => c.email || c.candidateEmail).filter(Boolean);
      return emails;
    }
    return [];
  }, [assignMode, selectedCandidateEmails, selectedGroup, candidates]);

  // Toggle single candidate selection
  const handleToggleCandidateEmail = (email) => {
    setSelectedCandidateEmails(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  // Toggle all filtered candidates
  const handleToggleAllFiltered = () => {
    const filteredEmails = filteredCandidates.map(c => c.email).filter(Boolean);
    const allSelected = filteredEmails.every(e => selectedCandidateEmails.includes(e));

    if (allSelected) {
      setSelectedCandidateEmails(prev => prev.filter(e => !filteredEmails.includes(e)));
    } else {
      setSelectedCandidateEmails(prev => [...new Set([...prev, ...filteredEmails])]);
    }
  };

  // Dispatch Assignment Submission
  const handleDispatchAssignments = async () => {
    if (!selectedAssessment) {
      showToast("Please select an assessment to assign.");
      return;
    }

    if (targetRecipientEmails.length === 0) {
      showToast(assignMode === 'INDIVIDUAL' ? "Please select at least one candidate." : "Please select a candidate group.");
      return;
    }

    if (!startTimeInput) {
      showToast("Please select a valid start time.");
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;
    let failedCount = 0;

    try {
      for (const email of targetRecipientEmails) {
        try {
          const payload = {
            assessmentId: selectedAssessment.id,
            candidateEmail: email,
            dueDate: dueDateInput ? new Date(dueDateInput).toISOString() : null,
            startDate: startTimeInput.split('T')[0],
            startTime: startTimeInput.split('T')[1] || '00:00'
          };
          await api.post('/api/assignments', payload);
          successCount++;
        } catch (err) {
          console.error(`Failed to assign to ${email}:`, err);
          failedCount++;
        }
      }

      if (successCount > 0) {
        showToast(`Successfully assigned to ${successCount} candidate${successCount > 1 ? 's' : ''}!`);
        if (fetchAssignments) await fetchAssignments();
        // Reset selections
        if (assignMode === 'INDIVIDUAL') {
          setSelectedCandidateEmails([]);
        }
      }

      if (failedCount > 0) {
        showToast(`Note: ${failedCount} assignment(s) could not be completed.`);
      }
    } catch (err) {
      console.error("Dispatch assignment error:", err);
      showToast("Error processing assignments.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered recent assignments
  const filteredAssignments = useMemo(() => {
    const q = assignmentSearchQuery.toLowerCase();
    return assignments.filter(a => {
      const cand = (a.candidateName || a.candidateEmail || '').toLowerCase();
      const asm = (a.assessmentName || '').toLowerCase();
      const st = (a.status || '').toLowerCase();
      return cand.includes(q) || asm.includes(q) || st.includes(q);
    });
  }, [assignments, assignmentSearchQuery]);

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Banner Ribbon */}
      <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full">
              Assignment Studio
            </span>
          </div>
          <h2 className="font-outfit font-extrabold text-2xl text-slate-900 dark:text-slate-50 tracking-tight">
            Assign Assessment
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Configure candidate recipients, set scheduling windows, and dispatch evaluation invitations.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('assessments')}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
          >
            Manage Assessments
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ASSIGNMENT CONFIGURATION FORMS (8 COLS) */}
        <div className="xl:col-span-8 flex flex-col gap-6">

          {/* 1. SELECT ASSESSMENT CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <BookOpen size={16} />
                </div>
                <h3 className="font-outfit font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  1. Select Assessment
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                {savedAssessments.length} Available
              </span>
            </div>

            {/* Assessment Selector Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-64 overflow-y-auto pr-1 dashboard-scrollbar">
              {filteredAssessments.map(asm => {
                const isSelected = String(asm.id) === String(selectedAssessmentId);
                return (
                  <div
                    key={asm.id}
                    onClick={() => setSelectedAssessmentId(asm.id)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs ring-1 ring-indigo-500/20'
                        : 'border-slate-200/80 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-outfit font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate" title={asm.name}>
                          {asm.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {asm.duration || '60m'} • {asm.questionsCount || asm.questions?.length || 0} Questions
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                      }`}>
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(asm.subjects) && asm.subjects.map(s => (
                        <span key={s} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. TARGET AUDIENCE SELECTOR CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Users size={16} />
                </div>
                <h3 className="font-outfit font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  2. Choose Candidate Recipients
                </h3>
              </div>

              {/* Mode Toggle (Individual vs Group) */}
              <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setAssignMode('INDIVIDUAL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                    assignMode === 'INDIVIDUAL'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-transparent'
                  }`}
                >
                  Individual Candidates
                </button>
                <button
                  type="button"
                  onClick={() => setAssignMode('GROUP')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                    assignMode === 'GROUP'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-transparent'
                  }`}
                >
                  Candidate Groups
                </button>
              </div>
            </div>

            {/* TAB 1: INDIVIDUAL CANDIDATES TABLE */}
            {assignMode === 'INDIVIDUAL' && (
              <div className="flex flex-col gap-4">
                {/* Search & Select All Bar */}
                <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search candidates by name, email..."
                      value={candidateSearchQuery}
                      onChange={(e) => setCandidateSearchQuery(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 pl-8 pr-3 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleToggleAllFiltered}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      {filteredCandidates.every(c => selectedCandidateEmails.includes(c.email)) ? 'Deselect All' : 'Select All Filtered'}
                    </button>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800">
                      {selectedCandidateEmails.length} Selected
                    </span>
                  </div>
                </div>

                {/* Candidate Directory Table */}
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl max-h-72 overflow-y-auto dashboard-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                        <th className="py-2.5 px-4 w-10"></th>
                        <th className="py-2.5 px-4">Candidate</th>
                        <th className="py-2.5 px-4">Job Role / Dept</th>
                        <th className="py-2.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {filteredCandidates.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-slate-400">
                            No candidates found matching search query.
                          </td>
                        </tr>
                      ) : (
                        filteredCandidates.map(cand => {
                          const isChecked = selectedCandidateEmails.includes(cand.email);
                          return (
                            <tr
                              key={cand.id || cand.email}
                              onClick={() => handleToggleCandidateEmail(cand.email)}
                              className={`cursor-pointer transition-colors ${
                                isChecked
                                  ? 'bg-indigo-50/40 dark:bg-indigo-950/30'
                                  : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                              }`}
                            >
                              <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleCandidateEmail(cand.email)}
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                                    {(cand.full_name || cand.name || 'C')[0]}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 dark:text-slate-100">{cand.full_name || cand.name || 'Candidate'}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">{cand.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                                {cand.role || cand.job_title || 'Software Engineer'}
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  {cand.status || 'Active'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: CANDIDATE GROUPS */}
            {assignMode === 'GROUP' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {candidateGroups.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    No candidate groups created yet. You can create groups in the Candidate Groups tab.
                  </div>
                ) : (
                  candidateGroups.map(grp => {
                    const isSelected = String(grp.id) === String(selectedGroupId);
                    const memberCount = getGroupMemberCount(grp);

                    return (
                      <div
                        key={grp.id}
                        onClick={() => setSelectedGroupId(grp.id)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs ring-1 ring-indigo-500/20'
                            : 'border-slate-200/80 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                              <Building2 size={16} />
                            </div>
                            <span className="font-mono font-extrabold text-[11px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              {memberCount} Candidates
                            </span>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                          }`}>
                            {isSelected && <Check size={10} strokeWidth={3} />}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-outfit font-extrabold text-sm text-slate-900 dark:text-slate-100">{grp.name}</h4>
                          {grp.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{grp.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* 3. SCHEDULING & INVITATION SETTINGS CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Calendar size={16} />
                </div>
                <h3 className="font-outfit font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  3. Validity Window & Instructions
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-400">Schedule</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date & Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Assessment Start Time
                </label>
                <input
                  type="datetime-local"
                  value={startTimeInput}
                  onChange={(e) => setStartTimeInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Due Date & Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Assessment Expiration / Due Date
                </label>
                <input
                  type="datetime-local"
                  value={dueDateInput}
                  onChange={(e) => setDueDateInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Custom Notes / Message */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Custom Candidate Message (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Please complete this technical screening assessment before our next interview round..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3.5 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 resize-y"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DISPATCH BLUEPRINT & SUMMARY (4 COLS) */}
        <div className="xl:col-span-4 flex flex-col gap-6 sticky top-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                <h3 className="font-outfit font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Dispatch Summary
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                Review
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col">
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Recipients
                </span>
                <span className="text-xl font-mono font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {targetRecipientEmails.length}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col">
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Duration
                </span>
                <span className="text-xl font-mono font-black text-slate-900 dark:text-slate-100 mt-1">
                  {selectedAssessment?.duration?.replace(' minutes', 'm') || '60m'}
                </span>
              </div>
            </div>

            {/* Selected Assessment Preview */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Target Assessment
              </span>
              <p className="font-outfit font-extrabold text-xs text-slate-900 dark:text-slate-100">
                {selectedAssessment?.name || 'No assessment selected'}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                <span>{selectedAssessment?.questionsCount || selectedAssessment?.questions?.length || 0} Questions</span>
                <span>•</span>
                <span>{selectedAssessment?.difficulty || 'Medium'}</span>
              </div>
            </div>

            {/* Recipient Audience Chip */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Audience Mode
              </span>
              <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                {assignMode === 'INDIVIDUAL'
                  ? `${selectedCandidateEmails.length} Individual Candidate(s)`
                  : selectedGroup ? `Group: ${selectedGroup.name} (${targetRecipientEmails.length} members)` : 'No group selected'}
              </p>
            </div>

            {/* PRIMARY DISPATCH BUTTON */}
            <button
              type="button"
              onClick={handleDispatchAssignments}
              disabled={isSubmitting || targetRecipientEmails.length === 0 || !selectedAssessment}
              className={`w-full py-4 px-6 rounded-2xl font-outfit font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 shadow-md cursor-pointer border-none ${
                isSubmitting
                  ? 'bg-indigo-600/80 text-white cursor-not-allowed animate-pulse'
                  : targetRecipientEmails.length === 0 || !selectedAssessment
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={17} className="animate-spin" />
                  <span>Dispatching Invitations...</span>
                </>
              ) : (
                <>
                  <Send size={17} />
                  <span>Dispatch to {targetRecipientEmails.length} Candidate{targetRecipientEmails.length === 1 ? '' : 's'}</span>
                </>
              )}
            </button>

            {targetRecipientEmails.length === 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium text-center">
                Please select at least one candidate recipient to dispatch.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: RECENT ASSIGNMENTS MONITOR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-5 mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full">
                Active Queue Monitor
              </span>
            </div>
            <h3 className="font-outfit font-extrabold text-base text-slate-900 dark:text-slate-50">
              Live & Recent Assessment Assignments ({assignments.length})
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search assignment records..."
              value={assignmentSearchQuery}
              onChange={(e) => setAssignmentSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Assignments Table */}
        {filteredAssignments.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            No assignments found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Assessment</th>
                  <th className="py-3 px-4">Assigned Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
                {filteredAssignments.slice(0, 15).map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {(item.candidateName || 'C')[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{item.candidateName || 'Candidate'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{item.candidateEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.assessmentName || 'Assessment'}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                        item.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' :
                        item.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' :
                        item.status === 'EXPIRED' ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20' :
                        'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20'
                      }`}>
                        {item.status || 'ASSIGNED'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.score !== null && item.score !== undefined ? (
                        <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                          {item.score}%
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <ActionButton
                        onClick={async () => {
                          try {
                            await api.delete(`/api/assignments/${item.id}`);
                            if (showToast) showToast('Assignment removed successfully.');
                            if (fetchAssignments) await fetchAssignments();
                          } catch (err) {
                            console.error('Failed to delete assignment:', err);
                            if (showToast) showToast('Failed to delete assignment.');
                          }
                        }}
                        loadingText="Removing..."
                        icon={Trash2}
                        iconSize={12}
                        className="px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-600 hover:text-white transition-all cursor-pointer inline-flex"
                        title="Delete Assignment"
                      >
                        Delete
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AssignAssessmentTab;
