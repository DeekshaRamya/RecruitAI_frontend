import React, { useState, useEffect, useCallback } from 'react';
import { Award, RefreshCw } from 'lucide-react';
import api from '../../api';

const EnglishResultsTab = ({ showToast, handleOpenEnglishReport }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/recruiter/english-assessments');
      setAssessments(res.data);
    } catch (err) {
      console.error("Failed to fetch English assessments:", err);
      showToast("Failed to load English assessment results.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const formatDuration = (sec) => {
    if (!sec) return '0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const handleDownloadTxt = async (assessment) => {
    try {
      setDownloadingId(assessment.interview_id);
      const res = await api.get(`/api/recruiter/candidate/${assessment.candidate_id}/english-assessment`);
      const details = res.data;
      const conversations = details.conversations || [];
      const completedAt = assessment.end_time || assessment.start_time;

      let fileContent = `==================================================\n`;
      fileContent += `RECRUITAI - ENGLISH INTERVIEW CONVERSATIONAL TRANSCRIPT\n`;
      fileContent += `==================================================\n`;
      fileContent += `Candidate Name: ${assessment.candidate_name}\n`;
      fileContent += `Candidate Email: ${assessment.candidate_email}\n`;
      fileContent += `Completed At  : ${completedAt ? new Date(completedAt).toLocaleString() : '--'}\n`;
      fileContent += `Total Turns   : ${conversations.length}\n`;
      fileContent += `Overall Level : ${details.report?.overall_level || 'N/A'}\n`;
      fileContent += `Linguistic Score: ${details.report?.communication_score || 'N/A'}/100\n`;
      fileContent += `==================================================\n\n`;

      conversations.forEach((msg, idx) => {
        fileContent += `[Question ${idx + 1}] [AI HR Sophia]:\n${msg.ai_question}\n\n`;
        if (msg.candidate_answer) {
          fileContent += `[Answer ${idx + 1}] [Candidate]:\n${msg.candidate_answer}\n\n`;
        } else {
          fileContent += `[Answer ${idx + 1}] [Candidate]:\n[No Answer/Silence]\n\n`;
        }
        fileContent += `--------------------------------------------------\n\n`;
      });

      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${assessment.candidate_name.replace(/\s+/g, '_')}_English_Transcript.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("Transcript downloaded successfully!");
    } catch (err) {
      console.error("Failed to download transcript:", err);
      showToast("Error generating transcript file.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      {/* Tab Header */}
      <div className="flex items-center justify-between bg-dash-white-card border border-dash-border-gray/50 rounded-[20px] p-5 shadow-sm">
        <div>
          <h2 className="font-outfit font-bold text-lg text-dash-dark-purple leading-tight">
            English Assessment Result
          </h2>
          <p className="text-xs text-dash-light-purple font-semibold mt-1">
            Monitor and download AI HR interview transcripts and linguistic profiles.
          </p>
        </div>
        <button
          onClick={fetchAssessments}
          disabled={loading}
          className="p-2 border border-dash-border-gray hover:bg-dash-light-blue-bg/40 rounded-xl text-dash-dark-purple font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer bg-white"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main content table card */}
      <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[28px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)] overflow-hidden">
        {loading && assessments.length === 0 ? (
          <div className="p-6 space-y-4 animate-pulse w-full">
            <div className="h-10 bg-slate-100/80 rounded-xl w-full" />
            <div className="h-14 bg-slate-50 rounded-xl w-full" />
            <div className="h-14 bg-slate-50 rounded-xl w-full" />
            <div className="h-14 bg-slate-50 rounded-xl w-full" />
          </div>
        ) : assessments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
            <Award size={36} className="text-dash-light-purple/40" />
            <h4 className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple">No English Assessments Found</h4>
            <p className="text-xs text-dash-light-purple font-medium max-w-xs">
              Once candidates complete their AI HR English Interview, their results and files will appear here.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dash-border-gray/25 text-[10px] text-dash-light-purple font-extrabold uppercase tracking-wider">
                  <th className="pb-3.5 pl-2">Candidate</th>
                  <th className="pb-3.5">Assessment Status</th>
                  <th className="pb-3.5">Completion Date</th>
                  <th className="pb-3.5">Duration</th>
                  <th className="pb-3.5">Score</th>
                  <th className="pb-3.5 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dash-border-gray/10 text-xs font-semibold">
                {assessments.map((item) => (
                  <tr key={item.interview_id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Candidate Identity */}
                    <td className="py-4 pl-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-dash-dark-purple font-bold text-xs">{item.candidate_name}</span>
                        <span className="text-[10px] text-dash-light-purple font-medium">{item.candidate_email}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${item.status === 'COMPLETED'
                        ? 'bg-dash-light-green border-[#22c55e]/20 text-[#10b981]'
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'COMPLETED' ? 'bg-[#10b981]' : 'bg-amber-500 animate-pulse'}`} />
                        {item.status}
                      </span>
                    </td>

                    {/* Completed At Timestamp */}
                    <td className="py-4 text-slate-700 font-medium">
                      {item.end_time
                        ? new Date(item.end_time).toLocaleString()
                        : item.start_time
                          ? `Started: ${new Date(item.start_time).toLocaleString()}`
                          : '--'
                      }
                    </td>

                    {/* Elapsed Duration */}
                    <td className="py-4 text-slate-700 font-mono">
                      {formatDuration(item.duration)}
                    </td>

                    {/* Interview score */}
                    <td className="py-4 font-bold text-dash-dark-purple">
                      {item.score !== null && item.score !== undefined ? `${item.score}/100` : '--'}
                    </td>

                    {/* Actions button list */}
                    <td className="py-4 pr-2 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        {item.status === 'COMPLETED' && (
                          <>
                            {/* View detailed report modal trigger */}
                            <button
                              type="button"
                              onClick={() => handleOpenEnglishReport(item.candidate_id)}
                              className="px-3.5 py-1.5 rounded-xl border border-dash-border-gray hover:bg-dash-light-blue-bg/40 text-dash-dark-purple font-bold text-[11px] transition-all cursor-pointer bg-white"
                            >
                              View Report
                            </button>

                            {/* Download text log transcript */}
                            <button
                              type="button"
                              onClick={() => handleDownloadTxt(item)}
                              disabled={downloadingId === item.interview_id}
                              className="px-3.5 py-1.5 rounded-xl bg-dash-primary-purple hover:bg-dash-dark-purple text-white font-bold text-[11px] transition-all cursor-pointer border-none shadow-sm disabled:opacity-40 disabled:cursor-wait"
                            >
                              {downloadingId === item.interview_id ? 'Downloading...' : 'Download TXT'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnglishResultsTab;
