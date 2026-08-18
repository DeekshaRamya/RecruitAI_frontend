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
  HelpCircle
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
        tokens.push(<span key={match.index} className="text-[#94a3b8] italic">{groups.comment}</span>);
      } else if (groups.string) {
        tokens.push(<span key={match.index} className="text-[#10b981] font-medium">{groups.string}</span>);
      } else if (groups.keyword) {
        tokens.push(<span key={match.index} className="text-[#8b5cf6] font-bold">{groups.keyword}</span>);
      } else if (groups.func) {
        tokens.push(<span key={match.index} className="text-[#3b82f6] font-semibold">{groups.func}</span>);
      } else if (groups.number) {
        tokens.push(<span key={match.index} className="text-[#f59e0b] font-medium">{groups.number}</span>);
      } else {
        tokens.push(groups.other);
      }
    }
    return <pre className="font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap text-[#0f172a]">{tokens}</pre>;
  }

  if (lang === 'sql') {
    const combinedRegex = new RegExp(
      `(?<comment>--.*)|(?<string>'(?:\\\\.|[^'\\\\])*')|(?<keyword>\\b(?:SELECT|FROM|WHERE|GROUP\\s+BY|HAVING|ORDER\\s+BY|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|AS|IN|LIKE|IS|NULL|LIMIT|OFFSET)\\b)|(?<func>\\b(?:COUNT|SUM|AVG|MIN|MAX|COALESCE|CONCAT|NOW|DATE|ROW_NUMBER|DENSE_RANK)\\b)|(?<number>\\b\\d+\\b)|(?<other>[\\s\\S])`,
      'gi'
    );

    const tokens = [];
    let match;
    while ((match = combinedRegex.exec(code)) !== null) {
      const groups = match.groups;
      if (groups.comment) {
        tokens.push(<span key={match.index} className="text-[#94a3b8] italic">{groups.comment}</span>);
      } else if (groups.string) {
        tokens.push(<span key={match.index} className="text-[#10b981] font-medium">{groups.string}</span>);
      } else if (groups.keyword) {
        tokens.push(<span key={match.index} className="text-[#2563eb] font-bold uppercase">{groups.keyword}</span>);
      } else if (groups.func) {
        tokens.push(<span key={match.index} className="text-[#8b5cf6] font-semibold uppercase">{groups.func}</span>);
      } else if (groups.number) {
        tokens.push(<span key={match.index} className="text-[#f59e0b] font-medium">{groups.number}</span>);
      } else {
        tokens.push(groups.other);
      }
    }
    return <pre className="font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap text-[#0f172a]">{tokens}</pre>;
  }

  return <pre className="font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap text-[#0f172a]">{code}</pre>;
};

const ProgressiveGenerationBanner = ({ generationProgress }) => {
  if (!generationProgress || !generationProgress.active) return null;

  const { topics, statusMessage, overallPercent, completedTopicsCount, totalTopicsCount } = generationProgress;

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-[22px] p-5 shadow-lg text-white mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <h4 className="font-outfit font-extrabold text-sm text-white tracking-wide">
              AI Progressive Assessment Generation
            </h4>
            <p className="text-[11px] font-semibold text-purple-200/80">
              {statusMessage || "Generating questions topic by topic..."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10 shrink-0">
          <span className="text-xs font-black text-purple-300">{overallPercent}%</span>
          <span className="text-[10px] font-bold text-slate-300">({completedTopicsCount}/{totalTopicsCount} Topics)</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden mb-4 border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(168,85,247,0.5)]"
          style={{ width: `${overallPercent}%` }}
        />
      </div>

      {/* Topic Status Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {topics && topics.map((t, idx) => {
          const isDone = t.status === 'completed';
          const isGenerating = t.status === 'generating';
          const isFailed = t.status === 'failed';

          return (
            <div
              key={idx}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${isDone
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : isGenerating
                  ? 'bg-purple-500/25 text-purple-200 border border-purple-400/50 animate-pulse shadow-md'
                  : isFailed
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-slate-800/60 text-slate-400 border border-slate-700/50'
                }`}
            >
              {isDone && <CheckCircle size={13} className="text-emerald-400" />}
              {isGenerating && <Loader2 size={13} className="animate-spin text-purple-300" />}
              {isFailed && <AlertCircle size={13} className="text-red-400" />}
              {!isDone && !isGenerating && !isFailed && <Clock size={13} className="text-slate-400" />}

              <span>{t.name}</span>
              {isDone && <span className="text-[10px] opacity-85">✓ ({t.count} Qs)</span>}
              {isGenerating && <span className="text-[10px] opacity-90">⏳ Generating...</span>}
              {isFailed && <span className="text-[10px] opacity-90">❌</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PreviewQuestionsTab = ({
  previewAssessmentId,
  savedAssessments,
  generatedQuestions,
  setGeneratedQuestions,
  generationProgress,
  showToast,
  onSave,
  onSaveAndAssign,
  onSelectAssessment
}) => {
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Dynamic assessment data fetching from backend
  const fetchAssessmentData = useCallback(async (asmId) => {
    if (!asmId) return;
    setLoading(true);
    setFetchError(null);
    try {
      const res = await api.get(`/api/assessment/${asmId}?t=${Date.now()}`);
      if (res.data) {
        setActiveAssessment(res.data);
        if (res.data.questions && Array.isArray(res.data.questions)) {
          const formatted = res.data.questions.map((q, idx) => ({
            id: idx + 1,
            subject: q.subject || (res.data.subjects?.[0] || 'General'),
            topic: q.topic || 'General',
            type: q.type || 'MCQ',
            difficulty: q.difficulty || res.data.difficulty || 'Medium',
            scenario: q.scenario || q.problemStatement || '',
            question: q.question || q.problemStatement || '',
            options: q.options || [],
            correctAnswer: q.correctAnswer || '',
            explanation: q.explanation || '',
            problemStatement: q.problemStatement || q.scenario || '',
            candidateTask: q.candidateTask || '',
            expectedAnswer: q.expectedAnswer || q.correctAnswer || '',
            exampleInput: q.exampleInput || '',
            exampleOutput: q.exampleOutput || '',
            inputFormat: q.inputFormat || '',
            outputFormat: q.outputFormat || '',
            sampleInput: q.sampleInput || '',
            sampleOutput: q.sampleOutput || '',
            constraints: q.constraints || [],
            marks: q.marks || (q.type === 'MCQ' ? 1 : 10),
            estimatedTime: q.estimatedTime || (q.type === 'MCQ' ? '2 Minutes' : '15 Minutes')
          }));
          setGeneratedQuestions(formatted);
          if (formatted.length > 0) setSelectedId(formatted[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching assessment details:", err);
      setFetchError(err.response?.data?.detail || "Failed to load assessment data from server.");
    } finally {
      setLoading(false);
    }
  }, [setGeneratedQuestions]);

  useEffect(() => {
    const targetId = previewAssessmentId || (savedAssessments && savedAssessments.length > 0 ? savedAssessments[0].id : null);
    if (targetId) {
      fetchAssessmentData(targetId);
    } else if (generatedQuestions && generatedQuestions.length > 0 && !selectedId) {
      setSelectedId(generatedQuestions[0].id);
    }
  }, [previewAssessmentId, fetchAssessmentData, savedAssessments, generatedQuestions, selectedId]);

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
          explanation: editForm.explanation,
          options: editForm.options ? editForm.options.split(',').map(s => s.trim()).filter(Boolean) : [],
          correctAnswer: editForm.correctAnswer,
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
      <div className="flex flex-col gap-6 w-full animate-fade-in">
        <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-12 shadow-sm flex flex-col items-center justify-center text-center my-auto min-h-[420px]">
          <div className="w-16 h-16 rounded-2xl bg-dash-primary-purple/10 border border-dash-primary-purple/20 flex items-center justify-center text-dash-primary-purple mb-4 shadow-sm">
            <RefreshCw size={32} className="animate-spin" />
          </div>
          <h3 className="font-outfit font-extrabold text-lg sm:text-xl text-dash-dark-purple mb-2">
            Loading Assessment Preview...
          </h3>
          <p className="text-xs sm:text-sm text-dash-light-purple font-semibold max-w-md leading-relaxed">
            Fetching latest assessment questions and configuration dynamically from the database.
          </p>
        </div>
      </div>
    );
  }

  // Error state render
  if (fetchError) {
    return (
      <div className="flex flex-col gap-6 w-full animate-fade-in">
        <div className="bg-dash-white-card border border-red-200 rounded-[24px] p-12 shadow-sm flex flex-col items-center justify-center text-center my-auto min-h-[420px]">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500 mb-4 shadow-sm">
            <AlertCircle size={32} />
          </div>
          <h3 className="font-outfit font-extrabold text-lg sm:text-xl text-red-900 mb-2">
            Failed to Load Assessment
          </h3>
          <p className="text-xs sm:text-sm text-red-600 font-semibold max-w-md leading-relaxed mb-6">
            {fetchError}
          </p>
          <button
            onClick={() => fetchAssessmentData(previewAssessmentId || savedAssessments?.[0]?.id)}
            className="px-5 py-2.5 rounded-xl bg-dash-primary-purple text-white font-bold text-xs hover:bg-dash-dark-purple transition-all shadow-md flex items-center gap-2 cursor-pointer border-none"
          >
            <RefreshCw size={15} />
            <span>Retry Loading</span>
          </button>
        </div>
      </div>
    );
  }

  // Empty state when no questions/assessments exist
  if (!generatedQuestions || generatedQuestions.length === 0) {
    if (generationProgress && generationProgress.active) {
      return (
        <div className="flex flex-col gap-6 w-full animate-fade-in">
          <ProgressiveGenerationBanner generationProgress={generationProgress} />
          <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-12 shadow-[0_4px_20px_rgba(87,82,170,0.03)] flex flex-col items-center justify-center text-center my-auto min-h-[360px]">
            <Loader2 size={40} className="animate-spin text-dash-primary-purple mb-4" />
            <h3 className="font-outfit font-extrabold text-lg sm:text-xl text-dash-dark-purple mb-2">
              Generating Initial Questions...
            </h3>
            <p className="text-xs sm:text-sm text-dash-light-purple font-semibold max-w-md leading-relaxed">
              {generationProgress.statusMessage || "AI is generating the first topic's questions. Results will appear here instantly once ready..."}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6 w-full animate-fade-in">
        <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-12 shadow-[0_4px_20px_rgba(87,82,170,0.03)] flex flex-col items-center justify-center text-center my-auto min-h-[420px]">
          <div className="w-16 h-16 rounded-2xl bg-dash-primary-purple/10 border border-dash-primary-purple/20 flex items-center justify-center text-dash-primary-purple mb-4 shadow-sm">
            <FileText size={32} />
          </div>
          <h3 className="font-outfit font-extrabold text-lg sm:text-xl text-dash-dark-purple mb-2">
            No Assessment Preview
          </h3>
          <p className="text-xs sm:text-sm text-dash-light-purple font-semibold max-w-md leading-relaxed">
            No assessment created yet. Create and save an assessment to preview the generated questions.
          </p>
        </div>
      </div>
    );
  }

  const totalMarks = generatedQuestions.reduce((sum, q) => sum + (q.marks || (q.type === 'MCQ' ? 1 : 10)), 0);

  const filteredQuestions = generatedQuestions.filter(q => {
    const query = searchQuery.toLowerCase();
    const qText = (q.question || q.problemStatement || '').toLowerCase();
    const qSub = (q.subject || '').toLowerCase();
    const qTopic = (q.topic || '').toLowerCase();
    return qText.includes(query) || qSub.includes(query) || qTopic.includes(query);
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {generationProgress && generationProgress.active && (
        <ProgressiveGenerationBanner generationProgress={generationProgress} />
      )}
      {/* Assessment Question Pool Sub-Header */}
      <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-5 px-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold text-dash-primary-purple bg-dash-primary-purple/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Assessment Preview Mode
            </span>
            {savedAssessments && savedAssessments.length > 0 && (
              <select
                value={previewAssessmentId || (savedAssessments[0]?.id || '')}
                onChange={(e) => {
                  if (onSelectAssessment) onSelectAssessment(e.target.value);
                  fetchAssessmentData(e.target.value);
                }}
                className="bg-dash-white-card border border-dash-border-gray/70 rounded-xl py-1 px-3 text-xs font-bold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple cursor-pointer"
              >
                {savedAssessments.map(asm => (
                  <option key={asm.id} value={asm.id}>
                    {asm.name} ({asm.questions_count || asm.questions?.length || 0} Qs)
                  </option>
                ))}
              </select>
            )}
          </div>
          <h3 className="font-outfit font-extrabold text-base text-dash-dark-purple">
            {activeAssessment?.name || 'Assessment Question Pool Preview'}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-semibold text-dash-light-purple">
            <span className="flex items-center gap-1 bg-dash-light-blue-bg border border-dash-border-gray/40 px-2.5 py-0.5 rounded-lg text-dash-dark-purple font-bold">
              <Clock size={12} className="text-dash-primary-purple" />
              {activeAssessment?.duration || '60 minutes'}
            </span>
            <span className="flex items-center gap-1 bg-dash-light-blue-bg border border-dash-border-gray/40 px-2.5 py-0.5 rounded-lg text-dash-dark-purple font-bold">
              <FileText size={12} className="text-dash-primary-purple" />
              {generatedQuestions.length} Questions
            </span>
            <span className="flex items-center gap-1 bg-dash-light-blue-bg border border-dash-border-gray/40 px-2.5 py-0.5 rounded-lg text-dash-dark-purple font-bold">
              <Award size={12} className="text-dash-primary-purple" />
              {totalMarks} Total Marks
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onSave && (
            <ActionButton
              onClick={onSave}
              disabled={generationProgress?.active}
              title={generationProgress?.active ? 'Please wait until all topics are generated' : 'Save assessment'}
              icon={Save}
              iconSize={15}
              className="px-4 py-2.5 rounded-xl border border-dash-border-gray bg-dash-white-card hover:bg-dash-soft-pink text-dash-dark-purple font-bold text-xs shadow-sm"
            >
              Save Assessment
            </ActionButton>
          )}

          {onSaveAndAssign && (
            <ActionButton
              onClick={onSaveAndAssign}
              disabled={generationProgress?.active || generatedQuestions.length === 0}
              isLoading={generationProgress?.active}
              loadingText={`Generating (${generationProgress?.completedTopicsCount || 0}/${generationProgress?.totalTopicsCount || 0})...`}
              title={generationProgress?.active ? 'Please wait until all selected topics have been generated successfully' : 'Save and assign assessment to candidates'}
              icon={UserPlus}
              iconSize={15}
              className="px-4 py-2.5 rounded-xl bg-dash-primary-purple text-dash-white-card font-bold text-xs shadow-md hover:bg-dash-dark-purple border-none"
            >
              Save & Assign
            </ActionButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
        {/* LEFT PANEL: QUESTION LIST POOL */}
        <div className="lg:col-span-4 bg-dash-white-card border border-dash-border-gray rounded-[24px] p-5 shadow-[0_4px_20px_rgba(87,82,170,0.02)] flex flex-col gap-4 min-h-[450px] lg:h-[720px]">
          <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-dash-primary-purple animate-pulse" />
              <h3 className="font-outfit font-extrabold text-sm text-dash-dark-purple uppercase tracking-wider">
                Question Pool
              </h3>
            </div>
            <span className="text-xs font-bold text-dash-primary-purple bg-dash-primary-purple/10 px-2.5 py-0.5 rounded-full border border-dash-primary-purple/10">
              {generatedQuestions.length} Questions
            </span>
          </div>

          {/* Search Question Bar */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-light-purple transition-colors duration-300 group-focus-within:text-dash-primary-purple" size={14} />
            <input
              type="text"
              placeholder="Search question pool..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-dash-dark-purple placeholder-dash-light-purple/60 focus:outline-none focus:border-dash-primary-purple focus:ring-2 focus:ring-dash-primary-purple/5 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-dash-light-purple hover:text-dash-dark-purple">
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

              let diffColor = 'text-green-600 bg-green-50 border-green-200/50';
              if (q.difficulty === 'Medium') diffColor = 'text-amber-600 bg-amber-50 border-amber-200/50';
              else if (q.difficulty === 'Hard') diffColor = 'text-rose-600 bg-rose-50 border-rose-200/50';

              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedId(q.id)}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-300 group ${isSelected
                    ? 'border-dash-primary-purple bg-dash-soft-pink shadow-[0_4px_12px_rgba(87,82,170,0.06)]'
                    : 'border-dash-border-gray/60 bg-dash-white-card hover:bg-dash-soft-pink/50 hover:border-dash-primary-purple/30'
                    }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-extrabold font-outfit uppercase tracking-wider ${isSelected ? 'text-dash-primary-purple' : 'text-dash-light-purple'}`}>
                      Question #{actualIndex} ({q.type || (isCoding ? 'Scenario' : 'MCQ')})
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${diffColor}`}>
                        {q.difficulty || 'Medium'}
                      </span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-dash-primary-purple/10 text-dash-primary-purple">
                        {q.marks || (q.type === 'MCQ' ? 1 : 10)} M
                      </span>
                    </div>
                  </div>

                  <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${isSelected ? 'text-dash-dark-purple' : 'text-dash-dark-purple/80 group-hover:text-dash-primary-purple'} transition-colors`}>
                    {q.question || q.problemStatement}
                  </h4>

                  <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-dash-light-purple">
                    <span className="px-1.5 py-0.5 rounded bg-dash-light-blue-bg border border-dash-border-gray/30 text-dash-dark-purple/70">
                      {q.subject}
                    </span>
                    <span className="truncate">
                      {q.topic}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredQuestions.length === 0 && (
              <div className="py-12 text-center text-xs text-dash-light-purple font-medium flex flex-col items-center justify-center gap-2">
                <HelpCircle size={28} className="text-dash-light-purple/60" />
                <span>No questions found matching criteria.</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: QUESTION PREVIEW CARD & EDIT INTERFACE */}
        <div className="lg:col-span-8 bg-dash-white-card border border-dash-border-gray rounded-[24px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)] flex flex-col min-h-[500px] lg:h-[720px] overflow-y-auto">
          {!selectedQuestion ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-dash-light-blue-bg flex items-center justify-center text-dash-primary-purple mb-4">
                <Sparkles size={32} className="animate-pulse" />
              </div>
              <h3 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple">
                No Question Selected
              </h3>
              <p className="text-xs text-dash-light-purple font-medium mt-1.5 max-w-xs">
                Select a question from the pool on the left to preview and customize it.
              </p>
            </div>
          ) : isEditing ? (
            /* EDIT MODE FORM */
            <form onSubmit={handleSaveChanges} className="flex-1 flex flex-col justify-between gap-5">
              <div className="space-y-4">
                {/* Edit Header */}
                <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-3">
                  <div>
                    <span className="text-[10px] text-dash-primary-purple font-extrabold tracking-wider uppercase">Editing Mode</span>
                    <h3 className="font-outfit font-bold text-base text-dash-dark-purple mt-0.5">
                      Customize Question #{generatedQuestions.findIndex(q => q.id === selectedId) + 1}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3.5 py-1.5 rounded-xl border border-dash-border-gray text-xs font-bold text-dash-dark-purple hover:bg-dash-soft-pink transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-xl bg-dash-primary-purple text-dash-white-card text-xs font-bold hover:bg-dash-dark-purple transition-colors cursor-pointer shadow-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>

                {/* Form inputs grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Category (Subject)</label>
                    <input
                      type="text"
                      value={editForm.subject}
                      onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple focus:ring-1 focus:ring-dash-primary-purple/10"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Topic</label>
                    <input
                      type="text"
                      value={editForm.topic}
                      onChange={(e) => setEditForm(prev => ({ ...prev, topic: e.target.value }))}
                      className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple focus:ring-1 focus:ring-dash-primary-purple/10"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Question Type</label>
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-bold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple"
                    >
                      <option value="MCQ">Multiple Choice (MCQ)</option>
                      <option value="SCENARIO">Scenario Q&A (Text)</option>
                      <option value="PYTHON_CODING">Python Coding (Sandbox)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Difficulty</label>
                    <select
                      value={editForm.difficulty}
                      onChange={(e) => setEditForm(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-bold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Estimated Time</label>
                    <input
                      type="text"
                      value={editForm.estimatedTime}
                      onChange={(e) => setEditForm(prev => ({ ...prev, estimatedTime: e.target.value }))}
                      className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple focus:ring-1 focus:ring-dash-primary-purple/10"
                      placeholder="e.g. 15 Minutes"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Marks</label>
                    <input
                      type="number"
                      value={editForm.marks}
                      onChange={(e) => setEditForm(prev => ({ ...prev, marks: parseInt(e.target.value, 10) || 0 }))}
                      className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple focus:ring-1 focus:ring-dash-primary-purple/10"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>

                {/* Problem statement / Question block */}
                <div>
                  <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Problem Statement / Question Context</label>
                  <textarea
                    rows="3"
                    value={editForm.problemStatement}
                    onChange={(e) => setEditForm(prev => ({ ...prev, problemStatement: e.target.value, question: e.target.value }))}
                    className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple focus:ring-1 focus:ring-dash-primary-purple/10 resize-y"
                    required
                  />
                </div>

                {/* Conditional options for MCQ vs Coding */}
                {editForm.type === 'MCQ' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Options (comma-separated list)</label>
                      <input
                        type="text"
                        value={editForm.options}
                        onChange={(e) => setEditForm(prev => ({ ...prev, options: e.target.value }))}
                        className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple focus:ring-1 focus:ring-dash-primary-purple/10"
                        placeholder="yield, return, async, lambda"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Correct Answer</label>
                      <input
                        type="text"
                        value={editForm.correctAnswer}
                        onChange={(e) => setEditForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                        className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple focus:ring-1 focus:ring-dash-primary-purple/10"
                        required
                      />
                    </div>
                  </div>
                ) : editForm.type === 'PYTHON_CODING' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Input Format</label>
                        <input
                          type="text"
                          value={editForm.inputFormat}
                          onChange={(e) => setEditForm(prev => ({ ...prev, inputFormat: e.target.value }))}
                          className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple focus:ring-1 focus:ring-dash-primary-purple/10"
                          placeholder="e.g. A single string of characters"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Output Format</label>
                        <input
                          type="text"
                          value={editForm.outputFormat}
                          onChange={(e) => setEditForm(prev => ({ ...prev, outputFormat: e.target.value }))}
                          className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple focus:ring-1 focus:ring-dash-primary-purple/10"
                          placeholder="e.g. Print True or False"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Sample Input</label>
                        <textarea
                          rows="2"
                          value={editForm.sampleInput}
                          onChange={(e) => setEditForm(prev => ({ ...prev, sampleInput: e.target.value }))}
                          className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple focus:ring-1 focus:ring-dash-primary-purple/10 resize-y"
                          placeholder="madam"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Sample Output</label>
                        <textarea
                          rows="2"
                          value={editForm.sampleOutput}
                          onChange={(e) => setEditForm(prev => ({ ...prev, sampleOutput: e.target.value }))}
                          className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple focus:ring-1 focus:ring-dash-primary-purple/10 resize-y"
                          placeholder="True"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Constraints (comma-separated list)</label>
                      <input
                        type="text"
                        value={editForm.constraints}
                        onChange={(e) => setEditForm(prev => ({ ...prev, constraints: e.target.value }))}
                        className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple focus:ring-1 focus:ring-dash-primary-purple/10"
                        placeholder="e.g. Length <= 1000, ASCII only"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Expected Correct Code Solution</label>
                      <textarea
                        rows="4"
                        value={editForm.expectedAnswer}
                        onChange={(e) => setEditForm(prev => ({ ...prev, expectedAnswer: e.target.value, correctAnswer: e.target.value }))}
                        className="w-full bg-[#1e1e1e] border border-zinc-800 rounded-xl py-2.5 px-4 text-xs font-mono text-zinc-100 focus:outline-none focus:border-dash-primary-purple transition-all resize-y"
                        placeholder="def solution(): ..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Example Input</label>
                        <input
                          type="text"
                          value={editForm.exampleInput}
                          onChange={(e) => setEditForm(prev => ({ ...prev, exampleInput: e.target.value }))}
                          className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple focus:ring-1 focus:ring-dash-primary-purple/10"
                          placeholder="e.g. madam"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Example Output</label>
                        <input
                          type="text"
                          value={editForm.exampleOutput}
                          onChange={(e) => setEditForm(prev => ({ ...prev, exampleOutput: e.target.value }))}
                          className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple focus:ring-1 focus:ring-dash-primary-purple/10"
                          placeholder="e.g. True"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Constraints (comma-separated list)</label>
                      <input
                        type="text"
                        value={editForm.constraints}
                        onChange={(e) => setEditForm(prev => ({ ...prev, constraints: e.target.value }))}
                        className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple focus:ring-1 focus:ring-dash-primary-purple/10"
                        placeholder="e.g. Length <=1000, Ignore Case, Ignore Spaces"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Expected Answer (Code)</label>
                      <textarea
                        rows="3"
                        value={editForm.expectedAnswer}
                        onChange={(e) => setEditForm(prev => ({ ...prev, expectedAnswer: e.target.value }))}
                        className="w-full bg-[#fafafc] border border-dash-border-gray rounded-xl py-2.5 px-4 text-xs font-mono text-[#0f172a] focus:outline-none focus:border-dash-primary-purple focus:ring-1 focus:ring-dash-primary-purple/10 resize-y"
                      />
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Explanation</label>
                  <textarea
                    rows="2"
                    value={editForm.explanation}
                    onChange={(e) => setEditForm(prev => ({ ...prev, explanation: e.target.value }))}
                    className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple focus:ring-1 focus:ring-dash-primary-purple/10 resize-y"
                  />
                </div>
              </div>

              {/* Bottom edit buttons */}
              <div className="flex items-center gap-3 border-t border-dash-border-gray/25 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 rounded-xl border border-dash-border-gray text-xs font-bold text-dash-dark-purple hover:bg-dash-soft-pink transition-colors cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-dash-primary-purple text-dash-white-card text-xs font-bold hover:bg-dash-dark-purple transition-colors cursor-pointer shadow-[0_4px_12px_rgba(87,82,170,0.15)]"
                >
                  Save Question Changes
                </button>
              </div>
            </form>
          ) : (
            /* HIGH-FIDELITY PREVIEW CARD VIEW */
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-5.5 relative">
                {/* Preview Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-dash-border-gray/25 pb-3">
                  <div>
                    <span className="text-[10px] text-dash-primary-purple font-extrabold tracking-widest uppercase font-outfit">
                      Question {generatedQuestions.findIndex(q => q.id === selectedId) + 1} of {generatedQuestions.length} ({selectedQuestion?.type || 'MCQ'})
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-outfit font-extrabold text-base text-dash-dark-purple">
                        Previewing Question Details
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-dash-light-purple">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-dash-dark-purple/80 bg-dash-light-blue-bg border border-dash-border-gray/30 px-2.5 py-1 rounded-xl">
                      <BookOpen size={12} className="text-dash-primary-purple" />
                      {selectedQuestion?.subject}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-dash-dark-purple/80 bg-dash-light-blue-bg border border-dash-border-gray/30 px-2.5 py-1 rounded-xl">
                      <Clock size={12} className="text-dash-primary-purple" />
                      {selectedQuestion?.estimatedTime || '15 Minutes'}
                    </span>
                  </div>
                </div>

                {/* Metadata Cards Grid */}
                <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray/40 rounded-2xl p-4.5 grid grid-cols-4 gap-4 items-center">
                  <div>
                    <span className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider block mb-1">
                      Question No
                    </span>
                    <span className="text-xs font-extrabold text-dash-dark-purple font-outfit">
                      #{generatedQuestions.findIndex(q => q.id === selectedId) + 1}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider block mb-1">
                      Question Type
                    </span>
                    <span className="text-xs font-extrabold text-dash-primary-purple font-outfit">
                      {selectedQuestion?.type || 'MCQ'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider block mb-1">
                      Marks
                    </span>
                    <span className="text-xs font-extrabold text-dash-dark-purple font-outfit">
                      {selectedQuestion?.marks || (selectedQuestion?.type === 'MCQ' ? 1 : 10)} Marks
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider block mb-1">
                      Est. Duration
                    </span>
                    <span className="text-xs font-extrabold text-dash-dark-purple font-outfit">
                      {selectedQuestion?.estimatedTime || '5 Minutes'}
                    </span>
                  </div>

                  <div className="col-span-4 pt-3.5 mt-1.5 border-t border-dash-border-gray/40 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider">
                      Difficulty Level
                    </span>
                    <div className="flex items-center gap-1 bg-dash-white-card border border-dash-border-gray/80 p-0.5 rounded-lg">
                      {['Easy', 'Medium', 'Hard'].map((lvl) => {
                        const isActive = selectedQuestion?.difficulty === lvl;
                        let activeStyle = '';
                        if (isActive) {
                          if (lvl === 'Easy') activeStyle = 'bg-green-600 text-white shadow-sm';
                          else if (lvl === 'Medium') activeStyle = 'bg-amber-500 text-white shadow-sm';
                          else if (lvl === 'Hard') activeStyle = 'bg-rose-600 text-white shadow-sm';
                        } else {
                          activeStyle = 'text-dash-light-purple hover:bg-dash-soft-pink hover:text-dash-primary-purple';
                        }

                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleDifficultyChange(selectedQuestion?.id, lvl)}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all border-none cursor-pointer ${activeStyle}`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="space-y-4.5">
                  {/* Problem Statement */}
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-extrabold text-dash-primary-purple uppercase tracking-wider">
                      Question / Problem Statement
                    </h4>
                    <p className="text-xs font-semibold text-dash-dark-purple leading-relaxed bg-dash-white-card border border-dash-border-gray/40 p-4 rounded-2xl shadow-[0_2px_8px_rgba(87,82,170,0.01)] select-text">
                      {selectedQuestion?.problemStatement || selectedQuestion?.question || selectedQuestion?.scenario}
                    </p>
                  </div>

                  {/* MCQ Options Display */}
                  {!(selectedQuestion?.type?.includes('CODING') || selectedQuestion?.type === 'SCENARIO_CODING' || selectedQuestion?.type === 'SCENARIO') && selectedQuestion?.options?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-extrabold text-dash-primary-purple uppercase tracking-wider">
                        Options & Correct Answer
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {selectedQuestion.options.map((opt, idx) => {
                          const isCorrect = opt === selectedQuestion.correctAnswer;
                          const label = ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;
                          return (
                            <div
                              key={idx}
                              className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${isCorrect
                                ? 'border-green-500 bg-green-50/40 text-green-700 font-bold'
                                : 'border-dash-border-gray/50 bg-dash-white-card/90 text-dash-dark-purple'
                                }`}
                            >
                              {isCorrect ? (
                                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-dash-light-purple/60 shrink-0 flex items-center justify-center font-bold text-[9px] text-dash-light-purple">
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

                  {/* Example Input / Output for Coding Questions Only */}
                  {selectedQuestion?.subject?.toUpperCase() !== 'APTITUDE' && (selectedQuestion?.exampleInput || selectedQuestion?.exampleOutput || selectedQuestion?.sampleInput || selectedQuestion?.sampleOutput) && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-extrabold text-dash-primary-purple uppercase tracking-wider">
                        Sample Input & Output
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-dash-light-purple uppercase tracking-wider">Input</span>
                          <div className="bg-[#fafafc] border border-dash-border-gray/50 rounded-xl p-3 font-mono text-[11px] text-dash-dark-purple flex items-center gap-2">
                            <Terminal size={12} className="text-dash-light-purple shrink-0" />
                            <span className="select-text whitespace-pre-wrap">{selectedQuestion?.exampleInput || selectedQuestion?.sampleInput || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-dash-light-purple uppercase tracking-wider">Output</span>
                          <div className="bg-[#fafafc] border border-dash-border-gray/50 rounded-xl p-3 font-mono text-[11px] text-dash-dark-purple flex items-center gap-2">
                            <Play size={12} className="text-dash-light-purple shrink-0" />
                            <span className="select-text whitespace-pre-wrap">{selectedQuestion?.exampleOutput || selectedQuestion?.sampleOutput || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expected Answer Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-extrabold text-dash-primary-purple uppercase tracking-wider">
                        {selectedQuestion?.type === 'MCQ' ? 'Correct Answer Details' : (selectedQuestion?.subject?.toUpperCase() === 'APTITUDE' ? 'Expected Answer' : 'Expected Solution')}
                      </h4>
                      {selectedQuestion?.expectedAnswer && (
                        <button
                          onClick={() => handleCopyCode(selectedQuestion.expectedAnswer, selectedQuestion.id)}
                          className="px-2.5 py-1 rounded-lg border border-dash-border-gray text-[9px] font-bold text-dash-primary-purple hover:bg-dash-soft-pink transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === selectedQuestion?.id ? (
                            <>
                              <Check size={10} strokeWidth={3} className="text-green-600" />
                              <span className="text-green-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={10} />
                              <span>Copy Answer</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {selectedQuestion?.type === 'MCQ' ? (
                      <div className="bg-green-50/40 border border-green-200 text-green-700 rounded-xl p-3.5 font-semibold text-xs flex items-center gap-2">
                        <CheckCircle className="text-green-600 shrink-0" size={16} />
                        <span>{selectedQuestion.correctAnswer}</span>
                      </div>
                    ) : selectedQuestion?.subject?.toUpperCase() === 'APTITUDE' ? (
                      <div className="bg-indigo-50/40 border border-indigo-200 text-indigo-900 rounded-xl p-4 font-bold text-sm flex items-center gap-2.5">
                        <CheckCircle className="text-indigo-600 shrink-0" size={18} />
                        <span className="select-text">{selectedQuestion?.expectedAnswer || selectedQuestion?.correctAnswer}</span>
                      </div>
                    ) : (
                      <div className="bg-[#fafafc] border border-dash-border-gray/50 rounded-2xl p-4.5 overflow-hidden shadow-inner border-l-4 border-l-dash-primary-purple relative">
                        <div className="absolute right-3.5 top-3.5 text-[9px] font-bold text-dash-light-purple/60 font-mono uppercase tracking-wider select-none">
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
                      <h4 className="text-[10px] font-extrabold text-dash-primary-purple uppercase tracking-wider">
                        Explanation
                      </h4>
                      <p className="text-xs font-medium text-dash-light-purple leading-relaxed bg-[#f8fafc]/50 p-4 rounded-2xl border border-dash-border-gray/30 shadow-[0_1px_5px_rgba(0,0,0,0.01)] select-text">
                        {selectedQuestion.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="flex items-center gap-3 border-t border-dash-border-gray/25 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 py-3 rounded-xl border border-dash-border-gray/80 hover:bg-dash-soft-pink text-dash-dark-purple font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer bg-dash-white-card"
                >
                  <Edit3 size={13} />
                  <span>Edit Question</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(selectedQuestion?.id)}
                  className="flex-1 py-3 rounded-xl border border-red-200 hover:border-red-300 bg-red-50/50 hover:bg-red-50 text-red-600 font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
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
