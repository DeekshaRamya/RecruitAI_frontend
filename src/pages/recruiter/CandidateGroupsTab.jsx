import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  FolderPlus,
  Trash2,
  Edit3,
  Search,
  X,
  Plus,
  CheckCircle2,
  UserCheck,
  Calendar,
  Layers,
  Sparkles,
  ClipboardList,
  Check,
  Mail,
  Phone,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import api from '../../api';

const CandidateGroupsTab = ({
  candidateGroups = [],
  setCandidateGroups,
  candidates = [],
  savedAssessments = [],
  showToast,
  onAssignGroupClick,
  setActiveTab
}) => {
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);

  // Form states for creating / editing a batch
  const [batchName, setBatchName] = useState('');
  const [batchDescription, setBatchDescription] = useState('');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safe arrays
  const safeGroups = useMemo(() => Array.isArray(candidateGroups) ? candidateGroups : [], [candidateGroups]);
  const safeCandidates = useMemo(() => Array.isArray(candidates) ? candidates : [], [candidates]);

  // Derived KPI metrics
  const metrics = useMemo(() => {
    const totalBatches = safeGroups.length;
    const allBatchedIds = new Set();
    safeGroups.forEach(g => {
      if (Array.isArray(g.candidateIds)) {
        g.candidateIds.forEach(id => allBatchedIds.add(id));
      }
    });

    const batchedCount = allBatchedIds.size;
    const unbatchedCount = Math.max(0, safeCandidates.length - batchedCount);
    const avgSize = totalBatches > 0
      ? Math.round(safeGroups.reduce((acc, g) => acc + (g.candidateIds?.length || 0), 0) / totalBatches)
      : 0;

    return {
      totalBatches,
      batchedCount,
      unbatchedCount,
      avgSize
    };
  }, [safeGroups, safeCandidates]);

  // Filtered groups by search
  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return safeGroups;

    return safeGroups.filter(group => {
      const nameMatch = (group.name || '').toLowerCase().includes(query);
      const descMatch = (group.description || '').toLowerCase().includes(query);
      
      // Also match if any candidate inside has matching name/email
      const memberMatch = (group.candidateIds || []).some(id => {
        const c = safeCandidates.find(cand => cand.id === id);
        return c && (
          (c.full_name || c.name || '').toLowerCase().includes(query) ||
          (c.email || '').toLowerCase().includes(query)
        );
      });

      return nameMatch || descMatch || memberMatch;
    });
  }, [safeGroups, safeCandidates, searchQuery]);

  // Candidates filtered in Modal selector
  const modalFilteredCandidates = useMemo(() => {
    const query = candidateSearchQuery.trim().toLowerCase();
    if (!query) return safeCandidates;
    return safeCandidates.filter(c => {
      const name = (c.full_name || c.name || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      return name.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [safeCandidates, candidateSearchQuery]);

  // Open Create Batch Modal
  const handleOpenCreateModal = () => {
    setBatchName('');
    setBatchDescription('');
    setSelectedCandidateIds([]);
    setCandidateSearchQuery('');
    setShowCreateModal(true);
  };

  // Create Batch Submit
  const handleCreateBatch = async (e) => {
    e.preventDefault();
    const trimmedName = batchName.trim();
    if (!trimmedName) {
      if (showToast) showToast("Please enter a batch name.");
      return;
    }

    if (selectedCandidateIds.length === 0) {
      if (showToast) showToast("Please select at least 1 candidate for this batch.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/api/groups', {
        name: trimmedName,
        description: batchDescription.trim() || null,
        candidateIds: selectedCandidateIds
      });

      if (response.data) {
        setCandidateGroups(prev => [response.data, ...prev]);
        if (showToast) showToast(`Batch "${trimmedName}" created and saved to database.`);
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error("Failed to create batch in database:", err);
      // Fallback local creation if network error
      const newGroup = {
        id: 'grp_' + Date.now(),
        name: trimmedName,
        description: batchDescription.trim() || 'Candidate cohort for group evaluations.',
        candidateIds: selectedCandidateIds,
        createdAt: new Date().toISOString()
      };
      setCandidateGroups(prev => [newGroup, ...prev]);
      if (showToast) showToast(`Batch "${trimmedName}" created.`);
      setShowCreateModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit / Manage Batch Members Modal
  const handleOpenEditModal = (group) => {
    setSelectedGroup(group);
    setBatchName(group.name || '');
    setBatchDescription(group.description || '');
    setSelectedCandidateIds(Array.isArray(group.candidateIds) ? [...group.candidateIds] : []);
    setCandidateSearchQuery('');
    setShowEditModal(true);
  };

  // Update Batch Submit
  const handleUpdateBatch = async (e) => {
    e.preventDefault();
    if (!selectedGroup) return;

    const trimmedName = batchName.trim();
    if (!trimmedName) {
      if (showToast) showToast("Please enter a batch name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.put(`/api/groups/${selectedGroup.id}`, {
        name: trimmedName,
        description: batchDescription.trim() || null,
        candidateIds: selectedCandidateIds
      });

      if (response.data) {
        setCandidateGroups(prev => prev.map(g => g.id === selectedGroup.id ? response.data : g));
        if (showToast) showToast(`Batch "${trimmedName}" updated in database.`);
        setShowEditModal(false);
        setSelectedGroup(null);
      }
    } catch (err) {
      console.error("Failed to update batch in database:", err);
      setCandidateGroups(prev => prev.map(g => {
        if (g.id === selectedGroup.id) {
          return {
            ...g,
            name: trimmedName,
            description: batchDescription.trim(),
            candidateIds: selectedCandidateIds
          };
        }
        return g;
      }));
      if (showToast) showToast(`Batch "${trimmedName}" updated.`);
      setShowEditModal(false);
      setSelectedGroup(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Batch
  const handleOpenDeleteModal = (group) => {
    setGroupToDelete(group);
    setShowDeleteModal(true);
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;

    setIsSubmitting(true);
    try {
      await api.delete(`/api/groups/${groupToDelete.id}`);
      setCandidateGroups(prev => prev.filter(g => g.id !== groupToDelete.id));
      if (showToast) showToast(`Batch "${groupToDelete.name}" removed.`);
      setShowDeleteModal(false);
      setGroupToDelete(null);
    } catch (err) {
      console.error("Failed to delete batch:", err);
      setCandidateGroups(prev => prev.filter(g => g.id !== groupToDelete.id));
      if (showToast) showToast(`Batch "${groupToDelete.name}" removed.`);
      setShowDeleteModal(false);
      setGroupToDelete(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle candidate selection in modal
  const handleToggleCandidate = (id) => {
    setSelectedCandidateIds(prev =>
      prev.includes(id) ? prev.filter(candId => candId !== id) : [...prev, id]
    );
  };

  // Select all / Deselect all in modal
  const handleSelectAll = () => {
    const allFilteredIds = modalFilteredCandidates.map(c => c.id);
    const allSelected = allFilteredIds.every(id => selectedCandidateIds.includes(id));
    if (allSelected) {
      setSelectedCandidateIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedCandidateIds(Array.from(new Set([...selectedCandidateIds, ...allFilteredIds])));
    }
  };

  return (
    <div className="space-y-5">

      {/* 1. EXECUTIVE HEADER BANNER */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Candidate Batches & Cohorts
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
              <Layers size={12} />
              <span>{safeGroups.length} Active Batches</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create talent cohorts, group candidates by hiring drive or department, and assign assessments collectively.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleOpenCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-9 px-4 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <FolderPlus size={14} />
          <span>Create Batch</span>
        </Button>
      </div>

      {/* 2. SUMMARY KPI STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Total Batches */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Batches</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              {metrics.totalBatches}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Organized talent cohorts</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40">
            <Layers size={18} />
          </div>
        </div>

        {/* Card 2: Batched Talent */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Batched Candidates</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              {metrics.batchedCount}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              {safeCandidates.length > 0 ? Math.round((metrics.batchedCount / safeCandidates.length) * 100) : 0}% of talent pool grouped
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40">
            <UserCheck size={18} />
          </div>
        </div>

        {/* Card 3: Avg Batch Size */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Average Batch Size</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              {metrics.avgSize}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Candidates per cohort</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <Users size={18} />
          </div>
        </div>

      </div>

      {/* 3. SEARCH TOOLBAR */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search batches by name or candidate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-8 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400">
          Showing {filteredGroups.length} of {safeGroups.length} batches
        </span>
      </div>

      {/* 4. BATCHES GRID */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl p-12 text-center shadow-xs transition-colors">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-100 dark:border-indigo-900/40">
            <Layers size={22} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">No Candidate Batches Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Create your first candidate batch to easily group talent, manage cohorts, and assign assessments in bulk.
          </p>
          <Button
            size="sm"
            onClick={handleOpenCreateModal}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-9 px-4 rounded-lg cursor-pointer"
          >
            <FolderPlus size={14} className="mr-1.5" />
            <span>Create First Batch</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group) => {
            const memberIds = Array.isArray(group.candidateIds) ? group.candidateIds : [];
            const members = safeCandidates.filter(c => memberIds.includes(c.id));
            const createdDate = group.createdAt
              ? new Date(group.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : 'Recent';

            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 group"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {group.name}
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed block">
                        {group.description || 'Candidate cohort for group evaluations.'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditModal(group)}
                        className="h-7 w-7 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-md cursor-pointer"
                        title="Manage Batch"
                      >
                        <Edit3 size={13} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDeleteModal(group)}
                        className="h-7 w-7 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md cursor-pointer"
                        title="Delete Batch"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>

                  {/* Batch Details & Member Pill */}
                  <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar size={11} />
                      <span>{createdDate}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] border border-indigo-200/60 dark:border-indigo-800/40">
                      <Users size={11} />
                      <span>{members.length} Candidates</span>
                    </span>
                  </div>

                  {/* Candidate Members List */}
                  <div className="mt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Cohort Members ({members.length})
                    </span>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 dashboard-scrollbar">
                      {members.length === 0 ? (
                        <div className="p-3 text-center bg-slate-50 dark:bg-slate-800/40 rounded-lg text-slate-400 text-[11px]">
                          No candidates assigned yet.
                        </div>
                      ) : (
                        members.map((member) => {
                          const initials = (member.full_name || member.name || 'C')
                            .split(' ')
                            .filter(Boolean)
                            .map(n => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase();

                          return (
                            <div
                              key={member.id}
                              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Avatar className="w-6 h-6 rounded-md border border-slate-200 dark:border-slate-700 shrink-0">
                                  <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                    {member.full_name || member.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                    {member.email}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditModal(group)}
                    className="flex-1 text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 h-8.5 rounded-lg cursor-pointer"
                  >
                    <Users size={13} className="mr-1" />
                    <span>Manage Members</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => {
                      if (onAssignGroupClick) {
                        onAssignGroupClick(group);
                      } else if (setActiveTab) {
                        setActiveTab('assessments');
                        if (showToast) showToast(`Select an assessment to assign to "${group.name}".`);
                      }
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium h-8.5 rounded-lg cursor-pointer shadow-xs"
                  >
                    <ClipboardList size={13} className="mr-1" />
                    <span>Assign Test</span>
                  </Button>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* 5. MODAL: CREATE NEW BATCH */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 p-6 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Create New Candidate Batch</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Group candidate accounts into a dedicated cohort for bulk operations.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateBatch} className="space-y-4 flex-1 overflow-y-auto pr-1 dashboard-scrollbar">
                
                {/* Batch Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Batch Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Analysts - Cohort 2026, Campus Hiring Drive"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Batch Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description / Department <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fall recruitment candidates for technical screening"
                    value={batchDescription}
                    onChange={(e) => setBatchDescription(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Candidate Selection Section */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Select Candidates ({selectedCandidateIds.length} Selected)
                      </span>
                      <span className="text-[11px] text-slate-400">Choose candidate accounts to include in this batch.</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      {modalFilteredCandidates.length > 0 &&
                      modalFilteredCandidates.every(c => selectedCandidateIds.includes(c.id))
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  </div>

                  {/* Search candidate inside modal */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input
                      type="text"
                      placeholder="Filter talent by name, email, phone..."
                      value={candidateSearchQuery}
                      onChange={(e) => setCandidateSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Candidate selection list */}
                  <div className="max-h-56 overflow-y-auto space-y-1.5 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-900/40 dashboard-scrollbar">
                    {modalFilteredCandidates.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No candidates found.
                      </div>
                    ) : (
                      modalFilteredCandidates.map((cand) => {
                        const isSelected = selectedCandidateIds.includes(cand.id);
                        const initials = (cand.full_name || cand.name || 'C')
                          .split(' ')
                          .filter(Boolean)
                          .map(n => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase();

                        return (
                          <div
                            key={cand.id}
                            onClick={() => handleToggleCandidate(cand.id)}
                            className={`p-2.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700'
                                : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}} // Handled by parent container click
                                className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer pointer-events-none"
                              />
                              <Avatar className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                                <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {cand.full_name || cand.name}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                  {cand.email} {cand.phone ? `• ${cand.phone}` : ''}
                                </p>
                              </div>
                            </div>

                            {isSelected && (
                              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 shrink-0 flex items-center gap-1">
                                <Check size={13} />
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                    className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
                  >
                    Create Batch ({selectedCandidateIds.length})
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 6. MODAL: EDIT / MANAGE BATCH MEMBERS */}
      <AnimatePresence>
        {showEditModal && selectedGroup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 p-6 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Manage Batch & Members</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Update batch information or modify candidate cohort membership.
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleUpdateBatch} className="space-y-4 flex-1 overflow-y-auto pr-1 dashboard-scrollbar">
                
                {/* Batch Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Batch Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Batch Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description / Department
                  </label>
                  <input
                    type="text"
                    value={batchDescription}
                    onChange={(e) => setBatchDescription(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Candidate Selection Section */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Batch Candidates ({selectedCandidateIds.length} Members)
                      </span>
                      <span className="text-[11px] text-slate-400">Toggle candidates to add or remove from this cohort.</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      {modalFilteredCandidates.length > 0 &&
                      modalFilteredCandidates.every(c => selectedCandidateIds.includes(c.id))
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  </div>

                  {/* Search candidate inside modal */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input
                      type="text"
                      placeholder="Filter talent by name, email, phone..."
                      value={candidateSearchQuery}
                      onChange={(e) => setCandidateSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Candidate selection list */}
                  <div className="max-h-56 overflow-y-auto space-y-1.5 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-900/40 dashboard-scrollbar">
                    {modalFilteredCandidates.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No candidates found.
                      </div>
                    ) : (
                      modalFilteredCandidates.map((cand) => {
                        const isSelected = selectedCandidateIds.includes(cand.id);
                        const initials = (cand.full_name || cand.name || 'C')
                          .split(' ')
                          .filter(Boolean)
                          .map(n => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase();

                        return (
                          <div
                            key={cand.id}
                            onClick={() => handleToggleCandidate(cand.id)}
                            className={`p-2.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700'
                                : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer pointer-events-none"
                              />
                              <Avatar className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                                <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {cand.full_name || cand.name}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                  {cand.email} {cand.phone ? `• ${cand.phone}` : ''}
                                </p>
                              </div>
                            </div>

                            {isSelected && (
                              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 shrink-0 flex items-center gap-1">
                                <Check size={13} />
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditModal(false)}
                    className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
                  >
                    Save Changes ({selectedCandidateIds.length})
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 7. MODAL: DELETE BATCH CONFIRMATION */}
      <AnimatePresence>
        {showDeleteModal && groupToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 p-6"
            >
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
                <AlertTriangle size={20} />
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Delete Candidate Batch</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Are you sure you want to delete batch <strong className="text-slate-800 dark:text-slate-200">{groupToDelete.name}</strong>? The candidates within this batch will not be deleted from the system.
              </p>

              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteModal(false)}
                  className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDeleteGroup}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium"
                >
                  Delete Batch
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CandidateGroupsTab;
