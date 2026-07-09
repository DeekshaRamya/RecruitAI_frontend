import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LoginCard from '../components/LoginCard';
import RecruiterAnimation from '../components/RecruiterAnimation';
import CandidateAnimation from '../components/CandidateAnimation';
import RecruiterDashboard from './RecruiterDashboard';
import CandidateDashboard from './CandidateDashboard';
import logo from '../assets/logo.svg';

const Login = () => {
  const [role, setRole] = useState('recruiter'); // 'recruiter' or 'candidate'
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isRecruiter = role === 'recruiter';

  if (isLoggedIn) {
    if (isRecruiter) {
      return <RecruiterDashboard onLogout={() => setIsLoggedIn(false)} />;
    } else {
      return <CandidateDashboard onLogout={() => setIsLoggedIn(false)} />;
    }
  }

  return (
    <div
      className={`flex h-screen max-h-screen w-screen relative overflow-hidden transition-all duration-500 ease-in-out select-none ${isRecruiter
          ? 'recruiter-bg-mesh text-recruiter-text-main'
          : 'candidate-bg-mesh text-candidate-text-main'
        }`}
    >
      {/* Network / Grid Background Decorator */}
      <div
        className={`absolute top-0 left-0 w-full h-full pointer-events-none z-10 transition-all duration-500 ${isRecruiter ? 'recruiter-grid-overlay' : 'candidate-grid-overlay'
          }`}
      />

      {/* LEFT SECTION: Brand and Role Animations (Hidden on mobile/tablet) */}
      <div
        className={`hidden md:flex flex-col justify-between p-10 relative z-20 overflow-hidden h-screen max-h-screen transition-all duration-500 ease-in-out shrink-0 grow-0 ${isRecruiter ? 'basis-[65%]' : 'basis-3/5'
          }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 max-w-[220px]">
          <img
            src={logo}
            alt="RecruitAI Logo"
            className={`h-12 w-auto transition-colors duration-500 ${isRecruiter ? 'text-recruiter-text-main' : 'text-candidate-text-main'
              }`}
          />
        </div>

        {/* Dynamic Showcase Illustration */}
        <div className="flex-1 flex items-center justify-center relative my-6 w-full min-h-[580px]">
          <AnimatePresence mode="wait">
            {isRecruiter ? (
              <RecruiterAnimation key="recruiter" />
            ) : (
              <CandidateAnimation key="candidate" />
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Footer */}
        <div
          className={`flex justify-between items-center text-[0.85rem] transition-colors duration-500 ${isRecruiter ? 'text-recruiter-text-sub' : 'text-candidate-text-muted'
            }`}
        >
          <span>&copy; {new Date().getFullYear()} RecruitAI Corp. All rights reserved.</span>
          <div className="flex gap-6">
            <a
              href="#terms"
              className={`no-underline font-medium transition-colors duration-200 ${isRecruiter ? 'text-recruiter-text-sub hover:text-recruiter-accent' : 'text-candidate-text-sub hover:text-candidate-accent'
                }`}
            >
              Terms of Service
            </a>
            <a
              href="#privacy"
              className={`no-underline font-medium transition-colors duration-200 ${isRecruiter ? 'text-recruiter-text-sub hover:text-recruiter-accent' : 'text-candidate-text-sub hover:text-candidate-accent'
                }`}
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: Center Aligned Login Form */}
      <div
        className={`flex items-center justify-center p-6 md:p-10 relative z-20 h-screen max-h-screen w-full transition-all duration-500 ease-in-out shrink-0 grow-0 ${isRecruiter
            ? 'md:basis-[35%] bg-white border-l border-recruiter-card-border shadow-[-10px_0_30px_rgba(15,23,42,0.02)] max-md:bg-recruiter-bg'
            : 'md:basis-2/5 bg-white border-l border-candidate-card-border shadow-[-10px_0_30px_rgba(124,58,237,0.01)] max-md:bg-candidate-bg'
          }`}
      >
        <LoginCard role={role} setRole={setRole} onLogin={() => setIsLoggedIn(true)} />
      </div>
    </div>
  );
};

export default Login;
