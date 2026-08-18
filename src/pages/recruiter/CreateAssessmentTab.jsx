import React from 'react';
import {
  FileText,
  BookOpen,
  PieChart,
  SlidersHorizontal,
  Sparkles,
  RefreshCw,
  Code,
  Database,
  Brain
} from 'lucide-react';

const CreateAssessmentTab = ({
  assessmentTitle,
  setAssessmentTitle,
  durationInput,
  setDurationInput,
  selectedSubjects,
  toggleSubject,
  isSubjectsValid,
  questionDist,
  setQuestionDist,
  isQuestionDistValid,
  difficultyDist,
  setDifficultyDist,
  isDifficultyDistValid,
  isValidForGeneration,
  isGenerating,
  handleGenerateAssessment
}) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start animate-fade-in">
      {/* Left Column: Form Configuration Cards (2/3 width) */}
      <div className="xl:col-span-2 flex flex-col gap-6">

        {/* 1. Assessment Details */}
        <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
          <h3 className="font-outfit font-bold text-base text-dash-dark-purple border-b border-dash-border-gray/25 pb-3 flex items-center gap-2">
            <FileText size={18} className="text-dash-primary-purple" />
            <span>Assessment Details</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-dash-light-purple uppercase tracking-wider">Assessment Title</label>
              <input
                type="text"
                value={assessmentTitle}
                onChange={(e) => setAssessmentTitle(e.target.value)}
                placeholder="e.g. Python & SQL Technical Test"
                className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2.5 px-4 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-dash-light-purple uppercase tracking-wider">Duration</label>
              <input
                type="text"
                value={durationInput}
                onChange={(e) => setDurationInput(e.target.value)}
                placeholder="e.g. 60 minutes"
                className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2.5 px-4 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple transition-all"
              />
            </div>
          </div>
        </div>

        {/* 2. Subject Selection */}
        <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-3">
            <h3 className="font-outfit font-bold text-base text-dash-dark-purple flex items-center gap-2">
              <BookOpen size={18} className="text-dash-primary-purple" />
              <span>Subject Selection</span>
            </h3>
            {!isSubjectsValid && (
              <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                Select at least 1 subject
              </span>
            )}
          </div>
          <p className="text-xs text-dash-light-purple font-medium">Select one or more subjects for the assessment:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'Python', name: 'Python', icon: Code, desc: 'Syntax, OOP, Data Structures' },
              { id: 'SQL', name: 'SQL', icon: Database, desc: 'Queries, Joins, Aggregations' },
              { id: 'Aptitude', name: 'Aptitude', icon: Brain, desc: 'Logical, Quantitative, Verbal' }
            ].map((subj) => {
              const isSelected = selectedSubjects.includes(subj.id);
              const Icon = subj.icon;
              return (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => toggleSubject(subj.id)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 ${isSelected
                    ? 'bg-dash-primary-purple/10 border-dash-primary-purple shadow-sm ring-1 ring-dash-primary-purple'
                    : 'bg-dash-white-card border-dash-border-gray/70 hover:border-dash-primary-purple/40 hover:bg-dash-soft-pink'
                    }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? 'bg-dash-primary-purple text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon size={18} />
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => { }}
                      className="w-4 h-4 rounded text-dash-primary-purple focus:ring-dash-primary-purple cursor-pointer"
                    />
                  </div>
                  <div>
                    <h4 className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple">{subj.name}</h4>
                    <p className="text-[10px] text-dash-light-purple font-medium mt-0.5">{subj.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Question Type Distribution */}
        <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-3">
            <h3 className="font-outfit font-bold text-base text-dash-dark-purple flex items-center gap-2">
              <PieChart size={18} className="text-dash-primary-purple" />
              <span>Question Type Distribution</span>
            </h3>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${isQuestionDistValid
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-600 border-red-200'
              }`}>
              Total: {questionDist.mcq + questionDist.scenario}% {isQuestionDistValid ? '✓' : '⚠️ Must equal 100%'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-dash-dark-purple">Multiple Choice (MCQ)</label>
                <span className="text-xs font-extrabold text-dash-primary-purple">{questionDist.mcq}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={questionDist.mcq}
                onChange={(e) => {
                  const val = Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0));
                  setQuestionDist({ mcq: val, scenario: 100 - val });
                }}
                className="w-full bg-white border border-dash-border-gray rounded-xl py-2 px-3 text-sm font-bold text-dash-dark-purple"
              />
            </div>

            <div className="flex flex-col gap-2 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-dash-dark-purple">Scenario-Based</label>
                <span className="text-xs font-extrabold text-dash-primary-purple">{questionDist.scenario}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={questionDist.scenario}
                onChange={(e) => {
                  const val = Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0));
                  setQuestionDist({ scenario: val, mcq: 100 - val });
                }}
                className="w-full bg-white border border-dash-border-gray rounded-xl py-2 px-3 text-sm font-bold text-dash-dark-purple"
              />
            </div>
          </div>
        </div>

        {/* 4. Difficulty Distribution */}
        <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-3">
            <h3 className="font-outfit font-bold text-base text-dash-dark-purple flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-dash-primary-purple" />
              <span>Difficulty Distribution</span>
            </h3>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${isDifficultyDistValid
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-600 border-red-200'
              }`}>
              Total: {difficultyDist.easy + difficultyDist.medium + difficultyDist.hard}% {isDifficultyDistValid ? '✓' : '⚠️ Must equal 100%'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-2 p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-emerald-900">Easy %</label>
                <span className="text-xs font-extrabold text-emerald-700">{difficultyDist.easy}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={difficultyDist.easy}
                onChange={(e) => {
                  const val = Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0));
                  setDifficultyDist(prev => ({ ...prev, easy: val }));
                }}
                className="w-full bg-white border border-emerald-300 rounded-xl py-1.5 px-3 text-xs font-bold text-emerald-950"
              />
            </div>

            <div className="flex flex-col gap-2 p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-amber-900">Medium %</label>
                <span className="text-xs font-extrabold text-amber-700">{difficultyDist.medium}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={difficultyDist.medium}
                onChange={(e) => {
                  const val = Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0));
                  setDifficultyDist(prev => ({ ...prev, medium: val }));
                }}
                className="w-full bg-white border border-amber-300 rounded-xl py-1.5 px-3 text-xs font-bold text-amber-950"
              />
            </div>

            <div className="flex flex-col gap-2 p-3.5 bg-rose-50/60 border border-rose-200/80 rounded-2xl">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-rose-900">Hard %</label>
                <span className="text-xs font-extrabold text-rose-700">{difficultyDist.hard}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={difficultyDist.hard}
                onChange={(e) => {
                  const val = Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0));
                  setDifficultyDist(prev => ({ ...prev, hard: val }));
                }}
                className="w-full bg-white border border-rose-300 rounded-xl py-1.5 px-3 text-xs font-bold text-rose-950"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Live Summary Preview Card & Action */}
      <div className="flex flex-col gap-6 sticky top-6">
        <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[28px] p-6 shadow-md flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-4">
            <h3 className="font-outfit font-extrabold text-base text-dash-dark-purple flex items-center gap-2">
              <Sparkles size={18} className="text-dash-primary-purple" />
              <span>Summary Card</span>
            </h3>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-dash-primary-purple/10 text-dash-primary-purple uppercase tracking-wider">
              AI Selection
            </span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="font-semibold text-dash-light-purple">Selected Subjects</span>
              <span className="font-extrabold text-dash-dark-purple">
                {selectedSubjects.length > 0 ? selectedSubjects.join(", ") : "None"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="font-semibold text-dash-light-purple">Total Questions</span>
              <span className="font-extrabold text-dash-primary-purple text-xs bg-dash-primary-purple/10 px-2 py-0.5 rounded-md border border-dash-primary-purple/20">AI Determined (15–30)</span>
            </div>

            <div className="flex justify-between items-center py-1.5">
              <span className="font-semibold text-dash-light-purple">MCQ Ratio</span>
              <span className="font-bold text-slate-800">{questionDist.mcq}%</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="font-semibold text-dash-light-purple">Scenario Ratio</span>
              <span className="font-bold text-slate-800">{questionDist.scenario}%</span>
            </div>

            <div className="flex justify-between items-center py-1.5">
              <span className="font-semibold text-emerald-700">Easy Ratio</span>
              <span className="font-bold text-emerald-800">{difficultyDist.easy}%</span>
            </div>

            <div className="flex justify-between items-center py-1.5">
              <span className="font-semibold text-amber-700">Medium Ratio</span>
              <span className="font-bold text-amber-800">{difficultyDist.medium}%</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="font-semibold text-rose-700">Hard Ratio</span>
              <span className="font-bold text-rose-800">{difficultyDist.hard}%</span>
            </div>
          </div>

          {/* Validation Errors Box */}
          {!isValidForGeneration && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex flex-col gap-1 text-[11px] font-semibold text-red-600">
              {!isSubjectsValid && <div>• Please select at least 1 subject.</div>}
              {!isQuestionDistValid && <div>• Question type distribution must sum to 100%.</div>}
              {!isDifficultyDistValid && <div>• Difficulty distribution must sum to 100%.</div>}
            </div>
          )}

          <button
            onClick={handleGenerateAssessment}
            disabled={!isValidForGeneration || isGenerating}
            className="w-full py-4 rounded-2xl bg-dash-primary-purple text-white font-extrabold text-sm hover:bg-dash-dark-purple transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border-0"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                <span>Generating Questions with AI...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate with AI</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAssessmentTab;
