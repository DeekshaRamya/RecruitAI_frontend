import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  CameraOff,
  Search,
  SlidersHorizontal,
  AlertCircle,
  Users,
  User,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Download,
  X,
  RefreshCw,
  ShieldAlert,
  Eye,
    Play
} from 'lucide-react';
import api from '../../api';

// Helper to safely construct absolute screenshot URLs from backend uploads
const getFullScreenshotUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image')) {
    return trimmed;
  }
  const base = (api.defaults?.baseURL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
};


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

const TechnicalResultsTab = ({
  showToast,
  candidateGroups = [],
  candidates = []
}) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('All');
  const [sortBy, setSortBy] = useState('score-desc');
  const [loadingDetailId, setLoadingDetailId] = useState(null);
  const [recalculating, setRecalculating] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [screenshotModal, setScreenshotModal] = useState(null);

  // View modes: 'flat' for standard table, 'groups' for grouped cards
  const [viewMode, setViewMode] = useState('flat');
  const [selectedGroupForView, setSelectedGroupForView] = useState(null);

  // Quick lookup from candidate ID to email
  const candidateIdToEmailMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(candidates)) {
      candidates.forEach(c => {
        if (c.id && c.email) {
          map.set(String(c.id), c.email.toLowerCase().trim());
        }
      });
    }
    return map;
  }, [candidates]);

  // Aggregate results per Candidate Group
  const groupsWithResults = useMemo(() => {
    if (!Array.isArray(candidateGroups)) return [];

    return candidateGroups.map(group => {
      const groupCandidateEmails = new Set();
      (group.candidateIds || []).forEach(candId => {
        const email = candidateIdToEmailMap.get(String(candId));
        if (email) {
          groupCandidateEmails.add(email);
        }
      });

      const groupResults = results.filter(res => {
        const email = res.candidateEmail?.toLowerCase().trim();
        return email && groupCandidateEmails.has(email);
      });

      const avgScore = groupResults.length > 0
        ? Math.round(groupResults.reduce((acc, r) => acc + (r.percentage || 0), 0) / groupResults.length)
        : null;

      return {
        ...group,
        results: groupResults,
        averageScore: avgScore
      };
    });
  }, [candidateGroups, candidateIdToEmailMap, results]);

  // Ungrouped results
  const ungroupedResults = useMemo(() => {
    const allGroupedEmails = new Set();
    candidateGroups.forEach(group => {
      (group.candidateIds || []).forEach(candId => {
        const email = candidateIdToEmailMap.get(String(candId));
        if (email) {
          allGroupedEmails.add(email);
        }
      });
    });

    return results.filter(res => {
      const email = res.candidateEmail?.toLowerCase().trim();
      return !email || !allGroupedEmails.has(email);
    });
  }, [candidateGroups, candidateIdToEmailMap, results]);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/recruiter/results');
      setResults(response.data || []);
    } catch (err) {
      console.error("Failed to fetch recruiter results:", err);
      showToast("Error loading evaluation results.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleOpenDetail = async (targetId) => {
    if (!targetId) {
      showToast("Cannot open report: Assessment identifier is missing.");
      return;
    }
    try {
      setLoadingDetailId(targetId);
      const response = await api.get(`/api/results/${targetId}`);
      const resultData = response.data || {};

      setSelectedResult(resultData);
      const initialExpanded = {};
      if (response.data?.questionsAnalysis) {
        response.data.questionsAnalysis.forEach((q, idx) => {
          initialExpanded[q.questionId || idx] = true;
        });
      }
      setExpandedQuestions(initialExpanded);
    } catch (err) {
      console.error("[Recruiter Dashboard] Error fetching assessment results:", err, err.response?.data);
      const serverDetail = err.response?.data?.detail;
      if (err.response?.status === 404) {
        showToast(serverDetail || "Assessment results not found. The assessment may still be in progress.");
      } else if (err.response?.status === 403) {
        showToast(serverDetail || "You do not have authorization to view these assessment details.");
      } else if (err.response?.status === 400) {
        showToast(serverDetail || "Invalid assessment ID format provided.");
      } else {
        showToast(serverDetail || "Unable to load assessment details from server. Please try again later.");
      }
    } finally {
      setLoadingDetailId(null);
    }
  };

  const handleReevaluate = async (assignmentId) => {
    try {
      setRecalculating(true);
      showToast("Triggering AI re-evaluation. Please wait...");
      const response = await api.post('/api/evaluation', { assignmentId });
      setSelectedResult(response.data);
      showToast("Assessment re-evaluated successfully!");
      fetchResults();
    } catch (err) {
      console.error("Re-evaluation failed:", err);
      showToast("Failed to re-evaluate assessment.");
    } finally {
      setRecalculating(false);
    }
  };

  const toggleQuestionExpand = (qId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleDownloadPDF = (result) => {
    if (!result) return;
    const printWindow = window.open('', '_blank');
    const questionsHTML = (result.questionsAnalysis || []).map((q, idx) => `
      <div class="question-card">
        <div class="q-header">
          <span class="q-num">Question ${idx + 1} (${q.type})</span>
          <span class="badge badge-${q.status.toLowerCase().replace(/\s+/g, '-')}">${q.status}</span>
        </div>
        <div class="q-text">${q.questionText}</div>
        
        <div class="answer-section">
          <div class="answer-row">
            <span class="ans-label">Correct Answer:</span>
            <span class="ans-val font-code">${q.correctAnswer}</span>
          </div>
          <div class="answer-row">
            <span class="ans-label">Candidate Answer:</span>
            <span class="ans-val font-code">${q.candidateAnswer || 'Not Answered'}</span>
          </div>
        </div>

        <div class="ai-feedback-box">
          <div class="ai-title"><span class="sparkle-icon">✨</span> AI Evaluation Details</div>
          <div class="metric-grid">
            <div class="metric-item">
              <span class="metric-label">Semantic Similarity:</span>
              <span class="metric-val">${q.similarityScore !== null && q.similarityScore !== undefined ? q.similarityScore : (q.status === 'Correct' ? 100 : 0)}%</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Score Awarded:</span>
              <span class="metric-val">${q.marksAwarded} / ${q.maxMarks}</span>
            </div>
          </div>
          <div class="feedback-field">
            <strong>Explanation:</strong> ${q.aiExplanation || q.feedback || 'N/A'}
          </div>
          <div class="feedback-field">
            <strong>Strengths:</strong> ${q.strengths || 'N/A'}
          </div>
          <div class="feedback-field">
            <strong>Missing Points:</strong> ${q.missingPoints || 'N/A'}
          </div>
          <div class="feedback-field">
            <strong>Suggested Improvement:</strong> ${q.suggestedImprovement || q.improvements || 'N/A'}
          </div>
        </div>
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>RecruitAI Report - ${result.candidateName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@700;800&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #1e1b4b;
              padding: 40px;
              line-height: 1.5;
              background-color: #ffffff;
            }
            .header-container {
              border-bottom: 3px solid #5752aa;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .brand-title {
              font-family: 'Plus Jakarta Sans', sans-serif;
              font-size: 28px;
              font-weight: 800;
              color: #5752aa;
              margin: 0;
            }
            .brand-sub {
              font-size: 11px;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.15em;
              font-weight: 700;
            }
            .report-title {
              font-size: 16px;
              font-weight: 700;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
              margin-bottom: 30px;
            }
            .meta-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 16px;
              border-radius: 12px;
            }
            .meta-label {
              font-size: 10px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              display: block;
              margin-bottom: 4px;
            }
            .meta-val {
              font-size: 13px;
              font-weight: 600;
              color: #0f172a;
            }
            .overall-box {
              background: linear-gradient(135deg, #fdf6fb 0%, #f6f5ff 100%);
              border: 1px solid #e8dbfc;
              border-radius: 16px;
              padding: 24px;
              margin-bottom: 40px;
            }
            .overall-title {
              font-size: 18px;
              font-weight: 800;
              color: #5752aa;
              margin-top: 0;
              margin-bottom: 15px;
            }
            .overall-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-bottom: 20px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 20px;
            }
            .overall-metric {
              text-align: center;
            }
            .overall-num {
              font-size: 32px;
              font-weight: 800;
              color: #5752aa;
            }
            .overall-label {
              font-size: 11px;
              font-weight: 600;
              color: #64748b;
              text-transform: uppercase;
            }
            .rec-badge {
              display: inline-block;
              padding: 6px 16px;
              background-color: #5752aa;
              color: #ffffff;
              font-weight: 700;
              font-size: 12px;
              border-radius: 9999px;
              text-transform: uppercase;
              margin-top: 4px;
            }
            .overall-feedback-content {
              font-size: 13px;
              line-height: 1.6;
              color: #334155;
            }
            .overall-feedback-content strong {
              color: #0f172a;
            }
            .question-card {
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              padding: 20px;
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .q-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
            }
            .q-num {
              font-size: 12px;
              font-weight: 700;
              color: #5752aa;
              text-transform: uppercase;
            }
            .badge {
              font-size: 10px;
              font-weight: 700;
              padding: 4px 10px;
              border-radius: 9999px;
              text-transform: uppercase;
            }
            .badge-correct { background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
            .badge-partially-correct { background-color: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
            .badge-incorrect { background-color: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
            .q-text {
              font-size: 15px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 15px;
            }
            .answer-section {
              background-color: #f8fafc;
              border-radius: 12px;
              padding: 15px;
              margin-bottom: 15px;
              border: 1px solid #e2e8f0;
            }
            .answer-row {
              margin-bottom: 8px;
            }
            .answer-row:last-child {
              margin-bottom: 0;
            }
            .ans-label {
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              display: block;
              margin-bottom: 2px;
            }
            .ans-val {
              font-size: 13px;
              color: #334155;
              display: block;
            }
            .font-code {
              font-family: 'Courier New', Courier, monospace;
              background-color: #f1f5f9;
              padding: 8px 12px;
              border-radius: 6px;
              border: 1px solid #cbd5e1;
              white-space: pre-wrap;
              margin-top: 4px;
            }
            .ai-feedback-box {
              background-color: #faf5ff;
              border: 1px solid #ebd5ff;
              border-radius: 12px;
              padding: 15px;
            }
            .ai-title {
              font-size: 12px;
              font-weight: 700;
              color: #7c3aed;
              margin-bottom: 12px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .metric-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
              margin-bottom: 12px;
              background-color: #ffffff;
              padding: 10px;
              border-radius: 8px;
              border: 1px solid #ebd5ff;
            }
            .metric-item {
              display: flex;
              flex-direction: column;
            }
            .metric-label {
              font-size: 10px;
              font-weight: 600;
              color: #7c3aed;
              text-transform: uppercase;
            }
            .metric-val {
              font-size: 14px;
              font-weight: 700;
              color: #0f172a;
            }
            .feedback-field {
              font-size: 12px;
              color: #475569;
              margin-bottom: 8px;
              line-height: 1.5;
            }
            .feedback-field:last-child {
              margin-bottom: 0;
            }
            .feedback-field strong {
              color: #0f172a;
            }
            @media print {
              body { padding: 0; }
              .question-card { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <h1 class="brand-title">RecruitAI</h1>
              <span class="brand-sub">Evaluation Report</span>
            </div>
            <div class="report-title">AI Assessment Result</div>
          </div>

          <div class="meta-grid">
            <div class="meta-card">
              <span class="meta-label">Candidate Name</span>
              <span class="meta-val">${result.candidateName}</span>
            </div>
            <div class="meta-card">
              <span class="meta-label">Candidate Email</span>
              <span class="meta-val">${result.candidateEmail}</span>
            </div>
            <div class="meta-card">
              <span class="meta-label">Assessment Name</span>
              <span class="meta-val">${result.assessmentName}</span>
            </div>
            <div class="meta-card">
              <span class="meta-label">Submission Date</span>
              <span class="meta-val">${new Date(result.createdAt).toLocaleDateString()} ${new Date(result.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div class="overall-box">
            <h3 class="overall-title">Overall AI Summary</h3>
            <div class="overall-grid">
              <div class="overall-metric">
                <div class="overall-num">${result.percentage}%</div>
                <div class="overall-label">Final Score</div>
              </div>
              <div class="overall-metric">
                <div class="overall-num">${result.correctAnswers} / ${result.totalQuestions}</div>
                <div class="overall-label">Questions Correct</div>
              </div>
              <div class="overall-metric">
                <div class="overall-num">
                  <span class="rec-badge">${result.hiringRecommendation}</span>
                </div>
                <div class="overall-label" style="margin-top: 8px;">Hiring Recommendation</div>
              </div>
            </div>
            <div class="overall-feedback-content">
              <p><strong>AI Evaluation Summary:</strong> ${result.overallFeedback}</p>
              <p><strong>Key Strengths:</strong> ${result.overallStrengths}</p>
              <p><strong>Areas of Improvement:</strong> ${result.overallWeaknesses}</p>
            </div>
          </div>

          ${(result.autoSubmitted || result.submissionReason || (result.warningHistory && result.warningHistory.length > 0)) ? `
          <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <h3 style="margin-top:0; margin-bottom: 12px; color: #be123c; font-size: 14px; text-transform: uppercase; font-weight: 800;">Security Audit & Violation Report</h3>
            <p style="margin: 4px 0; font-size: 12px; color: #334155;"><strong>Submission Mode:</strong> ${result.autoSubmitted ? 'Automatic (4-Strike Violation Lockout)' : 'Manual'}</p>
            <p style="margin: 4px 0; font-size: 12px; color: #334155;"><strong>Full-Screen Exits Recorded:</strong> ${result.warningCount || (result.autoSubmitted ? 4 : 0)} / 4 Exits</p>
            ${result.submissionReason ? `<p style="margin: 8px 0 4px 0; font-size: 12px; color: #be123c;"><strong>Candidate Reason for Exiting:</strong> <em>"${result.submissionReason}"</em></p>` : ''}
          </div>
          ` : ''}

          <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; font-weight: 800; color: #5752aa; border-bottom: 2px solid #5752aa; padding-bottom: 8px; margin-bottom: 20px;">Question-by-Question AI Breakdown</h2>
          
          ${questionsHTML}

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 600);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const resultsToFilter = selectedGroupForView
    ? (selectedGroupForView.id === 'ungrouped' ? ungroupedResults : selectedGroupForView.results || [])
    : results;

  const filteredAndSortedResults = resultsToFilter
    .filter(res => {
      const query = searchQuery.toLowerCase();
      const nameMatch = res.candidateName?.toLowerCase().includes(query);
      const emailMatch = res.candidateEmail?.toLowerCase().includes(query);
      const asmMatch = res.assessmentName?.toLowerCase().includes(query);
      return nameMatch || emailMatch || asmMatch;
    })
    .filter(res => {
      if (scoreFilter === 'All') return true;
      if (scoreFilter === 'Excellent') return res.percentage >= 80;
      if (scoreFilter === 'Average') return res.percentage >= 50 && res.percentage < 80;
      if (scoreFilter === 'NeedsImprovement') return res.percentage < 50;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score-desc') return b.percentage - a.percentage;
      if (sortBy === 'score-asc') return a.percentage - b.percentage;
      if (sortBy === 'date-desc') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'date-asc') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'name-asc') return a.candidateName.localeCompare(b.candidateName);
      if (sortBy === 'name-desc') return b.candidateName.localeCompare(a.candidateName);
      return 0;
    });

  return (
    <div className="space-y-6 animate-fade-in w-full">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          {/* View Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => {
                setViewMode('flat');
                setSelectedGroupForView(null);
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg cursor-pointer border-none transition-all ${viewMode === 'flat' ? 'bg-white text-dash-primary-purple shadow-sm font-extrabold' : 'bg-transparent text-dash-light-purple hover:text-dash-dark-purple'}`}
            >
              All Results
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('groups');
                setSelectedGroupForView(null);
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg cursor-pointer border-none transition-all ${viewMode === 'groups' ? 'bg-white text-dash-primary-purple shadow-sm font-extrabold' : 'bg-transparent text-dash-light-purple hover:text-dash-dark-purple'}`}
            >
              Group Results
            </button>
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dash-light-purple" size={18} />
            <input
              type="text"
              placeholder="Search candidates or assessments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dash-white-card border border-dash-border-gray/50 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-dash-dark-purple placeholder:text-dash-light-purple focus:border-dash-primary-purple outline-none transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-dash-light-purple" />
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="px-2.5 py-2 rounded-lg bg-dash-white-card border border-dash-border-gray text-xs font-bold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple cursor-pointer hover:border-dash-primary-purple transition-all duration-200"
            >
              <option value="All">All Scores</option>
              <option value="Excellent">Excellent (80%+)</option>
              <option value="Average">Average (50%-79%)</option>
              <option value="NeedsImprovement">Needs Improvement (&lt;50%)</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-2 rounded-lg bg-dash-white-card border border-dash-border-gray text-xs font-bold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple cursor-pointer hover:border-dash-primary-purple transition-all duration-200"
          >
            <option value="score-desc">Score: Highest to Lowest</option>
            <option value="score-asc">Score: Lowest to Highest</option>
            <option value="date-desc">Date: Newest to Oldest</option>
            <option value="date-asc">Date: Oldest to Newest</option>
            <option value="name-asc">Candidate Name: A-Z</option>
            <option value="name-desc">Candidate Name: Z-A</option>
          </select>
        </div>
      </div>

      {/* Group Navigation Bar */}
      {selectedGroupForView && (
        <div className="flex items-center gap-2 bg-dash-primary-purple/5 border border-dash-primary-purple/15 px-4 py-3 rounded-2xl animate-fade-in">
          <button
            onClick={() => setSelectedGroupForView(null)}
            className="px-3 py-1.5 rounded-lg border border-dash-primary-purple text-dash-primary-purple hover:bg-dash-primary-purple hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer bg-white"
          >
            ← Back to Groups
          </button>
          <span className="text-xs text-dash-light-purple font-medium">Viewing results for Group:</span>
          <strong className="text-sm text-dash-dark-purple font-outfit">{selectedGroupForView.name}</strong>
        </div>
      )}

      <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] shadow-[0_4px_25px_rgba(87,82,170,0.02)] overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="p-6 space-y-4 animate-pulse w-full">
            <div className="h-10 bg-slate-100/80 rounded-xl w-full" />
            <div className="h-16 bg-slate-50 rounded-xl w-full" />
            <div className="h-16 bg-slate-50 rounded-xl w-full" />
            <div className="h-16 bg-slate-50 rounded-xl w-full" />
          </div>
        ) : (
          <>
            {viewMode === 'groups' && selectedGroupForView === null ? (
              // RENDER GROUPS GRID CARDS
              <div className="p-6 animate-fade-in">
                {groupsWithResults.length === 0 && ungroupedResults.length === 0 ? (
                  <div className="text-center py-12 text-sm text-dash-light-purple">
                    <AlertCircle className="mx-auto mb-3 text-dash-light-purple" size={32} />
                    No candidate groups or results found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupsWithResults.map(group => (
                      <div
                        key={group.id}
                        onClick={() => setSelectedGroupForView(group)}
                        className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-sm hover:shadow-md hover:border-dash-primary-purple/40 transition-all duration-300 flex flex-col justify-between gap-5 cursor-pointer group animate-fade-in"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-dash-primary-purple/10 flex items-center justify-center text-dash-primary-purple group-hover:scale-110 transition-transform duration-300">
                              <Users size={20} />
                            </div>
                            <div>
                              <h3 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple group-hover:text-dash-primary-purple transition-colors duration-200">
                                {group.name}
                              </h3>
                              <span className="text-[10px] text-dash-light-purple font-semibold uppercase tracking-wider block mt-0.5">
                                {group.candidateIds?.length || 0} Members
                              </span>
                            </div>
                          </div>

                          {group.averageScore !== null && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 border border-emerald-200 text-emerald-600">
                              {group.averageScore}% Avg
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-xs font-semibold">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-dash-light-purple">Evaluated Candidates</span>
                            <span className="text-dash-dark-purple font-bold text-sm">
                              {group.results?.length || 0} / {group.candidateIds?.length || 0}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5 items-end">
                            <span className="text-dash-light-purple">Pending Submission</span>
                            <span className="text-dash-light-purple font-medium text-xs">
                              {Math.max(0, (group.candidateIds?.length || 0) - (group.results?.length || 0))}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="w-full py-2.5 rounded-xl border border-dash-primary-purple/20 text-dash-primary-purple font-bold text-xs bg-dash-primary-purple/5 hover:bg-dash-primary-purple hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border-solid"
                        >
                          <span>View Group Results</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    ))}

                    {/* Ungrouped Card */}
                    {ungroupedResults.length > 0 && (
                      <div
                        onClick={() => setSelectedGroupForView({ id: 'ungrouped', name: 'Individual Candidates', results: ungroupedResults })}
                        className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-sm hover:shadow-md hover:border-dash-primary-purple/40 transition-all duration-300 flex flex-col justify-between gap-5 cursor-pointer group animate-fade-in"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform duration-300">
                              <User size={20} />
                            </div>
                            <div>
                              <h3 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple group-hover:text-dash-primary-purple transition-colors duration-200">
                                Individual Candidates
                              </h3>
                              <span className="text-[10px] text-dash-light-purple font-semibold uppercase tracking-wider block mt-0.5">
                                Ungrouped
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-xs font-semibold">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-dash-light-purple">Evaluated Results</span>
                            <span className="text-dash-dark-purple font-bold text-sm">
                              {ungroupedResults.length}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs bg-slate-50 hover:bg-slate-100 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border-solid"
                        >
                          <span>View Results</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // RENDER RESULTS TABLE
              <>
                <div className="flex-1 overflow-x-auto dashboard-scrollbar">
                  <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-dash-soft-pink border-b border-dash-border-gray text-[10px] font-extrabold text-dash-dark-purple tracking-widest uppercase">
                        <th className="px-6 py-4.5">Candidate Name</th>
                        <th className="px-6 py-4.5">Assessment Name</th>
                        <th className="px-6 py-4.5">Submission Date & Time</th>
                        <th className="px-6 py-4.5">Security Status</th>
                        <th className="px-6 py-4.5">Score</th>
                        <th className="px-6 py-4.5">AI Recommendation</th>
                        <th className="px-6 py-4.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dash-border-gray">
                      <AnimatePresence mode="popLayout">
                        {filteredAndSortedResults.map((res) => {
                          const scoreVal = res.percentage;
                          let scoreColor = '#149470';
                          let scoreBg = 'rgba(20, 148, 112, 0.1)';
                          if (scoreVal < 50) {
                            scoreColor = '#E11D48';
                            scoreBg = 'rgba(225, 29, 72, 0.1)';
                          } else if (scoreVal < 80) {
                            scoreColor = '#D97706';
                            scoreBg = 'rgba(217, 119, 6, 0.1)';
                          }

                          return (
                            <motion.tr
                              key={res.id}
                              layout
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.3 }}
                              className="bg-dash-white-card hover:bg-dash-soft-pink transition-colors duration-200 group"
                            >
                              <td className="px-6 py-4">
                                <h4 className="text-xs font-bold text-dash-dark-purple group-hover:text-dash-primary-purple transition-colors duration-200">
                                  {res.candidateName}
                                </h4>
                                <span className="text-[10px] font-semibold text-dash-light-purple block mt-0.5">{res.candidateEmail}</span>
                              </td>

                              <td className="px-6 py-4 text-xs font-bold text-dash-dark-purple">
                                {res.assessmentName}
                              </td>

                              <td className="px-6 py-4">
                                <span className="text-xs font-bold text-dash-dark-purple block">
                                  {new Date(res.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                                <span className="text-[10px] font-semibold text-dash-light-purple block mt-0.5">
                                  {new Date(res.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </td>

                              <td className="px-6 py-4">
                                {res.autoSubmitted || res.submissionType === 'Automatic' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 border border-rose-200 text-rose-600">
                                    <AlertTriangle size={11} className="text-rose-500 shrink-0" />
                                    <span>Auto Submitted ({res.warningCount || 4} Exits)</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 border border-emerald-200 text-emerald-600">
                                    <CheckCircle size={11} className="text-emerald-500 shrink-0" />
                                    <span>Standard</span>
                                  </span>
                                )}
                              </td>

                              <td className="px-6 py-4">
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border"
                                  style={{
                                    color: scoreColor,
                                    backgroundColor: scoreBg,
                                    borderColor: `${scoreColor}30`
                                  }}
                                >
                                  {scoreVal}%
                                </span>
                              </td>

                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-dash-primary-purple bg-dash-primary-purple/5 border border-dash-primary-purple/20 px-3 py-1 rounded-full">
                                  <Sparkles size={12} className="text-dash-primary-purple" />
                                  {res.hiringRecommendation || "Recommended"}
                                </span>
                              </td>

                              <td className="px-6 py-4 text-right">
                                <button
                                  disabled={loadingDetailId === (res.assignmentId || res.id)}
                                  onClick={() => handleOpenDetail(res.assignmentId || res.id)}
                                  className="px-3 py-1.5 rounded-lg bg-dash-white-card border border-dash-border-gray hover:border-dash-primary-purple text-dash-primary-purple text-xs font-bold hover:bg-dash-soft-pink transition-all duration-300 flex items-center gap-1.5 ml-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {loadingDetailId === (res.assignmentId || res.id) ? (
                                    <>
                                      <div className="w-3.5 h-3.5 border-2 border-dash-primary-purple border-t-transparent rounded-full animate-spin shrink-0" />
                                      <span>Loading...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye size={13} />
                                      <span>View Details</span>
                                    </>
                                  )}
                                </button>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>

                      {filteredAndSortedResults.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-sm text-dash-light-purple">
                            <AlertCircle className="mx-auto mb-3 text-dash-light-purple" size={32} />
                            No assessment evaluations found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-dash-border-gray bg-dash-white-card flex items-center justify-between text-[11px] text-dash-light-purple font-semibold px-6">
                  <span>Showing {filteredAndSortedResults.length} evaluations</span>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedResult && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResult(null)}
              className="fixed inset-0 bg-dash-dark-purple/40 z-45"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed top-0 bottom-0 right-0 w-full sm:w-[650px] bg-dash-white-card border-l border-dash-border-gray shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-dash-border-gray mb-6">
                  <div>
                    <span className="text-[10px] text-dash-primary-purple font-extrabold tracking-widest uppercase">AI Assessment Report</span>
                    <h3 className="text-base font-bold text-dash-dark-purple font-outfit mt-1">{selectedResult.candidateName}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadPDF(selectedResult)}
                      className="p-2 rounded-lg bg-dash-soft-pink border border-dash-border-gray hover:border-dash-primary-purple text-dash-primary-purple transition-all cursor-pointer flex items-center gap-1.5"
                      title="Download Report PDF"
                    >
                      <Download size={14} />
                      <span className="text-xs font-bold">PDF</span>
                    </button>
                    <button
                      onClick={() => setSelectedResult(null)}
                      className="p-2 rounded-lg hover:bg-dash-soft-pink text-dash-light-purple hover:text-dash-dark-purple transition-all cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray rounded-xl p-3.5">
                    <span className="text-[10px] text-dash-light-purple font-bold uppercase tracking-wider block mb-1">Assessment</span>
                    <span className="text-xs font-bold text-dash-dark-purple truncate block" title={selectedResult.assessmentName}>{selectedResult.assessmentName || 'Technical Assessment'}</span>
                  </div>
                  <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray rounded-xl p-3.5">
                    <span className="text-[10px] text-dash-light-purple font-bold uppercase tracking-wider block mb-1">Submitted On</span>
                    <span className="text-xs font-semibold text-dash-dark-purple block">
                      {selectedResult.createdAt ? `${new Date(selectedResult.createdAt).toLocaleDateString()} ${new Date(selectedResult.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Recent'}
                    </span>
                  </div>
                  <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray rounded-xl p-3.5">
                    <span className="text-[10px] text-dash-light-purple font-bold uppercase tracking-wider block mb-1">Candidate Email</span>
                    <span className="text-xs font-semibold text-dash-dark-purple truncate block" title={selectedResult.candidateEmail}>{selectedResult.candidateEmail || 'N/A'}</span>
                  </div>
                  <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray rounded-xl p-3.5">
                    <span className="text-[10px] text-dash-light-purple font-bold uppercase tracking-wider block mb-1">Time Taken</span>
                    <span className="text-xs font-semibold text-dash-dark-purple block">
                      {selectedResult.timeTaken ? `${Math.floor(selectedResult.timeTaken / 60)}m ${selectedResult.timeTaken % 60}s` : 'N/A'}
                    </span>
                  </div>
                  <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray rounded-xl p-3.5">
                    <span className="text-[10px] text-dash-light-purple font-bold uppercase tracking-wider block mb-1">Trust Score</span>
                    <span className="text-xs font-bold block" style={{
                      color: (() => {
                        const exits = (selectedResult.activitySummary?.totalWarnings ?? selectedResult.warningCount ?? 0) + (selectedResult.autoSubmitted ? 1 : 0);
                        const trust = Math.max(0, 100 - exits * 20 - (selectedResult.activitySummary?.tabSwitches ?? 0) * 10);
                        return trust >= 80 ? '#149470' : trust >= 50 ? '#D97706' : '#E11D48';
                      })()
                    }}>
                      {(() => {
                        const exits = (selectedResult.activitySummary?.totalWarnings ?? selectedResult.warningCount ?? 0) + (selectedResult.autoSubmitted ? 1 : 0);
                        const trust = Math.max(0, 100 - exits * 20 - (selectedResult.activitySummary?.tabSwitches ?? 0) * 10);
                        return `${trust}% (${trust >= 80 ? 'High' : trust >= 50 ? 'Moderate' : 'Low'})`;
                      })()}
                    </span>
                  </div>
                  <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray rounded-xl p-3.5">
                    <span className="text-[10px] text-dash-light-purple font-bold uppercase tracking-wider block mb-1">Result Status</span>
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full inline-block mt-0.5 ${((selectedResult.passFail === 'Pass') || ((selectedResult.percentage ?? 0) >= 50)) ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {selectedResult.passFail || ((selectedResult.percentage ?? 0) >= 50 ? 'Pass' : 'Fail')}
                    </span>
                  </div>
                </div>

                                {/* Security Audit & Proctoring Events Report */}
                {(() => {
                  const summary = selectedResult.activitySummary || {};
                  const logs = selectedResult.activityLogs || [];

                  const getActivityDetails = (type) => {
                    const t = (type || "").toUpperCase();
                    switch (t) {
                      case "TAB_SWITCH": return { title: "Tab Switch / Switched Away", color: "text-amber-700 bg-amber-50 border-amber-200" };
                      case "WINDOW_BLUR": return { title: "Window Lost Focus", color: "text-amber-700 bg-amber-50 border-amber-200" };
                      case "WINDOW_FOCUS": return { title: "Returned to Assessment", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
                      case "ESC_KEY": return { title: "Esc Key Pressed", color: "text-rose-700 bg-rose-50 border-rose-200" };
                      case "COPY_ATTEMPT": return { title: "Copy Attempt", color: "text-purple-700 bg-purple-50 border-purple-200" };
                      case "PASTE_ATTEMPT": return { title: "Paste Attempt", color: "text-purple-700 bg-purple-50 border-purple-200" };
                      case "CUT_ATTEMPT": return { title: "Cut Attempt", color: "text-purple-700 bg-purple-50 border-purple-200" };
                      case "RIGHT_CLICK": return { title: "Right Click Attempt", color: "text-slate-700 bg-slate-100 border-slate-200" };
                      case "DEVTOOLS_ATTEMPT": return { title: "DevTools Access Attempt", color: "text-rose-700 bg-rose-100 border-rose-300" };
                      case "FULLSCREEN_EXIT": return { title: "Full-screen Exit", color: "text-rose-700 bg-rose-50 border-rose-200" };
                      case "PAGE_REFRESH":
                      case "PAGE_RELOAD": return { title: "Page Refresh / Reload", color: "text-indigo-700 bg-indigo-50 border-indigo-200" };
                      case "FACE_NOT_DETECTED": return { title: "Face Not Detected", color: "text-rose-700 bg-rose-50 border-rose-200" };
                      case "MULTIPLE_FACES": return { title: "Multiple Faces Detected", color: "text-rose-700 bg-rose-50 border-rose-200" };
                      case "HEAD_TURNED_LEFT": return { title: "Head Turned Left", color: "text-amber-700 bg-amber-50 border-amber-200" };
                      case "HEAD_TURNED_RIGHT": return { title: "Head Turned Right", color: "text-amber-700 bg-amber-50 border-amber-200" };
                      case "HEAD_LOOKING_UP": return { title: "Head Looking Up", color: "text-amber-700 bg-amber-50 border-amber-200" };
                      case "HEAD_LOOKING_DOWN": return { title: "Head Looking Down", color: "text-amber-700 bg-amber-50 border-amber-200" };
                      case "EYES_LOOKING_LEFT": return { title: "Eyes Looking Left", color: "text-sky-700 bg-sky-50 border-sky-200" };
                      case "EYES_LOOKING_RIGHT": return { title: "Eyes Looking Right", color: "text-sky-700 bg-sky-50 border-sky-200" };
                      case "EYES_LOOKING_UP": return { title: "Eyes Looking Up", color: "text-sky-700 bg-sky-50 border-sky-200" };
                      case "EYES_LOOKING_DOWN": return { title: "Eyes Looking Down", color: "text-sky-700 bg-sky-50 border-sky-200" };
                      default: return { title: type, color: "text-slate-600 bg-slate-50 border-slate-200" };
                    }
                  };

                  const cameraViolationTypes = new Set([
                    'FACE_NOT_DETECTED', 'MULTIPLE_FACES', 'HEAD_TURNED_LEFT', 'HEAD_TURNED_RIGHT',
                    'HEAD_LOOKING_UP', 'HEAD_LOOKING_DOWN', 'EYES_LOOKING_LEFT', 'EYES_LOOKING_RIGHT',
                    'EYES_LOOKING_UP', 'EYES_LOOKING_DOWN', 'CAMERA_VIOLATION'
                  ]);

                  const proctorEvents = logs.filter(
                    l => cameraViolationTypes.has((l.activityType || '').toUpperCase()) || Boolean(l.screenshotUrl)
                  );

                  return (
                    <div className="bg-gradient-to-r from-slate-50 via-rose-50/25 to-amber-50/25 border border-slate-200 rounded-2xl p-5 mb-6 shadow-xs">
                      {/* Section Header */}
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <ShieldAlert size={18} className="text-rose-600" />
                          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                            Security Audit & Proctoring Report
                          </h4>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          selectedResult.autoSubmitted ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
                        }`}>
                          {selectedResult.autoSubmitted ? "Auto Submitted" : "Completed Normally"}
                        </span>
                      </div>

                      {/* Summary Metrics Bar */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                        <div className="bg-white border border-slate-200/70 rounded-xl p-2.5 shadow-xs">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Warnings</span>
                          <span className="text-xs font-extrabold text-rose-600">{summary.totalWarnings || selectedResult.warningCount || 0} / 3</span>
                        </div>
                        <div className="bg-white border border-slate-200/70 rounded-xl p-2.5 shadow-xs">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Full-screen Exits</span>
                          <span className="text-xs font-extrabold text-rose-600">{summary.fullScreenExits || 0}</span>
                        </div>
                        <div className="bg-white border border-slate-200/70 rounded-xl p-2.5 shadow-xs">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Tab Switches</span>
                          <span className="text-xs font-extrabold text-amber-600">{summary.tabSwitches || 0}</span>
                        </div>
                        <div className="bg-white border border-slate-200/70 rounded-xl p-2.5 shadow-xs">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Proctoring Violations</span>
                          <span className={`text-xs font-extrabold ${proctorEvents.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {proctorEvents.length} Event{proctorEvents.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {selectedResult.submissionReason && (
                        <div className="bg-white border border-rose-200 rounded-xl p-3 mb-4">
                          <span className="text-[9px] font-extrabold text-rose-600 uppercase tracking-wider block mb-1">
                            Submission Reason
                          </span>
                          <p className="text-xs font-medium text-slate-800 italic">
                            "{selectedResult.submissionReason}"
                          </p>
                        </div>
                      )}

                      {/* Proctoring Events (Face & Eye Tracking) Section */}
                      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                          <div className="flex items-center gap-2">
                            <Camera size={14} className="text-indigo-600" />
                            <h5 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                              Proctoring Events
                            </h5>
                          </div>
                          <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full font-mono font-bold">
                            MediaPipe Face & Eye Detection
                          </span>
                        </div>

                        {proctorEvents.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                            {proctorEvents.map((evt, idx) => {
                              const meta = getActivityDetails(evt.activityType);
                              const durationNum = evt.duration ?? evt.details?.match(/(\d+(?:\.\d+)?)\s*sec/i)?.[1];
                              const durationText = durationNum ? `${durationNum}s` : '3.0s+';
                              const fullImgUrl = getFullScreenshotUrl(evt.screenshotUrl);

                              return (
                                <div 
                                  key={evt.id || idx} 
                                  className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 hover:border-indigo-300 transition-all flex flex-col justify-between gap-2.5 shadow-2xs"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                                      <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                                      <span>{meta.title}</span>
                                    </div>
                                    <span className="text-[10px] font-mono font-semibold text-slate-400 shrink-0">
                                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60">
                                    <span className="text-slate-500 font-mono text-[10px]">
                                      Duration: <strong className="text-slate-800 font-bold">{durationText}</strong>
                                    </span>
                                    {fullImgUrl ? (
                                      <button
                                        type="button"
                                        onClick={() => setScreenshotModal({
                                          imageUrl: fullImgUrl,
                                          title: meta.title,
                                          timestamp: evt.timestamp,
                                          duration: durationText
                                        })}
                                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] cursor-pointer flex items-center gap-1.5 shadow-xs transition-all"
                                      >
                                        <Eye size={11} />
                                        <span>View Screenshot</span>
                                      </button>
                                    ) : (
                                      <span className="text-[10px] font-mono text-slate-400 italic">
                                        No screenshot
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                              <CheckCircle size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-extrabold text-emerald-900">No proctoring violations detected.</p>
                              <p className="text-[11px] text-emerald-700 mt-0.5">The candidate maintained face alignment and on-screen eye focus throughout the assessment session.</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Chronological Activity Timeline */}
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                        <h5 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-3">
                          Chronological Activity Timeline ({logs.length > 0 ? logs.length : (selectedResult.warningHistory?.length || 0)} Events Recorded)
                        </h5>

                        {logs.length > 0 ? (
                          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                            {logs.map((log, idx) => {
                              const meta = getActivityDetails(log.activityType);
                              return (
                                <div key={log.id || idx} className="flex items-center justify-between text-xs border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-mono text-slate-400">
                                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${meta.color}`}>
                                      {meta.title}
                                    </span>
                                    {log.questionNumber && (
                                      <span className="text-[10px] font-bold text-slate-400">
                                        Q#{log.questionNumber}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-semibold text-slate-500 max-w-[180px] truncate">
                                    {log.details || (log.warningCount ? `Warning ${log.warningCount}` : '')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : selectedResult.warningHistory && selectedResult.warningHistory.length > 0 ? (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {selectedResult.warningHistory.map((timestamp, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                                <span className="text-slate-700 flex items-center gap-1.5">
                                  <AlertCircle size={12} className="text-rose-500 shrink-0" />
                                  Warning {idx + 1}: Exited full-screen environment
                                </span>
                                <span className="text-slate-400 font-mono text-[11px]">
                                  {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No suspicious activity or violations recorded during this assessment.</p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="bg-gradient-to-r from-dash-soft-pink to-dash-light-blue-bg/20 border border-dash-border-gray rounded-2xl p-5 mb-6">
                  <h4 className="text-xs font-extrabold text-dash-primary-purple uppercase tracking-wider mb-3">Overall AI Evaluation</h4>

                  <div className="grid grid-cols-3 gap-2 text-center border-b border-dash-border-gray/30 pb-4 mb-4">
                    <div>
                      <span className="text-2xl font-black text-dash-primary-purple">{selectedResult.percentage}%</span>
                      <span className="text-[10px] font-bold text-dash-light-purple uppercase block mt-1">Final Score</span>
                    </div>
                    <div>
                      <span className="text-2xl font-black text-dash-dark-purple">
                        {selectedResult.correctAnswers} / {selectedResult.totalQuestions}
                      </span>
                      <span className="text-[10px] font-bold text-dash-light-purple uppercase block mt-1">Correct Qns</span>
                    </div>
                    <div>
                      <span className="text-2xl font-black text-dash-dark-purple flex justify-center items-center gap-1">
                        {selectedResult.wrongAnswers}
                      </span>
                      <span className="text-[10px] font-bold text-dash-light-purple uppercase block mt-1">Incorrect Qns</span>
                    </div>
                  </div>

                  <div className="space-y-3.5 text-xs text-dash-dark-purple select-text">
                    <div className="bg-dash-white-card border border-dash-border-gray/40 rounded-xl p-3">
                      <span className="text-[9px] font-extrabold text-dash-primary-purple uppercase tracking-wider block mb-1">Hiring Recommendation</span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-dash-primary-purple/10 rounded-full font-bold text-xs text-dash-primary-purple">
                        <Sparkles size={12} />
                        {selectedResult.hiringRecommendation}
                      </span>
                    </div>
                    <div className="bg-dash-white-card border border-dash-border-gray/40 rounded-xl p-3">
                      <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Overall AI Feedback</span>
                      <p className="font-semibold leading-relaxed text-slate-700">{selectedResult.overallFeedback}</p>
                    </div>
                    <div className="bg-dash-white-card border border-dash-border-gray/40 rounded-xl p-3">
                      <span className="text-[9px] font-extrabold text-green-600 uppercase tracking-wider block mb-1">Overall Strengths</span>
                      <p className="font-semibold leading-relaxed text-green-800">{selectedResult.overallStrengths}</p>
                    </div>
                    <div className="bg-dash-white-card border border-dash-border-gray/40 rounded-xl p-3">
                      <span className="text-[9px] font-extrabold text-amber-600 uppercase tracking-wider block mb-1">Overall Weaknesses</span>
                      <p className="font-semibold leading-relaxed text-amber-800">{selectedResult.overallWeaknesses}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6 flex justify-end">
                  <button
                    disabled={recalculating}
                    onClick={() => handleReevaluate(selectedResult.assignmentId)}
                    className="flex items-center gap-2 px-4 py-2 border border-dash-primary-purple hover:bg-dash-primary-purple hover:text-dash-white-card rounded-xl text-xs font-bold text-dash-primary-purple transition-all cursor-pointer disabled:opacity-40"
                  >
                    <RefreshCw size={13} className={recalculating ? "animate-spin" : ""} />
                    <span>{recalculating ? "Re-grading..." : "Re-run AI Evaluation"}</span>
                  </button>
                </div>

                


                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-dash-dark-purple uppercase tracking-wider border-b border-dash-border-gray pb-2 mb-2">
                    Question-by-Question Breakdown
                  </h4>
                  {(selectedResult.questionsAnalysis || []).map((q, idx) => {
                    const isExpanded = expandedQuestions[q.questionId];
                    let badgeColor = 'text-green-600 bg-green-50 border-green-200';
                    if (q.status === 'Incorrect') {
                      badgeColor = 'text-rose-600 bg-rose-50 border-rose-200';
                    } else if (q.status === 'Partially Correct') {
                      badgeColor = 'text-amber-600 bg-amber-50 border-amber-200';
                    }

                    return (
                      <div key={q.questionId} className="border border-dash-border-gray/50 rounded-2xl overflow-hidden bg-dash-white-card">
                        <button
                          onClick={() => toggleQuestionExpand(q.questionId)}
                          className="w-full text-left p-4 bg-dash-light-blue-bg/10 hover:bg-dash-light-blue-bg/25 transition-colors flex items-center justify-between gap-4 cursor-pointer border-0 outline-none"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-bold text-dash-primary-purple uppercase tracking-wider">
                                Question {idx + 1} ({q.type})
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${badgeColor}`}>
                                {q.status}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-dash-dark-purple line-clamp-1">
                              {q.questionText}
                            </p>
                          </div>
                          <ChevronRight
                            size={16}
                            className={`text-dash-light-purple transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-90' : ''
                              }`}
                          />
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-t border-dash-border-gray/25 p-4 space-y-4 text-xs select-text bg-[#fcfcff]"
                            >
                              {['CODING', 'PYTHON_CODING', 'SQL', 'SCENARIO_CODING'].includes((q.type || '').toUpperCase()) ? (
                                <div className="space-y-4 w-full">
                                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 relative font-mono overflow-x-auto text-[11px] text-zinc-100 max-h-[300px]">
                                    <div className="absolute right-3.5 top-3 text-[9px] font-bold text-zinc-600 uppercase tracking-wider select-none">Submitted Code ({q.type})</div>
                                    <SyntaxHighlighter code={q.candidateAnswer || '# No answer submitted.'} language={(q.type || '').toUpperCase() === 'SQL' ? 'sql' : 'python'} />
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 text-center">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Passed Cases</span>
                                      <span className="text-sm font-black text-green-600 mt-0.5 block">{q.passedTestCases ?? 0}</span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 text-center">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Failed Cases</span>
                                      <span className="text-sm font-black text-rose-600 mt-0.5 block">{q.failedTestCases ?? 0}</span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 text-center">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Execution Time</span>
                                      <span className="text-sm font-black text-slate-700 mt-0.5 block">{q.runTime !== null && q.runTime !== undefined ? `${q.runTime}s` : '0.0s'}</span>
                                    </div>
                                  </div>

                                  {q.testResults && q.testResults.length > 0 && (
                                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2 max-h-[220px] overflow-y-auto">
                                      <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider block border-b border-zinc-800 pb-1.5">Test Case Execution Log</span>
                                      <div className="space-y-2">
                                        {q.testResults.map((tc, tcIdx) => (
                                          <div key={tcIdx} className="text-[11px] font-mono border-b border-zinc-800/40 pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-center justify-between font-bold text-xs">
                                              <span className="text-zinc-400">Test Case #{tc.testCaseIndex}</span>
                                              <span className={tc.passed ? "text-green-500" : "text-rose-500"}>{tc.passed ? "Passed" : "Failed"}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mt-1.5 text-zinc-500 text-[10px]">
                                              <div>Input: <span className="text-zinc-300">{tc.input}</span></div>
                                              <div>Expected: <span className="text-zinc-300">{tc.expectedOutput}</span></div>
                                              <div className="col-span-2">Actual Output: <span className={tc.passed ? "text-green-400" : "text-rose-400"}>{tc.actualOutput || (tc.stderr ? "Error" : "No output")}</span></div>
                                              {tc.stderr && <div className="col-span-2 text-rose-500 text-[9px] overflow-x-auto whitespace-pre-wrap">{tc.stderr}</div>}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-dash-white-card border border-dash-border-gray/40 rounded-xl p-3">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Recruiter Correct Answer</span>
                                    <p className="font-semibold text-slate-800 whitespace-pre-wrap">{q.correctAnswer}</p>
                                  </div>
                                  <div className="bg-dash-white-card border border-dash-border-gray/40 rounded-xl p-3">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Candidate Answer</span>
                                    <p className="font-semibold text-slate-800 whitespace-pre-wrap">{q.candidateAnswer || <span className="italic text-slate-400">Not Answered</span>}</p>
                                  </div>
                                </div>
                              )}

                              <div className="bg-violet-50/50 border border-violet-200/50 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-violet-700 uppercase tracking-wider">
                                  <Sparkles size={11} />
                                  <span>AI Evaluation Details</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-white border border-violet-100 rounded-xl p-3">
                                  <div>
                                    <span className="text-[9px] font-bold text-violet-500 uppercase tracking-wider">Match Percentage</span>
                                    <p className="text-base font-black text-slate-800 mt-0.5">{q.similarityScore !== null && q.similarityScore !== undefined ? q.similarityScore : (q.status === 'Correct' ? 100 : 0)}%</p>
                                  </div>
                                  <div>
                                    <span className="text-[9px] font-bold text-violet-500 uppercase tracking-wider">Marks Awarded</span>
                                    <p className="text-base font-black text-slate-800 mt-0.5">{q.marksAwarded} / {q.maxMarks}</p>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div>
                                    <strong className="text-[10px] uppercase text-slate-500 block mb-0.5">AI Explanation:</strong>
                                    <p className="text-xs font-semibold text-slate-700 leading-relaxed">{q.aiExplanation || q.feedback || "N/A"}</p>
                                  </div>
                                  <div>
                                    <strong className="text-[10px] uppercase text-green-600 block mb-0.5">Strengths:</strong>
                                    <p className="text-xs font-semibold text-green-800 leading-relaxed">{q.strengths || "None"}</p>
                                  </div>
                                  <div>
                                    <strong className="text-[10px] uppercase text-rose-500 block mb-0.5">Missing Points:</strong>
                                    <p className="text-xs font-semibold text-rose-800 leading-relaxed">{q.missingPoints || "None"}</p>
                                  </div>
                                  <div>
                                    <strong className="text-[10px] uppercase text-amber-600 block mb-0.5">Suggested Improvement:</strong>
                                    <p className="text-xs font-semibold text-amber-800 leading-relaxed">{q.suggestedImprovement || q.improvements || "None"}</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                  {(!selectedResult.questionsAnalysis || selectedResult.questionsAnalysis.length === 0) && (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                      <AlertCircle size={24} className="mx-auto mb-2 text-slate-400" />
                      <p className="font-bold text-slate-700">No question-level breakdown available</p>
                      <p className="text-[11px] text-slate-500 mt-1">This assessment may have been evaluated at an overall level, or question details have not been recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-dash-border-gray mt-6 shrink-0">
                <button
                  onClick={() => setSelectedResult(null)}
                  className="w-full py-3 rounded-xl bg-dash-primary-purple text-dash-white-card font-bold text-xs hover:bg-dash-dark-purple transition-all duration-200 flex items-center justify-center cursor-pointer border-none shadow-sm"
                >
                  Close Report
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
            {/* Proctoring Screenshot Preview Modal */}
      {screenshotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Camera size={16} />
                </div>
                <div>
                  <h3 className="font-outfit font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {screenshotModal.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Captured: {new Date(screenshotModal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setScreenshotModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Image Preview */}
            <div className="p-5 flex flex-col gap-3">
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 aspect-video flex items-center justify-center">
                <img
                  src={screenshotModal.imageUrl}
                  alt={screenshotModal.title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement.querySelector('.img-fallback');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="img-fallback hidden flex-col items-center justify-center p-6 text-center text-slate-400">
                  <CameraOff size={32} className="text-slate-500 mb-2" />
                  <p className="text-xs font-semibold text-slate-300">Screenshot image could not be loaded</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono break-all max-w-sm">{screenshotModal.imageUrl}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1">
                <span>Duration: <strong className="text-slate-800 dark:text-slate-200">{screenshotModal.duration}</strong></span>
                <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold">Proctoring Snapshot</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setScreenshotModal(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalResultsTab;