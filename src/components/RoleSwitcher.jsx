import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, User } from 'lucide-react';

const RoleSwitcher = ({ role, setRole }) => {
  const isRecruiter = role === 'recruiter' || role === 'admin';

  return (
    <div 
      className="flex rounded-xl p-1 relative mb-6 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 transition-all duration-300"
    >
      {/* Recruiter / Admin Tab */}
      <button
        type="button"
        className={`flex-1 bg-transparent border-none font-inter text-[0.925rem] font-semibold py-2.5 px-4 cursor-pointer z-10 flex items-center justify-center gap-2 transition-colors duration-300 ${
          isRecruiter ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
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
          !isRecruiter ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
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
            ? 'bg-slate-900 dark:bg-indigo-600 shadow-[0_4px_12px_rgba(15,23,42,0.12)]' 
            : 'bg-candidate-primary shadow-[0_4px_12px_rgba(124,58,237,0.12)]'
        }`}
        initial={false}
        animate={{
          x: isRecruiter ? '0%' : '100%',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      />
    </div>
  );
};

export default RoleSwitcher;
