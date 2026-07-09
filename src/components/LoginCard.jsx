import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Check, User, Phone } from 'lucide-react';
import RoleSwitcher from './RoleSwitcher';
import InputField from './InputField';
import logo from '../assets/logo.svg';

const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h11v11H0z" fill="#F25022" />
    <path d="M12 0h11v11H12z" fill="#7FBA00" />
    <path d="M0 12h11v11H0z" fill="#00A4EF" />
    <path d="M12 12h11v11H12z" fill="#FFB900" />
  </svg>
);

const LoginCard = ({ role, setRole }) => {
  // Navigation mode for Candidate UI ('login' or 'register')
  const [candidateMode, setCandidateMode] = useState('login');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Candidate Registration states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const isRecruiter = role === 'recruiter';

  // Reset candidate mode when switching roles
  useEffect(() => {
    setCandidateMode('login');
  }, [role]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log(`Signing in as ${role}:`, { email, password, rememberMe });
    alert(`Signing in as ${role === 'recruiter' ? 'Recruiter' : 'Candidate'} with email: ${email}`);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("You must agree to the Terms & Conditions.");
      return;
    }
    console.log("Candidate Registering:", {
      fullName,
      email,
      phone,
      password,
      agreeTerms
    });
    alert(`Successfully registered account for ${fullName}! Proceeding to Login.`);
    setCandidateMode('login');
  };

  const handleMicrosoftLogin = () => {
    console.log('Microsoft login clicked');
    alert('Microsoft Entra ID corporate login initiated.');
  };

  // Dynamic Header contents
  const getHeaderContent = () => {
    if (isRecruiter) {
      return {
        title: 'Recruiter Portal',
        subtitle: 'Secure access to RecruitAI recruiter management and assessment dashboard.'
      };
    }
    if (candidateMode === 'login') {
      return {
        title: 'Welcome Back',
        subtitle: 'Enter your credentials to access your candidate dashboard.'
      };
    }
    return {
      title: 'Join RecruitAI',
      subtitle: 'Create your candidate profile to begin assessment journeys.'
    };
  };

  const headerContent = getHeaderContent();

  return (
    <motion.div
      className={`w-full max-w-[460px] relative z-[50] transition-all duration-500 ${
        isRecruiter 
          ? 'bg-recruiter-card-bg border border-recruiter-card-border rounded-2xl p-8 md:p-10 shadow-[0_10px_40px_rgba(15,23,42,0.04)]' 
          : 'bg-candidate-card-bg border border-candidate-card-border rounded-2xl p-8 md:p-9 shadow-[0_10px_40px_rgba(124,58,237,0.04)]'
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Mobile Logo: displayed only on tablet/mobile screens */}
      <div className="max-md:flex hidden justify-center mb-8">
        <img src={logo} alt="RecruitAI Logo" className="h-10" />
      </div>

      {/* Role Switcher */}
      <RoleSwitcher role={role} setRole={setRole} />

      {/* Dynamic Title and Subtitle with Framer Motion AnimatePresence */}
      <div className="text-center mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${role}-${candidateMode}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <h2 
              className={`font-plus-jakarta font-bold tracking-tight transition-colors duration-500 text-left ${
                isRecruiter 
                  ? 'text-[2.1rem] text-recruiter-text-main mb-3' 
                  : 'text-2xl text-candidate-text-main mb-2'
              }`}
            >
              {headerContent.title}
            </h2>
            <p 
              className={`text-[0.925rem] leading-relaxed transition-colors duration-500 text-left ${
                isRecruiter ? 'text-recruiter-text-sub' : 'text-candidate-text-muted'
              }`}
            >
              {headerContent.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dynamic Auth Forms based on Role selection */}
      <AnimatePresence mode="wait">
        {isRecruiter ? (
          <motion.div
            key="recruiter-auth"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-5 mt-2"
          >
            {/* Single primary corporate button */}
            <motion.button
              type="button"
              className="w-full border-none font-inter text-[0.95rem] font-semibold text-white cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] bg-recruiter-primary rounded-xl p-4 border border-recruiter-primary shadow-[0_4px_14px_rgba(15,23,42,0.08)] hover:bg-recruiter-primary-hover hover:border-recruiter-primary-hover hover:shadow-[0_6px_18px_rgba(15,23,42,0.15)]"
              onClick={handleMicrosoftLogin}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MicrosoftIcon />
              <span>Continue with Microsoft</span>
            </motion.button>

            <div className="text-left text-[0.8rem] text-recruiter-text-sub leading-[1.4] mt-2">
              Sign in securely using your organization’s Microsoft account.
            </div>
          </motion.div>
        ) : candidateMode === 'login' ? (
          <motion.div
            key="candidate-login"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {/* Candidate Login Form */}
            <form onSubmit={handleLoginSubmit}>
              <div className="flex flex-col gap-4 mb-5">
                <InputField
                  label="Email Address"
                  type="email"
                  id="email"
                  name="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={Mail}
                  role={role}
                />

                <InputField
                  label="Password"
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={Lock}
                  role={role}
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex justify-between items-center mb-5 text-[0.85rem]">
                <label className="flex items-center gap-2 cursor-pointer select-none text-candidate-text-sub">
                  <input
                    type="checkbox"
                    className="absolute opacity-0 w-0 h-0"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <div 
                    className={`relative w-4 h-4 rounded flex items-center justify-center transition-all duration-200 ${
                      rememberMe 
                        ? 'bg-candidate-primary border-transparent' 
                        : 'bg-input-bg-light border border-input-border-light'
                    }`}
                  >
                    <Check 
                      className={`text-white transition-all duration-200 ${rememberMe ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.6]'}`} 
                      size={12} 
                      strokeWidth={3} 
                    />
                  </div>
                  <span>Remember Me</span>
                </label>
                <a 
                  href="#forgot" 
                  className="no-underline font-medium transition-colors duration-200 text-candidate-text-sub hover:text-candidate-accent"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Submit button with icon */}
              <motion.button
                type="submit"
                className="w-full border-none font-inter text-[0.95rem] font-semibold text-white cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] bg-candidate-primary rounded-xl p-3.5 shadow-[0_4px_14px_rgba(124,58,237,0.08)] hover:bg-candidate-primary-hover hover:shadow-[0_6px_18px_rgba(124,58,237,0.18)]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center text-center my-5 text-recruiter-text-muted text-[0.8rem] tracking-[1px]">
              <div className="flex-1 border-b border-[#e2e8f0] mr-3" />
              <span>OR</span>
              <div className="flex-1 border-b border-[#e2e8f0] ml-3" />
            </div>

            {/* Registration redirect */}
            <div className="text-center text-[0.875rem] text-candidate-text-muted">
              <span>Don't have an account?</span>
              <span 
                className="font-semibold no-underline ml-1 transition-colors duration-200 cursor-pointer text-candidate-primary hover:text-candidate-primary-hover" 
                onClick={() => setCandidateMode('register')}
              >
                Register
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="candidate-register"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {/* Candidate Registration Form */}
            <form onSubmit={handleRegisterSubmit}>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4 max-h-[48vh] overflow-y-auto pr-1 custom-scrollbar max-sm:grid-cols-1">
                {/* Full Name */}
                <InputField
                  label="Full Name"
                  type="text"
                  id="reg-name"
                  name="fullName"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  icon={User}
                  role={role}
                />

                {/* Phone Number */}
                <InputField
                  label="Phone Number"
                  type="tel"
                  id="reg-phone"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={Phone}
                  role={role}
                />

                {/* Email Address */}
                <InputField
                  label="Email Address"
                  type="email"
                  id="reg-email"
                  name="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={Mail}
                  role={role}
                />

                {/* Password */}
                <InputField
                  label="Password"
                  type="password"
                  id="reg-password"
                  name="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={Lock}
                  role={role}
                />
              </div>

              {/* Terms Checkbox */}
              <div className="flex justify-between items-center mb-4 text-[0.85rem] mt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none text-candidate-text-sub text-[0.8rem]">
                  <input
                    type="checkbox"
                    className="absolute opacity-0 w-0 h-0"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <div 
                    className={`relative w-4 h-4 rounded flex items-center justify-center transition-all duration-200 ${
                      agreeTerms 
                        ? 'bg-candidate-primary border-transparent' 
                        : 'bg-input-bg-light border border-input-border-light'
                    }`}
                  >
                    <Check 
                      className={`text-white transition-all duration-200 ${agreeTerms ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.6]'}`} 
                      size={12} 
                      strokeWidth={3} 
                    />
                  </div>
                  <span>I agree to the Terms & Conditions</span>
                </label>
              </div>

              {/* Create Account Action */}
              <motion.button
                type="submit"
                className="w-full border-none font-inter text-[0.95rem] font-semibold text-white cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] bg-candidate-primary rounded-xl p-3 shadow-[0_4px_14px_rgba(124,58,237,0.08)] hover:bg-candidate-primary-hover hover:shadow-[0_6px_18px_rgba(124,58,237,0.18)]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Create Account</span>
              </motion.button>
            </form>

            {/* Login redirect link */}
            <div className="text-center text-[0.875rem] text-candidate-text-muted mt-4">
              <span>Already have an account?</span>
              <span 
                className="font-semibold no-underline ml-1 transition-colors duration-200 cursor-pointer text-candidate-primary hover:text-candidate-primary-hover" 
                onClick={() => setCandidateMode('login')}
              >
                Sign In
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LoginCard;
