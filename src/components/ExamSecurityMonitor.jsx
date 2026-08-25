import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Maximize2,
  Activity,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';

/**
 * ExamSecurityMonitor Component
 * Displays a security dashboard overlay, fullscreen enforcement screens (warnings 1-3),
 * and a mandatory submission dialog modal for the 4th full-screen exit violation.
 * 
 * @param {Object} props
 * @param {Object} props.securityState Return value of useExamSecurity hook.
 * @param {string} props.assessmentName Name of the active assessment.
 * @param {function} props.onAutoSubmit Callback triggered with submission metadata when candidate submits.
 */
export const ExamSecurityMonitor = ({
  securityState,
  assessmentName = 'Active Evaluation',
  onAutoSubmit = null,
}) => {
  const {
    violations = [],
    trustScore = 100,
    isFullscreen = false,
    isFullscreenGraceActive = false,
    graceSecondsLeft = 15,
    isExamLocked = false,
    fullscreenExitCount = 0,
    warningHistory = [],
    requestFullscreen,
  } = securityState || {};

  const [submissionReason, setSubmissionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const is4thViolation = fullscreenExitCount >= 4;

  const handleReasonSubmit = async (e) => {
    if (e) e.preventDefault();
    if (submissionReason.trim().length < 10) return;

    if (securityState?.exitFullscreen) {
      await securityState.exitFullscreen();
    }

    setSubmitting(true);
    if (onAutoSubmit) {
      await onAutoSubmit({
        autoSubmitted: true,
        submissionReason: submissionReason.trim(),
        warningCount: 4,
        warningHistory: warningHistory && warningHistory.length > 0 ? warningHistory : [new Date().toISOString()]
      });
    }
    setSubmitting(false);
  };

  // Determine modal header and message based on full-screen exit count
  const getWarningContent = () => {
    switch (fullscreenExitCount) {
      case 0:
        return {
          title: "Assessment Instructions & Safe Exam Rules",
          titleColor: "text-indigo-400",
          message: "To ensure a fair testing environment, this assessment runs in Safe Exam Mode. Please read the following rules carefully:\n\n" +
            "🚫 DO NOT press Alt+Tab or switch windows/tabs.\n" +
            "🚫 DO NOT exit full-screen mode (Escape key is disabled).\n" +
            "🚫 DO NOT open Developer Tools (F12 or inspect shortcuts).\n" +
            "🚫 DO NOT copy, cut, or paste content.\n" +
            "🚫 DO NOT right-click on the page.\n" +
            "🚫 DO NOT connect multiple monitors (dual screens).\n\n" +
            "You are allowed a maximum of 3 warnings. Exiting full-screen a 4th time will result in automatic submission. Please click below to enter full-screen and begin your assessment.",
          buttonText: "Start Assessment in Fullscreen"
        };
      case 1:
        return {
          title: "Warning (1 of 3)",
          titleColor: "text-amber-400",
          message: "You have exited full-screen mode.\n\n" +
            "🚫 DO NOT switch windows/tabs (Alt+Tab).\n" +
            "🚫 DO NOT exit full-screen mode.\n\n" +
            "Please return to full-screen to continue your assessment. Repeated violations will result in automatic submission.",
          buttonText: "Return to Exam"
        };
      case 2:
        return {
          title: "Warning (2 of 3)",
          titleColor: "text-orange-400",
          message: "This is your second warning.\n\n" +
            "🚫 DO NOT switch windows/tabs (Alt+Tab).\n" +
            "🚫 DO NOT exit full-screen mode.\n\n" +
            "Please return to full-screen immediately. One more violation will result in automatic submission.",
          buttonText: "Return to Exam"
        };
      case 3:
        return {
          title: "Final Warning (3 of 3)",
          titleColor: "text-rose-500",
          message: "This is your final warning.\n\n" +
            "🚫 DO NOT switch windows/tabs (Alt+Tab).\n" +
            "🚫 DO NOT exit full-screen mode.\n\n" +
            "If you exit full-screen once again, your assessment will be submitted automatically.",
          buttonText: "Return to Exam"
        };
      default:
        return {
          title: "Warning (1 of 3)",
          titleColor: "text-zinc-100",
          message: "You have exited full-screen mode.\nPlease return to full-screen to continue your assessment.\nRepeated violations may result in automatic submission.",
          buttonText: "Return to Exam"
        };
    }
  };

  const warningContent = getWarningContent();

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
      {!isExamLocked && !is4thViolation && (
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

            {/* Warnings Count */}
            <div className="flex items-center gap-1.5">
              <ShieldAlert className={`w-3.5 h-3.5 ${fullscreenExitCount > 0 ? 'text-amber-400' : 'text-zinc-400'}`} />
              <span className="text-xs text-zinc-400 font-semibold font-outfit">Warnings:</span>
              <span className={`text-xs font-black font-outfit ${fullscreenExitCount > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
                {fullscreenExitCount} / 3
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* 2. Fullscreen Requirement Overlay for Warnings 1, 2, 3 */}
      <AnimatePresence>
        {!isFullscreen && !isExamLocked && !is4thViolation && (
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
              className="max-w-lg w-full bg-[#121214] border border-zinc-800/80 rounded-[32px] p-8 text-center shadow-2xl relative overflow-hidden"
            >
              {/* Background gradient orb */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-[60px]" />

              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-400 border border-amber-500/20">
                <Maximize2 size={28} className="animate-pulse" />
              </div>

              <h2 className={`font-plus-jakarta font-black text-xl mb-4 ${warningContent.titleColor}`}>
                {warningContent.title}
              </h2>

              <p className="text-zinc-300 text-xs leading-relaxed mb-6 font-medium whitespace-pre-line text-left bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/50">
                {warningContent.message}
              </p>

              {/* Grace Period Warning */}
              {isFullscreenGraceActive && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6">
                  <div className="flex justify-center items-center gap-2 text-amber-400 font-bold mb-1 text-xs uppercase tracking-wider font-outfit">
                    <AlertTriangle size={14} />
                    <span>Integrity Lock Warning</span>
                  </div>
                  <p className="text-amber-200/90 text-sm font-bold">
                    Locking assessment in <span className="text-amber-400 font-black text-base font-outfit">{graceSecondsLeft}s</span>
                  </p>
                </div>
              )}

              <button
                onClick={requestFullscreen}
                className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/20 hover:shadow-indigo-700/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
              >
                <Maximize2 size={16} />
                <span>{warningContent.buttonText}</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Mandatory Submission Reason Dialog Modal (Violation 4) */}
      <AnimatePresence>
        {is4thViolation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-[#09090A]/95 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-lg w-full bg-[#121215] border border-rose-500/30 rounded-[32px] p-8 text-center shadow-2xl relative overflow-hidden"
            >
              {/* Alert red glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none" />

              <div className="w-20 h-20 bg-rose-500/15 rounded-full flex items-center justify-center mx-auto mb-5 text-rose-500 border border-rose-500/30">
                <Lock size={34} />
              </div>

              <h2 className="font-plus-jakarta font-black text-2xl text-rose-500 mb-2">
                Assessment Auto Submission
              </h2>

              <p className="text-zinc-300 text-sm leading-relaxed mb-6 font-medium whitespace-pre-line">
                You have exited full-screen mode more than the allowed limit.
                Your assessment will now be submitted automatically.

                Please provide the reason why you exited full-screen mode.
              </p>

              <form onSubmit={handleReasonSubmit} className="text-left space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
                    <FileText size={14} className="text-rose-400" />
                    <span>Reason <span className="text-rose-500">*</span></span>
                  </label>

                  <textarea
                    rows={5}
                    value={submissionReason}
                    onChange={(e) => setSubmissionReason(e.target.value)}
                    placeholder={`Example:\n- Accidentally pressed ESC\n- Internet issue\n- System notification\n- Keyboard mistake`}
                    className="w-full bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-4 text-xs font-semibold text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-rose-500 transition-colors leading-relaxed"
                  />

                  <div className="flex items-center justify-between mt-2 text-[11px] font-bold">
                    <span className={submissionReason.trim().length >= 10 ? "text-emerald-400" : "text-amber-400 flex items-center gap-1"}>
                      {submissionReason.trim().length < 10 && <AlertCircle size={12} />}
                      {submissionReason.trim().length >= 10
                        ? "Minimum character requirement met"
                        : "Minimum 10 characters required"}
                    </span>
                    <span className="text-zinc-400 font-mono">
                      {submissionReason.trim().length} / 10 min
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submissionReason.trim().length < 10 || submitting}
                  className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-2xl font-extrabold text-sm tracking-wide shadow-lg shadow-rose-600/20 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                  <CheckCircle size={16} />
                  <span>{submitting ? "Submitting Assessment..." : "Submit Assessment"}</span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. General Lock Screen (If locked out due to Trust Score = 0) */}
      <AnimatePresence>
        {isExamLocked && !is4thViolation && (
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
              <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 border border-rose-500/25">
                <Lock size={32} />
              </div>

              <h2 className="font-plus-jakarta font-black text-2xl text-red-500 mb-2">
                Assessment Locked
              </h2>

              <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-medium">
                Multiple proctoring violations have compromised assessment integrity.
                Your assessment has been locked.
              </p>

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

              {onAutoSubmit ? (
                <button
                  onClick={() => onAutoSubmit({ autoSubmitted: true, submissionReason: "Proctoring score threshold reached zero.", warningCount: fullscreenExitCount, warningHistory })}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-red-600/15 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
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
