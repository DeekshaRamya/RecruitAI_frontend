import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, User } from 'lucide-react';

const RoleSwitcher = ({ role, setRole }) => {
  const isRecruiter = role === 'recruiter';

  return (
    <div 
      className={`flex rounded-xl p-1 relative mb-6 transition-all duration-500 ${
        isRecruiter 
          ? 'bg-[#f1f5f9] border border-[#e2e8f0]' 
          : 'bg-[#f5f3ff] border border-[#e0dbff]'
      }`}
    >
      {/* Recruiter Tab */}
      <button
        type="button"
        className={`flex-1 bg-transparent border-none font-inter text-[0.925rem] font-semibold py-2.5 px-4 cursor-pointer z-10 flex items-center justify-center gap-2 transition-colors duration-300 ${
          isRecruiter ? 'text-white' : 'text-candidate-text-sub'
        }`}
        onClick={() => setRole('recruiter')}
      >
        <Briefcase size={16} />
        <span>Recruiter</span>
      </button>

      {/* Candidate Tab */}
      <button
        type="button"
        className={`flex-1 bg-transparent border-none font-inter text-[0.925rem] font-semibold py-2.5 px-4 cursor-pointer z-10 flex items-center justify-center gap-2 transition-colors duration-300 ${
          !isRecruiter ? 'text-white' : 'text-recruiter-text-sub'
        }`}
        onClick={() => setRole('candidate')}
      >
        <User size={16} />
        <span>Candidate</span>
      </button>

      {/* Sliding Active Tab Background Indicator */}
      <motion.div
        className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg z-0 ${
          isRecruiter 
            ? 'bg-recruiter-primary shadow-[0_4px_12px_rgba(15,23,42,0.08)]' 
            : 'bg-candidate-primary shadow-[0_4px_12px_rgba(124,58,237,0.08)]'
        }`}
        initial={false}
        animate={{
          x: isRecruiter ? '0%' : '100%',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    </div>
  );
};

export default RoleSwitcher;
