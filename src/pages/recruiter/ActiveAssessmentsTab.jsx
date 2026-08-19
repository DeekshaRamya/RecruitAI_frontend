import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  BookOpen,
  Calendar,
  Eye,
  Trash2,
  Search,
  X,
  SlidersHorizontal,
  AlertCircle,
  RefreshCw,
  Loader2,
  PlusCircle,
  CheckCircle2,
  Code2,
  Database,
  Brain,
  ShieldCheck,
  ChevronRight,
  Layers,
  Copy,
  Check,
  Terminal,
  FileCode2,
  Sparkles,
  LayoutGrid,
  List,
  Edit2,
  Download,
  Send,
  HelpCircle,
  ExternalLink,
  Tag,
  ArrowUpDown
} from 'lucide-react';
import api from '../../api';

// ActionButton with loading state support
const ActionButton = ({ onClick, disabled, isLoading, loadingText, title, icon: Icon, iconSize = 14, className = '', children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || isLoading}
    title={title}
    className={`cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
  >
    {isLoading ? (
      <>
        <Loader2 size={iconSize} className="animate-spin" />
        <span>{loadingText || 'Loading...'}</span>
      </>
    ) : (
      <>
        {Icon && <Icon size={iconSize} />}
        {children && <span>{children}</span>}
      </>
    )}
  </button>
);

// High-fidelity syntax highlighter for code snippets in Side Sheet
const SyntaxHighlighter = ({ code, language = 'python' }) => {
  if (!code) return null;
  const lang = language.toLowerCase();

  if (lang === 'python') {
    const combinedRegex = new RegExp(
      `(?<comment>#.*)|(?<string>'(?:\\\\.|[^'\\\\])*'|"(?:\\\\.|[^"\\\\])*")|(?<keyword>\\b(?:def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|in|is|not|and|or|lambda|yield|pass|break|continue|None|True|False)\\b)|(?<func>\\b[a-zA-Z_]\\w*(?=\\s*\\())|(?<number>\\b\\d+(?:\\.\\d+)?\\b)|(?<other>[\\s\\S])`,
      'g'
    );

    const tokens = [];
    let match;
    while ((match = combinedRegex.exec(code)) !== null) {
      const groups = match.groups;
      if (groups.comment) {
        tokens.push(<span key={match.index} className="text-slate-400 dark:text-slate-500 italic">{groups.comment}</span>);
      } else if (groups.string) {
        tokens.push(<span key={match.index} className="text-emerald-600 dark:text-emerald-400 font-medium">{groups.string}</span>);
      } else if (groups.keyword) {
        tokens.push(<span key={match.index} className="text-purple-600 dark:text-purple-400 font-bold">{groups.keyword}</span>);
      } else if (groups.func) {
        tokens.push(<span key={match.index} className="text-blue-600 dark:text-blue-400 font-semibold">{groups.func}</span>);
      } else if (groups.number) {
        tokens.push(<span key={match.index} className="text-amber-600 dark:text-amber-400 font-medium">{groups.number}</span>);
      } else {
        tokens.push(groups.other);
      }
    }
    return <pre className="font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap text-slate-800 dark:text-slate-200">{tokens}</pre>;
  }

  if (lang === 'sql') {
    const combinedRegex = new RegExp(
      `(?<comment>--.*)|(?<string>'(?:\\\\.|[^'\\\\])*')|(?<keyword>\\b(?:SELECT|FROM|WHERE|GROUP\\s+BY|HAVING|ORDER\\s+BY|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|AS|IN|LIKE|IS|NULL|LIMIT|OFFSET|TOP|INSERT|INTO|VALUES|UPDATE|DELETE|CREATE|TABLE|ALTER)\\b)|(?<func>\\b(?:COUNT|SUM|AVG|MIN|MAX|COALESCE|CONCAT|NOW|DATE|ROW_NUMBER|DENSE_RANK|ISNULL|CAST|CONVERT)\\b)|(?<number>\\b\\d+\\b)|(?<other>[\\s\\S])`,
      'gi'
    );

    const tokens = [];
    let match;
    while ((match = combinedRegex.exec(code)) !== null) {
      const groups = match.groups;
      if (groups.comment) {
        tokens.push(<span key={match.index} className="text-slate-400 dark:text-slate-500 italic">{groups.comment}</span>);
      } else if (groups.string) {
        tokens.push(<span key={match.index} className="text-emerald-600 dark:text-emerald-400 font-medium">{groups.string}</span>);
      } else if (groups.keyword) {
        tokens.push(<span key={match.index} className="text-sky-600 dark:text-sky-400 font-bold uppercase">{groups.keyword}</span>);
      } else if (groups.func) {
        tokens.push(<span key={match.index} className="text-amber-600 dark:text-amber-400 font-semibold">{groups.func}</span>);
      } else if (groups.number) {
        tokens.push(<span key={match.index} className="text-indigo-600 dark:text-indigo-400 font-medium">{groups.number}</span>);
      } else {
        tokens.push(groups.other);
      }
    }
    return <pre className="font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap text-slate-800 dark:text-slate-200">{tokens}</pre>;
  }

  return <pre className="font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap text-slate-800 dark:text-slate-200">{code}</pre>;
};

// ==========================================
// 1. SLIDE-OVER SIDE SHEET FOR PREVIEWING
// ==========================================
export const PreviewQuestionsSideSheet = ({
  assessment,
  onClose,
  onAssignClick,
  onOpenInStudio,
  showToast
}) => {
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');

  const questions = useMemo(() => {
    return Array.isArray(assessment?.questions) ? assessment.questions : [];
  }, [assessment]);

  const filteredQuestions = useMemo(() => {
    if (!filterQuery) return questions;
    const q = filterQuery.toLowerCase();
    return questions.filter(item => {
      const title = (item.title || item.question || '').toLowerCase();
      const sub = (item.subject || '').toLowerCase();
      return title.includes(q) || sub.includes(q);
    });
  }, [questions, filterQuery]);

  const activeQuestion = filteredQuestions[selectedQuestionIndex] || questions[0];

  const handleCopyCode = (code, index) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    if (showToast) showToast('Solution snippet copied to clipboard');
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!assessment) return null;

  return (
    <div className="fixed inset-0 z-[150] overflow-hidden flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-Over Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full z-10 text-slate-800 dark:text-slate-100"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/60 dark:bg-slate-950/40 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full">
                Question Inspector
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                {questions.length} Total Questions
              </span>
            </div>
            <h3 className="font-outfit font-extrabold text-lg sm:text-xl text-slate-900 dark:text-slate-100 truncate" title={assessment.name}>
              {assessment.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenInStudio && (
              <button
                type="button"
                onClick={() => onOpenInStudio(assessment)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-2xs"
              >
                <Sparkles size={13} className="text-indigo-500" />
                <span>Open in Studio</span>
              </button>
            )}

            {onAssignClick && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAssignClick(assessment);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer border-none"
              >
                <Send size={13} />
                <span>Assign</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body Content: 2-Column Split */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Column: Questions List Navigation (4 cols) */}
          <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/40 dark:bg-slate-950/20">
            {/* Question Filter */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter questions..."
                  value={filterQuery}
                  onChange={(e) => {
                    setFilterQuery(e.target.value);
                    setSelectedQuestionIndex(0);
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 pl-8 pr-3 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Questions Index */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 dashboard-scrollbar">
              {filteredQuestions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No questions match your filter.
                </div>
              ) : (
                filteredQuestions.map((q, idx) => {
                  const isSelected = activeQuestion === q;
                  const subject = q.subject || 'Technical';
                  return (
                    <button
                      key={q.id || idx}
                      type="button"
                      onClick={() => setSelectedQuestionIndex(idx)}
                      className={`w-full p-3 rounded-2xl text-left transition-all flex items-start justify-between gap-2 cursor-pointer border ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 shadow-xs ring-1 ring-indigo-500/20'
                          : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            Q{idx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                            {subject}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                          {q.title || q.question || 'Technical Problem'}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                        {q.marks || 10}m
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Question Details Inspector (8 cols) */}
          <div className="md:col-span-8 flex flex-col h-full overflow-y-auto p-6 space-y-6 dashboard-scrollbar">
            {activeQuestion ? (
              <>
                {/* Question Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      Question {questions.indexOf(activeQuestion) + 1}
                    </span>
                    <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {activeQuestion.subject || 'General'}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {activeQuestion.difficulty || 'Medium'}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    Marks: <strong className="text-slate-900 dark:text-slate-100">{activeQuestion.marks || 10} pts</strong>
                  </span>
                </div>

                {/* Problem Statement */}
                <div className="space-y-2">
                  <h4 className="font-outfit font-extrabold text-base text-slate-900 dark:text-slate-100">
                    {activeQuestion.title || activeQuestion.question || 'Problem Statement'}
                  </h4>
                  {activeQuestion.description && activeQuestion.description !== activeQuestion.title && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/70">
                      {activeQuestion.description}
                    </p>
                  )}
                </div>

                {/* MCQ Options (if format is MCQ) */}
                {Array.isArray(activeQuestion.options) && activeQuestion.options.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-outfit font-extrabold text-xs uppercase tracking-wider text-slate-400">
                      Answer Choices
                    </h5>
                    <div className="grid grid-cols-1 gap-2">
                      {activeQuestion.options.map((opt, i) => {
                        const isCorrect = (
                          activeQuestion.correctAnswer === opt ||
                          activeQuestion.answer === opt ||
                          activeQuestion.correct_option === opt ||
                          (typeof activeQuestion.correctAnswerIndex === 'number' && activeQuestion.correctAnswerIndex === i)
                        );
                        return (
                          <div
                            key={i}
                            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
                              isCorrect
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                                : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-[11px] ${
                                isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}>
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span>{typeof opt === 'string' ? opt : JSON.stringify(opt)}</span>
                            </div>
                            {isCorrect && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-600 text-white flex items-center gap-1">
                                <Check size={11} strokeWidth={3} />
                                <span>Correct Answer</span>
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sample Test Cases (if coding question) */}
                {Array.isArray(activeQuestion.testCases) && activeQuestion.testCases.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-outfit font-extrabold text-xs uppercase tracking-wider text-slate-400">
                      Sample Test Cases
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeQuestion.testCases.map((tc, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-mono">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase text-slate-400">Case {idx + 1}</span>
                            {tc.is_hidden && <span className="text-[9px] font-bold text-amber-500">Hidden</span>}
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-sans">Input:</span>
                            <code className="text-slate-800 dark:text-slate-200 font-bold block">{tc.input || 'None'}</code>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-sans">Expected Output:</span>
                            <code className="text-emerald-600 dark:text-emerald-400 font-bold block">{tc.expected_output || tc.output || 'None'}</code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Solution Code / Starter Code */}
                {(activeQuestion.solutionCode || activeQuestion.code || activeQuestion.starterCode) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-outfit font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Code2 size={13} className="text-indigo-500" />
                        <span>Solution / Code Reference</span>
                      </h5>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(activeQuestion.solutionCode || activeQuestion.code || activeQuestion.starterCode, selectedQuestionIndex)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {copiedCodeIndex === selectedQuestionIndex ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                        <span>{copiedCodeIndex === selectedQuestionIndex ? 'Copied' : 'Copy Code'}</span>
                      </button>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner overflow-hidden">
                      <SyntaxHighlighter
                        code={activeQuestion.solutionCode || activeQuestion.code || activeQuestion.starterCode}
                        language={activeQuestion.subject === 'SQL' ? 'sql' : 'python'}
                      />
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {activeQuestion.explanation && (
                  <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 space-y-1.5">
                    <h5 className="font-outfit font-extrabold text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                      <HelpCircle size={13} />
                      <span>Explanation & Criteria</span>
                    </h5>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {activeQuestion.explanation}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Select a question from the left sidebar to inspect details.
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// 2. QUICK EDIT ASSESSMENT MODAL
// ==========================================
const QuickEditAssessmentModal = ({
  assessment,
  onClose,
  onSave,
  showToast
}) => {
  const [name, setName] = useState(assessment?.name || '');
  const [duration, setDuration] = useState(assessment?.duration || '60 minutes');
  const [difficulty, setDifficulty] = useState(assessment?.difficulty || 'Medium');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      if (showToast) showToast('Please enter an assessment title.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        duration: duration,
        difficulty: difficulty
      };
      const res = await api.put(`/api/assessment/${assessment.id}`, payload);
      if (res.data) {
        if (showToast) showToast('Assessment updated successfully.');
        onSave(res.data);
        onClose();
      }
    } catch (err) {
      console.error('Failed to update assessment:', err);
      if (showToast) showToast('Failed to update assessment.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Edit2 size={16} />
            </div>
            <div>
              <h3 className="font-outfit font-extrabold text-base text-slate-900 dark:text-slate-100">
                Edit Assessment Details
              </h3>
              <p className="text-[11px] text-slate-400">Update title, duration, and difficulty level.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-slate-300 font-bold">Assessment Title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="30 minutes">30 minutes</option>
                <option value="45 minutes">45 minutes</option>
                <option value="60 minutes">60 minutes</option>
                <option value="90 minutes">90 minutes</option>
                <option value="120 minutes">120 minutes</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Easy">Easy (Junior)</option>
                <option value="Medium">Medium (Mid-level)</option>
                <option value="Hard">Hard (Senior)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <ActionButton
              onClick={handleSave}
              isLoading={isSaving}
              loadingText="Saving..."
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer border-none"
            >
              Save Changes
            </ActionButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// 3. MAIN REDESIGNED ACTIVE ASSESSMENTS TAB
// ==========================================
export const ActiveAssessmentsTab = ({
  savedAssessments = [],
  setSavedAssessments,
  setGeneratedQuestions,
  showToast,
  setActiveTab,
  currentUser,
  onAssignClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' or 'TABLE'
  const [sortBy, setSortBy] = useState('NEWEST'); // 'NEWEST', 'QUESTIONS', 'DURATION', 'TITLE'

  // Side sheet & modals
  const [previewingSideSheetAssessment, setPreviewingSideSheetAssessment] = useState(null);
  const [editingAssessment, setEditingAssessment] = useState(null);

  // Deduplicate and sanitize assessments
  const validAssessments = useMemo(() => {
    const raw = (savedAssessments || []).filter(asm => {
      if (!asm) return false;
      const hasId = Boolean(asm.id);
      const hasName = Boolean(asm.name && asm.name.trim());
      const hasQuestions = Array.isArray(asm.questions) ? asm.questions.length > 0 : (asm.questionsCount > 0);
      return (hasId || hasName) && hasQuestions;
    });

    const seenIds = new Set();
    const seenNames = new Set();
    return raw.filter(asm => {
      const idKey = asm.id ? String(asm.id) : null;
      const nameKey = asm.name ? String(asm.name).trim().toLowerCase() : null;
      if (idKey && seenIds.has(idKey)) return false;
      if (nameKey && seenNames.has(nameKey)) return false;
      if (idKey) seenIds.add(idKey);
      if (nameKey) seenNames.add(nameKey);
      return true;
    });
  }, [savedAssessments]);

  // Derived telemetry metrics
  const telemetry = useMemo(() => {
    const totalAssessments = validAssessments.length;
    const totalQuestions = validAssessments.reduce((acc, a) => acc + (a.questionsCount || a.questions?.length || 0), 0);
    
    // Unique subjects
    const allSubjects = new Set();
    validAssessments.forEach(a => {
      if (Array.isArray(a.subjects)) {
        a.subjects.forEach(s => allSubjects.add(s));
      }
    });

    return {
      totalAssessments,
      totalQuestions,
      uniqueSubjectsCount: allSubjects.size,
      avgDuration: totalAssessments > 0 ? '60m' : '0m'
    };
  }, [validAssessments]);

  // Filtered & sorted assessments
  const filteredAssessments = useMemo(() => {
    let result = validAssessments.filter(asm => {
      const query = searchQuery.toLowerCase();
      const nameMatch = asm.name && asm.name.toLowerCase().includes(query);
      const subjectMatch = Array.isArray(asm.subjects) && asm.subjects.some(sub => sub.toLowerCase().includes(query));
      
      const passesSearch = !searchQuery || nameMatch || subjectMatch;
      
      let passesSubject = true;
      if (subjectFilter !== 'ALL') {
        passesSubject = Array.isArray(asm.subjects) && asm.subjects.some(s => s.toLowerCase() === subjectFilter.toLowerCase());
      }

      let passesDiff = true;
      if (difficultyFilter !== 'ALL') {
        passesDiff = (asm.difficulty || 'Medium').toLowerCase() === difficultyFilter.toLowerCase();
      }

      return passesSearch && passesSubject && passesDiff;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'QUESTIONS') {
        const countA = a.questionsCount || a.questions?.length || 0;
        const countB = b.questionsCount || b.questions?.length || 0;
        return countB - countA;
      }
      if (sortBy === 'TITLE') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'DURATION') {
        return (b.duration || '').localeCompare(a.duration || '');
      }
      // Default: NEWEST
      return (b.createdDate || '').localeCompare(a.createdDate || '');
    });
  }, [validAssessments, searchQuery, subjectFilter, difficultyFilter, sortBy]);

  // Open in Studio for remixing
  const handleOpenInStudio = (asm) => {
    if (asm.questions && setGeneratedQuestions) {
      setGeneratedQuestions(asm.questions);
    }
    if (setActiveTab) {
      setActiveTab('create-assessment');
      if (showToast) showToast(`Loaded "${asm.name}" into Studio.`);
    }
  };

  // 1-Click Duplicate Assessment
  const handleDuplicateAssessment = async (asm) => {
    try {
      const payload = {
        name: `${asm.name} (Copy)`,
        subjects: asm.subjects || ['General'],
        difficulty: asm.difficulty || 'Medium',
        duration: asm.duration || '60 minutes',
        questionsCount: asm.questionsCount || asm.questions?.length || 0,
        createdDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        candidatesAssigned: 0,
        questions: asm.questions || []
      };

      const res = await api.post('/api/assessment', payload);
      if (res.data && setSavedAssessments) {
        setSavedAssessments(prev => [res.data, ...prev]);
        if (showToast) showToast(`Duplicated "${asm.name}" as new blueprint.`);
      }
    } catch (err) {
      console.error('Failed to duplicate assessment:', err);
      if (showToast) showToast('Failed to duplicate assessment.');
    }
  };

  // Export Question Bank to JSON
  const handleExportJSON = (asm) => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(asm, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${asm.name.replace(/\s+/g, '_')}_questions.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      if (showToast) showToast(`Exported "${asm.name}" question bank.`);
    } catch (err) {
      console.error('Failed to export JSON:', err);
    }
  };

  // Delete Assessment
  const handleDeleteAssessment = async (assessmentId, assessmentName) => {
    if (!window.confirm(`Are you sure you want to delete "${assessmentName}"? This will remove this assessment and its questions.`)) {
      return;
    }

    try {
      await api.delete(`/api/assessment/${assessmentId}`);
      if (setSavedAssessments) {
        setSavedAssessments(prev => prev.filter(asm => asm.id !== assessmentId));
      }
      if (showToast) showToast(`Assessment "${assessmentName}" deleted successfully.`);
      if (previewingSideSheetAssessment?.id === assessmentId) {
        setPreviewingSideSheetAssessment(null);
      }
    } catch (err) {
      console.error("Failed to delete assessment from backend:", err);
      if (showToast) showToast("Error deleting assessment.");
    }
  };

  // Subject Badge Color Mapping
  const getSubjectBadge = (subject) => {
    switch (subject.toLowerCase()) {
      case 'python':
        return 'text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20';
      case 'sql':
        return 'text-sky-700 dark:text-sky-300 bg-sky-500/10 border-sky-500/20';
      case 'aptitude':
        return 'text-purple-700 dark:text-purple-300 bg-purple-500/10 border-purple-500/20';
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
      case 'Medium':
        return 'text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20';
      case 'Hard':
        return 'text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Banner Ribbon */}
      <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs backdrop-blur-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full">
              Assessment Catalog & Question Bank
            </span>
          </div>
          <h2 className="font-outfit font-extrabold text-2xl text-slate-900 dark:text-slate-50 tracking-tight">
            Manage Assessments
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Inspect question repositories, edit blueprints, clone drafts, and export test banks.
          </p>
        </div>

        {/* Global Telemetry & Creation Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 px-3 text-center">
            <div className="px-2">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Assessments</span>
              <span className="text-sm font-mono font-black text-slate-900 dark:text-slate-100">{telemetry.totalAssessments}</span>
            </div>
            <div className="px-2 border-x border-slate-200 dark:border-slate-800">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Questions</span>
              <span className="text-sm font-mono font-black text-indigo-600 dark:text-indigo-400">{telemetry.totalQuestions}</span>
            </div>
            <div className="px-2">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Topics</span>
              <span className="text-sm font-mono font-black text-purple-600 dark:text-purple-400">{telemetry.uniqueSubjectsCount}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('create-assessment')}
            className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer border-none"
          >
            <PlusCircle size={15} />
            <span>Create Assessment</span>
          </button>
        </div>
      </div>

      {/* Search, Filter, Sort & View Mode Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-indigo-500" size={15} />
          <input
            type="text"
            placeholder="Search assessments by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-8 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filters, Sorters & View Mode */}
        <div className="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
          
          {/* Subject Pills */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            {['ALL', 'Python', 'SQL', 'Aptitude'].map((sub) => {
              const isActive = subjectFilter === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubjectFilter(sub)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-transparent'
                  }`}
                >
                  {sub === 'ALL' ? 'All' : sub}
                </button>
              );
            })}
          </div>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Difficulties</option>
            <option value="Easy">Easy (Junior)</option>
            <option value="Medium">Medium (Mid)</option>
            <option value="Hard">Hard (Senior)</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="NEWEST">Newest First</option>
            <option value="QUESTIONS">Most Questions</option>
            <option value="TITLE">Title (A-Z)</option>
            <option value="DURATION">Duration</option>
          </select>

          {/* View Mode Switcher (Grid vs Table) */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer border-none ${
                viewMode === 'GRID'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-transparent'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer border-none ${
                viewMode === 'TABLE'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-transparent'
              }`}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredAssessments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[350px] shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
            <BookOpen size={32} />
          </div>
          <h3 className="font-outfit font-extrabold text-base text-slate-900 dark:text-slate-100">
            {searchQuery ? "No Matching Assessments" : "No Assessments Created Yet"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5 max-w-sm leading-relaxed">
            {searchQuery
              ? `No assessments match "${searchQuery}". Try adjusting your keywords or filters.`
              : 'Create your first custom technical assessment blueprint using the AI Assessment Studio.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setActiveTab('create-assessment')}
              className="mt-5 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer border-none"
            >
              Launch Assessment Studio
            </button>
          )}
        </div>
      ) : viewMode === 'GRID' ? (
        /* ======================== GRID VIEW ======================== */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          {filteredAssessments.map((asm) => {
            const questionCount = asm.questionsCount || asm.questions?.length || 0;
            return (
              <motion.div
                key={asm.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-500/40 dark:hover:border-indigo-400/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-5 transition-all duration-200 group"
              >
                <div>
                  {/* Card Header: Title & Difficulty Badge */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4
                      className="font-outfit font-extrabold text-base text-slate-900 dark:text-slate-50 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[220px]"
                      title={asm.name}
                    >
                      {asm.name}
                    </h4>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border shrink-0 uppercase tracking-wider ${getDifficultyBadge(asm.difficulty)}`}>
                      {asm.difficulty || 'Medium'}
                    </span>
                  </div>

                  {/* Creation Date & Author */}
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-4 font-mono">
                    <Calendar size={12} />
                    <span>Created: {asm.createdDate || 'Recent'}</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded font-sans text-[9px] font-bold">
                      By {asm.created_by ? (currentUser?.id === asm.created_by ? 'You' : (currentUser?.name || 'Recruiter')) : (currentUser?.name || 'You')}
                    </span>
                  </div>

                  {/* Subject Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {Array.isArray(asm.subjects) && asm.subjects.map(sub => (
                      <span key={sub} className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getSubjectBadge(sub)}`}>
                        {sub}
                      </span>
                    ))}
                  </div>

                  {/* Metadata block */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 p-3 rounded-2xl mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-indigo-500" />
                      <span>{asm.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-indigo-500" />
                      <span>{questionCount} Questions</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-1 flex flex-col gap-2.5">
                  {/* Primary Action: Inspect Questions (Opens Side Sheet) */}
                  <button
                    type="button"
                    onClick={() => setPreviewingSideSheetAssessment(asm)}
                    className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-800 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Eye size={13} />
                    <span>Inspect Questions</span>
                  </button>

                  {/* Secondary Actions Toolbar */}
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingAssessment(asm)}
                      className="py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      title="Edit Assessment Details"
                    >
                      <Edit2 size={12} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicateAssessment(asm)}
                      className="py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      title="Clone / Duplicate Assessment"
                    >
                      <Copy size={12} />
                      <span className="hidden sm:inline">Clone</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportJSON(asm)}
                      className="py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      title="Export Question Bank to JSON"
                    >
                      <Download size={12} />
                      <span className="hidden sm:inline">JSON</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteAssessment(asm.id, asm.name)}
                      className="py-1.5 px-2 rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      title="Delete Assessment"
                    >
                      <Trash2 size={12} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* ======================== TABLE VIEW ======================== */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Assessment Name</th>
                  <th className="py-3.5 px-4">Topics</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Questions</th>
                  <th className="py-3.5 px-4">Created By</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
                {filteredAssessments.map((asm) => (
                  <tr key={asm.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                          <BookOpen size={14} />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{asm.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(asm.subjects) && asm.subjects.map(s => (
                          <span key={s} className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${getSubjectBadge(s)}`}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getDifficultyBadge(asm.difficulty)}`}>
                        {asm.difficulty || 'Medium'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {asm.duration}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {asm.questionsCount || asm.questions?.length || 0} Qs
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                        {asm.created_by ? (currentUser?.id === asm.created_by ? 'You' : (currentUser?.name || 'Recruiter')) : (currentUser?.name || 'You')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {asm.createdDate || 'Recent'}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewingSideSheetAssessment(asm)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                          title="Inspect Questions"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingAssessment(asm)}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicateAssessment(asm)}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Clone"
                        >
                          <Copy size={12} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteAssessment(asm.id, asm.name)}
                          className="p-1.5 rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-Over Side Sheet for Previewing Questions */}
      <AnimatePresence>
        {previewingSideSheetAssessment && (
          <PreviewQuestionsSideSheet
            assessment={previewingSideSheetAssessment}
            onClose={() => setPreviewingSideSheetAssessment(null)}
            onAssignClick={onAssignClick}
            onOpenInStudio={handleOpenInStudio}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* Quick Edit Modal */}
      {editingAssessment && (
        <QuickEditAssessmentModal
          assessment={editingAssessment}
          onClose={() => setEditingAssessment(null)}
          onSave={(updated) => {
            if (setSavedAssessments) {
              setSavedAssessments(prev => prev.map(a => a.id === updated.id ? updated : a));
            }
          }}
          showToast={showToast}
        />
      )}

    </div>
  );
};

export default ActiveAssessmentsTab;
