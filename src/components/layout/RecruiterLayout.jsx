import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PlusCircle,
  FileCode2,
  ClipboardList,
  Users2,
  CheckCircle,
  Mic2,
  BarChart3,
  Archive,
  Menu,
  X,
  ChevronDown,
  LogOut,
  SlidersHorizontal,
  FolderOpen,
  UserCheck,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  History,
  UserCog,
  Settings,
  Cpu
} from 'lucide-react';
import logo from '../../assets/systech.jpg';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// shadcn UI Components
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const RECRUITER_TABS = {
  'dashboard': { label: 'Dashboard Overview', category: 'General', description: 'Real-time candidate pipeline metrics and recent activity' },
  'candidates': { label: 'Candidates Directory', category: 'Candidates', description: 'Add, edit, manage, and assign technical assessments to candidates' },
  'create-assessment': { label: 'Create Assessment', category: 'Assessments', description: 'Configure custom technical and domain-specific assessments' },
  'assessments': { label: 'Manage Assessments', category: 'Assessments', description: 'View, edit, manage, and assign created assessments' },
  'assign-assessment': { label: 'Assign Assessment', category: 'Assessments', description: 'Schedule and dispatch technical assessments to candidates and cohorts' },
  'groups': { label: 'Candidate Groups', category: 'Candidates', description: 'Organize candidate cohorts, departments, and bulk invitations' },
  'results': { label: 'Technical Evaluations', category: 'Analytics', description: 'Detailed coding performance, SQL execution, and test cases' },
  'english-results': { label: 'Communication Reports', category: 'Analytics', description: 'Language fluency, pronunciation, and spoken English evaluation' },
  'overall-results': { label: 'Hiring Decision Matrix', category: 'Analytics', description: 'Composite candidate scores and final hiring recommendations' },
  'ai-usage': { label: 'AI Usage & Tracking', category: 'Administration', description: 'Real-time audit log of AI model requests, latencies, and token consumption' },
  'users': { label: 'Internal Users & Roles', category: 'Administration', description: 'Manage staff access, team roles, and administrative permissions' },
  'login-history': { label: 'Login & Audit Logs', category: 'Administration', description: 'Security audit trail, IP addresses, and authentication history' }
};

const RecruiterLayout = ({
  activeTab: controlledActiveTab,
  setActiveTab: controlledSetActiveTab,
  onLogout,
  user,
  children
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract current tab from path or fallback to prop
  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '/recruiter';
  const currentPathTab = location.pathname.startsWith('/recruiter/')
    ? location.pathname.replace('/recruiter/', '').split('/')[0]
    : location.pathname.startsWith('/admin/')
    ? location.pathname.replace('/admin/', '').split('/')[0]
    : location.pathname === '/results'
    ? 'results'
    : 'dashboard';

  const activeTab = controlledActiveTab || currentPathTab || 'dashboard';

  const handleTabChange = (tabId) => {
    if (controlledSetActiveTab) {
      controlledSetActiveTab(tabId);
    } else {
      navigate(`${basePath}/${tabId}`);
    }
  };

  const handleLogoutAction = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('recruitai_access_token');
      localStorage.removeItem('recruitai_refresh_token');
      localStorage.removeItem('recruitai_user');
      localStorage.removeItem('current_candidate');
      navigate('/login', { replace: true });
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName = user?.full_name || user?.name || 'Recruiter Admin';
  const email = user?.email || 'recruiter@recruitai.com';
  const userRole = (user?.role || 'recruiter').toLowerCase();
  
  const initials = displayName
    ? displayName.trim().split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'RA';

  const avatarUrl = user?.photo || user?.avatar || user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=334155&color=f8fafc&bold=true`;

  const navSections = userRole === 'admin' ? [
    {
      title: 'Administration',
      items: [
        { id: 'dashboard', label: 'Admin Overview', icon: LayoutDashboard },
        { id: 'ai-usage', label: 'AI Usage & Tracking', icon: Cpu },
        { id: 'users', label: 'Internal Users & Roles', icon: UserCog },
        { id: 'login-history', label: 'Login & Audit Logs', icon: History },
      ]
    }
  ] : [
    {
      title: 'Platform',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'candidates', label: 'Candidates', icon: UserCheck },
        { id: 'groups', label: 'Candidate Groups', icon: Users2 },
      ]
    },
    {
      title: 'Assessments',
      items: [
        { id: 'create-assessment', label: 'Create Assessment', icon: PlusCircle },
        { id: 'assessments', label: 'Manage Assessments', icon: ClipboardList },
        { id: 'assign-assessment', label: 'Assign Assessment', icon: UserPlus },
      ]
    },
    {
      title: 'Evaluations & Analytics',
      items: [
        { id: 'results', label: 'Technical Results', icon: CheckCircle },
        { id: 'english-results', label: 'Communication Reports', icon: Mic2 },
        { id: 'overall-results', label: 'Decision Matrix', icon: BarChart3 },
      ]
    }
  ];

  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-recruiter-bg dark:bg-[#0b0f19] font-sans text-recruiter-text-main dark:text-slate-100 antialiased transition-colors duration-200">
        
        {/* ========================================================= */}
        {/* 1. CLEAN ENTERPRISE DESKTOP SIDEBAR                       */}
        {/* ========================================================= */}
        <aside className="hidden lg:flex flex-col w-[260px] h-screen shrink-0 bg-dash-sidebar-bg dark:bg-[#070b14] border-r border-slate-800/80 dark:border-slate-800 text-slate-200 z-30 select-none transition-colors duration-200">
          <div className="flex flex-col h-full justify-between p-4">
            
            {/* Top Workspace & Navigation */}
            <div className="flex flex-col min-h-0 flex-1 overflow-y-auto custom-scrollbar pr-1">
              
              {/* Brand Header */}
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <img
                  src={logo}
                  alt="Company Logo"
                  className="w-8 h-8 rounded-lg object-cover border border-slate-700/80 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm tracking-tight text-white leading-none truncate">
                      RecruitAI
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal truncate block mt-1">
                    {userRole === 'admin' ? 'Admin Control Center' : 'Recruitment Portal'}
                  </span>
                </div>
              </div>

              <Separator className="bg-slate-800/70 mb-3" />

              {/* Grouped Nav Items */}
              <nav className="space-y-4">
                {navSections.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <div className="px-2.5 pb-1 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                      {section.title}
                    </div>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer border-none text-left ${
                              isActive
                                ? 'bg-slate-800 text-white font-medium shadow-xs'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-normal'
                            }`}
                          >
                            <Icon size={16} strokeWidth={1.75} className={`shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                            <span className="truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            {/* Bottom Profile Footer */}
            <div className="pt-3 border-t border-slate-800/80 dark:border-slate-800 mt-auto">
              <div className="p-2.5 rounded-xl bg-slate-900/80 dark:bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="w-8 h-8 rounded-lg border border-slate-700 shrink-0">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-slate-800 text-slate-200 font-medium text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium text-slate-200 truncate leading-tight" title={displayName}>
                        {displayName}
                      </p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider shrink-0 ${
                        userRole === 'admin' 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {userRole === 'admin' ? 'Admin' : 'Recruiter'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5" title={email}>
                      {email}
                    </p>
                  </div>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLogoutAction}
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent shrink-0"
                      aria-label="Sign out"
                    >
                      <LogOut size={15} strokeWidth={1.75} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-900 text-white text-xs border-slate-800">
                    Sign Out
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

          </div>
        </aside>

        {/* ========================================================= */}
        {/* 2. MOBILE DRAWER NAVIGATION                               */}
        {/* ========================================================= */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/80 z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed top-0 bottom-0 left-0 w-[270px] p-4 z-50 lg:hidden flex flex-col bg-[#0F141C] text-slate-200 border-r border-slate-800 overflow-hidden shadow-xl"
            >
              <div className="flex flex-col h-full justify-between">
                <div className="flex flex-col overflow-y-auto">
                  <div className="flex items-center justify-between mb-3 px-2">
                    <div className="flex items-center gap-2.5">
                      <img src={logo} alt="Logo" className="w-7 h-7 rounded-md object-cover border border-slate-700" />
                      <span className="font-semibold text-sm text-white">RecruitAI</span>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 border-none bg-transparent cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <Separator className="bg-slate-800 mb-3" />

                  <nav className="space-y-4">
                    {navSections.map((section) => (
                      <div key={section.title} className="space-y-1">
                        <div className="px-2 pb-1 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                          {section.title}
                        </div>
                        <div className="space-y-0.5">
                          {section.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  handleTabChange(item.id);
                                  setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer border-none text-left ${
                                  isActive
                                    ? 'bg-slate-800 text-white font-medium'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-normal'
                                }`}
                              >
                                <Icon size={16} strokeWidth={1.75} className={`shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </nav>
                </div>

                <div className="pt-3 border-t border-slate-800 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSidebarOpen(false);
                      handleLogoutAction();
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg text-xs font-medium border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ========================================================= */}
        {/* 3. MAIN WORKSPACE WITH CLEAN NAVBAR                       */}
        {/* ========================================================= */}
        <main className="flex-1 min-w-0 flex flex-col relative z-20 overflow-y-auto h-screen max-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
          
          {/* Top Navbar */}
          <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 shrink-0 gap-4 transition-colors">
            
            {/* Left: Mobile Toggle & Clean Breadcrumb Trail */}
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden rounded-lg border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 cursor-pointer h-8 w-8"
                aria-label="Open Navigation Menu"
              >
                <Menu size={16} />
              </Button>

              <div className="flex flex-col min-w-0">
                <Breadcrumb>
                  <BreadcrumbList className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        onClick={() => handleTabChange('dashboard')}
                        className="cursor-pointer text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                      >
                        {userRole === 'admin' ? 'Admin Portal' : 'Recruiter Portal'}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-slate-400 dark:text-slate-600" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-slate-900 dark:text-slate-100 font-semibold truncate">
                        {RECRUITER_TABS[activeTab]?.label || 'Dashboard'}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block mt-0.5">
                  {RECRUITER_TABS[activeTab]?.description || 'Recruitment operations'}
                </p>
              </div>
            </div>

            {/* Right: Theme Switcher */}
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />
            </div>
          </header>

          {/* Tab Content Container */}
          <div className="flex-1 p-4 sm:p-6">
            {children || <Outlet />}
          </div>

        </main>
      </div>
    </TooltipProvider>
  );
};

export default RecruiterLayout;
