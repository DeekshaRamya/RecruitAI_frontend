import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2,
  RefreshCw,
  Sparkles,
  Brain,
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import api from '../../api';

const OverallResultsTab = ({ showToast }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRecCandidate, setSelectedRecCandidate] = useState(null);

  const fetchOverallResults = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/recruiter/overall-results');
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch overall comparison:", err);
      showToast("Error loading overall assessment scores.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOverallResults();
  }, [fetchOverallResults]);

  const getRecommendation = (item) => {
    if (item.ai_recommendation) return item.ai_recommendation;

    const tech = item.technical_score;
    const eng = item.english_score;
    const avg = item.overall_score;

    if (tech === null && eng === null) {
      return {
        decision: "Awaiting Assessments",
        explanation: "Candidate has not completed technical or English speaking assessments yet.",
        strengths: ["Candidate registered on recruitment portal"],
        weaknesses: ["No assessment scores recorded yet"],
        technical_performance: "Pending technical assessment completion.",
        communication_skills: "Pending English speaking assessment completion.",
        suitability: "Awaiting candidate test submissions before rendering evaluation."
      };
    }

    const effectiveScore = avg !== null ? avg : (tech !== null ? tech : eng);

    let decision = "Not Recommended";
    let suitability = `Overall performance (${effectiveScore}%) falls below qualifying criteria. Not recommended to proceed.`;

    if (effectiveScore >= 80 && (tech === null || tech >= 75) && (eng === null || eng >= 75)) {
      decision = "Highly Recommended";
      suitability = `Exceptional candidate overall (${effectiveScore}%). Highly recommended for immediate hiring or advancing to final executive interview rounds.`;
    } else if (effectiveScore >= 65) {
      decision = "Recommended";
      suitability = `Solid performance (${effectiveScore}%). Meets core technical and communication requirements for the role.`;
    } else if (effectiveScore >= 50) {
      decision = "Recommended with Reservations";
      suitability = `Moderate performance (${effectiveScore}%). Recommended with reservations; further technical or language verification advised.`;
    }

    const strengths = [];
    if (tech !== null && tech >= 75) strengths.push(`Strong technical problem-solving (${tech}%)`);
    if (eng !== null && eng >= 75) strengths.push(`Fluent English communication (${eng}%)`);
    if (tech !== null && 60 <= tech && tech < 75) strengths.push(`Solid technical foundation (${tech}%)`);
    if (eng !== null && 60 <= eng && eng < 75) strengths.push(`Clear verbal articulation (${eng}%)`);
    if (strengths.length === 0) strengths.push("Completed mandatory evaluation assessments");

    const weaknesses = [];
    if (tech !== null && tech < 60) weaknesses.push(`Technical score below benchmark (${tech}%)`);
    if (eng !== null && eng < 60) weaknesses.push(`Communication score needs improvement (${eng}%)`);
    if (tech === null) weaknesses.push("Pending technical assessment submission");
    if (eng === null) weaknesses.push("Pending English speaking assessment submission");
    if (weaknesses.length === 0) weaknesses.push("No critical shortcomings identified");

    const tech_perf = tech !== null ? `Technical Score: ${tech}%` : "Technical assessment pending";
    const comm_skills = eng !== null ? `Communication Score: ${eng}%` : "English speaking assessment pending";

    return {
      decision,
      explanation: `${decision}: ${suitability} (${tech_perf}, ${comm_skills}).`,
      strengths,
      weaknesses,
      technical_performance: tech_perf,
      communication_skills: comm_skills,
      suitability
    };
  };

  const getBadgeStyle = (decision) => {
    switch (decision) {
      case 'Highly Recommended':
        return 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm font-extrabold';
      case 'Recommended':
        return 'bg-blue-50 border-blue-300 text-blue-700 font-extrabold';
      case 'Recommended with Reservations':
        return 'bg-amber-50 border-amber-300 text-amber-800 font-extrabold';
      case 'Not Recommended':
        return 'bg-rose-50 border-rose-300 text-rose-700 font-extrabold';
      default:
        return 'bg-slate-100 border-slate-300 text-slate-600 font-semibold';
    }
  };

  const filtered = data.filter(item =>
    item.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
    item.candidate_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-dash-white-card border border-dash-border-gray/50 rounded-[20px] p-5 shadow-sm font-inter">
        <div>
          <h2 className="font-outfit font-bold text-lg text-dash-dark-purple leading-tight">
            Overall Result & AI Recommendation
          </h2>
          <p className="text-xs text-dash-light-purple font-semibold mt-1">
            Review AI-generated hiring recommendations synthesized from candidate Technical and English assessments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search candidate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-2 border border-dash-border-gray/50 bg-white rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-dash-primary-purple w-48"
          />
          <button
            onClick={fetchOverallResults}
            disabled={loading}
            className="p-2 border border-dash-border-gray hover:bg-dash-light-blue-bg/40 rounded-xl text-dash-dark-purple font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer bg-white"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[28px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)] overflow-hidden font-inter">
        {loading && data.length === 0 ? (
          <div className="p-6 space-y-4 animate-pulse w-full">
            <div className="h-10 bg-slate-100/80 rounded-xl w-full" />
            <div className="h-14 bg-slate-50 rounded-xl w-full" />
            <div className="h-14 bg-slate-50 rounded-xl w-full" />
            <div className="h-14 bg-slate-50 rounded-xl w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
            <BarChart2 size={36} className="text-dash-light-purple/40 animate-pulse" />
            <h4 className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple">No completed technical assessments available yet.</h4>
            <p className="text-xs text-dash-light-purple font-medium max-w-sm">
              Only candidates assigned an assessment by you who have completed their Technical Assessment will appear here.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dash-border-gray/25 text-[10px] text-dash-light-purple font-extrabold uppercase tracking-wider">
                  <th className="pb-3.5 pl-2">Candidate Details</th>
                  <th className="pb-3.5">Technical Assessment</th>
                  <th className="pb-3.5">English Assessment</th>
                  <th className="pb-3.5 pl-4">AI Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dash-border-gray/10 text-xs font-semibold">
                {filtered.map((item) => {
                  const techPercent = item.technical_score !== null ? `${item.technical_score}%` : 'Pending';
                  const engPercent = item.english_score !== null ? `${item.english_score}%` : 'Pending';
                  const rec = getRecommendation(item);

                  return (
                    <tr key={item.candidate_id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Identity Details */}
                      <td className="py-4 pl-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-dash-dark-purple font-bold text-xs">{item.candidate_name}</span>
                          <span className="text-[10px] text-dash-light-purple font-medium">{item.candidate_email}</span>
                        </div>
                      </td>

                      {/* Technical Score with Visual Bar */}
                      <td className="py-4">
                        <div className="flex items-center gap-3 w-36">
                          <span className={`w-12 text-left font-bold ${item.technical_score !== null ? 'text-dash-dark-purple' : 'text-slate-400 font-medium'}`}>
                            {techPercent}
                          </span>
                          {item.technical_score !== null && (
                            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                              <div className="h-full bg-dash-primary-purple rounded-full" style={{ width: `${item.technical_score}%` }} />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* English Score with Visual Bar */}
                      <td className="py-4">
                        <div className="flex items-center gap-3 w-36">
                          <span className={`w-12 text-left font-bold ${item.english_score !== null ? 'text-dash-dark-purple' : 'text-slate-400 font-medium'}`}>
                            {engPercent}
                          </span>
                          {item.english_score !== null && (
                            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                              <div className="h-full bg-dash-light-purple rounded-full" style={{ width: `${item.english_score}%` }} />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* AI Recommendation Column */}
                      <td className="py-4 pl-4 pr-2">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] uppercase tracking-wide border ${getBadgeStyle(rec.decision)}`}>
                              <Sparkles size={12} />
                              <span>{rec.decision}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedRecCandidate(item)}
                              className="px-2.5 py-1 rounded-lg border border-dash-primary-purple/30 bg-dash-primary-purple/10 hover:bg-dash-primary-purple/20 text-dash-primary-purple font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Brain size={11} />
                              <span>View Insights</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium leading-relaxed line-clamp-2 max-w-md">
                            {rec.suitability}
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Recommendation Insights Modal */}
      <AnimatePresence>
        {selectedRecCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecCandidate(null)}
              className="fixed inset-0 bg-dash-dark-purple/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white border border-dash-border-gray/60 rounded-[28px] p-6 sm:p-8 max-w-2xl w-full shadow-2xl z-10 relative overflow-hidden space-y-6 max-h-[90vh] overflow-y-auto font-inter"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-dash-border-gray/30 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-dash-primary-purple bg-dash-primary-purple/10 px-2.5 py-0.5 rounded-md">
                      AI Hiring Recommendation
                    </span>
                    {selectedRecCandidate.overall_score !== null && (
                      <span className="text-[10px] font-bold text-dash-dark-purple bg-slate-100 px-2.5 py-0.5 rounded-md">
                        {selectedRecCandidate.overall_score}% Overall Score
                      </span>
                    )}
                  </div>
                  <h3 className="font-outfit font-extrabold text-xl text-dash-dark-purple mt-1.5">
                    {selectedRecCandidate.candidate_name}
                  </h3>
                  <p className="text-xs text-dash-light-purple font-medium">
                    {selectedRecCandidate.candidate_email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRecCandidate(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-dash-dark-purple hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {(() => {
                const rec = getRecommendation(selectedRecCandidate);
                return (
                  <div className="space-y-5">
                    {/* Hiring Decision Banner */}
                    <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${getBadgeStyle(rec.decision)}`}>
                      <div className="flex items-center gap-2.5">
                        <Sparkles size={20} className="shrink-0" />
                        <div>
                          <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-75 block">Decision</span>
                          <span className="text-base font-outfit font-extrabold">{rec.decision}</span>
                        </div>
                      </div>
                    </div>

                    {/* Overall Suitability */}
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-extrabold text-dash-primary-purple uppercase tracking-wider">
                        Overall Suitability & Hiring Rationale
                      </h4>
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed bg-slate-50 border border-slate-200/60 p-4 rounded-2xl select-text">
                        {rec.suitability}
                      </p>
                    </div>

                    {/* Technical & Communication Performance Breakdown Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 bg-dash-light-blue-bg/30 border border-dash-border-gray/30 p-4 rounded-2xl">
                        <span className="text-[10px] font-extrabold text-dash-primary-purple uppercase tracking-wider block">
                          Technical Performance
                        </span>
                        <p className="text-xs font-semibold text-dash-dark-purple mt-1">
                          {rec.technical_performance}
                        </p>
                      </div>

                      <div className="space-y-1 bg-dash-light-blue-bg/30 border border-dash-border-gray/30 p-4 rounded-2xl">
                        <span className="text-[10px] font-extrabold text-dash-primary-purple uppercase tracking-wider block">
                          Communication Skills
                        </span>
                        <p className="text-xs font-semibold text-dash-dark-purple mt-1">
                          {rec.communication_skills}
                        </p>
                      </div>
                    </div>

                    {/* Strengths & Weaknesses Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Strengths */}
                      <div className="space-y-2 bg-emerald-50/40 border border-emerald-200/60 p-4 rounded-2xl">
                        <h4 className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle size={13} className="text-emerald-600" />
                          <span>Candidate Strengths</span>
                        </h4>
                        <ul className="space-y-1.5 text-xs font-semibold text-emerald-900">
                          {rec.strengths.map((str, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div className="space-y-2 bg-amber-50/40 border border-amber-200/60 p-4 rounded-2xl">
                        <h4 className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle size={13} className="text-amber-600" />
                          <span>Areas for Improvement</span>
                        </h4>
                        <ul className="space-y-1.5 text-xs font-semibold text-amber-950">
                          {rec.weaknesses.map((wk, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span>{wk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Footer Close */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedRecCandidate(null)}
                        className="px-5 py-2.5 rounded-xl bg-dash-primary-purple text-white font-bold text-xs hover:bg-dash-dark-purple transition-all cursor-pointer border-none shadow-sm"
                      >
                        Close Insights
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OverallResultsTab;
