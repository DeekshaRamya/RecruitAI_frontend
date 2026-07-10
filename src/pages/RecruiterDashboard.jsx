import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  Briefcase,
  Users,
  Award,
  TrendingUp,
  Search,
  X,
  Check,
  Settings,
  Bell,
  Menu,
  ChevronRight,
  SlidersHorizontal,
  Mail,
  User,
  Clock,
  Download,
  AlertCircle,
  Phone,
  Calendar,
  Globe,
  Plus,
  LogOut,
  Edit2,
  Lock,
  ArrowUpRight,
  FileText
} from 'lucide-react';

const RecruiterDashboard = ({ onLogout }) => {
  // Candidate dataset state
  const [candidates, setCandidates] = useState([
    { id: 1, name: 'Sarah Connor', email: 'sarah.c@sky.net', role: 'Senior React Developer', date: '2026-07-08', status: 'Completed', score: 94 },
    { id: 2, name: 'Alex Mercer', email: 'alex@gentek.org', role: 'Backend Engineer', date: '2026-07-07', status: 'In Progress', score: null },
    { id: 3, name: 'Diana Prince', email: 'diana.p@themyscira.gov', role: 'Lead Product Designer', date: '2026-07-06', status: 'Under Review', score: 88 },
    { id: 4, name: 'Bruce Wayne', email: 'bruce@waynecorp.com', role: 'Security Architect', date: '2026-07-05', status: 'Completed', score: 99 },
    { id: 5, name: 'Peter Parker', email: 'peter@dailybugle.com', role: 'Frontend Engineer', date: '2026-07-04', status: 'Failed', score: 45 },
    { id: 6, name: 'Clark Kent', email: 'clark.k@dailyplanet.com', role: 'Content Manager', date: '2026-07-03', status: 'Completed', score: 92 },
  ]);

  // Sidebar navigation state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search, filter, and sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [sortBy, setSortBy] = useState('newest');

  // Interactive UI Drawer states
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Subjects and topics dataset
  const subjectsData = {
    Python: [
      'Variables & Data Types',
      'Control Flow & Loops',
      'Functions',
      'OOP & Classes',
      'Exception Handling',
      'File Handling',
      'Collections',
      'Generators & Decorators',
      'Async Programming',
      'Unit Testing'
    ],
    SQL: [
      'SELECT & Projection',
      'WHERE & Filtering',
      'GROUP BY & Aggregation',
      'HAVING',
      'JOINs',
      'Subqueries',
      'Window Functions',
      'CTEs',
      'Stored Procedures',
      'Indexing & Performance'
    ],
    Aptitude: [
      'Percentages',
      'Profit & Loss',
      'Time & Work',
      'Time & Distance',
      'Number System',
      'Logical Reasoning',
      'Data Interpretation',
      'Ratios & Proportions',
      'Probability',
      'Series & Patterns'
    ]
  };

  // Selected topics state (Python topics selected by default as in screenshot)
  const [selectedTopics, setSelectedTopics] = useState({
    Python: ['Variables & Data Types', 'Control Flow & Loops'],
    SQL: [],
    Aptitude: []
  });

  // Assessment Settings states
  const [questionsPerTopic, setQuestionsPerTopic] = useState('10 questions');
  const [difficulty, setDifficulty] = useState('Medium');
  const [duration, setDuration] = useState('60 minutes');

  // Dynamic assessment calculations
  const totalSelectedTopics = selectedTopics.Python.length + selectedTopics.SQL.length + selectedTopics.Aptitude.length;
  const activeSubjectsCount = (selectedTopics.Python.length > 0 ? 1 : 0) + (selectedTopics.SQL.length > 0 ? 1 : 0) + (selectedTopics.Aptitude.length > 0 ? 1 : 0);
  const qPerTopicNum = parseInt(questionsPerTopic) || 10;
  const totalQuestions = totalSelectedTopics * qPerTopicNum;

  // Toggle selection for a topic
  const toggleTopic = (subject, topic) => {
    setSelectedTopics(prev => {
      const currentList = prev[subject];
      const isSelected = currentList.includes(topic);
      const newList = isSelected
        ? currentList.filter(t => t !== topic)
        : [...currentList, topic];
      return {
        ...prev,
        [subject]: newList
      };
    });
  };

  // Create assessment form state (legacy fallback, unused but kept for compatibility)
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    role: 'Frontend Engineer',
    duration: '45',
    difficulty: 'Medium'
  });

  // Successful assessment toast/alert notification
  const [toastMessage, setToastMessage] = useState('');

  // Dynamic states for active assessments metric count
  const [activeAssessmentsCount, setActiveAssessmentsCount] = useState(18);

  // Dropdown open states
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Statistics data (dynamic active assessments)
  const stats = [
    { label: 'Total Candidates', value: '1,248', change: '+12% this week', icon: Users },
    { label: 'Active Assessments', value: activeAssessmentsCount.toString(), change: '+2 new today', icon: Briefcase },
    { label: 'Completion Rate', value: '84.5%', change: '+3% avg. rate', icon: TrendingUp },
    { label: 'Average Score', value: '78.2%', change: '+1.4% improvement', icon: Award },
  ];

  // List of roles and statuses for filters
  const roles = ['All Roles', ...new Set(candidates.map(c => c.role))];
  const statuses = ['All Statuses', 'Completed', 'In Progress', 'Under Review', 'Failed'];

  // Handle Search, Filters, and Sorting
  const filteredCandidates = candidates
    .filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = selectedRole === 'All Roles' || candidate.role === selectedRole;
      const matchesStatus = selectedStatus === 'All Statuses' || candidate.status === selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortBy === 'score-high') {
        return (b.score || 0) - (a.score || 0);
      }
      if (sortBy === 'score-low') {
        return (a.score || 0) - (b.score || 0);
      }
      return 0;
    });

  // Action: Create Assessment (legacy submit)
  const handleCreateAssessmentSubmit = (e) => {
    e.preventDefault();
    if (!newAssessment.title.trim()) return;

    setIsCreateModalOpen(false);
    showToast(`Assessment "${newAssessment.title}" successfully created!`);

    // Reset form
    setNewAssessment({
      title: '',
      role: 'Frontend Engineer',
      duration: '45',
      difficulty: 'Medium'
    });
  };

  // Action: Generate Assessment with AI
  const handleGenerateAssessment = () => {
    showToast(`Successfully generated assessment containing ${totalQuestions} questions across ${totalSelectedTopics} topics!`);
    setActiveAssessmentsCount(prev => prev + 1);
    
    // Reset selection after delay and return to dashboard tab
    setTimeout(() => {
      setSelectedTopics({
        Python: [],
        SQL: [],
        Aptitude: []
      });
      setActiveTab('dashboard');
    }, 1800);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  const getHeaderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Recruiter Workspace',
          tag: 'v1.2',
          subtitle: 'Analyze candidate assessments and coordinate evaluation flows.'
        };
      case 'create-assessment':
        return {
          title: 'Create Assessment',
          tag: 'AI Generator',
          subtitle: 'Select topics by subject. AI will generate questions automatically.'
        };
      case 'preview-questions':
        return {
          title: 'Preview Questions',
          tag: 'QA Mode',
          subtitle: 'Review and customize the AI-generated questions before publishing.'
        };
      case 'monitor':
        return {
          title: 'Assessment Monitor',
          tag: 'Live Analytics',
          subtitle: 'Track candidate completion rates and performance analytics in real-time.'
        };
      default:
        return {
          title: 'Recruiter Workspace',
          tag: 'v1.2',
          subtitle: 'Coordinate evaluation flows.'
        };
    }
  };

  return (
    <div className="bg-dash-light-blue-bg text-dash-dark-purple min-h-screen relative overflow-hidden font-inter flex w-full">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl bg-dash-white-card border border-dash-border-gray shadow-[0_10px_25px_rgba(87,82,170,0.1)] flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-dash-primary-purple animate-ping" />
            <span className="text-sm font-semibold text-dash-dark-purple tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. SIDEBAR (Full-Height Solid Layout) */}
      <aside className="hidden lg:flex flex-col w-[260px] h-screen shrink-0 bg-dash-sidebar-bg pt-8 pb-8 pl-6 pr-0 relative z-30 text-dash-white-card shadow-[4px_0_24px_rgba(0,0,0,0.03)] justify-between">
        <div>
          {/* Branding */}
          <div className="flex items-center gap-3 px-2 py-4 mb-6">
            <div className="w-9 h-9 rounded-xl bg-dash-primary-purple flex items-center justify-center shadow-md">
              <span className="font-outfit font-extrabold text-dash-white-card text-lg tracking-wider">R</span>
            </div>
            <div>
              <h1 className="font-outfit font-bold text-base tracking-tight text-dash-white-card leading-none">RecruitAI</h1>
              <span className="text-[10px] text-dash-light-purple font-medium tracking-widest uppercase">Recruiter Portal</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
              { id: 'create-assessment', label: 'Create Assessment', icon: Plus },
              { id: 'preview-questions', label: 'Preview Questions', icon: FileText },
              { id: 'monitor', label: 'Monitor', icon: TrendingUp },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-l-[24px] rounded-r-none text-sm font-bold transition-all duration-300 relative group ${isActive
                    ? 'sidebar-active-tab shadow-sm'
                    : 'text-dash-light-purple hover:text-dash-white-card hover:bg-dash-primary-purple/20'
                    }`}
                >
                  <Icon size={18} className="relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Parrot Illustration */}
          <div className="mt-14 px-3 flex justify-center">
            <DotLottieReact
              src="https://lottie.host/defd84c4-5ba2-47c1-9c0e-5791da804e15/LDAVfJ7ud9.lottie"
              loop
              autoplay
              style={{ width: '150px', height: '150px' }}
            />
          </div>
        </div>

        {/* User Profile, Logout & Cookies Button */}
        <div className="space-y-4">
          <div className="border-t border-dash-border-gray/25 pt-4 px-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-dash-primary-purple flex items-center justify-center font-semibold text-dash-white-card">
                RA
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-semibold text-dash-white-card truncate">Recruiter Admin</h4>
                <span className="text-[10px] text-dash-light-purple truncate block">Recruiter</span>
              </div>
            </div>
          </div>

          <div className="px-2 flex flex-col gap-2.5">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-dash-light-purple hover:bg-dash-primary-purple/20 transition-all duration-200 cursor-pointer"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>

            {/* Cookie Manager Button matching image */}
            <button 
              onClick={() => showToast('Cookie preferences updated!')}
              className="w-full text-left px-3 py-2 rounded-lg bg-dash-white-card border border-dash-border-gray hover:bg-dash-soft-pink text-dash-dark-purple text-[10px] font-bold transition-all duration-200 cursor-pointer shadow-sm"
            >
              Manage cookies or opt out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-dash-dark-purple z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Content */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
            className="fixed top-0 bottom-0 left-0 w-[270px] pt-6 pb-6 pl-6 pr-0 z-50 lg:hidden flex flex-col bg-dash-sidebar-bg text-dash-white-card border-r border-dash-border-gray/25"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-dash-primary-purple flex items-center justify-center">
                  <span className="font-outfit font-extrabold text-dash-white-card text-base">R</span>
                </div>
                <h1 className="font-outfit font-bold text-base text-dash-white-card">RecruitAI</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-dash-primary-purple/20 text-dash-light-purple hover:text-dash-white-card"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-1 flex-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
                { id: 'create-assessment', label: 'Create Assessment', icon: Plus },
                { id: 'preview-questions', label: 'Preview Questions', icon: FileText },
                { id: 'monitor', label: 'Monitor', icon: TrendingUp },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-l-[24px] rounded-r-none text-sm font-bold transition-all duration-200 ${isActive
                      ? 'sidebar-active-tab shadow-sm'
                      : 'text-dash-light-purple hover:text-dash-white-card hover:bg-dash-primary-purple/20'
                      }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-dash-border-gray/25 pt-4 space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="w-9 h-9 rounded-full bg-dash-primary-purple flex items-center justify-center font-semibold text-dash-white-card">
                  RA
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-dash-white-card">Recruiter Admin</h4>
                  <span className="text-[10px] text-dash-light-purple">Recruiter</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-dash-light-purple hover:bg-dash-primary-purple/20 transition-all duration-200"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 relative z-20 overflow-y-auto h-screen max-h-screen">
        {/* HEADER SECTION */}
        <header className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-5 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2 lg:mt-0 shadow-[0_4px_20px_rgba(87,82,170,0.03)]">
          <div className="flex items-center gap-3">
            {/* Hamburger menu for small screens */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-dash-white-card border border-dash-border-gray text-dash-primary-purple hover:bg-dash-soft-pink transition-all duration-200"
            >
              <Menu size={20} />
            </button>

            <div>
              <h2 className="text-xl sm:text-2xl font-plus-jakarta font-extrabold tracking-tight text-dash-dark-purple flex items-center gap-2">
                {getHeaderContent().title}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-dash-primary-purple/10 border border-dash-border-gray text-dash-primary-purple font-outfit">{getHeaderContent().tag}</span>
              </h2>
              <p className="text-xs sm:text-sm text-dash-light-purple font-semibold mt-0.5">
                {getHeaderContent().subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 self-end sm:self-auto">
            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl bg-dash-white-card border border-dash-border-gray text-dash-primary-purple hover:bg-dash-soft-pink transition-all duration-300 hover:scale-105">
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-dash-primary-purple animate-pulse" />
              <Bell size={18} />
            </button>

            {/* Create Assessment Button (Primary Purple style) */}
            {activeTab !== 'create-assessment' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('create-assessment')}
                className="px-4.5 py-2.5 rounded-xl bg-dash-primary-purple border border-dash-primary-purple text-dash-white-card font-bold text-sm cursor-pointer shadow-md hover:bg-dash-dark-purple hover:border-dash-dark-purple transition-all duration-300 flex items-center gap-2"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Create Assessment</span>
              </motion.button>
            )}
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            {/* 3. STATISTICS CARDS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    whileHover={{ y: -5 }}
                    className="bg-dash-white-card border border-dash-border-gray hover:bg-dash-soft-pink rounded-2xl p-5 relative overflow-hidden group transition-all duration-300 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-dash-light-purple tracking-wider uppercase">{stat.label}</span>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-dash-primary-purple/10 border-dash-primary-purple/20 text-dash-primary-purple">
                        <Icon size={18} />
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-outfit font-extrabold text-dash-dark-purple tracking-tight leading-none">
                        {stat.value}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-dash-success-green bg-dash-success-green/10 border border-dash-success-green/20 px-2 py-0.5 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </section>

            {/* 4. CANDIDATE ASSESSMENT MANAGEMENT SECTION */}
            <section className="bg-dash-white-card border border-dash-border-gray rounded-[20px] shadow-sm flex-1 flex flex-col overflow-hidden">

              {/* SEARCH & FILTERS BAR */}
              <div className="p-5 border-b border-dash-border-gray bg-dash-white-card flex flex-col md:flex-row gap-4 items-center justify-between z-20">

                {/* Search Input Box */}
                <div className="relative w-full md:max-w-xs group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-light-purple transition-colors duration-300 group-focus-within:text-dash-primary-purple" size={16} />
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-dash-white-card border border-dash-border-gray rounded-lg py-2.5 pl-9 pr-4 text-xs font-semibold text-dash-dark-purple placeholder-dash-light-purple/60 transition-all duration-300 focus:outline-none focus:border-dash-primary-purple focus:ring-2 focus:ring-dash-primary-purple/10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dash-light-purple hover:text-dash-dark-purple transition-colors duration-200 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filter Dropdowns */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">

                  {/* Role Select */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(!roleDropdownOpen);
                        setStatusDropdownOpen(false);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-dash-white-card border border-dash-border-gray text-xs font-bold text-dash-dark-purple flex items-center gap-2 hover:border-dash-primary-purple transition-all duration-200 cursor-pointer"
                    >
                      <span className="text-dash-light-purple font-medium">Role:</span>
                      <span>{selectedRole}</span>
                      <SlidersHorizontal size={12} className="text-dash-primary-purple" />
                    </button>

                    <AnimatePresence>
                      {roleDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setRoleDropdownOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-48 rounded-xl bg-dash-white-card border border-dash-border-gray shadow-lg z-50 py-1 overflow-hidden"
                          >
                            {roles.map((role) => (
                              <button
                                key={role}
                                onClick={() => {
                                  setSelectedRole(role);
                                  setRoleDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-dash-dark-purple hover:bg-dash-soft-pink flex items-center justify-between cursor-pointer border-none"
                              >
                                <span>{role}</span>
                                {selectedRole === role && <Check size={12} className="text-dash-primary-purple" />}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Status Select */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setStatusDropdownOpen(!statusDropdownOpen);
                        setRoleDropdownOpen(false);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-dash-white-card border border-dash-border-gray text-xs font-bold text-dash-dark-purple flex items-center gap-2 hover:border-dash-primary-purple transition-all duration-200 cursor-pointer"
                    >
                      <span className="text-dash-light-purple font-medium">Status:</span>
                      <span>{selectedStatus}</span>
                      <SlidersHorizontal size={12} className="text-dash-primary-purple" />
                    </button>

                    <AnimatePresence>
                      {statusDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setStatusDropdownOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-44 rounded-xl bg-dash-white-card border border-dash-border-gray shadow-lg z-50 py-1 overflow-hidden"
                          >
                            {statuses.map((status) => (
                              <button
                                key={status}
                                onClick={() => {
                                  setSelectedStatus(status);
                                  setStatusDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-dash-dark-purple hover:bg-dash-soft-pink flex items-center justify-between cursor-pointer border-none"
                              >
                                <span>{status}</span>
                                {selectedStatus === status && <Check size={12} className="text-dash-primary-purple" />}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sort Selector */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-2.5 py-2 rounded-lg bg-dash-white-card border border-dash-border-gray text-xs font-bold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple cursor-pointer hover:border-dash-primary-purple transition-all duration-200"
                  >
                    <option value="newest">Date Applied</option>
                    <option value="score-high">Score: High to Low</option>
                    <option value="score-low">Score: Low to High</option>
                  </select>

                </div>

              </div>

              {/* CANDIDATE LIST DATA TABLE */}
              <div className="flex-1 overflow-x-auto dashboard-scrollbar">
                <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-dash-soft-pink border-b border-dash-border-gray text-[10px] font-extrabold text-dash-dark-purple tracking-widest uppercase">
                      <th className="px-6 py-4.5">Candidate Info</th>
                      <th className="px-6 py-4.5">Applied Role</th>
                      <th className="px-6 py-4.5">Submission Date</th>
                      <th className="px-6 py-4.5">Assessment Status</th>
                      <th className="px-6 py-4.5 text-center">Score</th>
                      <th className="px-6 py-4.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dash-border-gray">
                    <AnimatePresence mode="popLayout">
                      {filteredCandidates.map((candidate) => {
                        let statusColor = '';
                        let statusBg = '';
                        if (candidate.status === 'Completed') {
                          statusColor = '#149470';
                          statusBg = 'rgba(20, 148, 112, 0.1)';
                        } else if (candidate.status === 'Under Review') {
                          statusColor = '#7CB08D';
                          statusBg = 'rgba(124, 176, 141, 0.1)';
                        } else {
                          statusColor = '#84492D';
                          statusBg = 'rgba(132, 73, 45, 0.1)';
                        }

                        return (
                          <motion.tr
                            key={candidate.id}
                            layout
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="bg-dash-white-card hover:bg-dash-soft-pink transition-colors duration-200 group"
                          >
                            {/* Name and Email */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-dash-light-blue-bg border border-dash-border-gray flex items-center justify-center text-xs font-semibold text-dash-dark-purple group-hover:border-dash-primary-purple/40 transition-colors duration-250">
                                  {candidate.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-dash-dark-purple group-hover:text-dash-primary-purple transition-colors duration-200">{candidate.name}</h4>
                                  <span className="text-[10px] text-dash-light-purple">{candidate.email}</span>
                                </div>
                              </div>
                            </td>

                            {/* Applied Role */}
                            <td className="px-6 py-4">
                              <span className="text-xs font-semibold text-dash-dark-purple">{candidate.role}</span>
                            </td>

                            {/* Submission Date */}
                            <td className="px-6 py-4 text-xs text-dash-light-purple">
                              {candidate.date}
                            </td>

                            {/* Status Badges */}
                            <td className="px-6 py-4">
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border"
                                style={{
                                  borderColor: `${statusColor}30`,
                                  backgroundColor: statusBg,
                                  color: statusColor,
                                }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: statusColor }}
                                />
                                {candidate.status}
                              </span>
                            </td>

                            {/* Assessment Score */}
                            <td className="px-6 py-4 text-center">
                              {candidate.score !== null ? (
                                <span
                                  className="text-xs font-extrabold px-2.5 py-1 rounded-lg"
                                  style={{
                                    color: candidate.score >= 85 ? '#149470' : candidate.score >= 70 ? '#7CB08D' : '#84492D',
                                    backgroundColor: candidate.score >= 85 ? 'rgba(20, 148, 112, 0.05)' : candidate.score >= 70 ? 'rgba(124, 176, 141, 0.05)' : 'rgba(132, 73, 45, 0.05)'
                                  }}
                                >
                                  {candidate.score}%
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-dash-light-purple">--</span>
                              )}
                            </td>

                            {/* Report Action Button */}
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setSelectedCandidate(candidate)}
                                className="px-3 py-1.5 rounded-lg bg-dash-white-card border border-dash-border-gray hover:border-dash-primary-purple text-dash-primary-purple text-xs font-bold hover:bg-dash-soft-pink transition-all duration-300 flex items-center gap-1.5 ml-auto cursor-pointer"
                              >
                                <FileText size={13} />
                                <span>View Report</span>
                              </button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>

                    {filteredCandidates.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-dash-light-purple">
                          <AlertCircle className="mx-auto mb-3 text-dash-light-purple" size={32} />
                          No candidates found matching filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TABLE FOOTER */}
              <div className="p-4 border-t border-dash-border-gray bg-dash-white-card flex items-center justify-between text-[11px] text-dash-light-purple font-semibold px-6">
                <span>Showing {filteredCandidates.length} of {candidates.length} candidates</span>
                <span>Total 18 assessments listed in workspace</span>
              </div>

            </section>
          </>
        )}

        {/* 6. INTERACTIVE CREATE ASSESSMENT SCREEN */}
        {activeTab === 'create-assessment' && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
            {/* Left Pane: Subjects Grid (3/5 width) */}
            <div className="xl:col-span-3 flex flex-col gap-6">
              
              {/* Python Card */}
              <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-3">
                  <h3 className="font-outfit font-bold text-base text-dash-dark-purple">Python</h3>
                  <span className="text-xs font-bold text-dash-light-purple">
                    {selectedTopics.Python.length} of {subjectsData.Python.length} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {subjectsData.Python.map((topic) => {
                    const isSelected = selectedTopics.Python.includes(topic);
                    return (
                      <button
                        key={topic}
                        onClick={() => toggleTopic('Python', topic)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-dash-primary-purple border-dash-primary-purple text-dash-white-card shadow-sm'
                            : 'bg-dash-white-card border-dash-border-gray hover:bg-dash-soft-pink hover:border-dash-primary-purple/40 text-dash-dark-purple'
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SQL Card */}
              <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-3">
                  <h3 className="font-outfit font-bold text-base text-dash-dark-purple">SQL</h3>
                  <span className="text-xs font-bold text-dash-light-purple">
                    {selectedTopics.SQL.length} of {subjectsData.SQL.length} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {subjectsData.SQL.map((topic) => {
                    const isSelected = selectedTopics.SQL.includes(topic);
                    return (
                      <button
                        key={topic}
                        onClick={() => toggleTopic('SQL', topic)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-dash-primary-purple border-dash-primary-purple text-dash-white-card shadow-sm'
                            : 'bg-dash-white-card border-dash-border-gray hover:bg-dash-soft-pink hover:border-dash-primary-purple/40 text-dash-dark-purple'
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aptitude Card (Amber styles matching the user's screenshot) */}
              <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-3">
                  <h3 className="font-outfit font-bold text-base text-dash-dark-purple">Aptitude</h3>
                  <span className="text-xs font-bold text-dash-light-purple">
                    {selectedTopics.Aptitude.length} of {subjectsData.Aptitude.length} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {subjectsData.Aptitude.map((topic) => {
                    const isSelected = selectedTopics.Aptitude.includes(topic);
                    return (
                      <button
                        key={topic}
                        onClick={() => toggleTopic('Aptitude', topic)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#d97706] border-[#d97706] text-dash-white-card shadow-sm'
                            : 'bg-dash-white-card border-[#d97706]/40 hover:bg-[#fef3c7] hover:border-[#d97706] text-[#b45309]'
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Pane: Settings & Summary (2/5 width) */}
            <div className="xl:col-span-2 flex flex-col gap-6">
              
              {/* Assessment Settings Card */}
              <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-6 shadow-sm flex flex-col gap-5">
                <h3 className="font-outfit font-bold text-base text-dash-dark-purple border-b border-dash-border-gray/25 pb-3">
                  Assessment Settings
                </h3>
                
                {/* Questions per Topic */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-dash-light-purple uppercase tracking-wider">
                    Questions per Topic
                  </label>
                  <select
                    value={questionsPerTopic}
                    onChange={(e) => setQuestionsPerTopic(e.target.value)}
                    className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2.5 px-4 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple cursor-pointer transition-all"
                  >
                    <option value="5 questions">5 questions</option>
                    <option value="10 questions">10 questions</option>
                    <option value="15 questions">15 questions</option>
                    <option value="20 questions">20 questions</option>
                  </select>
                </div>

                {/* Difficulty Level selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-dash-light-purple uppercase tracking-wider">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Easy', 'Medium', 'Hard'].map((lvl) => {
                      const isActive = difficulty === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setDifficulty(lvl)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                            isActive
                              ? 'bg-dash-primary-purple/10 border-dash-primary-purple text-dash-primary-purple shadow-sm'
                              : 'bg-dash-white-card border-dash-border-gray text-dash-light-purple hover:border-dash-primary-purple/55 hover:text-dash-primary-purple'
                          }`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration select */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-dash-light-purple uppercase tracking-wider">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2.5 px-4 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple cursor-pointer transition-all"
                  >
                    <option value="30 minutes">30 minutes</option>
                    <option value="45 minutes">45 minutes</option>
                    <option value="60 minutes">60 minutes</option>
                    <option value="90 minutes">90 minutes</option>
                    <option value="120 minutes">120 minutes</option>
                  </select>
                </div>

              </div>

              {/* Summary Card */}
              <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
                <h3 className="font-outfit font-bold text-base text-dash-dark-purple border-b border-dash-border-gray/25 pb-3">
                  Summary
                </h3>
                
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-dash-light-purple">Topics selected</span>
                    <span className="text-dash-dark-purple font-bold">{totalSelectedTopics}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-dash-light-purple">Active subjects</span>
                    <span className="text-dash-dark-purple font-bold">{activeSubjectsCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-dash-light-purple">Total questions</span>
                    <span className="text-dash-dark-purple font-bold">{totalQuestions}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-dash-light-purple">Difficulty</span>
                    <span className="text-dash-dark-purple font-bold">{difficulty}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-dash-light-purple">Duration</span>
                    <span className="text-dash-dark-purple font-bold">{qPerTopicNum * totalSelectedTopics > 0 ? duration : '--'}</span>
                  </div>
                </div>

                <button
                  onClick={handleGenerateAssessment}
                  disabled={totalSelectedTopics === 0}
                  className="w-full mt-3 py-3.5 rounded-xl bg-dash-primary-purple border border-dash-primary-purple text-dash-white-card font-bold text-sm hover:bg-dash-dark-purple hover:border-dash-dark-purple transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Globe size={15} />
                  <span>Generate with AI</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 7. PREVIEW QUESTIONS SCREEN */}
        {activeTab === 'preview-questions' && (
          <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
            <h3 className="font-outfit font-bold text-base text-dash-dark-purple border-b border-dash-border-gray/25 pb-3">
              AI Question Preview Pool
            </h3>
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  subject: 'Python',
                  topic: 'Variables & Data Types',
                  q: 'Explain the difference between mutable and immutable data types in Python. Give examples of each.',
                  difficulty: 'Medium'
                },
                {
                  id: 2,
                  subject: 'Python',
                  topic: 'Control Flow & Loops',
                  q: 'What is the purpose of the else clause in a for loop? Provide a short snippet demonstrating its utility.',
                  difficulty: 'Medium'
                },
                {
                  id: 3,
                  subject: 'SQL',
                  topic: 'SELECT & Projection',
                  q: 'Write a query to retrieve the second highest salary from an Employee table without using aggregate functions or LIMIT.',
                  difficulty: 'Hard'
                }
              ].map(item => (
                <div key={item.id} className="p-4 rounded-2xl bg-dash-light-blue-bg/40 border border-dash-border-gray/20 flex flex-col gap-2 hover:bg-dash-soft-pink transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-dash-primary-purple/10 text-dash-primary-purple border border-dash-primary-purple/20">
                        {item.subject}
                      </span>
                      <span className="text-[10px] font-bold text-dash-light-purple">
                        {item.topic}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-dash-success-green/10 text-dash-success-green border border-dash-success-green/20">
                      {item.difficulty}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-dash-dark-purple leading-relaxed">
                    {item.q}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. MONITOR ACTIVE SCREEN */}
        {activeTab === 'monitor' && (
          <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-8 text-center flex flex-col items-center justify-center min-h-[350px]">
            <div className="p-4 rounded-full bg-dash-light-blue-bg text-dash-primary-purple mb-4">
              <TrendingUp size={36} className="animate-pulse" />
            </div>
            <h3 className="font-plus-jakarta font-extrabold text-lg text-dash-dark-purple">
              Live Evaluation Analytics
            </h3>
            <p className="text-sm text-dash-light-purple font-medium mt-2 max-w-sm">
              Real-time candidate telemetry and evaluation logs are active. Awaiting submissions for the current cycle.
            </p>
          </div>
        )}
      </main>

      {/* 5. DRAWER (Mock candidate detailed report - Light themed) */}
      <AnimatePresence>
        {selectedCandidate && (
          <>
            {/* Dark Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCandidate(null)}
              className="fixed inset-0 bg-dash-dark-purple/40 z-40"
            />

            {/* Slide-out Panel Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed top-0 bottom-0 right-0 w-full sm:w-[460px] bg-dash-white-card border-l border-dash-border-gray shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between pb-4 border-b border-dash-border-gray mb-6">
                  <div>
                    <span className="text-[10px] text-dash-primary-purple font-extrabold tracking-widest uppercase">Evaluation Details</span>
                    <h3 className="text-base font-bold text-dash-dark-purple font-outfit mt-1">{selectedCandidate.name}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="p-1.5 rounded-lg hover:bg-dash-soft-pink text-dash-light-purple hover:text-dash-dark-purple transition-all duration-200 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Candidate Info profile card */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray rounded-xl p-3.5">
                      <span className="text-[10px] text-dash-light-purple font-bold uppercase tracking-wider block mb-1">Applied Role</span>
                      <span className="text-xs font-semibold text-dash-dark-purple">{selectedCandidate.role}</span>
                    </div>
                    <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray rounded-xl p-3.5">
                      <span className="text-[10px] text-dash-light-purple font-bold uppercase tracking-wider block mb-1">Email Address</span>
                      <span className="text-xs font-semibold text-dash-dark-purple truncate block">{selectedCandidate.email}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray rounded-xl p-3.5">
                      <span className="text-[10px] text-dash-light-purple font-bold uppercase tracking-wider block mb-1">Date Applied</span>
                      <span className="text-xs font-semibold text-dash-dark-purple">{selectedCandidate.date}</span>
                    </div>
                    <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray rounded-xl p-3.5">
                      <span className="text-[10px] text-dash-light-purple font-bold uppercase tracking-wider block mb-1">Score Result</span>
                      <span className="text-xs font-semibold text-dash-dark-purple flex items-center gap-1.5 mt-0.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: selectedCandidate.status === 'Completed' ? '#149470' : selectedCandidate.status === 'Under Review' ? '#7CB08D' : '#84492D'
                          }}
                        />
                        {selectedCandidate.score !== null ? `${selectedCandidate.score}%` : '--'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Evaluation detailed breakdown values */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-dash-dark-purple tracking-wider uppercase mb-3">Skill breakdown</h4>
                  {selectedCandidate.score !== null ? (
                    <div className="space-y-4">
                      {/* Metric 1 */}
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                          <span className="text-dash-light-purple">React & Frontend Logic</span>
                          <span className="text-dash-dark-purple font-bold">{selectedCandidate.score - 2}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-dash-soft-pink overflow-hidden">
                          <div className="h-full bg-dash-primary-purple rounded-full" style={{ width: `${selectedCandidate.score - 2}%` }} />
                        </div>
                      </div>

                      {/* Metric 2 */}
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                          <span className="text-dash-light-purple">System Design</span>
                          <span className="text-dash-dark-purple font-bold">{selectedCandidate.score + 1}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-dash-soft-pink overflow-hidden">
                          <div className="h-full bg-dash-primary-purple rounded-full" style={{ width: `${selectedCandidate.score + 1}%` }} />
                        </div>
                      </div>

                      {/* Metric 3 */}
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                          <span className="text-dash-light-purple">Problem Solving</span>
                          <span className="text-dash-dark-purple font-bold">{selectedCandidate.score - 8}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-dash-soft-pink overflow-hidden">
                          <div className="h-full bg-dash-primary-purple rounded-full" style={{ width: `${selectedCandidate.score - 8}%` }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 text-center bg-dash-light-blue-bg/30 border border-dash-border-gray rounded-xl">
                      <Clock className="text-dash-accent-brown mx-auto mb-2 animate-pulse" size={24} />
                      <span className="text-xs text-dash-light-purple font-medium leading-relaxed block">
                        Evaluation in progress. Detailed metric score breakdown will be available once submitted by candidate.
                      </span>
                    </div>
                  )}
                </div>

                {/* AI Recommendation Feedback */}
                {selectedCandidate.score !== null && (
                  <div className="bg-dash-soft-pink border border-dash-border-gray rounded-xl p-4">
                    <h5 className="text-[10px] text-dash-primary-purple font-bold uppercase tracking-wider mb-1">AI Recommendation Feedback</h5>
                    <p className="text-xs text-dash-dark-purple leading-relaxed">
                      {selectedCandidate.score >= 90
                        ? "Exceptional candidate. Outperformed in logic reasoning, optimization efficiency, and system scalability. Strongly suggest scheduling panel interviews immediately."
                        : selectedCandidate.score >= 75
                          ? "Strong performance. Demonstrated clear knowledge of frontend development concepts with average optimization skills. Recommend moving to technical round."
                          : "Candidate did not pass the required baseline performance standards. Scores were low in algorithmic solving speed."}
                    </p>
                  </div>
                )}

              </div>

              {/* Drawer footer buttons */}
              <div className="pt-5 border-t border-dash-border-gray flex gap-3 mt-8">
                <button
                  onClick={() => showToast(`Report for ${selectedCandidate.name} downloaded successfully!`)}
                  disabled={selectedCandidate.score === null}
                  className="flex-1 py-3 rounded-2xl border border-dash-border-gray hover:bg-dash-soft-pink text-dash-primary-purple font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Report</span>
                </button>
                <button
                  onClick={() => {
                    showToast(`Interview invite sent to ${selectedCandidate.name}!`);
                    setSelectedCandidate(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-dash-primary-purple text-dash-white-card font-bold text-xs transition-all duration-200 hover:bg-dash-dark-purple shadow-[0_4px_12px_rgba(87,82,170,0.2)] flex items-center justify-center gap-1 cursor-pointer border-none"
                >
                  <span>Request Interview</span>
                  <ChevronRight size={14} />
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>



    </div>
  );
};

export default RecruiterDashboard;
