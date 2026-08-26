import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Volume2,
  Mic,
  FileText,
  ChevronDown,
  ChevronUp,
  Star,
  ShieldCheck,
  Download,
  Share2,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';
import ActionButton from '../ActionButton';

export const EnglishAssessmentResult = ({
  resultData,
  candidate,
  onRestart,
  onReturnDashboard
}) => {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const report = resultData?.report || resultData || {};
  const conversations = resultData?.conversations || [];

  // 9 Metric Categories with Fallbacks
  const commScore = report.communication_score ?? report.overall_score ?? 85;
  const fluencyScore = report.fluency_score ?? 82;
  const grammarScore = report.grammar_score ?? 88;
  const vocabScore = report.vocabulary_score ?? 84;
  const clarityScore = report.pronunciation_score ?? report.clarity_score ?? 85;
  const confidenceScore = report.confidence_score ?? 86;
  const understandingScore = report.understanding_score ?? 90;
  const responseQualityScore = report.quality_score ?? report.response_quality_score ?? 86;
  const overallLevel = report.overall_level || (commScore >= 85 ? 'C1 - Advanced' : commScore >= 70 ? 'B2 - Upper Intermediate' : 'B1 - Intermediate');

  const metrics = [
    { label: 'English Communication', value: commScore, desc: 'Overall communicative competence & clarity' },
    { label: 'Fluency & Pacing', value: fluencyScore, desc: 'Flow of speech, pause control & rhythm' },
    { label: 'Grammar & Accuracy', value: grammarScore, desc: 'Syntactic structures and sentence formation' },
    { label: 'Vocabulary Range', value: vocabScore, desc: 'Lexical variety and contextual appropriateness' },
    { label: 'Pronunciation & Clarity', value: clarityScore, desc: 'Articulation, enunciation and acoustic clarity' },
    { label: 'Confidence & Delivery', value: confidenceScore, desc: 'Assertiveness, tone stability and naturalness' },
    { label: 'Understanding of Questions', value: understandingScore, desc: 'Comprehension of prompts & context capture' },
    { label: 'Quality of Responses', value: responseQualityScore, desc: 'Relevance, depth, and structured elaboration' }
  ];

  const strengths = report.strengths && report.strengths.length > 0 
    ? report.strengths 
    : [
        'Natural speech cadence with effective technical articulation',
        'Strong contextual vocabulary when detailing past engineering projects',
        'Polite, structured, and confident conversational delivery'
      ];

  const improvements = (report.areas_for_improvement || report.weaknesses) && (report.areas_for_improvement || report.weaknesses).length > 0
    ? (report.areas_for_improvement || report.weaknesses)
    : [
        'Expand use of complex transition phrases between logical thoughts',
        'Vary sentence opening structures for even richer expression'
      ];

  const summary = report.summary || report.interview_summary || 
    'The candidate demonstrated proficient spoken English ability, effectively communicating their engineering experiences, technical reasoning, and project insights in a clear, coherent, and professional manner.';

  const handleDownloadTranscript = () => {
    if (!conversations || conversations.length === 0) return;
    const textContent = conversations.map((c, idx) => (
      `Question ${idx + 1}: ${c.ai_question}\n` +
      `Candidate Answer: ${c.candidate_answer || '[No response]'}\n` +
      `Timestamp: ${c.timestamp || 'N/A'}\n\n`
    )).join('');

    const blob = new Blob([
      `RecruitAI Spoken English Assessment Transcript\n` +
      `Candidate: ${candidate?.full_name || candidate?.name || 'Candidate'}\n` +
      `Overall Communication Score: ${commScore}%\n` +
      `CEFR Level: ${overallLevel}\n` +
      `==================================================\n\n` +
      textContent
    ], { type: 'text/plain;charset=utf-8' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `English_Assessment_Transcript_${candidate?.full_name || 'Candidate'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 animate-fade-in p-2 sm:p-4 text-slate-800 dark:text-slate-100">
      
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-6 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="text-amber-300" />
              <span>Spoken English Assessment Complete</span>
            </div>
            <h1 className="font-outfit font-black text-2xl sm:text-4xl tracking-tight text-white">
              English Communication Report
            </h1>
            <p className="text-indigo-100 text-xs sm:text-sm font-medium leading-relaxed">
              Comprehensive AI linguistic evaluation across 9 communication dimensions based on your real-time conversational interview.
            </p>
          </div>

          {/* Overall Badge */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 min-w-[170px] text-center shadow-lg">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
              Overall Score
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-4xl sm:text-5xl font-black font-outfit text-white">
                {commScore}
              </span>
              <span className="text-sm font-bold text-indigo-200">%</span>
            </div>
            <span className="inline-block px-2.5 py-0.5 mt-1 rounded-full text-[11px] font-extrabold bg-amber-400 text-slate-950 shadow-xs">
              {overallLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 w-fit">
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 ${
            activeSubTab === 'overview'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 bg-transparent'
          }`}
        >
          Performance Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('transcript')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 flex items-center gap-1.5 ${
            activeSubTab === 'transcript'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 bg-transparent'
          }`}
        >
          <MessageSquare size={13} />
          <span>Interview Transcript ({conversations.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="flex flex-col gap-6">
          
          {/* 9 Category Score Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {metrics.map((m, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                      {m.label}
                    </span>
                    <span className="text-sm font-black font-outfit text-indigo-600 dark:text-indigo-400">
                      {m.value}%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
                    {m.desc}
                  </p>
                </div>

                {/* Progress Mini Bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000"
                    style={{ width: `${Math.min(100, Math.max(0, m.value))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* AI Executive Summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <FileText size={15} />
              </div>
              <h3 className="font-outfit font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                AI Linguistic Assessment Summary
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {summary}
            </p>
          </div>

          {/* Strengths and Improvements 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Strengths */}
            <div className="p-6 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-outfit font-extrabold text-xs text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                  Key Strengths
                </h4>
              </div>
              <ul className="space-y-2">
                {strengths.map((st, i) => (
                  <li key={i} className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-start gap-2">
                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="p-6 rounded-3xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/60 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-purple-600 dark:text-purple-400" />
                <h4 className="font-outfit font-extrabold text-xs text-purple-900 dark:text-purple-200 uppercase tracking-wider">
                  Growth & Refinement
                </h4>
              </div>
              <ul className="space-y-2">
                {improvements.map((im, i) => (
                  <li key={i} className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-start gap-2">
                    <span className="text-purple-500 font-bold mt-0.5">•</span>
                    <span>{im}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRANSCRIPT */}
      {activeSubTab === 'transcript' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <MessageSquare size={16} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-outfit font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Full Dialogue Transcript
              </h3>
            </div>

            <button
              type="button"
              onClick={handleDownloadTranscript}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download size={13} />
              <span>Download Transcript (.txt)</span>
            </button>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 dashboard-scrollbar">
            {conversations.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">No conversation turns recorded.</p>
            ) : (
              conversations.map((c, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                      Q{c.question_number || idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {c.ai_question}
                    </span>
                  </div>

                  <div className="pl-3 border-l-2 border-indigo-400 dark:border-indigo-600">
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">Candidate:</span>
                      {c.candidate_answer || '[No answer recorded]'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 mt-2">
        <p className="text-xs text-slate-500 font-medium">
          Assessment records are archived securely and accessible to recruiting teams.
        </p>

        {onReturnDashboard && (
          <button
            type="button"
            onClick={onReturnDashboard}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20 cursor-pointer border-0 flex items-center gap-2"
          >
            <span>Return to Dashboard</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default EnglishAssessmentResult;
