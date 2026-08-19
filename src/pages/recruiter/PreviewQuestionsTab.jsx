import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Clock,
  Award,
  Search,
  X,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  Copy,
  Check,
  Play,
  Terminal,
  Sparkles,
  BookOpen,
  RefreshCw,
  AlertCircle,
  Loader2,
  Save,
  UserPlus,
  HelpCircle,
  Code2,
  Database,
  Brain,
  SlidersHorizontal,
  ChevronRight
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
        <span>{children}</span>
      </>
    )}
  </button>
);

// High-fidelity syntax highlighter for code snippets
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
        tokens.push(<span key={match.index} className="text-blue-600 dark:text-blue-400 font-bold uppercase">{groups.keyword}</span>);
      } else if (groups.func) {
        tokens.push(<span key={match.index} className="text-purple-600 dark:text-purple-400 font-semibold uppercase">{groups.func}</span>);
      } else if (groups.number) {
        tokens.push(<span key={match.index} className="text-amber-600 dark:text-amber-400 font-medium">{groups.number}</span>);
      } else {
        tokens.push(groups.other);
      }
    }
    return <pre className="font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap text-slate-800 dark:text-slate-200">{tokens}</pre>;
  }

  return <pre className="font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap text-slate-800 dark:text-slate-200">{code}</pre>;
};

const ProgressiveGenerationBanner = ({ generationProgress }) => {
  if (!generationProgress || !generationProgress.active) return null;

  const { topics, statusMessage, overallPercent, completedTopicsCount, totalTopicsCount } = generationProgress;

  return (
    <div className="w-full bg-slate-900 dark:bg-slate-950 border border-indigo-500/30 rounded-3xl p-5 shadow-lg text-white mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <h4 className="font-outfit font-extrabold text-sm text-white tracking-wide">
              AI Progressive Assessment Generation
            </h4>
            <p className="text-[11px] font-semibold text-indigo-200/80">
              {statusMessage || "Generating questions topic by topic..."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10 shrink-0">
          <span className="text-xs font-black text-indigo-300">{overallPercent}%</span>
          <span className="text-[10px] font-bold text-slate-300">({completedTopicsCount}/{totalTopicsCount} Topics)</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden mb-4 border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
          style={{ width: `${overallPercent}%` }}
        />
      </div>

      {/* Topic Status Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {topics && topics.map((t, idx) => {
          const isDone = t.status === 'completed';
          const isCurrent = t.status === 'generating';
          const isFail = t.status === 'failed';

          let chipBg = 'bg-slate-800/80 border-slate-700 text-slate-400';
          if (isDone) chipBg = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold';
          else if (isCurrent) chipBg = 'bg-indigo-500/30 border-indigo-400/60 text-white font-bold ring-2 ring-indigo-500/30 animate-pulse';
          else if (isFail) chipBg = 'bg-rose-500/20 border-rose-500/40 text-rose-300';

          return (
            <div key={idx} className={`px-3 py-1 rounded-xl text-xs border flex items-center gap-1.5 transition-all ${chipBg}`}>
              {isDone ? (
                <CheckCircle size={13} className="text-emerald-400" />
              ) : isCurrent ? (
                <Loader2 size={13} className="animate-spin text-indigo-300" />
              ) : isFail ? (
                <AlertCircle size={13} className="text-rose-400" />
              ) : (
                <Clock size={13} className="text-slate-500" />
              )}
              <span>{t.name}</span>
              {t.count > 0 && <span className="text-[10px] opacity-80 font-mono">({t.count} Qs)</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PreviewQuestionsTab = ({
  previewAssessmentId,
  onSelectAssessment,
  showToast,
  generatedQuestions = [],
  setGeneratedQuestions,
  generationProgress,
  isGenerating,
  onSave,
  onSaveAssessment,
  onSaveAndAssign,
  savedAssessments = []
}) => {
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAndAssigning, setIsSavingAndAssigning] = useState(false);

  // Fetch assessment details if previewing an existing assessment from DB
  const fetchAssessmentData = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setFetchError(null);
    try {
      const response = await api.get(`/api/assessment/${id}`);
      if (response.data && response.data.questions) {
        const mappedQuestions = response.data.questions.map((q, idx) => ({
          id: idx + 1,
          subject: q.subject || 'General',
          topic: q.topic || 'General',
          type: q.type || 'MCQ',
          difficulty: q.difficulty || 'Medium',
          scenario: q.scenario || q.problemStatement || '',
          question: q.question,
          q: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          problemStatement: q.problemStatement || q.scenario || '',
          candidateTask: q.candidateTask || '',
          expectedAnswer: q.expectedAnswer || q.correctAnswer || '',
          evaluationCriteria: q.evaluationCriteria || '',
          exampleInput: q.exampleInput || '',
          exampleOutput: q.exampleOutput || '',
          inputFormat: q.inputFormat || '',
          outputFormat: q.outputFormat || '',
          sampleInput: q.sampleInput || '',
          sampleOutput: q.sampleOutput || '',
          constraints: q.constraints || [],
          hiddenTestCases: q.hiddenTestCases || [],
          marks: q.marks || (q.type === 'MCQ' ? 1 : 10),
          estimatedTime: q.estimatedTime || (q.type === 'MCQ' ? '2 Minutes' : '15 Minutes'),
          databaseSchema: q.databaseSchema || null,
          sampleData: q.sampleData || null
        }));

        setGeneratedQuestions(mappedQuestions);
        if (mappedQuestions.length > 0) {
          setSelectedId(mappedQuestions[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch assessment questions:", err);
      setFetchError(err.response?.data?.detail || err.message || "Failed to load assessment.");
    } finally {
      setLoading(false);
    }
  }, [setGeneratedQuestions]);

  useEffect(() => {
    if (previewAssessmentId) {
      fetchAssessmentData(previewAssessmentId);
    } else if (generatedQuestions && generatedQuestions.length > 0) {
      if (!selectedId || !generatedQuestions.some(q => q.id === selectedId)) {
        setSelectedId(generatedQuestions[0].id);
      }
    }
  }, [previewAssessmentId, fetchAssessmentData, generatedQuestions, selectedId]);

  // Edit form state
  const [editForm, setEditForm] = useState({
    subject: '',
    topic: '',
    type: 'MCQ',
    difficulty: '',
    estimatedTime: '',
    problemStatement: '',
    exampleInput: '',
    exampleOutput: '',
    constraints: '',
    expectedAnswer: '',
    explanation: '',
    question: '',
    options: '',
    correctAnswer: '',
    inputFormat: '',
    outputFormat: '',
    sampleInput: '',
    sampleOutput: '',
    hiddenTestCases: '[]',
    marks: 10
  });

  const selectedQuestion = generatedQuestions?.find(q => q.id === selectedId) || generatedQuestions?.[0];

  // Sync edit form when selected question changes
  useEffect(() => {
    if (selectedQuestion) {
      const isCoding = selectedQuestion.type?.includes('CODING') || selectedQuestion.type === 'SCENARIO_CODING' || selectedQuestion.type === 'SCENARIO';
      setEditForm({
        subject: selectedQuestion.subject || '',
        topic: selectedQuestion.topic || '',
        type: selectedQuestion.type || 'MCQ',
        difficulty: selectedQuestion.difficulty || 'Medium',
        estimatedTime: selectedQuestion.estimatedTime || (isCoding ? '15 Minutes' : '5 Minutes'),
        problemStatement: selectedQuestion.problemStatement || selectedQuestion.question || selectedQuestion.scenario || '',
        exampleInput: selectedQuestion.exampleInput || '',
        exampleOutput: selectedQuestion.exampleOutput || '',
        constraints: selectedQuestion.constraints ? selectedQuestion.constraints.join(', ') : '',
        expectedAnswer: selectedQuestion.expectedAnswer || selectedQuestion.correctAnswer || '',
        explanation: selectedQuestion.explanation || '',
        question: selectedQuestion.question || '',
        options: selectedQuestion.options ? selectedQuestion.options.join(', ') : '',
        correctAnswer: selectedQuestion.correctAnswer || '',
        inputFormat: selectedQuestion.inputFormat || '',
        outputFormat: selectedQuestion.outputFormat || '',
        sampleInput: selectedQuestion.sampleInput || '',
        sampleOutput: selectedQuestion.sampleOutput || '',
        hiddenTestCases: selectedQuestion.hiddenTestCases ? JSON.stringify(selectedQuestion.hiddenTestCases, null, 2) : '[]',
        marks: selectedQuestion.marks || (selectedQuestion.type === 'MCQ' ? 1 : 10)
      });
      setIsEditing(false);
    }
  }, [selectedId, selectedQuestion]);

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast("Code copied to clipboard!");
  };

  const handleDifficultyChange = (qId, newDiff) => {
    setGeneratedQuestions(prev => prev.map(q => q.id === qId ? { ...q, difficulty: newDiff } : q));
    showToast(`Updated difficulty to ${newDiff}`);
  };

  const handleDeleteQuestion = (qId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this question?");
    if (!confirmDelete) return;

    const remaining = generatedQuestions.filter(q => q.id !== qId);
    setGeneratedQuestions(remaining);
    showToast("Question deleted from pool.");

    if (remaining.length > 0) {
      setSelectedId(remaining[0].id);
    } else {
      setSelectedId(null);
    }
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    let parsedHiddenTestCases = [];
    try {
      parsedHiddenTestCases = JSON.parse(editForm.hiddenTestCases || '[]');
    } catch {
      showToast("Invalid JSON syntax in Hidden Test Cases.");
      return;
    }

    setGeneratedQuestions(prev => prev.map(q => {
      if (q.id === selectedId) {
        const isCoding = editForm.type?.includes('CODING') || editForm.type === 'SCENARIO_CODING' || editForm.type === 'SCENARIO';
        return {
          ...q,
          subject: editForm.subject,
          topic: editForm.topic,
          type: editForm.type,
          difficulty: editForm.difficulty,
          estimatedTime: editForm.estimatedTime,
          question: isCoding ? editForm.problemStatement : editForm.question,
          problemStatement: editForm.problemStatement,
          exampleInput: editForm.exampleInput,
          exampleOutput: editForm.exampleOutput,
          constraints: editForm.constraints ? editForm.constraints.split(',').map(s => s.trim()).filter(Boolean) : [],
          expectedAnswer: editForm.expectedAnswer,
          correctAnswer: editForm.correctAnswer || editForm.expectedAnswer,
          explanation: editForm.explanation,
          options: editForm.options ? editForm.options.split(',').map(s => s.trim()).filter(Boolean) : [],
          inputFormat: editForm.inputFormat,
          outputFormat: editForm.outputFormat,
          sampleInput: editForm.sampleInput,
          sampleOutput: editForm.sampleOutput,
          hiddenTestCases: parsedHiddenTestCases,
          marks: parseFloat(editForm.marks) || (editForm.type === 'MCQ' ? 1 : 10)
        };
      }
      return q;
    }));
    setIsEditing(false);
    showToast("Changes saved successfully!");
  };

  // Loading state render
  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full animate-fade-in text-slate-800 dark:text-slate-100">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center text-center my-auto min-h-[380px]">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
            <RefreshCw size={28} className="animate-spin" />
          </div>
          <h3 className="font-outfit font-extrabold text-lg text-slate-900 dark:text-slate-100 mb-2">
            Loading Assessment Preview...
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-md leading-relaxed">
            Fetching latest assessment questions and configuration dynamically from the database.
          </p>
        </div>
      </div>
    );
  }

  // Error state render
  if (fetchError) {
    return (
      <div className="flex flex-col gap-6 w-full animate-fade-in text-slate-800 dark:text-slate-100">
        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center text-center my-auto min-h-[380px]">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-500 mb-4 shadow-sm">
            <AlertCircle size={28} />
          </div>
          <h3 className="font-outfit font-extrabold text-lg text-rose-900 dark:text-rose-300 mb-2">
            Unable to Load Assessment
          </h3>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mb-5 max-w-md">
            {fetchError}
          </p>
          <button
            onClick={() => fetchAssessmentData(previewAssessmentId || savedAssessments?.[0]?.id)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2 cursor-pointer border-none"
          >
            <RefreshCw size={14} />
            <span>Retry Loading</span>
          </button>
        </div>
      </div>
    );
  }

  // Empty state only when not actively generating and no questions exist
  if ((!generatedQuestions || generatedQuestions.length === 0) && (!generationProgress || !generationProgress.active)) {
    return (
      <div className="flex flex-col gap-6 w-full animate-fade-in text-slate-800 dark:text-slate-100">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center text-center my-auto min-h-[380px]">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
            <FileText size={32} />
          </div>
          <h3 className="font-outfit font-extrabold text-lg text-slate-900 dark:text-slate-100 mb-2">
            No Assessment Questions Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-md leading-relaxed">
            Configure topics above and click 'Generate with AI' to stream questions here live.
          </p>
        </div>
      </div>
    );
  }

  const totalMarks = (generatedQuestions || []).reduce((sum, q) => sum + (q.marks || (q.type === 'MCQ' ? 1 : 10)), 0);

  const filteredQuestions = (generatedQuestions || []).filter(q => {
    const query = searchQuery.toLowerCase();
    const qText = (q.question || q.problemStatement || '').toLowerCase();
    const qSub = (q.subject || '').toLowerCase();
    const qTopic = (q.topic || '').toLowerCase();
    return qText.includes(query) || qSub.includes(query) || qTopic.includes(query);
  });

  const handleSaveAction = async (andAssign = false) => {
    const saveFunc = onSaveAssessment || onSave;
    if (saveFunc) {
      if (andAssign) setIsSavingAndAssigning(true);
      else setIsSaving(true);

      try {
        await saveFunc(andAssign);
      } finally {
        setIsSaving(false);
        setIsSavingAndAssigning(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {generationProgress && generationProgress.active && (
        <ProgressiveGenerationBanner generationProgress={generationProgress} />
      )}

      {/* Assessment Question Pool Sub-Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 px-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Question Bank Preview
            </span>
            {savedAssessments && savedAssessments.length > 0 && (
              <select
                value={previewAssessmentId || (savedAssessments[0]?.id || '')}
                onChange={(e) => {
                  if (onSelectAssessment) onSelectAssessment(e.target.value);
                  fetchAssessmentData(e.target.value);
                }}
                className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-1 px-3 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {savedAssessments.map(asm => (
                  <option key={asm.id} value={asm.id}>
                    {asm.name} ({asm.questions_count || asm.questions?.length || 0} Qs)
                  </option>
                ))}
              </select>
            )}
          </div>
          <h3 className="font-outfit font-extrabold text-base text-slate-900 dark:text-slate-50">
            Generated Questions Pool ({generatedQuestions.length} Questions)
          </h3>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            <span className="flex items-center gap-1 font-mono">
              <Award size={13} className="text-indigo-500" />
              <span>{totalMarks} Total Marks</span>
            </span>
            <span>•</span>
            <span>{generatedQuestions.filter(q => q.type === 'MCQ').length} MCQs</span>
            <span>•</span>
            <span>{generatedQuestions.filter(q => q.type !== 'MCQ').length} Scenarios</span>
          </div>
        </div>

        {/* Global Save Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <ActionButton
            onClick={() => handleSaveAction(false)}
            isLoading={isSaving}
            loadingText="Saving..."
            disabled={generatedQuestions.length === 0}
            icon={Save}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md border-none cursor-pointer"
          >
            Save Assessment
          </ActionButton>
        </div>
      </div>

      {/* 2-Column Question Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
        
        {/* LEFT PANEL: QUESTION LIST POOL (4 COLS) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-4 min-h-[450px] lg:h-[740px]">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <h3 className="font-outfit font-extrabold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Question Index
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              {generatedQuestions.length} Qs
            </span>
          </div>

          {/* Search Question Bar */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-indigo-500" size={14} />
            <input
              type="text"
              placeholder="Filter by question, topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Question List container */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 dashboard-scrollbar">
            {filteredQuestions.map((q) => {
              const isSelected = q.id === selectedId;
              const actualIndex = generatedQuestions.findIndex(item => item.id === q.id) + 1;
              const isCoding = q.type?.includes('CODING') || q.type === 'SCENARIO_CODING' || q.type === 'SCENARIO';

              let diffBadge = 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
              if (q.difficulty === 'Medium') diffBadge = 'text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20';
              else if (q.difficulty === 'Hard') diffBadge = 'text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/20';

              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedId(q.id)}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-200 group ${
                    isSelected
                      ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs ring-1 ring-indigo-500/20'
                      : 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-extrabold font-outfit uppercase tracking-wider ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      #{actualIndex} ({q.type || (isCoding ? 'Scenario' : 'MCQ')})
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${diffBadge}`}>
                        {q.difficulty || 'Medium'}
                      </span>
                      <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {q.marks || (q.type === 'MCQ' ? 1 : 10)}M
                      </span>
                    </div>
                  </div>

                  <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${isSelected ? 'text-slate-900 dark:text-slate-50' : 'text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'} transition-colors`}>
                    {q.question || q.problemStatement}
                  </h4>

                  <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                      {q.subject}
                    </span>
                    <span className="truncate">
                      {q.topic}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Live Streaming Indicator Card */}
            {generationProgress && generationProgress.active && (
              <div className="p-3.5 rounded-2xl border border-dashed border-indigo-500/40 bg-indigo-500/5 dark:bg-indigo-500/10 flex items-center gap-3 animate-pulse">
                <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Loader2 size={15} className="animate-spin" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                    Streaming in Progress
                  </span>
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {generationProgress.statusMessage || "AI is synthesizing next question..."}
                  </p>
                </div>
              </div>
            )}

            {filteredQuestions.length === 0 && (!generationProgress || !generationProgress.active) && (
              <div className="py-12 text-center text-xs text-slate-400 font-medium flex flex-col items-center justify-center gap-2">
                <HelpCircle size={28} className="text-slate-400/60" />
                <span>No questions matching search filter.</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: QUESTION INSPECTOR & EDITOR (8 COLS) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col min-h-[500px] lg:h-[740px] overflow-y-auto">
          {!selectedQuestion ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                {generationProgress && generationProgress.active ? (
                  <Loader2 size={32} className="animate-spin" />
                ) : (
                  <Sparkles size={32} className="animate-pulse" />
                )}
              </div>
              <h3 className="font-outfit font-extrabold text-base text-slate-900 dark:text-slate-100">
                {generationProgress && generationProgress.active
                  ? "Streaming AI Questions..."
                  : "No Question Selected"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5 max-w-sm leading-relaxed">
                {generationProgress && generationProgress.active
                  ? (generationProgress.statusMessage || "Incoming questions will automatically appear on the left pool and open for live preview.")
                  : "Select a question from the pool on the left to preview and customize it."}
              </p>
            </div>
          ) : isEditing ? (
            /* EDIT MODE FORM */
            <form onSubmit={handleSaveChanges} className="flex-1 flex flex-col justify-between gap-5">
              <div className="space-y-4">
                {/* Edit Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold tracking-wider uppercase">Editing Mode</span>
                    <h3 className="font-outfit font-bold text-base text-slate-900 dark:text-slate-100 mt-0.5">
                      Customize Question #{generatedQuestions.findIndex(q => q.id === selectedId) + 1}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer shadow-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>

                {/* Form inputs grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Category (Subject)</label>
                    <input
                      type="text"
                      value={editForm.subject}
                      onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Topic</label>
                    <input
                      type="text"
                      value={editForm.topic}
                      onChange={(e) => setEditForm(prev => ({ ...prev, topic: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Question Type</label>
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="MCQ">Multiple Choice (MCQ)</option>
                      <option value="SCENARIO">Scenario Q&A (Text)</option>
                      <option value="PYTHON_CODING">Python Coding (Sandbox)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Difficulty</label>
                    <select
                      value={editForm.difficulty}
                      onChange={(e) => setEditForm(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Estimated Time</label>
                    <input
                      type="text"
                      value={editForm.estimatedTime}
                      onChange={(e) => setEditForm(prev => ({ ...prev, estimatedTime: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. 15 Minutes"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Marks</label>
                    <input
                      type="number"
                      value={editForm.marks}
                      onChange={(e) => setEditForm(prev => ({ ...prev, marks: parseInt(e.target.value, 10) || 0 }))}
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>

                {/* Problem statement / Question block */}
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Problem Statement / Question Context</label>
                  <textarea
                    rows="3"
                    value={editForm.problemStatement}
                    onChange={(e) => setEditForm(prev => ({ ...prev, problemStatement: e.target.value, question: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 resize-y"
                    required
                  />
                </div>

                {/* Conditional options for MCQ vs Coding */}
                {editForm.type === 'MCQ' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Options (comma-separated list)</label>
                      <input
                        type="text"
                        value={editForm.options}
                        onChange={(e) => setEditForm(prev => ({ ...prev, options: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        placeholder="yield, return, async, lambda"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Correct Answer</label>
                      <input
                        type="text"
                        value={editForm.correctAnswer}
                        onChange={(e) => setEditForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Example Input</label>
                        <input
                          type="text"
                          value={editForm.exampleInput}
                          onChange={(e) => setEditForm(prev => ({ ...prev, exampleInput: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                          placeholder="e.g. madam"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Example Output</label>
                        <input
                          type="text"
                          value={editForm.exampleOutput}
                          onChange={(e) => setEditForm(prev => ({ ...prev, exampleOutput: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                          placeholder="e.g. True"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Expected Answer / Solution Code</label>
                      <textarea
                        rows="4"
                        value={editForm.expectedAnswer}
                        onChange={(e) => setEditForm(prev => ({ ...prev, expectedAnswer: e.target.value, correctAnswer: e.target.value }))}
                        className="w-full bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500 resize-y"
                        placeholder="SELECT ... or def solution(): ..."
                      />
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Explanation</label>
                  <textarea
                    rows="2"
                    value={editForm.explanation}
                    onChange={(e) => setEditForm(prev => ({ ...prev, explanation: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 resize-y"
                  />
                </div>
              </div>

              {/* Bottom edit buttons */}
              <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer shadow-md"
                >
                  Save Question Changes
                </button>
              </div>
            </form>
          ) : (
            /* HIGH-FIDELITY PREVIEW CARD VIEW */
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-5 relative">
                
                {/* Preview Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold tracking-widest uppercase font-outfit">
                      Question {generatedQuestions.findIndex(q => q.id === selectedId) + 1} of {generatedQuestions.length} ({selectedQuestion?.type || 'MCQ'})
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-outfit font-extrabold text-base text-slate-900 dark:text-slate-50">
                        {selectedQuestion?.topic || 'Question Details'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl">
                      <BookOpen size={12} className="text-indigo-500" />
                      {selectedQuestion?.subject}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl">
                      <Clock size={12} className="text-indigo-500" />
                      {selectedQuestion?.estimatedTime || '15 Minutes'}
                    </span>
                  </div>
                </div>

                {/* Metadata Cards Grid */}
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">
                      Question No
                    </span>
                    <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-slate-100">
                      #{generatedQuestions.findIndex(q => q.id === selectedId) + 1}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">
                      Type
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {selectedQuestion?.type || 'MCQ'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">
                      Marks
                    </span>
                    <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-slate-100">
                      {selectedQuestion?.marks || (selectedQuestion?.type === 'MCQ' ? 1 : 10)} Marks
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">
                      Difficulty
                    </span>
                    <div className="flex items-center gap-1">
                      {['Easy', 'Medium', 'Hard'].map((lvl) => {
                        const isActive = selectedQuestion?.difficulty === lvl;
                        let activeStyle = 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200';
                        if (isActive) {
                          if (lvl === 'Easy') activeStyle = 'bg-emerald-500 text-white font-bold shadow-xs';
                          else if (lvl === 'Medium') activeStyle = 'bg-amber-500 text-white font-bold shadow-xs';
                          else if (lvl === 'Hard') activeStyle = 'bg-rose-500 text-white font-bold shadow-xs';
                        }

                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleDifficultyChange(selectedQuestion?.id, lvl)}
                            className={`px-2 py-0.5 rounded-md text-[10px] transition-all border-none cursor-pointer ${activeStyle}`}
                          >
                            {lvl[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="space-y-4">
                  {/* Problem Statement */}
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Question / Problem Statement
                    </h4>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-relaxed bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl select-text">
                      {selectedQuestion?.problemStatement || selectedQuestion?.question || selectedQuestion?.scenario}
                    </p>
                  </div>

                  {/* MCQ Options Display */}
                  {!(selectedQuestion?.type?.includes('CODING') || selectedQuestion?.type === 'SCENARIO_CODING' || selectedQuestion?.type === 'SCENARIO') && selectedQuestion?.options?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        Options & Answer Choices
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {selectedQuestion.options.map((opt, idx) => {
                          const isCorrect = opt === selectedQuestion.correctAnswer;
                          const label = ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;
                          return (
                            <div
                              key={idx}
                              className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                                isCorrect
                                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {isCorrect ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0 flex items-center justify-center font-mono font-bold text-[9px] text-slate-400">
                                  {label}
                                </div>
                              )}
                              <span className="text-xs font-semibold leading-relaxed">
                                {opt}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Example Input / Output for Coding / Scenario */}
                  {selectedQuestion?.subject?.toUpperCase() !== 'APTITUDE' && (selectedQuestion?.exampleInput || selectedQuestion?.exampleOutput || selectedQuestion?.sampleInput || selectedQuestion?.sampleOutput) && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        Sample Input & Output
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Input</span>
                          <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-200 flex items-center gap-2">
                            <Terminal size={12} className="text-slate-500 shrink-0" />
                            <span className="select-text whitespace-pre-wrap">{selectedQuestion?.exampleInput || selectedQuestion?.sampleInput || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Output</span>
                          <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-emerald-400 flex items-center gap-2">
                            <Play size={12} className="text-emerald-500 shrink-0" />
                            <span className="select-text whitespace-pre-wrap">{selectedQuestion?.exampleOutput || selectedQuestion?.sampleOutput || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expected Answer Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {selectedQuestion?.type === 'MCQ' ? 'Correct Answer' : 'Expected Solution / Query'}
                      </h4>
                      {selectedQuestion?.expectedAnswer && (
                        <button
                          onClick={() => handleCopyCode(selectedQuestion.expectedAnswer, selectedQuestion.id)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === selectedQuestion?.id ? (
                            <>
                              <Check size={11} strokeWidth={3} className="text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {selectedQuestion?.type === 'MCQ' ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-xl p-3.5 font-semibold text-xs flex items-center gap-2">
                        <CheckCircle className="text-emerald-500 shrink-0" size={16} />
                        <span>{selectedQuestion.correctAnswer}</span>
                      </div>
                    ) : selectedQuestion?.subject?.toUpperCase() === 'APTITUDE' ? (
                      <div className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 rounded-xl p-4 font-bold text-sm flex items-center gap-2.5">
                        <CheckCircle className="text-indigo-600 dark:text-indigo-400 shrink-0" size={18} />
                        <span className="select-text">{selectedQuestion?.expectedAnswer || selectedQuestion?.correctAnswer}</span>
                      </div>
                    ) : (
                      <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-hidden shadow-inner border-l-4 border-l-indigo-500 relative">
                        <div className="absolute right-3.5 top-3.5 text-[9px] font-bold text-slate-500 font-mono uppercase tracking-wider select-none">
                          {selectedQuestion?.subject?.toLowerCase() === 'sql' ? 'sql' : 'python'}
                        </div>
                        <SyntaxHighlighter
                          code={selectedQuestion?.expectedAnswer || selectedQuestion?.correctAnswer || '# Solution code'}
                          language={selectedQuestion?.subject?.toLowerCase() === 'sql' ? 'sql' : 'python'}
                        />
                      </div>
                    )}
                  </div>

                  {/* Explanation */}
                  {selectedQuestion?.explanation && (
                    <div className="space-y-1.5 pb-2">
                      <h4 className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        Explanation & Rationale
                      </h4>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 select-text">
                        {selectedQuestion.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer bg-white dark:bg-slate-900"
                >
                  <Edit3 size={13} />
                  <span>Edit Question</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(selectedQuestion?.id)}
                  className="flex-1 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:border-rose-300 bg-rose-50/40 dark:bg-rose-950/30 hover:bg-rose-50 text-rose-600 dark:text-rose-400 font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Delete Question"
                >
                  <Trash2 size={13} />
                  <span>Delete Question</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewQuestionsTab;
