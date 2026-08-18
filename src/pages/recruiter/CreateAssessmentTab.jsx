import React, { useRef } from 'react';
import {
  FileText,
  BookOpen,
  PieChart,
  SlidersHorizontal,
  Sparkles,
  RefreshCw,
  Code2,
  Database,
  Brain,
  Plus,
  Minus,
  Layers,
  HelpCircle,
  Eye,
  CheckCircle2,
  Clock,
  Zap,
  Target,
  ArrowRight,
  ShieldCheck,
  Check,
  ChevronRight
} from 'lucide-react';
import PreviewQuestionsTab from './PreviewQuestionsTab';

const SUBJECT_CONFIGS = [
  {
    id: 'Python',
    name: 'Python',
    icon: Code2,
    desc: 'Syntax, OOP, Algorithms, Dynamic Logic',
    defaultCount: 10,
    accentColor: 'text-amber-500 dark:text-amber-400',
    bgAccent: 'bg-amber-500/10 border-amber-500/20 dark:bg-amber-500/15 dark:border-amber-500/30',
    activeGlow: 'ring-2 ring-amber-500/30 dark:ring-amber-400/40 border-amber-500 dark:border-amber-400'
  },
  {
    id: 'SQL',
    name: 'SQL',
    icon: Database,
    desc: 'Queries, Joins, Grouping, DB Verification',
    defaultCount: 10,
    accentColor: 'text-sky-500 dark:text-sky-400',
    bgAccent: 'bg-sky-500/10 border-sky-500/20 dark:bg-sky-500/15 dark:border-sky-500/30',
    activeGlow: 'ring-2 ring-sky-500/30 dark:ring-sky-400/40 border-sky-500 dark:border-sky-400'
  },
  {
    id: 'Aptitude',
    name: 'Aptitude',
    icon: Brain,
    desc: 'Quantitative, Logical & Verbal Reasoning',
    defaultCount: 5,
    accentColor: 'text-purple-500 dark:text-purple-400',
    bgAccent: 'bg-purple-500/10 border-purple-500/20 dark:bg-purple-500/15 dark:border-purple-500/30',
    activeGlow: 'ring-2 ring-purple-500/30 dark:ring-purple-400/40 border-purple-500 dark:border-purple-400'
  }
];

const PRESET_COUNTS = [5, 10, 15, 20];
const DURATION_PRESETS = ['30 minutes', '45 minutes', '60 minutes', '90 minutes', '120 minutes'];

const CreateAssessmentTab = ({
  assessmentTitle,
  setAssessmentTitle,
  durationInput,
  setDurationInput,
  selectedSubjects = [],
  setSelectedSubjects,
  subjectQuestionCounts = {},
  setSubjectQuestionCounts,
  toggleSubject,
  questionDist = { mcq: 70, scenario: 30 },
  setQuestionDist,
  difficultyDist = { easy: 20, medium: 50, hard: 30 },
  setDifficultyDist,
  isGenerating,
  onGenerate,
  handleGenerateAssessment,
  generatedQuestions = [],
  setGeneratedQuestions,
  generationProgress,
  onSave,
  onSaveAssessment,
  onSaveAndAssign,
  savedAssessments = [],
  showToast
}) => {
  const triggerGenerate = handleGenerateAssessment || onGenerate;
  const previewRef = useRef(null);

  // Question count helpers
  const getSubjectCount = (subId) => {
    const val = subjectQuestionCounts[subId];
    if (val !== undefined && val !== null && !isNaN(val)) {
      return Number(val);
    }
    const defaultSub = SUBJECT_CONFIGS.find(s => s.id === subId);
    return defaultSub ? defaultSub.defaultCount : 10;
  };

  const updateSubjectCount = (subId, newCount) => {
    const sanitized = Math.min(50, Math.max(1, parseInt(newCount, 10) || 1));
    if (setSubjectQuestionCounts) {
      setSubjectQuestionCounts(prev => ({
        ...prev,
        [subId]: sanitized
      }));
    }
  };

  const handleStepCount = (subId, delta, e) => {
    if (e) e.stopPropagation();
    const current = getSubjectCount(subId);
    updateSubjectCount(subId, current + delta);
  };

  // Total questions count calculation
  const totalQuestionsCount = selectedSubjects.reduce((acc, subId) => {
    return acc + getSubjectCount(subId);
  }, 0);

  // Validation rules
  const isSubjectsValid = selectedSubjects && selectedSubjects.length > 0;
  const isQuestionCountsValid = isSubjectsValid && selectedSubjects.every(sub => getSubjectCount(sub) >= 1);
  const isQuestionDistValid = (Number(questionDist.mcq || 0) + Number(questionDist.scenario || 0)) === 100;
  const isDifficultyDistValid = (Number(difficultyDist.easy || 0) + Number(difficultyDist.medium || 0) + Number(difficultyDist.hard || 0)) === 100;
  const isValidForGeneration = isSubjectsValid && isQuestionCountsValid && isQuestionDistValid && isDifficultyDistValid;

  const hasGeneratedQuestions = generatedQuestions && generatedQuestions.length > 0;
  const isGeneratingNow = isGenerating || (generationProgress && generationProgress.active);

  // Calculate proportional counts for summary preview
  const mcqEstCount = Math.round(totalQuestionsCount * (questionDist.mcq / 100));
  const scenarioEstCount = totalQuestionsCount - mcqEstCount;
  const easyEstCount = Math.round(totalQuestionsCount * (difficultyDist.easy / 100));
  const medEstCount = Math.round(totalQuestionsCount * (difficultyDist.medium / 100));
  const hardEstCount = Math.max(0, totalQuestionsCount - (easyEstCount + medEstCount));

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Banner Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 px-6 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="font-outfit font-extrabold text-base text-slate-900 dark:text-slate-50 tracking-tight">
              AI Assessment Studio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Configure topics, difficulty balance, and question counts for technical candidates.
            </p>
          </div>
        </div>

        {hasGeneratedQuestions && (
          <button
            onClick={() => document.getElementById('assessment-preview-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Eye size={14} />
            <span>Jump to Questions ({generatedQuestions.length})</span>
          </button>
        )}
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: BUILDER FORMS (8 COLS) */}
        <div className="xl:col-span-8 flex flex-col gap-6">

          {/* 1. Assessment Identity & Timing Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-5 transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <FileText size={16} />
                </div>
                <h3 className="font-outfit font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  1. Assessment Details
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                General Meta
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Title input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Assessment Title
                </label>
                <input
                  type="text"
                  value={assessmentTitle}
                  onChange={(e) => setAssessmentTitle(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineering Assessment"
                  className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              {/* Duration picker */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Duration</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Selected: {durationInput}</span>
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {DURATION_PRESETS.map((dur) => {
                    const isSelected = durationInput === dur;
                    return (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setDurationInput(dur)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        {dur.replace(' minutes', 'm')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Interactive Subject & Topic Breakdown Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-5 transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Layers size={16} />
                </div>
                <h3 className="font-outfit font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  2. Select Topics & Allocation
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full">
                  {selectedSubjects.length} Selected
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                  {totalQuestionsCount} Total Qs
                </span>
              </div>
            </div>

            {/* Subject Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SUBJECT_CONFIGS.map((sub) => {
                const isSelected = selectedSubjects.includes(sub.id);
                const IconComponent = sub.icon;
                const count = getSubjectCount(sub.id);

                return (
                  <div
                    key={sub.id}
                    onClick={() => toggleSubject && toggleSubject(sub.id)}
                    className={`relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 group select-none ${
                      isSelected
                        ? `bg-slate-50/70 dark:bg-slate-800/60 ${sub.activeGlow}`
                        : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/40'
                    }`}
                  >
                    {/* Top Row: Icon & Checkbox */}
                    <div className="flex items-start justify-between gap-2">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${sub.bgAccent} ${sub.accentColor}`}>
                        <IconComponent size={20} />
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        {isSelected && <Check size={13} strokeWidth={3} />}
                      </div>
                    </div>

                    {/* Middle: Title & Description */}
                    <div>
                      <h4 className="font-outfit font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        {sub.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mt-0.5 leading-snug">
                        {sub.desc}
                      </p>
                    </div>

                    {/* Bottom: Custom Stepper & Count */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className={`pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-2 ${
                        !isSelected ? 'opacity-40 pointer-events-none' : ''
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Questions
                      </span>

                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-2xs">
                        <button
                          type="button"
                          onClick={(e) => handleStepCount(sub.id, -1, e)}
                          disabled={count <= 1}
                          className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <Minus size={12} strokeWidth={2.5} />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={count}
                          onChange={(e) => updateSubjectCount(sub.id, e.target.value)}
                          className="w-8 text-center text-xs font-mono font-extrabold bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={(e) => handleStepCount(sub.id, 1, e)}
                          disabled={count >= 50}
                          className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <Plus size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Question Format & Difficulty Balance Matrix */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6 transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <SlidersHorizontal size={16} />
                </div>
                <h3 className="font-outfit font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  3. Format & Difficulty Dials
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                Evaluation Ratios
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Question Format Split */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Question Format Balance
                  </label>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {questionDist.mcq}% MCQ / {questionDist.scenario}% Scenario
                  </span>
                </div>

                {/* Visual Ratio Bar */}
                <div className="h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/60 dark:border-slate-800">
                  <div
                    style={{ width: `${questionDist.mcq}%` }}
                    className="h-full bg-blue-500 rounded-l-full transition-all duration-300"
                    title={`MCQ: ${questionDist.mcq}%`}
                  />
                  <div
                    style={{ width: `${questionDist.scenario}%` }}
                    className="h-full bg-indigo-500 rounded-r-full transition-all duration-300"
                    title={`Scenario: ${questionDist.scenario}%`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">MCQ</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">{questionDist.mcq}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Scenario</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">{questionDist.scenario}%</span>
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={questionDist.mcq}
                  onChange={(e) => {
                    const mcqVal = parseInt(e.target.value, 10);
                    setQuestionDist({ mcq: mcqVal, scenario: 100 - mcqVal });
                  }}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-1"
                />
              </div>

              {/* Difficulty Breakdown */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Difficulty Distribution
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {difficultyDist.easy}% E / {difficultyDist.medium}% M / {difficultyDist.hard}% H
                  </span>
                </div>

                {/* Visual Ratio Bar */}
                <div className="h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/60 dark:border-slate-800">
                  <div
                    style={{ width: `${difficultyDist.easy}%` }}
                    className="h-full bg-emerald-500 rounded-l-full transition-all duration-300"
                    title={`Easy: ${difficultyDist.easy}%`}
                  />
                  <div
                    style={{ width: `${difficultyDist.medium}%` }}
                    className="h-full bg-amber-500 transition-all duration-300"
                    title={`Medium: ${difficultyDist.medium}%`}
                  />
                  <div
                    style={{ width: `${difficultyDist.hard}%` }}
                    className="h-full bg-rose-500 rounded-r-full transition-all duration-300"
                    title={`Hard: ${difficultyDist.hard}%`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div className="flex flex-col p-2 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Easy</span>
                    <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{difficultyDist.easy}%</span>
                  </div>
                  <div className="flex flex-col p-2 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-center">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Med</span>
                    <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{difficultyDist.medium}%</span>
                  </div>
                  <div className="flex flex-col p-2 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 text-center">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">Hard</span>
                    <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{difficultyDist.hard}%</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setDifficultyDist({ easy: 40, medium: 40, hard: 20 })}
                    className="flex-1 py-1 px-2 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Junior (40/40/20)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDifficultyDist({ easy: 20, medium: 50, hard: 30 })}
                    className="flex-1 py-1 px-2 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Mid (20/50/30)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDifficultyDist({ easy: 10, medium: 40, hard: 50 })}
                    className="flex-1 py-1 px-2 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Senior (10/40/50)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY TELEMETRY SUMMARY & GENERATION CTA (4 COLS) */}
        <div className="xl:col-span-4 flex flex-col gap-6 sticky top-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6 transition-all">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                <h3 className="font-outfit font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Assessment Blueprint
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                AI Config
              </span>
            </div>

            {/* Metric Blocks */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col">
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Total Questions
                </span>
                <span className="text-xl font-mono font-black text-slate-900 dark:text-slate-100 mt-1">
                  {totalQuestionsCount}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col">
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Est. Duration
                </span>
                <span className="text-xl font-mono font-black text-slate-900 dark:text-slate-100 mt-1">
                  {durationInput.replace(' minutes', 'm')}
                </span>
              </div>
            </div>

            {/* Topic Breakdown List */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Selected Topic Allocation
              </span>
              {selectedSubjects.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                  No subjects selected
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedSubjects.map((subId) => {
                    const count = getSubjectCount(subId);
                    const pct = totalQuestionsCount > 0 ? Math.round((count / totalQuestionsCount) * 100) : 0;
                    return (
                      <div
                        key={subId}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{subId}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({pct}%)</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                          {count} Qs
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Estimated Breakdown Chips */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-medium">
                <span>MCQs / Scenarios</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{mcqEstCount} / {scenarioEstCount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-medium">
                <span>Easy / Med / Hard</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{easyEstCount} / {medEstCount} / {hardEstCount}</span>
              </div>
            </div>

            {/* GENERATE PRIMARY CTA */}
            <button
              type="button"
              onClick={triggerGenerate}
              disabled={isGeneratingNow || !isValidForGeneration}
              className={`w-full py-4 px-6 rounded-2xl font-outfit font-extrabold text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-md cursor-pointer border-none ${
                isGeneratingNow
                  ? 'bg-indigo-600/80 text-white cursor-not-allowed animate-pulse'
                  : !isValidForGeneration
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]'
              }`}
            >
              {isGeneratingNow ? (
                <>
                  <RefreshCw size={18} className="animate-spin text-white" />
                  <span>Streaming AI Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} className="text-white" />
                  <span>Generate {totalQuestionsCount} Questions with AI</span>
                </>
              )}
            </button>

            {!isValidForGeneration && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium text-center">
                Please select at least one topic to generate questions.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* EMBEDDED QUESTION PREVIEW & BANK WORKSPACE */}
      <div id="assessment-preview-section" ref={previewRef} className="w-full pt-4">
        <PreviewQuestionsTab
          generatedQuestions={generatedQuestions}
          setGeneratedQuestions={setGeneratedQuestions}
          generationProgress={generationProgress}
          isGenerating={isGenerating}
          onSave={onSave}
          onSaveAssessment={onSaveAssessment}
          onSaveAndAssign={onSaveAndAssign}
          savedAssessments={savedAssessments}
          showToast={showToast}
        />
      </div>

    </div>
  );
};

export default CreateAssessmentTab;
