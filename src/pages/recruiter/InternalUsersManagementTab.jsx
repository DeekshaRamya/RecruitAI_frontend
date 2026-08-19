import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  Plus,
  Mail,
  Phone,
  KeyRound,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  AlertTriangle,
  UserCog,
  Check,
  Copy,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import api from '../../api';

const InternalUsersManagementTab = ({ showToast, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'admin' | 'recruiter' | 'candidate'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('recruiter');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Create Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'recruiter',
    password: ''
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const res = await api.get('/api/users/internal', { params });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch internal users:", err);
      if (showToast) showToast(err.response?.data?.detail || "Failed to load internal users.");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, searchQuery, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.role === 'admin').length;
    const recruiters = users.filter(u => u.role === 'recruiter').length;
    const activeToday = users.filter(u => {
      if (!u.last_login) return false;
      const loginDate = new Date(u.last_login);
      const today = new Date();
      return loginDate.toDateString() === today.toDateString();
    }).length;

    return { total, admins, recruiters, activeToday };
  }, [users]);

  // Filtered and paginated list
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const name = (u.full_name || u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || name.includes(query) || email.includes(query);
      if (!matchesSearch) return false;
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      return true;
    });
  }, [users, searchQuery, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.email.trim()) {
      if (showToast) showToast("Name and email are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/api/users/internal', {
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        role: formData.role,
        password: formData.password.trim() || 'Systech@123'
      });

      if (res.data) {
        if (showToast) showToast(`Internal user "${res.data.full_name}" created successfully.`);
        setUsers(prev => [res.data, ...prev]);
        setShowCreateModal(false);
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          role: 'recruiter',
          password: ''
        });
      }
    } catch (err) {
      console.error("Failed to create internal user:", err);
      if (showToast) showToast(err.response?.data?.detail || "Failed to create internal user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (selectedUser.id === currentUser?.id && newRole !== 'admin') {
      if (showToast) showToast("You cannot revoke your own admin permissions.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.patch(`/api/users/${selectedUser.id}/role`, {
        role: newRole
      });

      if (res.data) {
        if (showToast) showToast(`Role for "${selectedUser.full_name}" updated to ${newRole.toUpperCase()}.`);
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u));
        setShowRoleModal(false);
        setSelectedUser(null);
      }
    } catch (err) {
      console.error("Failed to update role:", err);
      if (showToast) showToast(err.response?.data?.detail || "Failed to change user role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (user) => {
    if (user.id === currentUser?.id) {
      if (showToast) showToast("You cannot delete your own account.");
      return;
    }
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      await api.delete(`/api/users/${selectedUser.id}`);
      if (showToast) showToast(`User "${selectedUser.full_name}" removed from platform.`);
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to delete user:", err);
      if (showToast) showToast(err.response?.data?.detail || "Failed to delete user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & KPI Metric Summary */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UserCog size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Internal Users & Role Permissions
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage platform access, assign administrator or recruiter capabilities, and audit active staff accounts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-8 gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium h-8 gap-1.5 shadow-xs cursor-pointer"
          >
            <UserPlus size={14} />
            <span>Add Team Member</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Stats Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Staff</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</span>
            <span className="text-[11px] text-slate-400 font-medium">Internal Accounts</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Administrators</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.admins}</span>
            <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium">Full Access</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Recruiters</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.recruiters}</span>
            <span className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80 font-medium">Assessment Ops</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Today</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.activeToday}</span>
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">Logged In</span>
          </div>
        </div>

      </div>

      {/* 3. Filter Bar & Search */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Roles', count: users.length },
            { id: 'admin', label: 'Admins', count: stats.admins },
            { id: 'recruiter', label: 'Recruiters', count: stats.recruiters },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setRoleFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border flex items-center gap-1.5 shrink-0 ${
                roleFilter === tab.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                roleFilter === tab.id
                  ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-200'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Users Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Role & Access Level</th>
                <th className="py-3 px-4">Authentication Method</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4">Total Logins</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={18} className="animate-spin text-indigo-500" />
                      <span>Loading internal team accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserCog size={28} className="text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No users found matching criteria</p>
                      <p className="text-[11px] text-slate-400">Try adjusting your search or role filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  const displayName = u.full_name || u.name || 'User';
                  const initials = displayName.trim().split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
                  const isAdminRole = u.role === 'admin';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Name and Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                            <AvatarFallback className={`${
                              isAdminRole 
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' 
                                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                            } font-bold text-xs`}>
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {displayName}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              <span>{u.email}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyId(u.id)}
                                className="hover:text-slate-700 dark:hover:text-slate-200 p-0.5"
                                title="Copy User ID"
                              >
                                {copiedId === u.id ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                          isAdminRole
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                            : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60'
                        }`}>
                          {isAdminRole ? <ShieldCheck size={12} /> : <Users size={12} />}
                          <span className="capitalize">{u.role}</span>
                        </span>
                      </td>

                      {/* Auth Type */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          {u.microsoft_id ? (
                            <span className="flex items-center gap-1 text-sky-700 dark:text-sky-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                              Microsoft SSO
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                              <KeyRound size={12} className="text-slate-400" />
                              Password Auth
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {u.last_login ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {new Date(u.last_login).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(u.last_login).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Never logged in</span>
                        )}
                      </td>

                      {/* Login Count */}
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">
                          {u.login_count || 0} sessions
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenRoleModal(u)}
                            className="h-7 px-2.5 text-[11px] border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            <Shield size={12} className="mr-1" />
                            <span>Change Role</span>
                          </Button>

                          {!isCurrent && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDeleteModal(u)}
                              className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 size={13} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredUsers.length > itemsPerPage && (
          <div className="py-3 px-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="h-7 px-2 text-xs border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <ChevronLeft size={13} />
                <span>Prev</span>
              </Button>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-2">
                {safeCurrentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="h-7 px-2 text-xs border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 5. MODAL: CREATE INTERNAL USER */}
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <UserPlus size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Add Internal Team Member</h3>
                    <p className="text-[11px] text-slate-500">Create an admin or recruiter staff account</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. john.doe@systechusa.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role & Permissions *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="recruiter">Recruiter (Assessment Creation, Candidates, Analytics)</option>
                    <option value="admin">Administrator (Full Access & User Role Management)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Password
                  </label>
                  <input
                    type="password"
                    placeholder="Defaults to Systech@123"
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
                    onClick={() => setShowCreateModal(false)}
                    className="text-xs border-slate-200 dark:border-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Account'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 6. MODAL: CHANGE ROLE */}
      <AnimatePresence>
        {showRoleModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRoleModal(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Shield size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Update User Role</h3>
                  <p className="text-[11px] text-slate-500 truncate">{selectedUser.full_name}</p>
                </div>
              </div>

              <form onSubmit={handleRoleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select Access Level
                  </label>
                  <div className="space-y-2">
                    <label className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      newRole === 'recruiter' 
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40' 
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}>
                      <input
                        type="radio"
                        name="role"
                        value="recruiter"
                        checked={newRole === 'recruiter'}
                        onChange={() => setNewRole('recruiter')}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Recruiter</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Can create assessments, schedule tests, view analytics and candidate submissions.</p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      newRole === 'admin' 
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40' 
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}>
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={newRole === 'admin'}
                        onChange={() => setNewRole('admin')}
                        className="mt-0.5 text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Administrator</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Full root authority: manage staff roles, invite team, and access security audit logs.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => setShowRoleModal(false)}
                    className="text-xs border-slate-200 dark:border-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
                  >
                    {isSubmitting ? 'Saving...' : 'Confirm Role'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 7. MODAL: DELETE CONFIRMATION */}
      <AnimatePresence>
        {showDeleteModal && selectedUser && (
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

              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Remove Staff Account</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Are you sure you want to revoke platform access for <strong className="text-slate-800 dark:text-slate-200">{selectedUser.full_name}</strong> ({selectedUser.email})?
              </p>

              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => setShowDeleteModal(false)}
                  className="text-xs border-slate-200 dark:border-slate-700"
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
                  {isSubmitting ? 'Deleting...' : 'Revoke Access'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default InternalUsersManagementTab;