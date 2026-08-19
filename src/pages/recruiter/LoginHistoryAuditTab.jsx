import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  RefreshCw,
  Clock,
  Globe,
  Monitor,
  Laptop,
  Smartphone,
  Calendar,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import api from '../../api';

const LoginHistoryAuditTab = ({ showToast }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'admin' | 'recruiter' | 'candidate'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit: 200 };
      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }
      const res = await api.get('/api/users/login-history', { params });
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch login history:", err);
      if (showToast) showToast("Failed to load login audit logs.");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, showToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const adminLogins = logs.filter(l => l.user_role === 'admin').length;
    const recruiterLogins = logs.filter(l => l.user_role === 'recruiter').length;
    const candidateLogins = logs.filter(l => l.user_role === 'candidate').length;

    const today = new Date().toDateString();
    const todayLogins = logs.filter(l => new Date(l.login_time).toDateString() === today).length;

    return { total, adminLogins, recruiterLogins, candidateLogins, todayLogins };
  }, [logs]);

  // Filtering
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const name = (log.user_name || '').toLowerCase();
      const email = (log.user_email || '').toLowerCase();
      const ip = (log.ip_address || '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch = !query || name.includes(query) || email.includes(query) || ip.includes(query);
      if (!matchesSearch) return false;

      if (roleFilter !== 'all' && log.user_role !== roleFilter) return false;

      return true;
    });
  }, [logs, searchQuery, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const getDeviceIcon = (deviceStr) => {
    if (!deviceStr) return <Monitor size={14} className="text-slate-400" />;
    const d = deviceStr.toLowerCase();
    if (d.includes('mobile') || d.includes('android') || d.includes('iphone')) {
      return <Smartphone size={14} className="text-indigo-400" />;
    }
    if (d.includes('macintosh') || d.includes('windows') || d.includes('linux')) {
      return <Laptop size={14} className="text-slate-400" />;
    }
    return <Monitor size={14} className="text-slate-400" />;
  };

  const getCleanDeviceName = (deviceStr) => {
    if (!deviceStr) return 'Web Client';
    if (deviceStr.includes('Edg/')) return 'Microsoft Edge (Windows)';
    if (deviceStr.includes('Chrome/')) return 'Google Chrome';
    if (deviceStr.includes('Firefox/')) return 'Mozilla Firefox';
    if (deviceStr.includes('Safari/') && !deviceStr.includes('Chrome')) return 'Apple Safari';
    return deviceStr.length > 30 ? deviceStr.slice(0, 30) + '...' : deviceStr;
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <History size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Security & Authentication Audit Trail
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comprehensive activity log recording IP addresses, authenticated users, timestamps, and client user-agents.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
            className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-8 gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh Audit</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Stats Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Auth Events</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <History size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</span>
            <span className="text-[11px] text-slate-400 font-medium">Recorded Sessions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Admin Logins</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.adminLogins}</span>
            <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium">Root Sessions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Recruiter Logins</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.recruiterLogins}</span>
            <span className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80 font-medium">Staff Sessions</span>
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
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.todayLogins}</span>
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">Today's Logins</span>
          </div>
        </div>

      </div>

      {/* 3. Filter Bar & Search */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user, email, or IP address..."
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
            { id: 'all', label: 'All Sessions' },
            { id: 'admin', label: 'Admins' },
            { id: 'recruiter', label: 'Recruiters' },
            { id: 'candidate', label: 'Candidates' }
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
            </button>
          ))}
        </div>
      </div>

      {/* 4. Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User Account</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Device & Client</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={18} className="animate-spin text-indigo-500" />
                      <span>Loading security audit trail...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <History size={28} className="text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No login records found</p>
                      <p className="text-[11px] text-slate-400">New authentication attempts will be recorded here automatically.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const role = (log.user_role || 'candidate').toLowerCase();
                  const isAdmin = role === 'admin';
                  const isRecruiter = role === 'recruiter';
                  const date = new Date(log.login_time);

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        <div className="flex items-center gap-2">
                          <Clock size={13} className="text-slate-400 shrink-0" />
                          <span>{date.toLocaleString()}</span>
                        </div>
                      </td>

                      {/* User Account */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {log.user_name || 'User'}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {log.user_email || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isAdmin 
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50' 
                            : isRecruiter
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}>
                          {role}
                        </span>
                      </td>

                      {/* IP Address */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded">
                          <Globe size={11} className="text-slate-400" />
                          <span>{log.ip_address || '127.0.0.1'}</span>
                        </span>
                      </td>

                      {/* Device User Agent */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                        <div className="flex items-center gap-1.5" title={log.device || ''}>
                          {getDeviceIcon(log.device)}
                          <span className="truncate max-w-[200px]">
                            {getCleanDeviceName(log.device)}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 size={12} />
                          <span>Authorized</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredLogs.length > itemsPerPage && (
          <div className="py-3 px-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} audit records
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

    </div>
  );
};

export default LoginHistoryAuditTab;
