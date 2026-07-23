import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  ShieldAlert, 
  AlertTriangle, 
  Lock, 
  Maximize2, 
  Activity, 
  RefreshCw, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

/**
 * ExamSecurityMonitor Component
 * Displays a security dashboard overlay, fullscreen enforcement screens,
 * and a lock screen if a candidate commits too many violations.
 * 
 * @param {Object} props
 * @param {Object} props.securityState Return value of useExamSecurity hook.
 * @param {string} props.assessmentName Name of the active assessment.
 * @param {function} props.onAutoSubmit Callback triggered to submit the exam when locked out.
 */
export const ExamSecurityMonitor = ({
  securityState,
  assessmentName = 'Active Evaluation',
  onAutoSubmit = null,
}) => {
  const {
    violations,
    trustScore,
    isFullscreen,
    isFullscreenGraceActive,
    graceSecondsLeft,
    isExamLocked,
    requestFullscreen,
  } = securityState;

  // Compute color based on trust score
  const getTrustScoreColor = (score) => {
    if (score >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (score >= 50) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
  };

  const scoreTheme = getTrustScoreColor(trustScore);

  return (
    <>
      {/* 1. Header Security Widget (Floating Dashboard) */}
      {!isExamLocked && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-3">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-4 px-4 py-2 bg-[#121214]/90 backdrop-blur-md rounded-2xl border ${scoreTheme.border} shadow-lg shadow-black/30`}
          >
            {/* Live Status indicator */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${trustScore >= 50 ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${trustScore >= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-outfit">Proctor Active</span>
            </div>

            <div className="h-4 w-px bg-zinc-800" />

            {/* Trust Score */}
            <div className="flex items-center gap-1.5">
              <Shield className={`w-3.5 h-3.5 ${scoreTheme.text}`} />
              <span className="text-xs text-zinc-400 font-semibold font-outfit">Trust Score:</span>
              <span className={`text-xs font-black font-outfit ${scoreTheme.text}`}>{trustScore}%</span>
            </div>

            <div className="h-4 w-px bg-zinc-800" />

            {/* Violations Count */}
            <div className="flex items-center gap-1.5">
              <ShieldAlert className={`w-3.5 h-3.5 ${violations.length > 0 ? 'text-rose-400' : 'text-zinc-400'}`} />
              <span className="text-xs text-zinc-400 font-semibold font-outfit">Violations:</span>
              <span className={`text-xs font-black font-outfit ${violations.length > 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
                {violations.length}
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* 2. Fullscreen Requirement Overlay & Grace Period countdown */}
      <AnimatePresence>
        {!isFullscreen && !isExamLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0B0B0D]/98 z-50 flex items-center justify-center p-6 select-none"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-md w-full bg-[#121214] border border-zinc-800/80 rounded-[32px] p-8 text-center shadow-2xl relative overflow-hidden"
            >
              {/* Background gradient orb */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-rose-500/10 rounded-full blur-[60px]" />

              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 border border-rose-500/20">
                <Maximize2 size={28} className="animate-pulse" />
              </div>

              <h2 className="font-plus-jakarta font-black text-xl text-zinc-100 mb-2">
                Fullscreen Mode Required
              </h2>
              
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-medium">
                To maintain the integrity of the {assessmentName}, exiting fullscreen is not permitted. 
                Please enter fullscreen to continue your assessment.
              </p>

              {/* Grace Period Warning */}
              {isFullscreenGraceActive && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-6">
                  <div className="flex justify-center items-center gap-2 text-rose-400 font-bold mb-1 text-xs uppercase tracking-wider font-outfit">
                    <AlertTriangle size={14} />
                    <span>Integrity Lock Warning</span>
                  </div>
                  <p className="text-rose-200/90 text-sm font-bold">
                    Locking assessment in <span className="text-rose-400 font-black text-base font-outfit">{graceSecondsLeft}s</span>
                  </p>
                </div>
              )}

              <button
                onClick={requestFullscreen}
                className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/20 hover:shadow-indigo-700/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
              >
                <Maximize2 size={16} />
                <span>Enter Fullscreen</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Lock Screen (Disciplinary Submission Screen) */}
      <AnimatePresence>
        {isExamLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-[#09090A] z-50 flex items-center justify-center p-6 select-none"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-xl w-full bg-[#121215] border border-red-500/20 rounded-[32px] p-8 text-center shadow-2xl relative overflow-hidden"
            >
              {/* Alert red glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />
              
              <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 border border-rose-500/25">
                <Lock size={32} />
              </div>

              <h2 className="font-plus-jakarta font-black text-2xl text-red-500 mb-2">
                Assessment Locked
              </h2>
              
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-medium">
                Multiple security infractions or exiting the secure environment has resulted in an automated lockout. 
                Your assessment has been suspended to guarantee evaluation integrity.
              </p>

              {/* Summary of Infractions */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 mb-8 text-left max-h-[160px] overflow-y-auto dashboard-scrollbar">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Activity size={12} className="text-red-500" />
                  <span>Violation Log Summary</span>
                </h4>
                {violations.length === 0 ? (
                  <p className="text-xs text-zinc-500 font-semibold italic">Exited secure environment grace timeout.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {violations.map((v) => (
                      <li key={v.id} className="flex gap-2.5 text-xs">
                        <AlertCircle size={13} className="text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-zinc-200">{v.type}</strong>
                          <span className="text-zinc-400 ml-1">({v.severity} severity) - {v.description}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Action Button */}
              {onAutoSubmit ? (
                <button
                  onClick={onAutoSubmit}
                  className="w-full py-4.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-red-600/15 hover:shadow-red-700/25 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  <span>Submit Exam Progress</span>
                </button>
              ) : (
                <div className="text-xs text-zinc-500 font-bold border border-zinc-800 rounded-xl py-3 bg-zinc-900/40">
                  Please notify your assessment coordinator to unlock this session.
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default ExamSecurityMonitor;
