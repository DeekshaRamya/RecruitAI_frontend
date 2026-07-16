import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import api from '../api';
import {
  Briefcase,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  Award,
  TrendingUp,
  Plus,
  Volume2,
  Terminal,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  Play,
  ArrowLeft,
  ArrowRight,
  Check
} from 'lucide-react';

const CandidateDashboard = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toastMessage, setToastMessage] = useState('');

  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [examState, setExamState] = useState({
    currentQuestionIndex: 0,
    answers: {},
    timeLeft: 0,
    submitted: false
  });

  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const response = await api.get('/api/assignments/candidate');
      setAssignments(response.data);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const parseDuration = (durStr) => {
    const parsed = parseInt(durStr.replace(/\D/g, ''), 10);
    return isNaN(parsed) ? 30 : parsed;
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartExam = async (assignment) => {
    try {
      if (assignment.status === 'ASSIGNED') {
        await api.patch(`/api/assignments/${assignment.id}/status`, { status: 'IN_PROGRESS' });
        // Update local list
        setAssignments(prev => prev.map(a => a.id === assignment.id ? { ...a, status: 'IN_PROGRESS' } : a));
      }
      setActiveAssignment(assignment);
      setExamState({
        currentQuestionIndex: 0,
        answers: {},
        timeLeft: parseDuration(assignment.assessment.duration) * 60,
        submitted: false
      });
    } catch (err) {
      console.error("Failed to start assessment:", err);
      showToast("Error starting assessment. Please try again.");
    }
  };

  const handleSubmitExam = async (assignmentIdOverride) => {
    const targetId = assignmentIdOverride || activeAssignment?.id;
    if (!targetId) return;

    try {
      await api.patch(`/api/assignments/${targetId}/status`, { status: 'COMPLETED' });
      setExamState(prev => ({ ...prev, submitted: true }));
      await fetchAssignments();
    } catch (err) {
      console.error("Failed to submit exam:", err);
      showToast("Error submitting assessment. Please try again.");
    }
  };

  useEffect(() => {
    if (!activeAssignment || examState.submitted || examState.timeLeft <= 0) return;

    const timer = setInterval(() => {
      setExamState((prev) => {
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            handleSubmitExam(activeAssignment.id);
          }, 0);
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeAssignment, examState.submitted, examState.timeLeft]);

  const [candidate] = useState(() => {
    const saved = localStorage.getItem('current_candidate');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing current_candidate:", e);
      }
    }
    return {
      id: 3,
      name: 'Arjun Sharma',
      email: 'arjun.sharma@recruitai.com',
      role: 'Python Developer',
      date: '2026-07-06',
      resume: 84,
      python: 78,
      sql: 82,
      aptitude: 74,
      english: 88,
      final: 82,
      recommendation: 'Strong Hire',
      status: 'Completed'
    };
  });

  const handleSignOut = () => {
    localStorage.removeItem('current_candidate');
    onLogout();
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  const firstName = candidate.name.split(' ')[0];

  const getHeaderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Candidate Dashboard',
          tag: 'Portal',
          subtitle: `Welcome back, ${firstName}. Track your assessment progress here.`
        };
      case 'resume':
        return {
          title: 'Resume Upload',
          tag: 'Upload',
          subtitle: 'Upload your resume for AI-powered skill extraction and analysis.'
        };
      case 'technical':
        return {
          title: 'Technical Assessment',
          tag: 'Test',
          subtitle: 'AI-generated questions based on topics selected by your recruiter.'
        };
      case 'english':
        return {
          title: 'English Speaking Assessment',
          tag: 'Speaking',
          subtitle: 'AI-generated questions based on your resume. Speak clearly and confidently.'
        };
      default:
        return {
          title: 'Candidate Portal',
          tag: 'Workspaces',
          subtitle: 'Complete assessments and view progress details.'
        };
    }
  };

  const stats = [
    {
      label: 'Resume',
      value: candidate.resume > 0 ? 'Uploaded' : 'Pending',
      subtext: candidate.resume > 0 ? `${candidate.name.replace(/\s+/g, '_')}_CV.pdf` : 'No file uploaded',
      icon: FileText,
      colorClass: 'text-white bg-white/20',
      cardBg: 'bg-gradient-to-br from-[#5E80B4] to-[#4D6D9E] text-white border-0 shadow-md'
    },
    {
      label: 'Avg Skill Match',
      value: candidate.final > 0 ? `${candidate.final}%` : '—',
      subtext: 'Across 4 categories',
      icon: Award,
      colorClass: 'text-white bg-white/20',
      cardBg: 'bg-gradient-to-br from-[#8B95C9] to-[#7380BD] text-white border-0 shadow-md'
    },
    {
      label: 'Assessment',
      value: `${[candidate.python, candidate.sql, candidate.aptitude, candidate.english].filter(s => s > 0).length} / 4`,
      subtext: 'Modules completed',
      icon: Briefcase,
      colorClass: 'text-white bg-white/20',
      cardBg: 'bg-gradient-to-br from-[#E57E88] to-[#D06774] text-white border-0 shadow-md'
    },
    {
      label: 'Final Score',
      value: candidate.final > 0 ? `${candidate.final}%` : '—',
      subtext: candidate.final > 0 ? 'Unlock complete' : 'Complete all to unlock',
      icon: TrendingUp,
      colorClass: 'text-white bg-white/20',
      cardBg: 'bg-gradient-to-br from-[#768CB5] to-[#5C7CAE] text-white border-0 shadow-md'
    }
  ];

  // Journey steps based on mock
  const journeySteps = [
    {
      title: 'Resume Upload',
      description: candidate.resume > 0 ? `${candidate.name.replace(/\s+/g, '_')}_CV.pdf uploaded successfully` : 'Upload your resume to begin',
      status: candidate.resume > 0 ? 'Completed' : 'Pending',
      statusColor: candidate.resume > 0 ? 'text-dash-success-green bg-dash-success-green/10 border-dash-success-green/20' : 'text-dash-light-purple bg-dash-border-gray/30 border-dash-border-gray/40'
    },
    {
      title: 'AI Analysis',
      description: candidate.resume > 0 ? 'Skills extracted & matched against 4 categories' : 'Awaiting resume upload',
      status: candidate.resume > 0 ? 'Completed' : 'Pending',
      statusColor: candidate.resume > 0 ? 'text-dash-success-green bg-dash-success-green/10 border-dash-success-green/20' : 'text-dash-light-purple bg-dash-border-gray/30 border-dash-border-gray/40'
    },
    {
      title: 'Technical Assessment',
      description: '30 questions · 60 min · Python, SQL, Aptitude',
      status: (candidate.python > 0 || candidate.sql > 0 || candidate.aptitude > 0)
        ? ((candidate.python > 0 && candidate.sql > 0 && candidate.aptitude > 0) ? 'Completed' : 'In Progress')
        : 'Pending',
      statusColor: (candidate.python > 0 && candidate.sql > 0 && candidate.aptitude > 0)
        ? 'text-dash-success-green bg-dash-success-green/10 border-dash-success-green/20'
        : (candidate.python > 0 || candidate.sql > 0 || candidate.aptitude > 0)
          ? 'text-dash-primary-purple bg-dash-primary-purple/10 border-dash-primary-purple/20'
          : 'text-dash-light-purple bg-dash-border-gray/30 border-dash-border-gray/40'
    },
    {
      title: 'English Speaking',
      description: '5 AI-generated resume-based questions',
      status: candidate.english > 0 ? 'Completed' : 'Pending',
      statusColor: candidate.english > 0
        ? 'text-dash-success-green bg-dash-success-green/10 border-dash-success-green/20'
        : 'text-dash-light-purple bg-dash-border-gray/30 border-dash-border-gray/40'
    }
  ];

  // Skills progress based on mock
  const skills = [
    { name: 'Python', percent: candidate.python || 0, colorClass: 'bg-gradient-to-r from-[#5E80B4] to-[#4D6D9E]' },
    { name: 'SQL', percent: candidate.sql || 0, colorClass: 'bg-gradient-to-r from-[#8B95C9] to-[#7380BD]' },
    { name: 'Aptitude', percent: candidate.aptitude || 0, colorClass: 'bg-gradient-to-r from-[#E57E88] to-[#D06774]' },
    { name: 'English', percent: candidate.english || 0, colorClass: 'bg-gradient-to-r from-[#768CB5] to-[#5C7CAE]' }
  ];

  // Strengths tags
  const strengths = candidate.resume > 0 ? ['Python', 'SQL', 'Aptitude', 'English'] : ['Pending Assessment'];

  return (
    <div className="candidate-dashboard-theme bg-dash-light-blue-bg text-dash-dark-purple min-h-screen relative overflow-hidden font-inter flex w-full">
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

      {/* 1. SIDEBAR (Full-Height Solid Layout matching Recruiter) */}
      <aside className="hidden lg:flex flex-col w-[260px] h-screen shrink-0 bg-dash-sidebar-bg pt-8 pb-8 pl-6 pr-0 relative z-30 text-dash-dark-purple shadow-[4px_0_24px_rgba(0,0,0,0.03)] justify-between">
        <div>
          {/* Branding */}
          <div className="flex items-center gap-3 px-2 py-4 mb-6">
            <div className="w-9 h-9 rounded-xl bg-dash-primary-purple flex items-center justify-center shadow-md">
              <span className="font-outfit font-extrabold text-dash-white-card text-lg tracking-wider">R</span>
            </div>
            <div>
              <h1 className="font-outfit font-bold text-base tracking-tight text-dash-dark-purple leading-none">RecruitAI</h1>
              <span className="text-[10px] text-dash-light-purple font-medium tracking-widest uppercase">Candidate Portal</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
              { id: 'resume', label: 'Resume Upload', icon: FileText },
              { id: 'technical', label: 'Technical Test', icon: Terminal },
              { id: 'english', label: 'English Speaking', icon: Volume2 },
              { id: 'results', label: 'My Results', icon: Award },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id !== 'dashboard' && item.id !== 'resume' && item.id !== 'technical') {
                      showToast(`"${item.label}" feature is coming soon!`);
                    }
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-l-[24px] rounded-r-none text-sm font-bold transition-all duration-300 relative group ${isActive
                    ? 'sidebar-active-tab shadow-sm'
                    : 'text-dash-light-purple hover:text-dash-dark-purple hover:bg-dash-primary-purple/20'
                    }`}
                >
                  <Icon size={18} className="relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>
          {/* Centered Lottie Animation */}
          <div className="flex items-center justify-center py-4 px-6 mt-2">
            <div className="w-48 h-48 flex items-center justify-center">
              <DotLottieReact
                src="https://lottie.host/f5bd2f6c-67a9-44d5-954d-96176d4cb3df/USuWgujLWd.lottie"
                loop
                autoplay
              />
            </div>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="space-y-4">
          <div className="border-t border-dash-border-gray/25 pt-4 px-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-dash-primary-purple flex items-center justify-center font-semibold text-dash-white-card">
                {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-semibold text-dash-dark-purple truncate">{candidate.name}</h4>
                <span className="text-[10px] text-dash-light-purple truncate block">Candidate</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-dash-light-purple hover:bg-dash-primary-purple/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
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
            className="fixed top-0 bottom-0 left-0 w-[270px] pt-6 pb-6 pl-6 pr-0 z-50 lg:hidden flex flex-col bg-dash-sidebar-bg text-dash-dark-purple border-r border-dash-border-gray/25"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-dash-primary-purple flex items-center justify-center">
                  <span className="font-outfit font-extrabold text-dash-white-card text-base">R</span>
                </div>
                <h1 className="font-outfit font-bold text-base text-dash-dark-purple">RecruitAI</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-dash-primary-purple/20 text-dash-light-purple hover:text-dash-dark-purple mr-4"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-1 flex-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
                { id: 'resume', label: 'Resume Upload', icon: FileText },
                { id: 'technical', label: 'Technical Test', icon: Terminal },
                { id: 'english', label: 'English Speaking', icon: Volume2 },
                { id: 'results', label: 'My Results', icon: Award },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                      if (item.id !== 'dashboard' && item.id !== 'resume' && item.id !== 'technical') {
                        showToast(`"${item.label}" feature is coming soon!`);
                      }
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-l-[24px] rounded-r-none text-sm font-bold transition-all duration-200 ${isActive
                      ? 'sidebar-active-tab shadow-sm'
                      : 'text-dash-light-purple hover:text-dash-dark-purple hover:bg-dash-primary-purple/20'
                      }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            {/* Centered Lottie Animation */}
            <div className="flex items-center justify-center py-2 pr-4 my-2">
              <div className="w-44 h-44 flex items-center justify-center">
                <DotLottieReact
                  src="https://lottie.host/f5bd2f6c-67a9-44d5-954d-96176d4cb3df/USuWgujLWd.lottie"
                  loop
                  autoplay
                />
              </div>
            </div>

            <div className="border-t border-dash-border-gray/25 pt-4 space-y-3 mr-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-9 h-9 rounded-full bg-dash-primary-purple flex items-center justify-center font-semibold text-dash-white-card">
                  {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-dash-dark-purple">{candidate.name}</h4>
                  <span className="text-[10px] text-dash-light-purple">Candidate</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  handleSignOut();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-dash-light-purple hover:bg-dash-primary-purple/20 transition-all duration-200"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 relative z-20 overflow-y-auto h-screen max-h-screen">
        {/* HEADER SECTION (Horizontal White Card style) */}
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
                    className={`border rounded-[24px] p-5.5 flex flex-col justify-between shadow-[0_4px_15px_rgba(87,82,170,0.02)] transition-all duration-300 group cursor-default min-h-[135px] ${stat.cardBg || 'bg-dash-white-card border-dash-border-gray/50 text-dash-dark-purple hover:bg-dash-soft-pink'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${stat.cardBg ? 'text-white/80' : 'text-dash-light-purple group-hover:text-dash-primary-purple'}`}>
                        {stat.label}
                      </span>
                      <div className={`p-2 rounded-xl transition-all duration-300 ${stat.colorClass} group-hover:scale-110`}>
                        <Icon size={18} />
                      </div>
                    </div>
                    <div>
                      <h3 className={`text-2xl font-plus-jakarta font-extrabold mt-2 tracking-tight ${stat.cardBg ? 'text-white' : 'text-dash-dark-purple'}`}>
                        {stat.value}
                      </h3>
                      <p className={`text-xs font-semibold mt-1 ${stat.cardBg ? 'text-white/90' : 'text-dash-light-purple'}`}>
                        {stat.subtext}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </section>

            {/* 4. DETAILS SECTION (JOURNEY & SKILLS MATRIX) */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
              {/* LEFT: ASSESSMENT JOURNEY */}
              <section className="xl:col-span-3 bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)] flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-4">
                  <h3 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple tracking-tight">
                    Assessment Journey
                  </h3>
                  <span className="text-xs font-bold text-dash-light-purple">4 Steps Total</span>
                </div>

                <div className="flex flex-col gap-4">
                  {journeySteps.map((step, idx) => (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      whileHover={{ x: 4 }}
                      className="p-4 rounded-2xl bg-dash-soft-pink border border-dash-border-gray/50 flex items-center justify-between gap-4 hover:bg-dash-border-gray transition-all duration-200"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="mt-1 flex items-center justify-center text-dash-primary-purple">
                          <CheckCircle2 size={18} className={step.status === 'Completed' ? 'text-dash-success-green' : 'text-dash-light-purple/60'} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-dash-dark-purple tracking-tight">
                            {step.title}
                          </h4>
                          <p className="text-xs text-dash-light-purple font-medium mt-0.5">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border ${step.statusColor}`}>
                          {step.status}
                        </span>
                        <ChevronRight size={16} className="text-dash-light-purple/40" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* RIGHT: SKILLS MATRIX */}
              <section className="xl:col-span-2 bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)] flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-4">
                  <h3 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple tracking-tight">
                    Resume Skill Match
                  </h3>
                  <span className="text-xs font-bold text-dash-light-purple">Core Strength Match</span>
                </div>

                {/* Progress bars list */}
                <div className="space-y-4">
                  {skills.map((skill) => (
                    <div key={skill.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-dash-dark-purple">{skill.name}</span>
                        <span className="text-dash-primary-purple">{skill.percent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-dash-light-blue-bg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.percent}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${skill.colorClass}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Strengths tags */}
                <div className="border-t border-dash-border-gray/25 pt-4">
                  <h4 className="text-xs font-bold text-dash-light-purple uppercase tracking-wider mb-3">
                    Your Strengths
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {strengths.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-xl bg-dash-soft-pink border border-dash-border-gray/50 text-xs font-bold text-dash-dark-purple hover:bg-dash-primary-purple hover:text-dash-white-card transition-all duration-200 cursor-default"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </>
        )}

        {activeTab === 'resume' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
            {/* Left Area: Drag & Drop Upload Zone */}
            <div className="lg:col-span-2 bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-8 shadow-[0_4px_20px_rgba(87,82,170,0.02)] min-h-[400px] flex flex-col items-center justify-center text-center">
              <div className="border-2 border-dashed border-dash-border-gray rounded-2xl p-12 w-full flex flex-col items-center justify-center gap-4 hover:bg-dash-soft-pink/30 transition-all duration-300">
                <div className="w-14 h-14 rounded-full bg-dash-primary-purple/10 flex items-center justify-center text-dash-primary-purple">
                  <UploadCloud size={28} />
                </div>
                <div>
                  <h3 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple">
                    Drag & drop your resume
                  </h3>
                  <p className="text-xs text-dash-light-purple font-medium mt-1">
                    Supports PDF and DOCX files up to 5MB
                  </p>
                </div>
                <button
                  onClick={() => showToast('File browser initiated')}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-dash-primary-purple text-dash-white-card font-bold text-sm hover:bg-dash-dark-purple transition-all duration-200 shadow-md cursor-pointer border-0"
                >
                  Browse Files
                </button>
              </div>
            </div>

            {/* Right Area: Stacked Cards */}
            <div className="flex flex-col gap-6">
              {/* Card 1: Supported Formats */}
              <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)] hover:bg-dash-soft-pink transition-all duration-300">
                <h4 className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple tracking-tight mb-4">
                  Supported Formats
                </h4>
                <div className="space-y-3">
                  {[
                    'PDF (.pdf)',
                    'Word Document (.docx)',
                    'Max size: 5MB'
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-xs font-semibold text-dash-dark-purple">
                      <CheckCircle2 size={16} className="text-dash-success-green" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: AI Extracts */}
              <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)] hover:bg-dash-soft-pink transition-all duration-300">
                <h4 className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple tracking-tight mb-4">
                  AI Extracts
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Skills', 'Languages', 'Projects', 'Experience',
                    'Education', 'Certifications', 'Tools', 'Technologies'
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-xl bg-dash-light-blue-bg border border-dash-border-gray/30 text-xs font-bold text-dash-dark-purple hover:bg-dash-primary-purple hover:text-dash-white-card transition-all duration-200 cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card 3: Information Card */}
              <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)] hover:bg-dash-soft-pink transition-all duration-300">
                <p className="text-xs text-dash-dark-purple font-medium leading-relaxed">
                  AI analyzes your resume and compares it against assessment categories to personalize your test experience.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'technical' && !activeAssignment && (
          <div className="w-full flex flex-col gap-6 animate-fade-in">
            {loadingAssignments ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-dash-primary-purple border-t-transparent animate-spin" />
                <p className="text-sm font-semibold text-dash-light-purple">Loading your assessments...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] shadow-sm max-w-2xl mx-auto w-full text-center p-8">
                <div className="w-16 h-16 rounded-full bg-dash-primary-purple/10 flex items-center justify-center text-dash-primary-purple mb-4">
                  <Terminal size={32} />
                </div>
                <h3 className="font-plus-jakarta font-extrabold text-xl text-dash-dark-purple">
                  No Assessments Assigned Yet
                </h3>
                <p className="text-sm text-dash-light-purple font-semibold mt-2 max-w-md">
                  Your recruiter will assign technical assessments for you to take here. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assignments.map((assignment) => {
                  const asm = assignment.assessment;
                  const isCompleted = assignment.status === 'COMPLETED';
                  const isInProgress = assignment.status === 'IN_PROGRESS';
                  const isAssigned = assignment.status === 'ASSIGNED';

                  return (
                    <div 
                      key={assignment.id} 
                      className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_25px_rgba(87,82,170,0.02)] flex flex-col justify-between gap-5 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase border bg-dash-soft-pink border-dash-border-gray/50 text-dash-dark-purple">
                          {asm.difficulty}
                        </span>
                        
                        {/* Status Badge */}
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                          isCompleted 
                            ? 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20'
                            : isInProgress
                              ? 'text-[#f97316] bg-[#f97316]/10 border-[#f97316]/20'
                              : 'text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/20'
                        }`}>
                          {assignment.status}
                        </span>
                      </div>

                      {/* Title & Subjects */}
                      <div>
                        <h4 className="font-plus-jakarta font-extrabold text-lg text-dash-dark-purple tracking-tight line-clamp-1">
                          {asm.name}
                        </h4>
                        <p className="text-xs font-bold text-dash-light-purple mt-1 font-mono">
                          Subjects: {asm.subjects ? (Array.isArray(asm.subjects) ? asm.subjects.join(', ') : asm.subjects) : ''}
                        </p>
                      </div>

                      {/* Detail Metrics Grid */}
                      <div className="grid grid-cols-2 gap-3 w-full bg-dash-light-blue-bg/40 border border-dash-border-gray/30 rounded-2xl p-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider">Duration</span>
                          <span className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple">{asm.duration}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider">Questions</span>
                          <span className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple">{asm.questionsCount} items</span>
                        </div>
                        <div className="flex flex-col gap-0.5 col-span-2 border-t border-dash-border-gray/25 pt-2 mt-1">
                          <span className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider">Assigned Date</span>
                          <span className="font-semibold text-xs text-dash-dark-purple">
                            {new Date(assignment.assignedAt).toLocaleString()}
                          </span>
                        </div>
                        {assignment.dueDate && (
                          <div className="flex flex-col gap-0.5 col-span-2 border-t border-dash-border-gray/25 pt-2">
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Due Date</span>
                            <span className="font-semibold text-xs text-red-600">
                              {new Date(assignment.dueDate).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {isCompleted ? (
                        <div className="w-full py-3 rounded-xl bg-dash-success-green/10 text-dash-success-green text-center font-bold text-sm border border-dash-success-green/20 flex items-center justify-center gap-2">
                          <CheckCircle2 size={16} />
                          <span>Completed</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartExam(assignment)}
                          className="w-full py-3 rounded-xl bg-dash-primary-purple text-dash-white-card font-bold text-sm hover:bg-dash-dark-purple transition-all duration-200 shadow-md cursor-pointer border-0 flex items-center justify-center gap-2"
                        >
                          <Play size={14} />
                          <span>{isInProgress ? 'Resume Assessment' : 'Start Assessment'}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'technical' && activeAssignment && examState.submitted && (
          <div className="flex justify-center items-center py-12 animate-fade-in w-full">
            <div className="w-full max-w-2xl bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-10 shadow-[0_4px_25px_rgba(87,82,170,0.02)] flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-full bg-dash-success-green/10 flex items-center justify-center text-dash-success-green mb-2 animate-bounce">
                <Check size={40} />
              </div>
              <div>
                <h3 className="font-plus-jakarta font-extrabold text-2xl text-dash-dark-purple tracking-tight">
                  Assessment Completed!
                </h3>
                <p className="text-sm text-dash-light-purple font-semibold mt-3 max-w-md mx-auto leading-relaxed">
                  Thank you for taking the assessment. Your response has been securely saved and submitted to your recruiter.
                </p>
              </div>
              <button
                onClick={() => setActiveAssignment(null)}
                className="px-8 py-3 rounded-xl bg-dash-primary-purple text-dash-white-card font-bold text-sm hover:bg-dash-dark-purple transition-all duration-200 shadow-md cursor-pointer border-0"
              >
                Return to Assessment List
              </button>
            </div>
          </div>
        )}

        {activeTab === 'technical' && activeAssignment && !examState.submitted && (() => {
          const questions = activeAssignment.assessment.questions || [];
          const currentIdx = examState.currentQuestionIndex;
          const question = questions[currentIdx];

          if (!question) {
            return (
              <div className="text-center py-20 bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-8 max-w-2xl mx-auto w-full">
                <p className="text-sm font-semibold text-red-500 mb-4">Error: No questions found in this assessment.</p>
                <button onClick={() => setActiveAssignment(null)} className="px-4 py-2 bg-dash-primary-purple text-white rounded-lg border-0 cursor-pointer">Go Back</button>
              </div>
            );
          }

          const hasPrev = currentIdx > 0;
          const hasNext = currentIdx < questions.length - 1;

          return (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start animate-fade-in w-full">
              
              {/* LEFT: Navigator & Progress Side */}
              <div className="xl:col-span-1 bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-5 shadow-[0_4px_20px_rgba(87,82,170,0.02)] flex flex-col gap-6">
                
                {/* Header Timer */}
                <div className="flex flex-col gap-1 text-center bg-dash-soft-pink border border-dash-border-gray/50 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider">Time Remaining</span>
                  <span className="font-plus-jakarta font-extrabold text-2xl text-red-600 font-mono tracking-wider">
                    {formatTime(examState.timeLeft)}
                  </span>
                </div>

                {/* Questions Grid Selector */}
                <div>
                  <h4 className="text-xs font-bold text-dash-dark-purple uppercase tracking-wider mb-3">Questions</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {questions.map((_, idx) => {
                      const isCurrent = idx === currentIdx;
                      const isAnswered = examState.answers[idx] !== undefined && examState.answers[idx] !== '';
                      return (
                        <button
                          key={idx}
                          onClick={() => setExamState(prev => ({ ...prev, currentQuestionIndex: idx }))}
                          className={`w-10 h-10 rounded-xl font-extrabold text-xs flex items-center justify-center cursor-pointer border transition-all duration-200 ${
                            isCurrent
                              ? 'bg-dash-primary-purple text-white border-dash-primary-purple shadow-sm'
                              : isAnswered
                                ? 'bg-dash-success-green/10 text-dash-success-green border-[#22c55e]/20 hover:bg-dash-success-green/20'
                                : 'bg-dash-soft-pink border border-dash-border-gray/50 text-dash-light-purple hover:bg-dash-border-gray'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="border-t border-dash-border-gray/25 pt-4 flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-bold text-dash-light-purple">
                    <span>Progress</span>
                    <span className="text-dash-dark-purple">
                      {Object.keys(examState.answers).length} / {questions.length} Done
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-dash-light-blue-bg overflow-hidden">
                    <div 
                      className="h-full bg-dash-primary-purple rounded-full transition-all duration-300"
                      style={{ width: `${(Object.keys(examState.answers).length / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Emergency Submit */}
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to submit your assessment? You cannot make any changes after submission.")) {
                      handleSubmitExam();
                    }
                  }}
                  className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>Submit Assessment</span>
                </button>
              </div>

              {/* RIGHT: Active Question Display */}
              <div className="xl:col-span-3 flex flex-col gap-6">
                
                {/* Question Info Header */}
                <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)] flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-3">
                    <span className="text-xs font-bold text-dash-light-purple uppercase tracking-wider">
                      Question {currentIdx + 1} of {questions.length}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-dash-soft-pink border border-dash-border-gray/50 text-dash-primary-purple">
                      {question.options && question.options.length > 0 ? 'MCQ' : 'SCENARIO'}
                    </span>
                  </div>

                  {/* Question Scenario if SCENARIO type */}
                  {question.scenario && (
                    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-5">
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Scenario Context:</h5>
                      <p className="text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-line">
                        {question.scenario}
                      </p>
                    </div>
                  )}

                  {/* Question text */}
                  <div>
                    <h3 className="font-plus-jakarta font-extrabold text-lg text-dash-dark-purple leading-relaxed">
                      {question.question}
                    </h3>
                  </div>

                  {/* Options (MCQ) or Textarea (Scenario) */}
                  {question.options && question.options.length > 0 ? (
                    <div className="flex flex-col gap-3 mt-2">
                      {question.options.map((option, optIdx) => {
                        const isSelected = examState.answers[currentIdx] === option;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => setExamState(prev => ({
                              ...prev,
                              answers: { ...prev.answers, [currentIdx]: option }
                            }))}
                            className={`w-full text-left p-4 rounded-2xl border font-semibold text-sm transition-all duration-200 cursor-pointer flex items-between items-center group ${
                              isSelected
                                ? 'bg-dash-primary-purple/10 border-dash-primary-purple text-dash-dark-purple shadow-sm'
                                : 'bg-dash-soft-pink border-dash-border-gray/50 text-dash-light-purple hover:bg-dash-border-gray hover:text-dash-dark-purple'
                            }`}
                          >
                            <span className="flex-1 pr-4">{option}</span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'border-dash-primary-purple bg-dash-primary-purple text-white'
                                : 'border-dash-border-gray/60 group-hover:border-dash-light-purple'
                            }`}>
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 mt-2">
                      {question.exampleInput && (
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700">
                          <div>
                            <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Example Input:</span>
                            <span className="block">{question.exampleInput}</span>
                          </div>
                          <div>
                            <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Example Output:</span>
                            <span className="block">{question.exampleOutput}</span>
                          </div>
                        </div>
                      )}
                      <textarea
                        value={examState.answers[currentIdx] || ''}
                        onChange={(e) => setExamState(prev => ({
                          ...prev,
                          answers: { ...prev.answers, [currentIdx]: e.target.value }
                        }))}
                        placeholder="Write your code or answer explanation here..."
                        rows={10}
                        className="w-full p-4 rounded-2xl border border-dash-border-gray/50 bg-[#fafafa] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-dash-primary-purple/40 focus:border-dash-primary-purple transition-all resize-y"
                      />
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between border-t border-dash-border-gray/25 pt-5 mt-3">
                    <button
                      onClick={() => setExamState(prev => ({ ...prev, currentQuestionIndex: currentIdx - 1 }))}
                      disabled={!hasPrev}
                      className={`px-5 py-2.5 rounded-xl border border-dash-border-gray/50 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        hasPrev 
                          ? 'bg-dash-soft-pink text-dash-dark-purple hover:bg-dash-border-gray'
                          : 'opacity-50 cursor-not-allowed text-dash-light-purple bg-transparent'
                      }`}
                    >
                      <ChevronLeft size={16} />
                      <span>Previous</span>
                    </button>

                    {hasNext ? (
                      <button
                        onClick={() => setExamState(prev => ({ ...prev, currentQuestionIndex: currentIdx + 1 }))}
                        className="px-6 py-2.5 rounded-xl bg-dash-primary-purple text-dash-white-card font-bold text-xs hover:bg-dash-dark-purple transition-all flex items-center gap-1.5 cursor-pointer border-0"
                      >
                        <span>Next</span>
                        <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to submit your assessment? You cannot make any changes after submission.")) {
                            handleSubmitExam();
                          }
                        }}
                        className="px-6 py-2.5 rounded-xl bg-[#22c55e] text-white font-bold text-xs hover:bg-[#16a34a] transition-all flex items-center gap-1.5 cursor-pointer border-0"
                      >
                        <CheckCircle2 size={16} />
                        <span>Finish & Submit</span>
                      </button>
                    )}
                  </div>

                </div>
              </div>

            </div>
          );
        })()}

        {activeTab === 'english' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start animate-fade-in">
            {/* LEFT: Question + Mic + AI Criteria (col-span-2) */}
            <div className="xl:col-span-2 flex flex-col gap-6">
              {/* Question Card */}
              <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)]">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-bold text-dash-light-purple uppercase tracking-wider">Question 1 of 5</span>
                  <span className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase border text-dash-primary-purple bg-dash-primary-purple/10 border-dash-primary-purple/20">AI Generated from Resume</span>
                </div>

                {/* Question Text Box */}
                <div className="bg-dash-soft-pink border border-dash-border-gray/50 rounded-2xl p-5 mb-6">
                  <p className="font-plus-jakarta font-bold text-base text-dash-dark-purple leading-relaxed">
                    "Can you briefly introduce yourself and walk me through your background?"
                  </p>
                </div>

                {/* Mic Button */}
                <div className="flex flex-col items-center gap-3 py-4">
                  <button
                    onClick={() => showToast('Recording started...')}
                    className="w-16 h-16 rounded-full bg-dash-primary-purple text-dash-white-card flex items-center justify-center hover:bg-dash-dark-purple transition-all duration-200 shadow-lg hover:scale-110 cursor-pointer border-0"
                  >
                    <Volume2 size={28} />
                  </button>
                  <span className="text-xs font-semibold text-dash-primary-purple">Click the mic to start recording</span>
                </div>
              </div>

              {/* AI Evaluation Criteria */}
              <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)]">
                <h4 className="text-xs font-bold text-dash-dark-purple uppercase tracking-wider mb-4">AI Evaluation Criteria</h4>
                <div className="grid grid-cols-5 gap-3">
                  {['Fluency', 'Pronunciation', 'Grammar', 'Vocabulary', 'Confidence'].map((criterion) => (
                    <div key={criterion} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-dash-soft-pink border border-dash-border-gray/50 hover:bg-dash-border-gray transition-all duration-200 cursor-default">
                      <Volume2 size={18} className="text-dash-primary-purple" />
                      <span className="text-[10px] font-bold text-dash-dark-purple text-center tracking-tight">{criterion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Question List + Progress */}
            <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)] flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-4">
                <h3 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple tracking-tight">Questions</h3>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { num: 1, text: 'Can you briefly introduce yourself and walk me through your background?', active: true, done: false },
                  { num: 2, text: 'You mentioned a Machine Learning project on your resume — can you explain what problem it solved?', active: false, done: false },
                  { num: 3, text: 'What challenges did you face during your internship and how did you overcome them?', active: false, done: false },
                  { num: 4, text: 'Why did you choose Python as your primary programming language for most of your projects?', active: false, done: false },
                  { num: 5, text: 'Where do you see yourself in the next 3 years in your career?', active: false, done: false }
                ].map((q) => (
                  <div
                    key={q.num}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${q.active
                      ? 'bg-dash-primary-purple/20 border-dash-primary-purple/40'
                      : 'bg-dash-soft-pink border border-dash-border-gray/50 hover:bg-dash-border-gray'
                      }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5 ${q.active ? 'bg-dash-primary-purple text-dash-white-card' : 'bg-dash-border-gray/40 text-dash-light-purple'
                      }`}>
                      {q.num}
                    </span>
                    <p className={`text-xs font-semibold leading-relaxed ${q.active ? 'text-dash-dark-purple' : 'text-dash-light-purple'
                      }`}>
                      {q.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Progress Footer */}
              <div className="border-t border-dash-border-gray/25 pt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-dash-light-purple uppercase tracking-wider">Completed</span>
                <span className="text-xs font-extrabold text-dash-dark-purple">0 / 5</span>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'dashboard' && activeTab !== 'resume' && activeTab !== 'technical' && activeTab !== 'english' && (
          <section className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-8 shadow-sm flex flex-col items-center justify-center min-h-[350px] text-center">
            <div className="p-4 rounded-full bg-dash-light-blue-bg text-dash-primary-purple mb-4">
              <Clock size={36} className="animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <h3 className="font-plus-jakarta font-extrabold text-lg text-dash-dark-purple">
              Page Under Construction
            </h3>
            <p className="text-sm text-dash-light-purple font-medium mt-2 max-w-sm">
              We are working hard to bring this view to your RecruitAI candidate portal workspace.
            </p>
          </section>
        )}
      </main>
    </div>
  );
};

export default CandidateDashboard;
