import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  ShieldCheck,
  History,
  Clock,
  CheckCircle2,
  RefreshCw,
  UserPlus,
  ArrowUpRight,
  Shield,
  Activity,
  KeyRound,
  Globe,
  UserCog
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import api from '../../api';

const AdminOverviewTab = ({ showToast, setActiveTab, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, logsRes] = await Promise.all([
        api.get('/api/users/internal'),
        api.get('/api/users/login-history', { params: { limit: 15 } })
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
    } catch (err) {
      console.error("Failed to load admin dashboard overview:", err);
      if (showToast) showToast("Failed to fetch admin overview metrics.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Aggregate statistics
  const stats = useMemo(() => {
    const totalStaff = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const recruiterCount = users.filter(u => u.role === 'recruiter').length;
    
    const today = new Date().toDateString();
    const activeStaffToday = users.filter(u => {
      if (!u.last_login) return false;
      return new Date(u.last_login).toDateString() === today;
    }).length;

    const totalAuthEvents = logs.length;

    return { totalStaff, adminCount, recruiterCount, activeStaffToday, totalAuthEvents };
  }, [users, logs]);

  return (
    <div className="space-y-6">

      {/* 1. Header */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Administrator Control Center
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Centralized management for internal team roles, access permissions, and system-wide security audit logs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdminData}
            disabled={loading}
            className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-8 gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setActiveTab('users')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium h-8 gap-1.5 shadow-xs cursor-pointer"
          >
            <UserCog size={14} />
            <span>Manage Users</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Internal Staff</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalStaff}</span>
            <span className="text-[11px] text-slate-500 font-medium">Internal Accounts</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Administrators</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.adminCount}</span>
            <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium">Full Access</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Recruiters</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.recruiterCount}</span>
            <span className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80 font-medium">Recruiter Access</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Today</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.activeStaffToday}</span>
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">Logged In Today</span>
          </div>
        </div>

      </div>

      {/* 3. Main Dashboard Sections: Team List & Recent Login Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Internal Users Quick View */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <UserCog size={15} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Team Members & Role Access</h3>
                <p className="text-[11px] text-slate-500">Internal administrators and recruiters</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('users')}
              className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-7"
            >
              <span>View All Users</span>
              <ArrowUpRight size={12} className="ml-1" />
            </Button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.slice(0, 6).map((u) => {
              const isAdmin = u.role === 'admin';
              const name = u.full_name || u.name || 'User';
              const initials = name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();

              return (
                <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                      <AvatarFallback className={`${
                        isAdmin 
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' 
                          : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                      } font-bold text-xs`}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                      isAdmin 
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/40' 
                        : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/40'
                    }`}>
                      {u.role}
                    </span>

                    <span className="text-[11px] text-slate-400 hidden sm:inline-block">
                      {u.last_login ? `Active ${new Date(u.last_login).toLocaleDateString()}` : 'Never'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Recent Login Events */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <History size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Live Login Audit</h3>
                  <p className="text-[11px] text-slate-500">Recent user authentications</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('login-history')}
                className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-7"
              >
                <span>Full Audit</span>
                <ArrowUpRight size={12} className="ml-1" />
              </Button>
            </div>

            <div className="space-y-3">
              {logs.slice(0, 5).map((l) => {
                const isAdmin = l.user_role === 'admin';
                const isRecruiter = l.user_role === 'recruiter';
                return (
                  <div key={l.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">{l.user_name || 'User'}</span>
                        <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                          isAdmin 
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : isRecruiter
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {l.user_role}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{l.ip_address || '127.0.0.1'}</p>
                    </div>

                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(l.login_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('login-history')}
            className="w-full text-xs font-medium border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer h-8 mt-4"
          >
            <span>View All Security Logs</span>
            <ArrowUpRight size={13} className="ml-1" />
          </Button>
        </div>

      </div>

    </div>
  );
};

export default AdminOverviewTab;
