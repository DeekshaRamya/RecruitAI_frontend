import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Clock, ArrowRight, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import ActionButton from '../ActionButton';

export const EnglishBreakModal = ({
  isOpen,
  breakEndTime,
  onSelectBreak,
  onBreakComplete,
  onSkipBreak
}) => {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalBreakSeconds, setTotalBreakSeconds] = useState(300);

  // Compute countdown against target timestamp (persists across refresh)
  useEffect(() => {
    if (!breakEndTime) {
      setSecondsLeft(0);
      return;
    }

    const target = new Date(breakEndTime).getTime();
    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      setSecondsLeft(diff);

      if (diff <= 0) {
        onBreakComplete();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [breakEndTime, onBreakComplete]);

  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalBreakSeconds > 0 
    ? Math.min(100, Math.max(0, ((totalBreakSeconds - secondsLeft) / totalBreakSeconds) * 100))
    : 100;

  // Render active countdown screen if breakEndTime is set and time remains
  if (breakEndTime && secondsLeft > 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl text-center relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-6 shadow-inner border border-indigo-100 dark:border-indigo-800/40">
            <Coffee className="w-8 h-8 animate-bounce" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-3">
            <Clock className="w-3.5 h-3.5" /> Break Time
          </span>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-outfit">
            Take a Short Breath
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto leading-relaxed">
            Your Technical Assessment has been submitted. Relax, hydrate, and prepare for your AI English Interview.
          </p>

          {/* Countdown Display */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
            <div className="text-5xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider mb-2">
              {formatTime(secondsLeft)}
            </div>
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              remaining
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onSkipBreak}
              className="w-full py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all duration-200 shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start English Assessment Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-[11px] text-slate-400 mt-4">
            Interview will automatically begin when the timer reaches 00:00.
          </p>
        </motion.div>
      </div>
    );
  }

  // Break Selection Modal
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-800/40">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full mb-2">
            Technical Assessment Completed
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">
            English Assessment
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Would you like to take a break before starting your English Assessment?
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {/* 5 Minutes */}
          <button
            onClick={() => {
              setTotalBreakSeconds(300);
              onSelectBreak(5);
            }}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">5 Minutes Break</div>
                <div className="text-xs text-slate-500">Quick rest to refresh before speaking</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </button>

          {/* 10 Minutes */}
          <button
            onClick={() => {
              setTotalBreakSeconds(600);
              onSelectBreak(10);
            }}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">10 Minutes Break</div>
                <div className="text-xs text-slate-500">Longer break to prepare and relax</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Skip Break / Start Now */}
          <button
            onClick={onSkipBreak}
            className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40 transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-indigo-950 dark:text-indigo-200">Skip Break / Start Now</div>
                <div className="text-xs text-indigo-600/80 dark:text-indigo-400">Jump directly into English Assessment</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        <p className="text-xs text-center text-slate-400">
          The English Assessment consists of a 30-minute personalized AI interview.
        </p>
      </motion.div>
    </div>
  );
};

export default EnglishBreakModal;