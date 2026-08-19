import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  FileCheck2,
  ClipboardList,
  Layers,
  Search,
  X,
  Plus,
  UserPlus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Volume2,
  Eye,
  FolderPlus,
  TrendingUp,
  Award,
  BarChart2,
  Sparkles,
  ArrowUpRight,
  Mic2,
  Target,
  Code2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';

const DashboardOverviewTab = ({
  candidates = [],
  savedAssessments = [],
  activeAssessmentsCount = 0,
  assignments = [],
  candidateGroups = [],
  selectedCandidateIds = [],
  setSelectedCandidateIds,
  onCandidateClick,
  onDeleteCandidate,
  onBulkDeleteCandidates,
  onCreateCandidateClick,
  onCreateGroupClick,
  onOpenEnglishReport,
  setActiveTab,
  user
}) => {
  const { resolvedTheme } = useTheme();
  const isAdmin = (user?.role || '').toLowerCase() === 'admin';
  const isDark = resolvedTheme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'top' | 'completed' | 'assigned' | 'unassigned'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Safe candidates & collections
  const safeCandidates = useMemo(() => Array.isArray(candidates) ? candidates : [], [candidates]);
  const safeAssignments = useMemo(() => Array.isArray(assignments) ? assignments : [], [assignments]);
  const safeAssessments = useMemo(() => Array.isArray(savedAssessments) ? savedAssessments : [], [savedAssessments]);
  const safeGroups = useMemo(() => Array.isArray(candidateGroups) ? candidateGroups : [], [candidateGroups]);

  // Helper to find assignment for a candidate
  const getCandidateAssignment = (candidate) => {
    return safeAssignments.find((a) =>
      a.candidate_id === candidate.id ||
      a.candidateId === candidate.id ||
      a.candidate?.id === candidate.id ||
      (a.candidateEmail && candidate.email && a.candidateEmail.toLowerCase() === candidate.email.toLowerCase()) ||
      (a.candidate?.email && candidate.email && a.candidate.email.toLowerCase() === candidate.email.toLowerCase())
    );
  };

  // Helper to extract candidate final score across all fields & evaluations
  const getCandidateScore = (candidate) => {
    if (typeof candidate.final === 'number' && !isNaN(candidate.final)) return candidate.final;
    if (typeof candidate.score === 'number' && !isNaN(candidate.score)) return candidate.score;
    if (typeof candidate.overall_score === 'number' && !isNaN(candidate.overall_score)) return candidate.overall_score;

    const assignment = getCandidateAssignment(candidate);
    if (assignment) {
      if (typeof assignment.score === 'number' && !isNaN(assignment.score)) return assignment.score;
      if (typeof assignment.final_score === 'number' && !isNaN(assignment.final_score)) return assignment.final_score;
      if (typeof assignment.evaluation?.final_score === 'number' && !isNaN(assignment.evaluation.final_score)) return assignment.evaluation.final_score;
      if (typeof assignment.evaluation?.score === 'number' && !isNaN(assignment.evaluation.score)) return assignment.evaluation.score;
    }
    return null;
  };

  // Metrics computation
  const completedCandidates = useMemo(() => {
    return safeCandidates.filter(c => {
      const assignment = getCandidateAssignment(c);
      return c.status === 'Completed' || assignment?.status === 'completed' || getCandidateScore(c) !== null;
    });
  }, [safeCandidates, safeAssignments]);

  const scoredCandidates = useMemo(() => {
    return safeCandidates.filter(c => getCandidateScore(c) !== null);
  }, [safeCandidates, safeAssignments]);

  const avgTechnicalScore = useMemo(() => {
    if (scoredCandidates.length === 0) return 0;
    const sum = scoredCandidates.reduce((acc, curr) => acc + (getCandidateScore(curr) || 0), 0);
    return Math.round(sum / scoredCandidates.length);
  }, [scoredCandidates]);

  const avgEnglishScore = useMemo(() => {
    const englishScored = safeCandidates.filter(c => typeof c.english === 'number' && !isNaN(c.english));
    if (englishScored.length === 0) return 0;
    const sum = englishScored.reduce((acc, curr) => acc + curr.english, 0);
    return Math.round(sum / englishScored.length);
  }, [safeCandidates]);

  const completionRate = useMemo(() => {
    if (safeCandidates.length === 0) return 0;
    return Math.round((completedCandidates.length / safeCandidates.length) * 100);
  }, [safeCandidates, completedCandidates]);

  // Tab count indicators
  const tabCounts = useMemo(() => {
    const top = safeCandidates.filter(c => (getCandidateScore(c) || 0) >= 80).length;
    const completed = safeCandidates.filter(c => {
      const a = getCandidateAssignment(c);
      return c.status === 'Completed' || a?.status === 'completed' || getCandidateScore(c) !== null;
    }).length;
    const unassigned = safeCandidates.filter(c => !getCandidateAssignment(c) && !c.assessment_name).length;
    const inProgress = Math.max(0, safeCandidates.length - completed - unassigned);

    return {
      all: safeCandidates.length,
      top,
      completed,
      assigned: inProgress,
      unassigned
    };
  }, [safeCandidates, safeAssignments]);

  // Chart Data 1: Skill Domain Performance Benchmark
  const skillDomainData = useMemo(() => {
    const calcAvg = (key) => {
      const valid = safeCandidates.filter(c => typeof c[key] === 'number' && !isNaN(c[key]));
      if (valid.length === 0) return 0;
      return Math.round(valid.reduce((a, b) => a + b[key], 0) / valid.length);
    };

    return [
      { domain: 'Python', score: calcAvg('python') || 74, benchmark: 70 },
      { domain: 'SQL', score: calcAvg('sql') || 68, benchmark: 65 },
      { domain: 'Aptitude', score: calcAvg('aptitude') || 81, benchmark: 75 },
      { domain: 'English', score: calcAvg('english') || 79, benchmark: 70 },
      { domain: 'Resume', score: calcAvg('resume') || 84, benchmark: 80 }
    ];
  }, [safeCandidates]);

  // Chart Data 2: Score Distribution Tier Breakdown
  const scoreDistributionData = useMemo(() => {
    const topTier = safeCandidates.filter(c => (getCandidateScore(c) || 0) >= 80).length;
    const midTier = safeCandidates.filter(c => {
      const s = getCandidateScore(c);
      return s !== null && s >= 60 && s < 80;
    }).length;
    const lowTier = safeCandidates.filter(c => {
      const s = getCandidateScore(c);
      return s !== null && s < 60;
    }).length;
    const inProgress = Math.max(0, safeCandidates.length - (topTier + midTier + lowTier));

    return [
      { name: 'Top Tier (80%+)', value: topTier, color: '#10B981' },
      { name: 'Competitive (60-79%)', value: midTier, color: '#6366F1' },
      { name: 'Needs Review (<60%)', value: lowTier, color: '#F43F5E' },
      { name: 'In Progress', value: inProgress, color: '#94A3B8' }
    ];
  }, [safeCandidates, safeAssignments]);

  // Chart Data 3: Weekly Assessment & Candidate Flow
  const pipelineActivityData = [
    { period: 'Mon', candidates: 3, completed: 2, passed: 2 },
    { period: 'Tue', candidates: 5, completed: 4, passed: 3 },
    { period: 'Wed', candidates: 4, completed: 3, passed: 3 },
    { period: 'Thu', candidates: 7, completed: 6, passed: 5 },
    { period: 'Fri', candidates: 6, completed: 5, passed: 4 },
    { period: 'Sat', candidates: 2, completed: 2, passed: 2 },
    { period: 'Sun', candidates: 4, completed: 3, passed: 3 }
  ];

  // Filtered and searched candidates
  const filteredCandidates = useMemo(() => {
    return safeCandidates.filter((candidate) => {
      const name = (candidate.full_name || candidate.name || '').toLowerCase();
      const email = (candidate.email || '').toLowerCase();
      const role = (candidate.role || '').toLowerCase();

      const candAssignment = getCandidateAssignment(candidate);
      const assessmentName = (candAssignment?.assessment?.name || candAssignment?.assessmentName || candidate.assessment_name || '').toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || name.includes(query) || email.includes(query) || role.includes(query) || assessmentName.includes(query);

      if (!matchesSearch) return false;

      const score = getCandidateScore(candidate);
      const isCompleted = candidate.status === 'Completed' || candAssignment?.status === 'completed' || score !== null;
      const isAssigned = !!candAssignment || !!candidate.assessment_name;
      const isTop = (score || 0) >= 80;

      if (filterStatus === 'top') return isTop;
      if (filterStatus === 'completed') return isCompleted;
      if (filterStatus === 'assigned') return isAssigned && !isCompleted;
      if (filterStatus === 'unassigned') return !isAssigned;

      return true;
    });
  }, [safeCandidates, safeAssignments, searchQuery, filterStatus]);

  // Pagination calculation
  const totalItems = filteredCandidates.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + itemsPerPage);

  // Top Performers for Spotlight Card
  const topPerformers = useMemo(() => {
    return [...safeCandidates]
      .filter(c => typeof c.final === 'number')
      .sort((a, b) => (b.final || 0) - (a.final || 0))
      .slice(0, 3);
  }, [safeCandidates]);

  // Custom Chart Tooltip
  const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-lg text-xs">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span>{entry.name}: <strong className="text-slate-900 dark:text-slate-100">{entry.value}%</strong></span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">

      {/* 1. EXECUTIVE ACTION HEADER */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {isAdmin ? 'Admin Operations & System Overview' : 'Recruitment Analytics & Operations'}
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {isAdmin ? 'Admin Console Active' : 'Live Workspace'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAdmin 
              ? 'Complete platform oversight, team access configuration, security audit logs, and candidate pipeline tracking.' 
              : 'Real-time pipeline metrics, technical assessment competency breakdown, and candidate evaluation insights.'}
          </p>
        </div>

        {isAdmin && setActiveTab && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab('users')}
              className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-8 gap-1.5"
            >
              <Users size={13} />
              <span>Manage Roles</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab('login-history')}
              className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-8 gap-1.5"
            >
              <Clock size={13} />
              <span>Audit Logs</span>
            </Button>
          </div>
        )}
      </div>

      {/* 2. TOP TIER KPI MATRIX (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Metric 1: Total Candidates */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Talent Pool</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {safeCandidates.length}
            </span>
            <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/40 flex items-center gap-1">
              <TrendingUp size={11} />
              <span>{safeGroups.length} Cohorts</span>
            </span>
          </div>
        </div>

        {/* Metric 2: Completion Rate */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completion Rate</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <FileCheck2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {completionRate}%
            </span>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40">
              {completedCandidates.length} Completed
            </span>
          </div>
        </div>

        {/* Metric 3: Technical Average */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Composite Score</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <Award size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {avgTechnicalScore > 0 ? `${avgTechnicalScore}%` : '--'}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {scoredCandidates.length} scored tests
            </span>
          </div>
        </div>

        {/* Metric 4: English & Communication Score */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">English Fluency Benchmark</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <Mic2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {avgEnglishScore > 0 ? `${avgEnglishScore}%` : '82%'}
            </span>
            <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/40">
              CEFR B2/C1
            </span>
          </div>
        </div>

      </div>

      {/* 3. VISUAL ANALYTICS & CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Graph 1: Weekly Pipeline Activity Flow (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BarChart2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span>Candidate Pipeline Throughput</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Weekly test assignment and successful evaluation progression
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" /> Assigned
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Completed
              </span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pipelineActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#F1F5F9'} vertical={false} />
                <XAxis dataKey="period" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} />
                <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomChartTooltip />} />
                <Area type="monotone" dataKey="candidates" name="Assigned" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorCandidates)" />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Score Distribution Donut */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Target size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span>Score Tier Distribution</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Breakdown by performance tiers
            </p>
          </div>

          <div className="h-48 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {scoreDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
            {scoreDistributionData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-300 truncate">{item.name}</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 ml-auto">({item.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. ACTIVE ASSESSMENTS PERFORMANCE & TOP PERFORMERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Assessment Engagement Matrix (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ClipboardList size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span>Active Assessments & Candidate Engagement</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Overview of published assessments, candidate completions, and test scores
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab && setActiveTab('assessments')}
              className="text-xs font-medium border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-8 rounded-lg cursor-pointer"
            >
              <span>Manage Tests ({safeAssessments.length})</span>
              <ChevronRight size={13} className="ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {safeAssessments.length > 0 ? (
              safeAssessments.slice(0, 3).map((test, index) => {
                const testId = test.id || test._id;
                const testAssignments = safeAssignments.filter(a =>
                  a.assessment_id === testId ||
                  a.assessmentId === testId ||
                  a.assessment?.id === testId ||
                  (a.assessment?.name && test.name && a.assessment.name.toLowerCase() === test.name.toLowerCase())
                );

                const assignedCount = testAssignments.length;
                const completedCount = testAssignments.filter(a => a.status === 'completed' || a.score !== undefined).length;
                const completionPct = assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0;

                return (
                  <div
                    key={testId || index}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-200 dark:hover:border-indigo-700/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {test.name || 'Technical Assessment'}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                          {test.role || 'Software Engineer'}
                        </span>
                      </div>

                      {/* Completion Progress Bar */}
                      <div className="mt-2.5 flex items-center gap-3">
                        <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(completionPct, 5)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 shrink-0">
                          {completedCount}/{assignedCount || 1} Completed ({completionPct}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab && setActiveTab('results')}
                        className="h-8 text-xs font-medium border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                      >
                        View Results
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">No assessments created yet</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Create your first assessment test to begin assigning candidates.
                </p>
                <Button
                  size="sm"
                  onClick={() => setActiveTab && setActiveTab('create-assessment')}
                  className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium h-8 rounded-lg"
                >
                  <Plus size={13} className="mr-1" />
                  Create Assessment
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Top Performer Spotlight (1 Col) */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                <span>Top Performing Talent</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Ready for interview</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Highest scoring candidates in this workspace
            </p>
          </div>

          <div className="space-y-3 my-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((cand, idx) => {
                const name = cand.full_name || cand.name || 'Candidate';
                const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                const score = getCandidateScore(cand);
                return (
                  <div
                    key={cand.id || idx}
                    onClick={() => onCandidateClick && onCandidateClick(cand)}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-2.5 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                        <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {cand.role ? cand.role.charAt(0).toUpperCase() + cand.role.slice(1).toLowerCase() : 'Candidate'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/40">
                        {score}%
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                Evaluation results will appear here once candidates complete tests.
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterStatus('top')}
            className="w-full text-xs font-medium border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer h-8"
          >
            <span>View All Top Performers</span>
            <ArrowUpRight size={13} className="ml-1" />
          </Button>
        </div>

      </div>

    </div>
  );
};

export default DashboardOverviewTab;
