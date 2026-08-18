import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  X,
  Plus,
  Mail,
  Phone,
  KeyRound,
  Shield,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  AlertTriangle,
  UserCheck,
  Calendar,
  Sparkles,
  Copy,
  CheckCircle2,
  Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import api from '../../api';

const CandidatesManagementTab = ({
  candidates = [],
  setCandidates,
  showToast,
  onCandidateClick
}) => {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'with-phone' | 'recent'
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Drawer / Modals state
  const [viewCandidate, setViewCandidate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState(null);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'Candidate@123',
    role: 'candidate'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safe candidate collections
  const safeCandidates = useMemo(() => Array.isArray(candidates) ? candidates : [], [candidates]);

  // Quick stats calculation
  const stats = useMemo(() => {
    const total = safeCandidates.length;
    const withPhone = safeCandidates.filter(c => !!c.phone && c.phone.trim() !== '').length;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recent = safeCandidates.filter(c => {
      const date = c.created_at ? new Date(c.created_at) : null;
      return date && date >= thirtyDaysAgo;
    }).length;

    return {
      total,
      withPhone,
      recent
    };
  }, [safeCandidates]);

  // Helper to format role name from DB
  const formatRole = (role) => {
    if (!role) return 'Candidate';
    const r = String(role).toLowerCase();
    return r.charAt(0).toUpperCase() + r.slice(1);
  };

  // Filtered candidates
  const filteredCandidates = useMemo(() => {
    return safeCandidates.filter((candidate) => {
      const name = (candidate.full_name || candidate.name || '').toLowerCase();
      const email = (candidate.email || '').toLowerCase();
      const phone = (candidate.phone || '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch = !query || name.includes(query) || email.includes(query) || phone.includes(query);
      if (!matchesSearch) return false;

      if (activeFilter === 'with-phone') {
        return !!candidate.phone && candidate.phone.trim() !== '';
      }

      if (activeFilter === 'recent') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const date = candidate.created_at ? new Date(candidate.created_at) : null;
        return date && date >= thirtyDaysAgo;
      }

      return true;
    });
  }, [safeCandidates, searchQuery, activeFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCandidates = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filteredCandidates.slice(start, start + itemsPerPage);
  }, [filteredCandidates, safeCurrentPage, itemsPerPage]);

  // Copy UUID to clipboard
  const handleCopyId = (id) => {
    navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    if (showToast) showToast('Candidate ID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handlers for Add Candidate
  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: 'Candidate@123',
      role: 'candidate'
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      if (showToast) showToast("Please fill in all required fields (Name, Email, Password).");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/api/candidates', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password.trim(),
        phone: formData.phone.trim() || null,
        role: 'candidate'
      });

      if (response.data) {
        if (showToast) showToast(`Candidate "${formData.name}" registered successfully.`);
        if (setCandidates) {
          setCandidates(prev => [response.data, ...prev]);
        }
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error("Failed to create candidate:", err);
      const msg = err.response?.data?.detail || "Failed to create candidate. Email might already exist.";
      if (showToast) showToast(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for Edit Candidate
  const handleOpenEditModal = (candidate) => {
    setCandidateToEdit(candidate);
    setFormData({
      name: candidate.full_name || candidate.name || '',
      email: candidate.email || '',
      phone: candidate.phone || '',
      password: '',
      role: candidate.role || 'candidate'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!candidateToEdit) return;

    if (!formData.name.trim() || !formData.email.trim()) {
      if (showToast) showToast("Candidate name and email cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        role: candidateToEdit.role || 'candidate'
      };
      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      const response = await api.put(`/api/candidates/${candidateToEdit.id}`, payload);

      if (response.data) {
        if (showToast) showToast(`Candidate "${formData.name}" updated successfully.`);
        if (setCandidates) {
          setCandidates(prev => prev.map(c => c.id === candidateToEdit.id ? { ...c, ...response.data } : c));
        }
        if (viewCandidate && viewCandidate.id === candidateToEdit.id) {
          setViewCandidate({ ...viewCandidate, ...response.data });
        }
        setShowEditModal(false);
        setCandidateToEdit(null);
      }
    } catch (err) {
      console.error("Failed to update candidate:", err);
      const msg = err.response?.data?.detail || "Failed to update candidate profile.";
      if (showToast) showToast(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for Delete Candidate
  const handleOpenDeleteModal = (candidate) => {
    setCandidateToDelete(candidate);
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    if (!candidateToDelete) return;

    setIsSubmitting(true);
    try {
      await api.delete(`/api/candidates/${candidateToDelete.id}`);
      if (showToast) showToast(`Candidate "${candidateToDelete.full_name || candidateToDelete.name}" deleted successfully.`);
      if (setCandidates) {
        setCandidates(prev => prev.filter(c => c.id !== candidateToDelete.id));
      }
      setSelectedCandidateIds(prev => prev.filter(id => id !== candidateToDelete.id));
      if (viewCandidate && viewCandidate.id === candidateToDelete.id) {
        setViewCandidate(null);
      }
      setShowDeleteModal(false);
      setCandidateToDelete(null);
    } catch (err) {
      console.error("Failed to delete candidate:", err);
      if (showToast) showToast("Failed to delete candidate.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedCandidateIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedCandidateIds.length} selected candidates?`)) return;

    try {
      await api.delete('/api/candidates', { data: { candidateIds: selectedCandidateIds } });
      if (showToast) showToast(`Successfully deleted ${selectedCandidateIds.length} candidates.`);
      if (setCandidates) {
        setCandidates(prev => prev.filter(c => !selectedCandidateIds.includes(c.id)));
      }
      setSelectedCandidateIds([]);
    } catch (err) {
      console.error("Failed to bulk delete candidates:", err);
      if (showToast) showToast("Failed to bulk delete candidates.");
    }
  };

  return (
    <div className="space-y-5">

      {/* 1. EXECUTIVE HEADER BANNER */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Candidate Directory
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
              <Users size={12} />
              <span>{safeCandidates.length} Active Records</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized talent registry to register, view profiles, update credentials, and manage candidate accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {selectedCandidateIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium h-9 rounded-lg"
            >
              <Trash2 size={13} className="mr-1.5" />
              <span>Delete Selected ({selectedCandidateIds.length})</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleOpenCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-9 px-4 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus size={14} />
            <span>Add Candidate</span>
          </Button>
        </div>
      </div>

      {/* 2. SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Total Candidates */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Registered</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              {stats.total}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Verified platform users</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40">
            <Users size={18} />
          </div>
        </div>

        {/* Card 2: With Phone Contact */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Direct Phone Reach</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              {stats.withPhone}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              {stats.total > 0 ? Math.round((stats.withPhone / stats.total) * 100) : 0}% reachable via phone
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40">
            <Phone size={18} />
          </div>
        </div>

        {/* Card 3: Recently Added */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Recently Registered</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              {stats.recent}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Added in the last 30 days</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <Calendar size={18} />
          </div>
        </div>

      </div>

      {/* 3. SEARCH & QUICK FILTER TOOLBAR */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
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

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'all'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Candidates ({safeCandidates.length})
          </button>
          <button
            onClick={() => setActiveFilter('with-phone')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'with-phone'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            With Phone ({stats.withPhone})
          </button>
          <button
            onClick={() => setActiveFilter('recent')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'recent'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Recent ({stats.recent})
          </button>
        </div>

      </div>

      {/* 4. CANDIDATES DATA TABLE */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedCandidates.length > 0 &&
                      paginatedCandidates.every(c => selectedCandidateIds.includes(c.id))
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        const newIds = paginatedCandidates.map(c => c.id);
                        setSelectedCandidateIds(Array.from(new Set([...selectedCandidateIds, ...newIds])));
                      } else {
                        const pageIds = paginatedCandidates.map(c => c.id);
                        setSelectedCandidateIds(selectedCandidateIds.filter(id => !pageIds.includes(id)));
                      }
                    }}
                    className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedCandidates.length > 0 ? (
                paginatedCandidates.map((candidate) => {
                  const candidateName = candidate.full_name || candidate.name || 'Candidate';
                  const candidateEmail = candidate.email || 'N/A';
                  const candidatePhone = candidate.phone || '—';
                  const roleName = formatRole(candidate.role);
                  const registeredDate = candidate.created_at
                    ? new Date(candidate.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'Recent';

                  const initials = candidateName
                    .trim()
                    .split(' ')
                    .filter(Boolean)
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  const isSelected = selectedCandidateIds.includes(candidate.id);

                  return (
                    <tr
                      key={candidate.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCandidateIds([...selectedCandidateIds, candidate.id]);
                            } else {
                              setSelectedCandidateIds(selectedCandidateIds.filter(id => id !== candidate.id));
                            }
                          }}
                          className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Candidate Name & UUID */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => setViewCandidate(candidate)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <Avatar className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                            <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                              {candidateName}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                              <span>ID: {String(candidate.id).slice(0, 8)}...</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyId(candidate.id);
                                }}
                                className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer p-0.5"
                                title="Copy ID"
                              >
                                {copiedId === candidate.id ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info (Email + Phone) */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-700 dark:text-slate-300 truncate flex items-center gap-1.5">
                            <Mail size={12} className="text-slate-400 shrink-0" />
                            <span>{candidateEmail}</span>
                          </span>
                          {candidatePhone !== '—' ? (
                            <span className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1.5">
                              <Phone size={11} className="text-slate-400 shrink-0" />
                              <span>{candidatePhone}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-[10px] italic">No phone provided</span>
                          )}
                        </div>
                      </td>

                      {/* System Role */}
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px] border border-slate-200/80 dark:border-slate-700">
                          {roleName}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-slate-400 shrink-0" />
                          <span>{registeredDate}</span>
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          
                          {/* View Candidate */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewCandidate(candidate)}
                            className="h-7 w-7 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-md cursor-pointer"
                            title="View Profile"
                          >
                            <Eye size={13} />
                          </Button>

                          {/* Edit Candidate */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditModal(candidate)}
                            className="h-7 w-7 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-md cursor-pointer"
                            title="Edit Candidate"
                          >
                            <Edit2 size={13} />
                          </Button>

                          {/* Delete Candidate */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDeleteModal(candidate)}
                            className="h-7 w-7 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md cursor-pointer"
                            title="Delete Candidate"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <div className="max-w-xs mx-auto text-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500 mb-2">
                        <Users size={18} />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No candidates found</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Try modifying your search or filter criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER & PAGINATION */}
        <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing {filteredCandidates.length > 0 ? (safeCurrentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(filteredCandidates.length, safeCurrentPage * itemsPerPage)} of{' '}
            {filteredCandidates.length} candidates
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="h-7 text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <ChevronLeft size={13} className="mr-0.5" />
                <span>Prev</span>
              </Button>
              <span className="px-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                {safeCurrentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="h-7 text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <span>Next</span>
                <ChevronRight size={13} className="ml-0.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 5. VIEW CANDIDATE PROFILE SLIDE-OVER DRAWER */}
      <AnimatePresence>
        {viewCandidate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewCandidate(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white dark:bg-[#0f172a] border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700">
                      <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                        {(viewCandidate.full_name || viewCandidate.name || 'C').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {viewCandidate.full_name || viewCandidate.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active Account
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewCandidate(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Candidate Information Card */}
                <div className="space-y-4 my-6">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                    
                    {/* Full Name */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Full Name</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                        {viewCandidate.full_name || viewCandidate.name}
                      </span>
                    </div>

                    {/* Email */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Email Address</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                        {viewCandidate.email}
                      </span>
                    </div>

                    {/* Phone */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Phone Number</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                        {viewCandidate.phone || '—'}
                      </span>
                    </div>

                    {/* System Role */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Role</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[11px] mt-0.5">
                        {formatRole(viewCandidate.role)}
                      </span>
                    </div>

                    {/* Internal UUID */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Internal User ID</span>
                      <div className="flex items-center justify-between mt-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                        <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate">
                          {viewCandidate.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyId(viewCandidate.id)}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold ml-2 shrink-0 cursor-pointer"
                        >
                          {copiedId === viewCandidate.id ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Created Date</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                        {viewCandidate.created_at
                          ? new Date(viewCandidate.created_at).toLocaleString()
                          : 'Recent'}
                      </span>
                    </div>

                  </div>
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleOpenEditModal(viewCandidate);
                  }}
                  className="flex-1 text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 h-9"
                >
                  <Edit2 size={13} className="mr-1.5" />
                  <span>Edit Profile</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleOpenDeleteModal(viewCandidate);
                  }}
                  className="border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs h-9 px-3"
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 6. MODAL: ADD NEW CANDIDATE */}
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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 p-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Add New Candidate</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Register a candidate account for assessments.</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. john.doe@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Default initial password for candidate login.</span>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => setShowCreateModal(false)}
                    className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
                  >
                    {isSubmitting ? 'Registering...' : 'Register Candidate'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 7. MODAL: EDIT CANDIDATE */}
      <AnimatePresence>
        {showEditModal && (
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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 p-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Edit Candidate Profile</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Modify personal information or reset password.</p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reset Password <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="New password (optional)"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => setShowEditModal(false)}
                    className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 8. MODAL: DELETE CANDIDATE CONFIRMATION */}
      <AnimatePresence>
        {showDeleteModal && candidateToDelete && (
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

              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Delete Candidate Account</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Are you sure you want to permanently delete candidate account <strong className="text-slate-800 dark:text-slate-200">{candidateToDelete.full_name || candidateToDelete.name}</strong> ({candidateToDelete.email})? This action cannot be undone.
              </p>

              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => setShowDeleteModal(false)}
                  className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={handleDeleteSubmit}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Account'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CandidatesManagementTab;
