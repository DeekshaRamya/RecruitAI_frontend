import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Zap,
  Clock,
  Search,
  RefreshCw,
  Server,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  BarChart3,
  X,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '../../api';

const AiUsageTrackingTab = ({ showToast }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('all'); // 'all' | 'Azure OpenAI' | 'Gemini'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Success' | 'Failed'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/ai-usage');
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch AI usage logs:", err);
      if (showToast) showToast("Failed to load AI usage tracking logs.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Key performance statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const successful = logs.filter(l => l.status === 'Success').length;
    const failed = logs.filter(l => l.status === 'Failed').length;
    const successRate = total > 0 ? ((successful / total) * 100).toFixed(1) : '100';

    const totalTokens = logs.reduce((acc, l) => acc + (l.total_tokens || 0), 0);
    const avgLatency = total > 0 
      ? Math.round(logs.reduce((acc, l) => acc + (l.response_time_ms || 0), 0) / total) 
      : 0;

    return { total, successful, failed, successRate, totalTokens, avgLatency };
  }, [logs]);

  // Filtered log entries
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const user = (log.user_email || log.user_name || '').toLowerCase();
      const feature = (log.feature_name || '').toLowerCase();
      const model = (log.model_name || '').toLowerCase();
      const provider = (log.ai_provider || '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch = !query || user.includes(query) || feature.includes(query) || model.includes(query) || provider.includes(query);
      if (!matchesSearch) return false;

      if (providerFilter !== 'all' && log.ai_provider !== providerFilter) return false;
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;

      return true;
    });
  }, [logs, searchQuery, providerFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const getProviderBadge = (provider) => {
    const p = (provider || '').toLowerCase();
    if (p.includes('gemini')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Zap size={11} className="text-emerald-500" />
          Google Gemini
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        <Server size={11} className="text-blue-500" />
        Azure OpenAI
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Cpu size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                AI Usage & Latency Tracking
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Granular audit trail recording provider, model, token consumption, response latencies, and execution status.
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
            <span>Refresh Logs</span>
          </Button>
        </div>
      </div>

      {/* 2. Key Performance Metrics Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total AI Requests</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Activity size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</span>
            <span className="text-[11px] text-slate-400 font-medium">Recorded Calls</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Tokens Used</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.totalTokens.toLocaleString()}
            </span>
            <span className="text-[11px] text-purple-600/80 dark:text-purple-400/80 font-medium">Prompt + Completion</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Response Latency</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.avgLatency.toLocaleString()} <span className="text-sm font-semibold">ms</span>
            </span>
            <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium">Mean Duration</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Success Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.successRate}%
            </span>
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
              {stats.successful} OK / {stats.failed} Err
            </span>
          </div>
        </div>

      </div>

      {/* 3. Search & Filters */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search feature, model, or user..."
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

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Provider Filter */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-slate-400 font-medium mr-1">Provider:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'Azure OpenAI', label: 'Azure OpenAI' },
              { id: 'Gemini', label: 'Gemini' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setProviderFilter(p.id);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
                  providerFilter === p.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

          {/* Status Filter */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-slate-400 font-medium mr-1">Status:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'Success', label: 'Success' },
              { id: 'Failed', label: 'Failed' }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setStatusFilter(s.id);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
                  statusFilter === s.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Individual Request Log Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">AI Provider</th>
                <th className="py-3 px-4">Model</th>
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-4 text-right">In Tokens</th>
                <th className="py-3 px-4 text-right">Out Tokens</th>
                <th className="py-3 px-4 text-right">Total Tokens</th>
                <th className="py-3 px-4">Request Time</th>
                <th className="py-3 px-4 text-right">Response Time</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={18} className="animate-spin text-indigo-500" />
                      <span>Fetching AI usage logs...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Cpu size={28} className="text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No AI usage logs found</p>
                      <p className="text-[11px] text-slate-400">Future AI model calls (question generation, resume analysis, evaluations) will be logged here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const isSuccess = log.status === 'Success';
                  const reqDate = log.request_time ? new Date(log.request_time) : null;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      
                      {/* User */}
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                        {log.user_email || (log.user_name && !['Anonymous Device', 'System / Anonymous', 'System'].includes(log.user_name) ? log.user_name : null) || 'system@recruitai.com'}
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
                          {log.role || 'N/A'}
                        </span>
                      </td>

                      {/* AI Provider */}
                      <td className="py-3 px-4">
                        {getProviderBadge(log.ai_provider)}
                      </td>

                      {/* Model */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {log.model_name || 'gpt-4o'}
                      </td>

                      {/* Feature */}
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[11px]">
                          {log.feature_name}
                        </span>
                      </td>

                      {/* Input Tokens */}
                      <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                        {(log.input_tokens || 0).toLocaleString()}
                      </td>

                      {/* Output Tokens */}
                      <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                        {(log.output_tokens || 0).toLocaleString()}
                      </td>

                      {/* Total Tokens */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                        {(log.total_tokens || 0).toLocaleString()}
                      </td>

                      {/* Request Time */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {reqDate ? reqDate.toLocaleString() : '—'}
                      </td>

                      {/* Response Time (ms) */}
                      <td className="py-3 px-4 text-right font-mono font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
                        {(log.response_time_ms || 0).toLocaleString()} ms
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={13} />
                            Success
                          </span>
                        ) : (
                          <span 
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 cursor-help"
                            title={log.error_message || 'AI Call Failed'}
                          >
                            <XCircle size={13} />
                            Failed
                          </span>
                        )}
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} AI request entries
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

export default AiUsageTrackingTab;
