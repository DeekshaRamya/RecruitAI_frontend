import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
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
  UploadCloud,
  Loader2
} from 'lucide-react';
import api from '../api';

const CandidateDashboard = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toastMessage, setToastMessage] = useState('');

  const [candidate, setCandidate] = useState(() => {
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

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const uploadFile = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf') {
      setUploadError('Only PDF files are supported.');
      showToast('Invalid file format');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB limit.');
      showToast('File too large');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/candidate/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      const updatedUser = response.data;
      
      const updatedCandidate = {
        ...candidate,
        resume: updatedUser.resume_score || 85,
        name: updatedUser.full_name || updatedUser.name || candidate.name,
        python: updatedUser.python_score || 0,
        sql: updatedUser.sql_score || 0,
        aptitude: updatedUser.aptitude_score || 0,
        english: updatedUser.english_score || 0,
        final: Math.round(
          ((updatedUser.python_score || 0) +
           (updatedUser.sql_score || 0) +
           (updatedUser.aptitude_score || 0) +
           (updatedUser.english_score || 0)) / 4
        ) || 80,
        resume_filename: updatedUser.resume_filename || file.name,
        resume_analysis: updatedUser.resume_analysis || [
          "Demonstrates solid background in core development.",
          "Demonstrates practical hands-on experience in SQL database schema design.",
          "Clear project organization and excellent written communication."
        ],
        status: 'Completed'
      };

      setCandidate(updatedCandidate);
      localStorage.setItem('current_candidate', JSON.stringify(updatedCandidate));

      const storedCandidates = localStorage.getItem('recruitai_candidates');
      if (storedCandidates) {
        try {
          const list = JSON.parse(storedCandidates);
          const idx = list.findIndex(c => c.email.toLowerCase() === candidate.email.toLowerCase());
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...updatedCandidate };
            localStorage.setItem('recruitai_candidates', JSON.stringify(list));
          }
        } catch (e) {
          console.error("Error updating candidates list:", e);
        }
      }

      showToast('Resume uploaded and analyzed successfully!');
    } catch (err) {
      console.error("Upload error:", err);
      let errMsg = 'Failed to upload resume. Please try again.';
      if (err.response && err.response.data && err.response.data.detail) {
        errMsg = err.response.data.detail;
      }
      setUploadError(errMsg);
      showToast('Upload failed');
    } finally {
      setUploading(false);
    }
  };

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
      subtext: candidate.resume > 0 ? (candidate.resume_filename || `${candidate.name.replace(/\s+/g, '_')}_CV.pdf`) : 'No file uploaded',
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
                    if (item.id !== 'dashboard' && item.id !== 'resume') {
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
                      if (item.id !== 'dashboard' && item.id !== 'resume') {
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
            {/* Left Area: Drag & Drop Upload Zone or AI Analysis Results */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {(!candidate.resume || candidate.resume === 0 || uploading) ? (
                <div 
                  className={`bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-8 shadow-[0_4px_20px_rgba(87,82,170,0.02)] min-h-[400px] flex flex-col items-center justify-center text-center transition-all duration-300 ${dragOver ? 'bg-dash-primary-purple/5 border-dash-primary-purple border-2' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="hidden"
                  />
                  
                  {uploading ? (
                    <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                      <Loader2 className="animate-spin text-dash-primary-purple" size={48} />
                      <div>
                        <h3 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple">
                          Analyzing Resume...
                        </h3>
                        <p className="text-xs text-dash-light-purple font-medium mt-1">
                          Our AI is extracting skills and matching experience.
                        </p>
                      </div>
                      <div className="w-full bg-dash-light-blue-bg h-2 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-dash-primary-purple h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-dash-primary-purple">{uploadProgress}%</span>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-dash-border-gray rounded-2xl p-12 w-full flex flex-col items-center justify-center gap-4 hover:bg-dash-soft-pink/30 transition-all duration-300">
                      <div className="w-14 h-14 rounded-full bg-dash-primary-purple/10 flex items-center justify-center text-dash-primary-purple">
                        <UploadCloud size={28} />
                      </div>
                      <div>
                        <h3 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple">
                          Drag & drop your resume
                        </h3>
                        <p className="text-xs text-dash-light-purple font-medium mt-1">
                          Supports PDF files up to 5MB
                        </p>
                      </div>
                      {uploadError && (
                        <p className="text-xs text-red-500 font-semibold bg-red-50 border border-red-100 rounded-xl px-4 py-2 mt-1">
                          {uploadError}
                        </p>
                      )}
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="mt-2 px-6 py-2.5 rounded-xl bg-dash-primary-purple text-dash-white-card font-bold text-sm hover:bg-dash-dark-purple transition-all duration-200 shadow-md cursor-pointer border-0"
                      >
                        Browse Files
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Premium AI Analysis Dashboard Card */
                <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6.5 shadow-[0_4px_20px_rgba(87,82,170,0.02)] flex flex-col gap-6 animate-fade-in">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-dash-border-gray/25 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-dash-success-green/10 flex items-center justify-center text-dash-success-green">
                        <CheckCircle2 size={22} />
                      </div>
                      <div>
                        <h3 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple">
                          Resume Analyzed
                        </h3>
                        <p className="text-xs text-dash-light-purple font-semibold mt-0.5">
                          File: <span className="text-dash-primary-purple font-bold">{candidate.resume_filename || `${candidate.name.replace(/\s+/g, '_')}_CV.pdf`}</span>
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        // Reset resume to allow upload again
                        setCandidate(prev => ({ ...prev, resume: 0 }));
                      }}
                      className="px-4 py-2 rounded-xl border border-dash-border-gray hover:bg-dash-soft-pink text-xs font-bold text-dash-dark-purple transition-all duration-200 cursor-pointer bg-transparent"
                    >
                      Upload New Resume
                    </button>
                  </div>

                  {/* Score & Profile Summary Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-dash-soft-pink/40 border border-dash-border-gray/50 rounded-[20px] p-5">
                    {/* SVG Circular Progress Gauge */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-dash-border-gray/30"
                            fill="transparent"
                          />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-dash-primary-purple"
                            strokeDasharray="264"
                            initial={{ strokeDashoffset: 264 }}
                            animate={{ strokeDashoffset: 264 - (264 * candidate.resume) / 100 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            fill="transparent"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="font-plus-jakarta font-extrabold text-2xl text-dash-dark-purple">{candidate.resume}%</span>
                          <span className="text-[9px] font-bold text-dash-light-purple uppercase tracking-wider">Score</span>
                        </div>
                      </div>
                      <h4 className="font-outfit font-bold text-xs text-dash-dark-purple mt-2.5">AI Resume Grade</h4>
                    </div>

                    {/* Skill profile and overview */}
                    <div className="md:col-span-2 flex flex-col gap-3">
                      <h4 className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple">
                        Profile Overview
                      </h4>
                      <p className="text-xs text-dash-light-purple font-medium leading-relaxed">
                        Our AI models evaluated your credentials against core role competencies. Your skill matching metrics have been updated below. You are now prepared to complete the remaining assessment steps.
                      </p>
                      
                      {/* Dashboard updated alert */}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dash-primary-purple/10 border border-dash-primary-purple/20 text-[11px] font-bold text-dash-primary-purple animate-pulse">
                        <Sparkles size={14} className="shrink-0" />
                        <span>Core skill metrics have been synchronized with your profile.</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Feedback & Analysis Bullet Points */}
                  <div className="flex flex-col gap-4">
                    <h4 className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple">
                      AI Strengths & Observations
                    </h4>
                    
                    <div className="flex flex-col gap-3">
                      {(candidate.resume_analysis || [
                        "Demonstrates solid background in core Python development.",
                        "Demonstrates practical hands-on experience in SQL database schema design.",
                        "Clear project organization and excellent written communication."
                      ]).map((point, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.15 }}
                          className="p-3.5 rounded-xl bg-dash-soft-pink border-l-4 border-l-dash-primary-purple border border-dash-border-gray/40 flex items-start gap-3 hover:bg-dash-border-gray/30 transition-all duration-200"
                        >
                          <span className="w-5 h-5 rounded-full bg-dash-primary-purple/10 flex items-center justify-center text-[10px] font-extrabold text-dash-primary-purple shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-xs font-semibold text-dash-dark-purple leading-relaxed">
                            {point}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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

        {activeTab === 'technical' && (
          <div className="flex justify-center items-center py-6 animate-fade-in w-full">
            <div className="w-full max-w-2xl bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-8 shadow-[0_4px_25px_rgba(87,82,170,0.02)] flex flex-col items-center text-center gap-6">
              {/* Header Icon */}
              <div className="w-16 h-16 rounded-full bg-dash-primary-purple/10 flex items-center justify-center text-dash-primary-purple">
                <Terminal size={32} />
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="font-plus-jakarta font-extrabold text-xl text-dash-dark-purple tracking-tight">
                  Ready to Begin?
                </h3>
                <p className="text-sm text-dash-light-purple font-semibold mt-2 max-w-md mx-auto leading-relaxed">
                  9 AI-generated questions across Python, SQL, and Aptitude. You have 60 minutes to complete the test.
                </p>
              </div>

              {/* Three Metrics Grid */}
              <div className="grid grid-cols-3 gap-4 w-full">
                {[
                  { value: '9', label: 'Questions' },
                  { value: '60 min', label: 'Duration' },
                  { value: '3', label: 'Subjects' }
                ].map((item) => (
                  <div key={item.label} className="bg-dash-soft-pink border border-dash-border-gray/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 hover:bg-dash-border-gray transition-all">
                    <span className="font-plus-jakarta font-extrabold text-lg text-dash-dark-purple">{item.value}</span>
                    <span className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Warning Instructions Box */}
              <div className="w-full bg-dash-soft-pink/50 border border-dash-accent-brown/40 rounded-2xl p-5 text-left flex flex-col gap-2">
                <h4 className="text-xs font-bold text-dash-accent-brown uppercase tracking-wider flex items-center gap-1.5">
                  Before you start:
                </h4>
                <ul className="text-xs font-semibold text-dash-accent-brown/90 space-y-1.5 list-disc list-inside">
                  <li>Do not refresh or navigate away during the test.</li>
                  <li>All answers are saved automatically.</li>
                  <li>Submit when done — you cannot re-attempt.</li>
                </ul>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => showToast('Technical Assessment started')}
                className="w-full py-3.5 rounded-xl bg-dash-primary-purple text-dash-white-card font-bold text-sm hover:bg-dash-dark-purple transition-all duration-200 shadow-md cursor-pointer border-0 flex items-center justify-center gap-2"
              >
                <Terminal size={16} />
                <span>Start Assessment</span>
              </button>
            </div>
          </div>
        )}

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
