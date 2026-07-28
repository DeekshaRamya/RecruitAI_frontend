import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Editor from '@monaco-editor/react';
import logo from '../assets/systech.jpg';
import api from '../api';
import { useExamSecurity } from '../hooks/useExamSecurity';
import { ExamSecurityMonitor } from '../components/ExamSecurityMonitor';
import {
  Briefcase,
  LogOut,
  Menu,
  X,
  FileText,
  Award,
  TrendingUp,
  Volume2,
  Terminal,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  Play,
  Bell,
  Check,
  Loader2,
  Eye,
  Maximize2,
  Minimize2,
  RotateCcw,
  Code,
  Database,
  Table,
  Key,
  Send,
  Mic,
  VolumeX
} from 'lucide-react';

const MAX_QUESTIONS = 8;

const DatabaseSchemaVisualizer = ({ schemaLines, dataLines }) => {
  const [parsedTables, setParsedTables] = React.useState([]);
  const [activeTableIdx, setActiveTableIdx] = React.useState(0);
  const [viewMode, setViewMode] = React.useState('schema'); // 'schema' | 'data'

  React.useEffect(() => {
    if (!schemaLines && !dataLines) {
      setParsedTables([]);
      return;
    }

    const tables = {};

    if (schemaLines && Array.isArray(schemaLines)) {
      schemaLines.forEach(sql => {
        const cleaned = sql.replace(/\s+/g, ' ').trim();
        const match = cleaned.match(/CREATE\s+TABLE\s+(\w+)\s*\((.*)\)/i);
        if (match) {
          const tableName = match[1];
          const columnsText = match[2];

          const columns = [];
          let current = "";
          let parenCount = 0;
          for (let i = 0; i < columnsText.length; i++) {
            const char = columnsText[i];
            if (char === '(') parenCount++;
            if (char === ')') parenCount--;
            if (char === ',' && parenCount === 0) {
              columns.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          if (current.trim()) {
            columns.push(current.trim());
          }

          const parsedColumns = columns.map(col => {
            const parts = col.trim().split(/\s+/);
            const name = parts[0];
            let type = parts[1] || "";
            if (type.toUpperCase().startsWith("DECIMAL") || type.toUpperCase().startsWith("VARCHAR") || type.toUpperCase().startsWith("NUMERIC")) {
              const typeMatch = col.match(/(VARCHAR\s*\([^)]+\)|DECIMAL\s*\([^)]+\)|NUMERIC\s*\([^)]+\))/i);
              if (typeMatch) {
                type = typeMatch[1];
              }
            }
            const isPrimaryKey = col.toUpperCase().includes("PRIMARY KEY");
            const isForeignKey = col.toUpperCase().includes("REFERENCES");

            return { name, type, isPrimaryKey, isForeignKey };
          }).filter(c => c.name);

          tables[tableName] = {
            name: tableName,
            columns: parsedColumns,
            rows: []
          };
        }
      });
    }

    if (dataLines && Array.isArray(dataLines)) {
      dataLines.forEach(sql => {
        const cleaned = sql.replace(/\s+/g, ' ').trim();
        const match = cleaned.match(/INSERT\s+INTO\s+(\w+)\s+(?:VALUES\s*)?\((.*)\);?/i);
        if (match) {
          const tableName = match[1];

          if (tables[tableName]) {
            const rowsRaw = [];
            const valuesIndex = cleaned.toUpperCase().indexOf("VALUES");
            if (valuesIndex !== -1) {
              const afterValues = cleaned.substring(valuesIndex + 6).trim();
              let tuple = "";
              let inTuple = false;
              for (let i = 0; i < afterValues.length; i++) {
                const char = afterValues[i];
                if (char === '(') {
                  inTuple = true;
                  tuple = "";
                } else if (char === ')') {
                  inTuple = false;
                  rowsRaw.push(tuple);
                } else if (inTuple) {
                  tuple += char;
                }
              }
            } else {
              rowsRaw.push(match[2]);
            }

            rowsRaw.forEach(rowStr => {
              const rowValues = [];
              let curVal = "";
              let insideQuotes = false;
              for (let i = 0; i < rowStr.length; i++) {
                const char = rowStr[i];
                if (char === "'") {
                  insideQuotes = !insideQuotes;
                } else if (char === ',' && !insideQuotes) {
                  rowValues.push(curVal.trim().replace(/^'|'$/g, ''));
                  curVal = "";
                } else {
                  curVal += char;
                }
              }
              if (curVal.trim()) {
                rowValues.push(curVal.trim().replace(/^'|'$/g, ''));
              }
              tables[tableName].rows.push(rowValues);
            });
          }
        }
      });
    }

    setParsedTables(Object.values(tables));
    setActiveTableIdx(0);
  }, [schemaLines, dataLines]);

  if (parsedTables.length === 0) {
    // If we have raw schemas/data but parser couldn't read them, show raw text
    if ((schemaLines && schemaLines.length > 0) || (dataLines && dataLines.length > 0)) {
      return (
        <div className="mt-4 flex flex-col gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database size={16} className="text-dash-primary-purple" />
            <h4 className="text-xs font-bold text-dash-dark-purple uppercase tracking-wider">Database Tables Info</h4>
          </div>
          {schemaLines && schemaLines.length > 0 && (
            <div>
              <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Schema Definition:</span>
              <pre className="text-xs font-mono font-semibold text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 overflow-x-auto whitespace-pre-wrap">
                {schemaLines.join('\n\n')}
              </pre>
            </div>
          )}
          {dataLines && dataLines.length > 0 && (
            <div>
              <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Sample Data:</span>
              <pre className="text-xs font-mono font-semibold text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 overflow-x-auto whitespace-pre-wrap">
                {dataLines.join('\n\n')}
              </pre>
            </div>
          )}
        </div>
      );
    }
    return null;
  }

  const activeTable = parsedTables[activeTableIdx];

  return (
    <div className="mt-4 flex flex-col gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm select-text">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-dash-primary-purple" />
          <h4 className="text-xs font-bold text-dash-dark-purple uppercase tracking-wider">Required Tables</h4>
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/40">
          <button
            type="button"
            onClick={() => setViewMode('schema')}
            className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-md tracking-wider transition-all cursor-pointer border-0 ${viewMode === 'schema'
              ? 'bg-white text-dash-dark-purple shadow-sm'
              : 'text-slate-500 hover:text-slate-700 bg-transparent'
              }`}
          >
            Schema
          </button>
          <button
            type="button"
            onClick={() => setViewMode('data')}
            className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-md tracking-wider transition-all cursor-pointer border-0 ${viewMode === 'data'
              ? 'bg-white text-dash-dark-purple shadow-sm'
              : 'text-slate-500 hover:text-slate-700 bg-transparent'
              }`}
          >
            Sample Data
          </button>
        </div>
      </div>

      {parsedTables.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {parsedTables.map((tbl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveTableIdx(i)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTableIdx === i
                ? 'bg-dash-primary-purple/10 border-dash-primary-purple text-dash-primary-purple'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
            >
              <Table size={12} />
              <span>{tbl.name}</span>
            </button>
          ))}
        </div>
      )}

      {activeTable && (
        <div className="mt-1 flex flex-col gap-2">
          {parsedTables.length === 1 && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Table size={13} className="text-slate-400" />
              <span>Table: {activeTable.name}</span>
            </div>
          )}

          {viewMode === 'schema' ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200/60">
              <table className="min-w-full divide-y divide-slate-200/60 text-left text-xs text-slate-700">
                <thead className="bg-slate-50 font-bold uppercase tracking-wider text-[9px] text-slate-400">
                  <tr>
                    <th className="px-4 py-2">Column</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2 text-right">Key</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-medium">
                  {activeTable.columns.map((col, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-semibold font-mono text-slate-855">{col.name}</td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500">{col.type}</td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        {col.isPrimaryKey && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200/50">
                            <Key size={8} /> PK
                          </span>
                        )}
                        {col.isForeignKey && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200/50 ml-1">
                            FK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/60 max-h-[220px]">
              {activeTable.rows.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">No sample rows available.</div>
              ) : (
                <table className="min-w-full divide-y divide-slate-200/60 text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 font-bold uppercase tracking-wider text-[9px] text-slate-400 sticky top-0">
                    <tr>
                      {activeTable.columns.map((col, idx) => (
                        <th key={idx} className="px-4 py-2">{col.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-mono text-[11px] text-slate-650">
                    {activeTable.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-50/50">
                        {row.map((val, valIdx) => (
                          <td key={valIdx} className="px-4 py-2.5 whitespace-nowrap">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* CandidateResultsView removed */

const sortQuestionsForCandidate = (rawQuestions) => {
  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) return [];

  const subjectOrder = { aptitude: 0, sql: 1, python: 2, java: 3, javascript: 4, "c++": 5, "c#": 6 };

  const isMcq = (q) => {
    const t = String(q.type || q.question_type || 'MCQ').toUpperCase();
    if (t === 'MCQ') return true;
    if (Array.isArray(q.options) && q.options.length > 0 && t !== 'SCENARIO' && t !== 'CODING') return true;
    return false;
  };

  const mcqs = [];
  const scenarios = [];

  rawQuestions.forEach((q) => {
    const qCopy = { ...q };
    const mcqFlag = isMcq(qCopy);
    qCopy.type = mcqFlag ? 'MCQ' : 'SCENARIO';
    qCopy.question_type = qCopy.type;
    qCopy.topic = qCopy.topic || qCopy.subject || 'General';
    qCopy.subject = qCopy.subject || qCopy.topic || 'General';
    qCopy.difficulty = qCopy.difficulty || 'Medium';
    qCopy.marks = qCopy.marks || (mcqFlag ? 1 : 5);

    if (mcqFlag) {
      mcqs.push(qCopy);
    } else {
      scenarios.push(qCopy);
    }
  });

  const getSortKey = (q) => {
    const subj = String(q.subject || q.topic || 'General').toLowerCase().trim();
    const rank = subjectOrder[subj] !== undefined ? subjectOrder[subj] : 90;
    return rank;
  };

  mcqs.sort((a, b) => getSortKey(a) - getSortKey(b));
  scenarios.sort((a, b) => getSortKey(a) - getSortKey(b));

  const sorted = [...mcqs, ...scenarios];
  sorted.forEach((q, idx) => {
    q.sequence_order = idx + 1;
  });

  return sorted;
};

const isQuestionAnswered = (q, idx, answers) => {
  if (!q || answers === undefined || answers === null) return false;
  const ans = answers[idx];
  if (ans === undefined || ans === null || ans === '') return false;

  const isMcq = (q.type || q.question_type || '').toUpperCase() === 'MCQ' || (Array.isArray(q.options) && q.options.length > 0);
  if (isMcq) {
    return String(ans).trim() !== '';
  }

  // Default starter templates
  const starter = q.starterCode || q.starter_code || q.codeTemplate || q.exampleCode || '';
  const isSql = (q.subject || q.language || '').toLowerCase().includes('sql') || (q.question || '').toUpperCase().includes('SELECT');
  const isCoding = isSql || (q.type || '').includes('CODING') || (q.subject || q.language || '').toLowerCase().includes('python');

  const trimmedAns = String(ans).trim();
  if (starter && trimmedAns === String(starter).trim()) return false;
  if (isSql && trimmedAns === '-- Write your SQL query here') return false;
  if (isCoding && trimmedAns === 'def solution():\n    pass\n\nif __name__ == "__main__":\n    solution()') return false;

  return trimmedAns.length > 0;
};

const CandidateDashboard = ({ onLogout, initialTab = 'technical' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [toastMessage, setToastMessage] = useState('');

  const [candidate, setCandidate] = useState(() => {
    const saved = localStorage.getItem('current_candidate');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing current_candidate:", e);
      }
    }
    return {
      id: 3,
      name: 'Arjun Sharma',
      email: 'arjun.sharma@recruitai.com',
      role: 'Python Developer',
      date: '2026-07-06',
      resume: 84,
      python: 78,
      sql: 82,
      aptitude: 74,
      english: 88,
      final: 82,
      recommendation: 'Strong Hire',
      status: 'Completed'
    };
  });

  // English Speaking Assessment states
  const [englishLoading, setEnglishLoading] = useState(false);
  const [englishInterview, setEnglishInterview] = useState(null);
  const [englishText, setEnglishText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [englishTimeLeft, setEnglishTimeLeft] = useState(900); // 15 minutes = 900 seconds
  const [aiTyping, setAiTyping] = useState(false);
  const [voiceUsed, setVoiceUsed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [techRedirectCountdown, setTechRedirectCountdown] = useState(null);
  const [aiIsSpeaking, setAiIsSpeaking] = useState(false);
  const [voiceMode, setVoiceMode] = useState(true); // default to calling mode
  const [englishUploading, setEnglishUploading] = useState(false);
  const [englishUploadProgress, setEnglishUploadProgress] = useState(0);
  const [englishDragOver, setEnglishDragOver] = useState(false);
  const [englishUploadError, setEnglishUploadError] = useState('');
  const englishFileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Stop recording and stream on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { }
      }
      if (mediaStreamRef.current) {
        try {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        } catch (e) { }
      }
    };
  }, []);

  // Fetch candidate English interview status
  const fetchEnglishStatus = async () => {
    try {
      setEnglishLoading(true);
      const res = await api.get('/api/english-assessment/current');
      setEnglishInterview(res.data);
      if (res.data && res.data.status === 'IN_PROGRESS') {
        // Calculate remaining time
        const startTime = new Date(res.data.start_time).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const remaining = Math.max(0, 900 - elapsed);
        setEnglishTimeLeft(remaining);
      }
    } catch (err) {
      console.error("Failed to fetch English assessment status:", err);
    } finally {
      setEnglishLoading(false);
    }
  };

  // Start English Interview session
  const handleStartEnglish = async () => {
    try {
      setEnglishLoading(true);
      setAiTyping(true);
      const res = await api.post('/api/english-assessment/start');
      setEnglishInterview(res.data);
      setEnglishTimeLeft(900);
      setEnglishText('');

      // Auto TTS first question if not muted
      if (res.data && res.data.ai_question && !isMuted) {
        setTimeout(() => speakQuestion(res.data.ai_question), 800);
      }

      showToast("English Interview started! Welcome aboard.");
    } catch (err) {
      console.error("Failed to start English Assessment:", err);
      const errMsg = err.response?.data?.detail || "Failed to start interview. Make sure your technical assessment is completed.";
      showToast(errMsg);
    } finally {
      setEnglishLoading(false);
      setAiTyping(false);
    }
  };

  // Submit Answer to current question
  const handleRespondEnglish = async (textToSend) => {
    const finalAnswer = (textToSend && typeof textToSend === 'string') ? textToSend : englishText;
    if (!finalAnswer.trim()) return;

    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    try {
      setEnglishLoading(true);
      setAiTyping(true);
      const answerPayload = {
        answer: finalAnswer.trim(),
        voice_used: voiceUsed
      };

      const res = await api.post('/api/english-assessment/respond', answerPayload);

      setEnglishText('');

      // Fetch latest status to refresh conversation list
      await fetchEnglishStatus();

      showToast("Answer saved successfully!");
      // Speak next question out loud if not muted
      if (res.data && res.data.ai_question && !isMuted) {
        setTimeout(() => speakQuestion(res.data.ai_question), 800);
      }
    } catch (err) {
      console.error("Failed to submit English Assessment response:", err);
      showToast("Network connection error. Retrying auto-save...");
    } finally {
      setEnglishLoading(false);
      setAiTyping(false);
    }
  };

  // Conclude/Complete English Interview
  const handleCompleteEnglish = async () => {
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    try {
      setEnglishLoading(true);
      setAiTyping(true);
      await api.post('/api/english-assessment/complete', { voice_used: voiceUsed });
      showToast("English Assessment completed successfully!");
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setAiIsSpeaking(false);
      }
      await fetchEnglishStatus();
    } catch (err) {
      console.error("Failed to complete English Assessment:", err);
      showToast("Error completing assessment. Please try again.");
    } finally {
      setEnglishLoading(false);
      setAiTyping(false);
    }
  };

  // Reset and retake the English Interview
  const handleRetryEnglish = async () => {
    try {
      setEnglishLoading(true);
      await api.post('/api/english-assessment/retry');
      showToast("English assessment reset. You can now start a new interview.");
      await fetchEnglishStatus();
    } catch (err) {
      console.error("Failed to retry English interview:", err);
      showToast("Failed to reset interview. Please try again.");
    } finally {
      setEnglishLoading(false);
    }
  };

  // Upload and parse resume specifically for English Assessment
  const uploadEnglishResume = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf') {
      setEnglishUploadError('Only PDF files are supported.');
      showToast('Invalid file format');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setEnglishUploadError('File size exceeds the 5MB limit.');
      showToast('File too large');
      return;
    }

    setEnglishUploading(true);
    setEnglishUploadProgress(0);
    setEnglishUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/candidate/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setEnglishUploadProgress(percentCompleted);
        },
      });

      showToast('Resume uploaded and analyzed successfully!');

      // Update candidate user state so profile contains parsed details
      setCandidate(prev => ({
        ...prev,
        resume: response.data.resume_score || 85,
        name: response.data.full_name || response.data.name || prev.name
      }));

      // Immediately trigger interview start!
      await handleStartEnglish();

    } catch (err) {
      console.error("Upload error:", err);
      let errMsg = 'Failed to upload resume. Please try again.';
      if (err.response && err.response.data && err.response.data.detail) {
        errMsg = err.response.data.detail;
      }
      setEnglishUploadError(errMsg);
      showToast('Upload failed');
    } finally {
      setEnglishUploading(false);
    }
  };

  // TTS speak helper
  const speakQuestion = (text) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setAiIsSpeaking(true);

      // If mic is recording, temporarily stop it to avoid feedback loop
      if (isRecording) {
        stopRecording();
      }

      const cleanText = text.replace(/Welcome to the English Assessment.*?Click "Start Interview" to begin\./gi, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';

      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0];
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onstart = () => {
        setAiIsSpeaking(true);
      };

      utterance.onend = () => {
        setAiIsSpeaking(false);
        // Automatically start recording when AI finishes speaking, in Voice Mode!
        if (voiceMode && !isMuted) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (SpeechRecognition) {
            setTimeout(() => {
              startRecording(SpeechRecognition);
            }, 500);
          }
        }
      };

      utterance.onerror = () => {
        setAiIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle voice mute
  const toggleMute = () => {
    setIsMuted(prev => {
      const newVal = !prev;
      if (newVal && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setAiIsSpeaking(false);
      } else if (!newVal) {
        const activeQ = englishInterview?.current_question?.ai_question || englishInterview?.ai_question;
        if (activeQ) {
          speakQuestion(activeQ);
        }
      }
      return newVal;
    });
  };

  // Toggle Microphone / Web Speech API Speech-to-Text
  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording(SpeechRecognition);
    }
  };

  const startRecording = async (SpeechRecognition) => {
    try {
      // 1. Acquire media stream with noise suppression constraints to activate browser audio processing
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        mediaStreamRef.current = stream;
      } catch (err) {
        console.warn("Failed to apply microphone noise suppression constraints:", err);
      }

      const rec = new SpeechRecognition();
      rec.continuous = true; // Continuous listening, no silence-based auto-stop
      rec.interimResults = true; // Show words as candidate speaks
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecording(true);
        setVoiceUsed(true);
      };

      rec.onresult = (event) => {
        let localFinalTranscript = '';
        let interimTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            localFinalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        const text = localFinalTranscript + interimTranscript;
        setEnglishText(text);
      };

      rec.onerror = (e) => {
        console.error("Speech Recognition Error:", e.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) { }
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
  };

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (activeTab === 'english' && englishInterview && englishInterview.status === 'IN_PROGRESS') {
      timer = setInterval(() => {
        setEnglishTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // End interview automatically
            handleCompleteEnglish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTab, englishInterview]);

  // Load status on mount and when tab changes
  useEffect(() => {
    if (activeTab === 'english') {
      fetchEnglishStatus();
    }
  }, [activeTab]);


  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [activeAssignment, setActiveAssignment] = useState(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifications, setReadNotifications] = useState(() => {
    const saved = localStorage.getItem('recruitai_read_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const getNotificationsFromAssignments = () => {
    const notifs = [];
    const now = Date.now();
    const list = Array.isArray(assignments) ? assignments : [];
    list.forEach(asm => {
      if (asm && (asm.status === 'ASSIGNED' || asm.status === 'SCHEDULED' || asm.status === 'IN_PROGRESS')) {
        const startTimeVal = asm.startTime || asm.start_time;
        const isScheduled = startTimeVal ? new Date(startTimeVal).getTime() > now : false;
        const formattedTime = startTimeVal ? new Date(startTimeVal).toLocaleString() : 'immediately';

        const notifId = `assign-${asm.id}`;
        const isRead = Array.isArray(readNotifications) ? readNotifications.includes(notifId) : false;

        notifs.push({
          id: notifId,
          title: isScheduled ? "Assessment Scheduled" : "Assessment Assigned",
          message: `"${asm.assessmentName || asm.assessment?.name || 'Assessment'}" has been scheduled for you. You can take this test starting from ${formattedTime}.`,
          time: asm.assignedAt || asm.created_at || new Date(),
          startTime: startTimeVal,
          isScheduled: !!startTimeVal,
          isAvailable: !isScheduled,
          read: isRead,
          assignment: asm
        });
      }
    });
    return notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
  };

  const notifications = getNotificationsFromAssignments();
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    const ids = notifications.map(n => n.id);
    const updated = [...new Set([...(Array.isArray(readNotifications) ? readNotifications : []), ...ids])];
    setReadNotifications(updated);
    localStorage.setItem('recruitai_read_notifications', JSON.stringify(updated));
  };

  // Python Coding Sandbox states
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [runtimeError, setRuntimeError] = useState('');
  const [syntaxError, setSyntaxError] = useState('');
  const [executionTime, setExecutionTime] = useState(0);
  const [executionStatus, setExecutionStatus] = useState('');
  const [sqlQueryResult, setSqlQueryResult] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [consoleTab, setConsoleTab] = useState('output');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [examState, setExamState] = useState({
    currentQuestionIndex: 0,
    answers: {},
    executionOutputs: {},
    timeLeft: 0,
    submitted: false
  });

  const prevQuestionIndexRef = useRef(examState.currentQuestionIndex);

  // Sync compiler output state and starter code when navigating between questions
  useEffect(() => {
    const currentIdx = examState.currentQuestionIndex;
    const prevIdx = prevQuestionIndexRef.current;

    if (prevIdx !== undefined && prevIdx !== null && prevIdx !== currentIdx) {
      // Save output of previous question into examState.executionOutputs
      const currentOutputs = {
        consoleOutput,
        runtimeError,
        syntaxError,
        executionStatus,
        executionTime,
        sqlQueryResult,
        customInput,
        consoleTab
      };
      setExamState(prev => ({
        ...prev,
        executionOutputs: {
          ...(prev.executionOutputs || {}),
          [prevIdx]: currentOutputs
        }
      }));
    }

    // Load execution outputs for the new question (if any exist)
    const savedOutputs = examState.executionOutputs?.[currentIdx];
    if (savedOutputs) {
      setConsoleOutput(savedOutputs.consoleOutput || '');
      setRuntimeError(savedOutputs.runtimeError || '');
      setSyntaxError(savedOutputs.syntaxError || '');
      setExecutionStatus(savedOutputs.executionStatus || '');
      setExecutionTime(savedOutputs.executionTime || 0);
      setSqlQueryResult(savedOutputs.sqlQueryResult || null);
      setCustomInput(savedOutputs.customInput || '');
      setConsoleTab(savedOutputs.consoleTab || 'output');
    } else {
      // Reset console & compiler output for unexecuted question
      setConsoleOutput('');
      setRuntimeError('');
      setSyntaxError('');
      setExecutionStatus('');
      setExecutionTime(0);
      setSqlQueryResult(null);
      setCustomInput('');
      setConsoleTab('output');
    }

    // Initialize starter code for new question if candidate hasn't typed code yet
    const asm = activeAssignment?.assessment || activeAssignment || {};
    const questions = asm.questions || [];
    const question = questions[currentIdx];
    if (question && (examState.answers[currentIdx] === undefined || examState.answers[currentIdx] === null)) {
      const isSql = (question.type === 'SCENARIO' || question.type === 'SCENARIO_CODING' || question.type === 'CODING') &&
        (question.subject || question.language || '').toLowerCase().includes('sql');
      const isCoding = question.type === 'CODING' || question.type === 'PYTHON_CODING' ||
        (question.subject || '').toLowerCase().includes('python');

      let starter = question.starterCode || question.starter_code || question.codeTemplate || question.exampleCode || null;
      if (!starter) {
        if (isSql) {
          starter = '-- Write your SQL query here\n';
        } else if (isCoding) {
          starter = `def solution():\n    pass\n\nif __name__ == "__main__":\n    solution()`;
        } else {
          starter = '';
        }
      }

      setExamState(prev => ({
        ...prev,
        answers: {
          ...prev.answers,
          [currentIdx]: starter
        }
      }));
    }

    prevQuestionIndexRef.current = currentIdx;
  }, [examState.currentQuestionIndex, activeAssignment]);

  const isExamActive = !!(activeAssignment && !examState.submitted && activeTab === 'technical' && !isSubmitModalOpen && !isSubmittingManual);

  const parseDuration = (durStr) => {
    if (typeof durStr === 'number') return durStr;
    if (!durStr) return 30;
    const parsed = parseInt(String(durStr).replace(/\D/g, ''), 10);
    return isNaN(parsed) ? 30 : parsed;
  };

  const formatTime = (seconds) => {
    const sec = Math.max(0, parseInt(seconds, 10) || 0);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Initialize Exam Security hook
  const examSecurity = useExamSecurity({
    active: isExamActive,
    assignmentId: activeAssignment?.id || activeAssignment?.assignmentId,
    questionNumber: (examState.currentQuestionIndex || 0) + 1,
    remainingTime: formatTime(examState.timeLeft),
    maxViolations: 3,
    maxWarnings: 3,
    gracePeriodSeconds: 15,
    onLock: (reason) => {
      showToast(`Security Alert: ${reason}`);
    },
    onViolation: (violation) => {
      showToast(`Security Warning: ${violation.type} - ${violation.description}`);
    }
  });

  // Lock body scroll when active in assessment
  useEffect(() => {
    if (isExamActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isExamActive]);

  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const response = await api.get('/api/assignments/candidate');
      if (Array.isArray(response.data)) {
        setAssignments(response.data);
      } else {
        setAssignments([]);
      }
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Resume support: restore active exam state if candidate refreshes page or reconnects
  useEffect(() => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('recruitai_active_exam_')) {
          const savedRaw = localStorage.getItem(key);
          if (savedRaw) {
            const saved = JSON.parse(savedRaw);
            if (saved && saved.assignment && saved.examState && !saved.examState.submitted) {
              if (saved.lastSavedTimestamp) {
                const elapsedSeconds = Math.floor((Date.now() - saved.lastSavedTimestamp) / 1000);
                saved.examState.timeLeft = Math.max(0, saved.examState.timeLeft - elapsedSeconds);
              }
              setActiveAssignment(saved.assignment);
              setExamState(saved.examState);
              setActiveTab('technical');
              break;
            }
          }
        }
      }
    } catch (e) {
      console.warn("Failed to restore exam state from localStorage:", e);
    }
  }, []);

  // Synchronize active exam state to localStorage on state changes
  useEffect(() => {
    if (activeAssignment && examState && !examState.submitted) {
      try {
        const key = `recruitai_active_exam_${activeAssignment.id}`;
        localStorage.setItem(key, JSON.stringify({
          assignment: activeAssignment,
          examState: examState,
          lastSavedTimestamp: Date.now()
        }));
      } catch (e) {
        console.warn("Failed to save active exam state to localStorage:", e);
      }
    } else if (activeAssignment && examState?.submitted) {
      try {
        const key = `recruitai_active_exam_${activeAssignment.id}`;
        localStorage.removeItem(key);
      } catch (_e) { }
    }
  }, [activeAssignment, examState]);


  const handleStartExam = async (assignment) => {
    try {
      const asm = assignment?.assessment || assignment || {};
      const startTimeVal = assignment?.startTime || assignment?.start_time || asm?.startTime || asm?.start_time;
      if (startTimeVal && new Date(startTimeVal).getTime() > Date.now()) {
        showToast("This assessment is not available yet. Please wait until the scheduled time.");
        return;
      }

      let activeQuestions = asm.questions || [];
      try {
        const evalRes = await api.post('/api/evaluation/start', { assignmentId: assignment.id });
        if (evalRes.data?.questions && evalRes.data.questions.length > 0) {
          activeQuestions = evalRes.data.questions;
        }
      } catch (evalErr) {
        console.warn("Evaluation start endpoint notice:", evalErr);
        if (assignment?.status === 'ASSIGNED' || assignment?.status === 'SCHEDULED') {
          try {
            await api.patch(`/api/assignments/${assignment.id}/status`, { status: 'IN_PROGRESS' });
          } catch (patchErr) {
            console.warn("Status patch warning:", patchErr);
          }
        }
      }

      // Enforce Phase 1 (MCQ) -> Phase 2 (Scenario) ordering grouped by topic
      const sortedQuestions = sortQuestionsForCandidate(activeQuestions);

      setAssignments(prev => prev.map(a => a.id === assignment.id ? { ...a, status: 'IN_PROGRESS' } : a));

      const initialAnswers = {};
      sortedQuestions.forEach((q, idx) => {
        const isCoding = q.type === 'CODING' || q.type === 'PYTHON_CODING' || (q.subject || '').toLowerCase().includes('python');
        const isSql = (q.type === 'SCENARIO' || q.type === 'SCENARIO_CODING' || q.type === 'CODING') && (q.subject || q.language || '').toLowerCase().includes('sql');
        const starter = q.starterCode || q.starter_code || q.codeTemplate || q.exampleCode;

        if (starter) {
          initialAnswers[idx] = starter;
        } else if (isSql) {
          initialAnswers[idx] = '-- Write your SQL query here\n';
        } else if (isCoding) {
          initialAnswers[idx] = `def solution():\n    pass\n\nif __name__ == "__main__":\n    solution()`;
        } else {
          initialAnswers[idx] = '';
        }
      });

      const assignmentToSet = {
        ...assignment,
        assessment: {
          ...asm,
          questions: sortedQuestions
        }
      };

      if (examSecurity?.resetExamSecurity) {
        examSecurity.resetExamSecurity();
      }

      setActiveAssignment(assignmentToSet);
      setActiveTab('technical');
      setExamState({
        currentQuestionIndex: 0,
        answers: initialAnswers,
        executionOutputs: {},
        timeLeft: parseDuration(asm.duration || "30") * 60,
        submitted: false
      });

      // Request browser full-screen mode on exam start
      setTimeout(() => {
        if (examSecurity?.requestFullscreen) {
          examSecurity.requestFullscreen();
        }
      }, 100);
    } catch (err) {
      console.error("Failed to start assessment:", err);
      let errMsg = "Error starting assessment. Please try again.";
      if (typeof err.response?.data?.detail === 'object') {
        errMsg = err.response.data.detail.message || JSON.stringify(err.response.data.detail);
      } else if (typeof err.response?.data?.detail === 'string') {
        errMsg = err.response.data.detail;
      } else if (err.message) {
        errMsg = err.message;
      }
      showToast(errMsg);
    }
  };

  const handleSubmitExam = async (assignmentIdOverride, securityMetadata = {}) => {
    const targetId = assignmentIdOverride || activeAssignment?.id || activeAssignment?.assignmentId || activeAssignment?._id;
    if (!targetId) {
      console.error("No active target assignment ID found for submission.");
      showToast("Error: No active assignment ID found.");
      return;
    }

    if (isSubmittingManual) {
      return;
    }

    setIsSubmittingManual(true);

    try {
      try {
        localStorage.removeItem(`recruitai_active_exam_${targetId}`);
      } catch (_e) { }

      const asm = activeAssignment?.assessment || activeAssignment || {};
      const questions = asm.questions || [];
      const answersPayload = questions.map((q, idx) => {
        const qId = q.id !== undefined && q.id !== null ? q.id : (q.question || idx);
        return {
          questionId: String(qId),
          answer: examState.answers[idx] !== undefined && examState.answers[idx] !== null ? String(examState.answers[idx]) : ""
        };
      });

      const durationSeconds = parseDuration(asm.duration || "30") * 60;
      const timeTaken = Math.max(0, durationSeconds - (examState.timeLeft || 0));
      const isAuto = securityMetadata?.autoSubmitted === true;

      const payload = {
        assignmentId: targetId,
        answers: answersPayload,
        timeTaken: Math.round(timeTaken),
        autoSubmitted: isAuto,
        submissionReason: securityMetadata?.submissionReason || null,
        warningCount: securityMetadata?.warningCount ?? examSecurity?.fullscreenExitCount ?? 0,
        warningHistory: securityMetadata?.warningHistory || examSecurity?.warningHistory || []
      };

      await api.post('/api/assessment/submit', payload);

      setExamState(prev => ({ ...prev, submitted: true }));
      setIsSubmitModalOpen(false);
      await fetchAssignments();
    } catch (err) {
      console.error("Failed to submit exam:", err);
      const detail = err?.response?.data?.detail;
      const errMsg = typeof detail === 'string' ? detail : (detail?.message || "Error submitting assessment. Please try again.");
      showToast(errMsg);
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const handleRunCode = async (currentCode, currentQuestion) => {
    if (!currentCode) return;
    setIsExecuting(true);
    setConsoleTab('output');
    setConsoleOutput('Running query...');
    setRuntimeError('');
    setSyntaxError('');
    setExecutionStatus('');
    setExecutionTime(0);
    setSqlQueryResult(null);

    let funcName = currentQuestion?.function_name || currentQuestion?.functionName || null;
    if (!funcName && currentCode) {
      const match = currentCode.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
      if (match) {
        funcName = match[1];
      }
    }

    let parsedInputs = currentQuestion?.inputs || null;
    if (!parsedInputs && customInput) {
      try {
        parsedInputs = JSON.parse(customInput);
      } catch (_e) {
        // Fallback to plain string input
      }
    }

    const codeTrim = (currentCode || '').trim().toUpperCase();
    const looksLikeSql = codeTrim.startsWith('SELECT') ||
      codeTrim.startsWith('WITH') ||
      codeTrim.startsWith('UPDATE') ||
      codeTrim.startsWith('INSERT') ||
      codeTrim.startsWith('DELETE') ||
      codeTrim.startsWith('CREATE') ||
      codeTrim.startsWith('ALTER') ||
      codeTrim.startsWith('DROP') ||
      codeTrim.startsWith('USE') ||
      codeTrim.startsWith('EXEC') ||
      codeTrim.startsWith('--');

    const isSql = looksLikeSql || (currentQuestion && (
      (currentQuestion.subject || '').toLowerCase().includes('sql') ||
      (currentQuestion.language || '').toLowerCase().includes('sql') ||
      (currentQuestion.topic || '').toLowerCase().includes('sql') ||
      (currentQuestion.type || '').toLowerCase().includes('sql')
    ));

    if (isSql) {
      try {
        const payload = {
          query: currentCode,
          serverType: "sqlserver",
          credentials: {
            host: "172.176.122.4",
            port: 1433,
            database: "AdventureWorks",
            username: "readonly_user",
            password: "Readonly@123"
          },
          examId: String(activeAssignment?.id || "exam_123"),
          userEmail: candidate?.email || "candidate@example.com"
        };
        const res = await api.post('/run-sql', payload);
        const data = res.data;

        if (data.status === 'Success' && Array.isArray(data.rows)) {
          let tableText = `Query Executed Successfully! (${data.rowCount} rows, ${data.executionTime}ms)\n\n`;
          if (data.columns && data.columns.length > 0) {
            tableText += data.columns.join(' | ') + '\n';
            tableText += data.columns.map(() => '---').join('-|-') + '\n';
            data.rows.slice(0, 50).forEach(row => {
              tableText += data.columns.map(col => String(row[col] ?? '')).join(' | ') + '\n';
            });
            if (data.rows.length > 50) {
              tableText += `\n... ${data.rows.length - 50} more rows truncated.`;
            }
          }
          setSqlQueryResult(data);
          setConsoleOutput(tableText);
          setRuntimeError('');
          setSyntaxError('');
          setExecutionTime((data.executionTime || 0) / 1000);
          setExecutionStatus('Success');

          setExamState(prev => ({
            ...prev,
            executionOutputs: {
              ...(prev.executionOutputs || {}),
              [examState.currentQuestionIndex]: {
                consoleOutput: tableText,
                runtimeError: '',
                syntaxError: '',
                executionTime: (data.executionTime || 0) / 1000,
                executionStatus: 'Success',
                sqlQueryResult: data,
                customInput,
                consoleTab: 'output'
              }
            }
          }));
        } else {
          const rErr = data.runtime_error || 'SQL Query Execution Error';
          const sErr = data.syntax_error || '';
          const exTime = (data.executionTime || 0) / 1000;
          setSqlQueryResult(null);
          setConsoleOutput('');
          setRuntimeError(rErr);
          setSyntaxError(sErr);
          setExecutionTime(exTime);
          setExecutionStatus('Error');

          setExamState(prev => ({
            ...prev,
            executionOutputs: {
              ...(prev.executionOutputs || {}),
              [examState.currentQuestionIndex]: {
                consoleOutput: '',
                runtimeError: rErr,
                syntaxError: sErr,
                executionTime: exTime,
                executionStatus: 'Error',
                sqlQueryResult: null,
                customInput,
                consoleTab: 'output'
              }
            }
          }));
        }
      } catch (err) {
        console.error("Failed to run SQL query:", err);
        const errMsg = err.response?.data?.detail || err.message || "SQL Execution error.";
        setSqlQueryResult(null);
        setRuntimeError(errMsg);
        setExecutionStatus('Error');

        setExamState(prev => ({
          ...prev,
          executionOutputs: {
            ...(prev.executionOutputs || {}),
            [examState.currentQuestionIndex]: {
              consoleOutput: '',
              runtimeError: errMsg,
              syntaxError: '',
              executionTime: 0,
              executionStatus: 'Error',
              sqlQueryResult: null,
              customInput,
              consoleTab: 'output'
            }
          }
        }));
      } finally {
        setIsExecuting(false);
      }
      return;
    }

    try {
      const payload = {
        code: currentCode,
        async: false,
        function_name: funcName,
        inputs: parsedInputs,
        input: typeof customInput === 'string' ? customInput : ''
      };

      const res = await api.post('/run-python', payload);
      const data = res.data;
      const outText = data.output || data.stdout || '';
      const rErr = data.runtime_error || '';
      const sErr = data.syntax_error || '';
      const exTime = data.execution_time || 0;
      const exStat = data.status || 'Success';

      setConsoleOutput(outText);
      setRuntimeError(rErr);
      setSyntaxError(sErr);
      setExecutionTime(exTime);
      setExecutionStatus(exStat);

      setExamState(prev => ({
        ...prev,
        executionOutputs: {
          ...(prev.executionOutputs || {}),
          [examState.currentQuestionIndex]: {
            consoleOutput: outText,
            runtimeError: rErr,
            syntaxError: sErr,
            executionTime: exTime,
            executionStatus: exStat,
            sqlQueryResult: null,
            customInput,
            consoleTab: 'output'
          }
        }
      }));
    } catch (err) {
      console.error("Failed to run code:", err);
      const errMsg = err.response?.data?.detail || err.message || "Execution error.";
      setRuntimeError(errMsg);
      setExecutionStatus('Error');

      setExamState(prev => ({
        ...prev,
        executionOutputs: {
          ...(prev.executionOutputs || {}),
          [examState.currentQuestionIndex]: {
            consoleOutput: '',
            runtimeError: errMsg,
            syntaxError: '',
            executionTime: 0,
            executionStatus: 'Error',
            sqlQueryResult: null,
            customInput,
            consoleTab: 'output'
          }
        }
      }));
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitCode = async (currentCode, currentQuestion) => {
    if (!currentCode) {
      showToast("Please enter Python code before submitting.");
      return;
    }
    const assessmentId = activeAssignment?.assessment_id || activeAssignment?.assessment?.id;
    const questionId = String(currentQuestion?.id || currentQuestion?.question || currentQuestion?.title || examState.currentQuestionIndex);

    if (!assessmentId) {
      showToast("Assessment ID missing.");
      return;
    }

    setIsSubmittingCode(true);
    try {
      await api.post('/api/assessment/submit-code', {
        assessmentId: assessmentId,
        questionId: questionId,
        code: currentCode,
        assignmentId: activeAssignment?.id
      });
      showToast("Python code saved in PostgreSQL successfully!");
    } catch (err) {
      console.error("Failed to submit code:", err);
      const errMsg = err.response?.data?.detail || err.message || "Error submitting code.";
      showToast(errMsg);
    } finally {
      setIsSubmittingCode(false);
    }
  };

  const handleResetCode = (currentIdx) => {
    if (window.confirm("Are you sure you want to reset your code to the default template? Any unsaved changes will be lost.")) {
      const asm = activeAssignment?.assessment || activeAssignment || {};
      const questions = asm.questions || [];
      const q = questions[currentIdx];
      const isSql = q && (q.type === 'SCENARIO' || q.type === 'SCENARIO_CODING' || q.type === 'CODING') && (q.subject || q.language || '').toLowerCase().includes('sql');
      const isCoding = q && (q.type === 'CODING' || q.type === 'PYTHON_CODING' || (q.subject || '').toLowerCase().includes('python'));
      const starter = q?.starterCode || q?.starter_code || q?.codeTemplate || q?.exampleCode;
      const template = starter || (isSql
        ? '-- Write your SQL query here\n'
        : isCoding
          ? `def solution():\n    pass\n\nif __name__ == "__main__":\n    solution()`
          : '');

      setExamState(prev => ({
        ...prev,
        answers: {
          ...prev.answers,
          [currentIdx]: template
        },
        executionOutputs: {
          ...(prev.executionOutputs || {}),
          [currentIdx]: null
        }
      }));

      setConsoleOutput('');
      setRuntimeError('');
      setSyntaxError('');
      setExecutionStatus('');
      setExecutionTime(0);
      setSqlQueryResult(null);
      setCustomInput('');
      setConsoleTab('output');
      showToast("Code and compiler output reset to starter template.");
    }
  };


  useEffect(() => {
    if (!activeAssignment || examState.submitted || examState.timeLeft <= 0) return;

    // Pause timer if exam security warning dialog is open or full-screen is not active
    if (!examSecurity.isFullscreen || examSecurity.isExamLocked) {
      return;
    }

    const timer = setInterval(() => {
      setExamState((prev) => {
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            handleSubmitExam(activeAssignment.id);
          }, 0);
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeAssignment, examState.submitted, examState.timeLeft, examSecurity.isFullscreen, examSecurity.isExamLocked]);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const uploadFile = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf') {
      setUploadError('Only PDF files are supported.');
      showToast('Invalid file format');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB limit.');
      showToast('File too large');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/candidate/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      const updatedUser = response.data;

      const updatedCandidate = {
        ...candidate,
        resume: updatedUser.resume_score || 85,
        name: updatedUser.full_name || updatedUser.name || candidate.name,
        python: updatedUser.python_score || 0,
        sql: updatedUser.sql_score || 0,
        aptitude: updatedUser.aptitude_score || 0,
        english: updatedUser.english_score || 0,
        final: Math.round(
          ((updatedUser.python_score || 0) +
            (updatedUser.sql_score || 0) +
            (updatedUser.aptitude_score || 0) +
            (updatedUser.english_score || 0)) / 4
        ) || 80,
        resume_filename: updatedUser.resume_filename || file.name,
        resume_analysis: updatedUser.resume_analysis || [
          "Demonstrates solid background in core development.",
          "Demonstrates practical hands-on experience in SQL database schema design.",
          "Clear project organization and excellent written communication."
        ],
        status: 'Completed'
      };

      setCandidate(updatedCandidate);
      localStorage.setItem('current_candidate', JSON.stringify(updatedCandidate));

      const storedCandidates = localStorage.getItem('recruitai_candidates');
      if (storedCandidates) {
        try {
          const list = JSON.parse(storedCandidates);
          const idx = list.findIndex(c => c.email.toLowerCase() === candidate.email.toLowerCase());
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...updatedCandidate };
            localStorage.setItem('recruitai_candidates', JSON.stringify(list));
          }
        } catch (e) {
          console.error("Error updating candidates list:", e);
        }
      }

      showToast('Resume uploaded and analyzed successfully!');
    } catch (err) {
      console.error("Upload error:", err);
      let errMsg = 'Failed to upload resume. Please try again.';
      if (err.response && err.response.data && err.response.data.detail) {
        errMsg = err.response.data.detail;
      }
      setUploadError(errMsg);
      showToast('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('current_candidate');
    onLogout();
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  const firstName = candidate.name.split(' ')[0];

  const getHeaderContent = () => {
    switch (activeTab) {
      case 'resume':
        return {
          title: 'Resume Upload',
          tag: 'Upload',
          subtitle: 'Upload your resume for AI-powered skill extraction and analysis.'
        };
      case 'technical':
        return {
          title: 'Technical Assessment',
          tag: 'Test',
          subtitle: 'AI-generated questions based on topics selected by your recruiter.'
        };
      case 'english':
        return {
          title: 'English Speaking Assessment',
          tag: 'Speaking',
          subtitle: 'AI-generated questions based on your resume. Speak clearly and confidently.'
        };
      default:
        return {
          title: 'Candidate Portal',
          tag: 'Workspaces',
          subtitle: 'Complete assessments and view progress details.'
        };
    }
  };

  /* Removed dashboard-specific local statistics and skill lists */

  return (
    <div className="candidate-dashboard-theme bg-dash-light-blue-bg text-dash-dark-purple min-h-screen relative overflow-hidden font-inter flex w-full">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl bg-dash-white-card border border-dash-border-gray shadow-[0_10px_25px_rgba(87,82,170,0.1)] flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-dash-primary-purple animate-ping" />
            <span className="text-sm font-semibold text-dash-dark-purple tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. SIDEBAR (Full-Height Solid Layout matching Recruiter) */}
      {!isExamActive && (
        <aside className="hidden lg:flex flex-col w-[260px] h-screen shrink-0 bg-dash-sidebar-bg pt-8 pb-8 pl-6 pr-0 relative z-30 text-dash-dark-purple shadow-[4px_0_24px_rgba(0,0,0,0.03)] justify-between">
          <div>
            {/* Branding */}
            <div className="flex items-center gap-3 px-2 py-4 mb-6">
              <img src={logo} alt="RecruitAI Logo" className="w-12 h-12 rounded-2xl object-cover shadow-md shrink-0" />
              <div>
                <h1 className="font-outfit font-bold text-base tracking-tight text-dash-dark-purple leading-none">RecruitAI</h1>
                <span className="text-[10px] text-dash-light-purple font-medium tracking-widest uppercase">Candidate Portal</span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              {[
                { id: 'technical', label: 'Technical Test', icon: Terminal },
                { id: 'english', label: 'English Speaking', icon: Volume2 },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id !== 'resume' && item.id !== 'technical' && item.id !== 'english') {
                        showToast(`"${item.label}" feature is coming soon!`);
                      }
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-l-[24px] rounded-r-none text-sm font-bold transition-all duration-300 relative group ${isActive
                      ? 'sidebar-active-tab shadow-sm'
                      : 'text-dash-light-purple hover:text-dash-dark-purple hover:bg-dash-primary-purple/20'
                      }`}
                  >
                    <Icon size={18} className="relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            {/* Centered Lottie Animation */}
            <div className="flex items-center justify-center py-4 px-6 mt-2">
              <div className="w-48 h-48 flex items-center justify-center">
                <DotLottieReact
                  src="https://lottie.host/f5bd2f6c-67a9-44d5-954d-96176d4cb3df/USuWgujLWd.lottie"
                  loop
                  autoplay
                />
              </div>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="space-y-4">
            <div className="border-t border-dash-border-gray/25 pt-4 px-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-dash-primary-purple flex items-center justify-center font-semibold text-dash-white-card">
                  {(candidate?.name || candidate?.full_name || 'Candidate').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-semibold text-dash-dark-purple truncate">{candidate?.name || candidate?.full_name || 'Candidate'}</h4>
                  <span className="text-[10px] text-dash-light-purple truncate block">Candidate</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-dash-light-purple hover:bg-dash-primary-purple/20 transition-all duration-200 cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Sidebar Backdrop & Content */}
      {!isExamActive && (
        <>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-dash-dark-purple z-40 lg:hidden"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
                className="fixed top-0 bottom-0 left-0 w-[270px] pt-6 pb-6 pl-6 pr-0 z-50 lg:hidden flex flex-col bg-dash-sidebar-bg text-dash-dark-purple border-r border-dash-border-gray/25"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <img src={logo} alt="RecruitAI Logo" className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0" />
                    <h1 className="font-outfit font-bold text-base text-dash-dark-purple">RecruitAI</h1>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-lg hover:bg-dash-primary-purple/20 text-dash-light-purple hover:text-dash-dark-purple mr-4"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="space-y-1 flex-1">
                  {[
                    { id: 'technical', label: 'Technical Test', icon: Terminal },
                    { id: 'english', label: 'English Speaking', icon: Volume2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                          if (item.id !== 'resume' && item.id !== 'technical' && item.id !== 'english') {
                            showToast(`"${item.label}" feature is coming soon!`);
                          }
                        }}
                        className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-l-[24px] rounded-r-none text-sm font-bold transition-all duration-200 ${isActive
                          ? 'sidebar-active-tab shadow-sm'
                          : 'text-dash-light-purple hover:text-dash-dark-purple hover:bg-dash-primary-purple/20'
                          }`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
                {/* Centered Lottie Animation */}
                <div className="flex items-center justify-center py-2 pr-4 my-2">
                  <div className="w-44 h-44 flex items-center justify-center">
                    <DotLottieReact
                      src="https://lottie.host/f5bd2f6c-67a9-44d5-954d-96176d4cb3df/USuWgujLWd.lottie"
                      loop
                      autoplay
                    />
                  </div>
                </div>

                <div className="border-t border-dash-border-gray/25 pt-4 space-y-3 mr-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-9 h-9 rounded-full bg-dash-primary-purple flex items-center justify-center font-semibold text-dash-white-card">
                      {(candidate?.name || candidate?.full_name || 'Candidate').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-dash-dark-purple">{candidate?.name || candidate?.full_name || 'Candidate'}</h4>
                      <span className="text-[10px] text-dash-light-purple">Candidate</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-dash-light-purple hover:bg-dash-primary-purple/20 transition-all duration-200"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </>
      )}

      {/* 2. MAIN WORKSPACE */}
      <main className={isExamActive ? "fixed inset-0 z-40 bg-dash-light-blue-bg overflow-hidden flex flex-col p-4 sm:p-6 lg:p-8 w-screen h-screen" : "flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 relative z-20 overflow-y-auto h-screen max-h-screen"}>
        {/* HEADER SECTION (Horizontal White Card style) */}
        {!isExamActive && (
          <header className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-5 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2 lg:mt-0 shadow-[0_4px_20px_rgba(87,82,170,0.03)]">
            <div className="flex items-center gap-3">
              {/* Hamburger menu for small screens */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-dash-white-card border border-dash-border-gray text-dash-primary-purple hover:bg-dash-soft-pink transition-all duration-200"
              >
                <Menu size={20} />
              </button>

              <div>
                <h2 className="text-xl sm:text-2xl font-plus-jakarta font-extrabold tracking-tight text-dash-dark-purple flex items-center gap-2">
                  {getHeaderContent().title}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-dash-primary-purple/10 border border-dash-border-gray text-dash-primary-purple font-outfit">{getHeaderContent().tag}</span>
                </h2>
                <p className="text-xs sm:text-sm text-dash-light-purple font-semibold mt-0.5">
                  {getHeaderContent().subtitle}
                </p>
              </div>
            </div>

            {/* Right Area: Notifications bell */}
            <div className="flex items-center gap-3 self-end sm:self-center relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl bg-dash-white-card border border-dash-border-gray text-dash-primary-purple hover:bg-dash-soft-pink transition-all duration-300 hover:scale-105 cursor-pointer flex items-center justify-center"
              >
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border-2 border-white" />
                )}
                <Bell size={18} />
              </button>

              {/* Notifications Dropdown Panel */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-45" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-3 w-80 bg-dash-white-card border border-dash-border-gray rounded-2xl shadow-xl z-50 p-4 flex flex-col gap-3 max-h-96 overflow-y-auto"
                    >
                      <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-2">
                        <h4 className="text-xs font-extrabold text-dash-dark-purple uppercase tracking-wider">Notifications</h4>
                        {unreadNotificationsCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-[10px] font-bold text-dash-primary-purple hover:underline bg-transparent border-0 cursor-pointer"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-xs text-dash-light-purple font-semibold">
                            No notifications found.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-3 rounded-xl border text-xs leading-relaxed flex flex-col gap-1.5 transition-all ${notif.read
                                ? 'bg-slate-50/50 border-slate-100 text-slate-500 font-medium'
                                : 'bg-dash-primary-purple/5 border-dash-primary-purple/20 text-dash-dark-purple font-semibold'
                                }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-extrabold text-dash-primary-purple">{notif.title}</span>
                                <span className="text-[9px] text-dash-light-purple font-medium whitespace-nowrap">
                                  {new Date(notif.time).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-[11px] leading-normal">{notif.message}</p>
                              {notif.isScheduled && (
                                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/50">
                                  <span className="text-[10px] font-bold text-slate-500">
                                    Starts: {new Date(notif.startTime).toLocaleString()}
                                  </span>
                                  {notif.isAvailable ? (
                                    <button
                                      onClick={() => {
                                        setShowNotifications(false);
                                        setActiveTab('technical');
                                        handleStartExam(notif.assignment);
                                      }}
                                      className="px-2.5 py-1 bg-dash-primary-purple text-white text-[9px] font-extrabold rounded-lg border-0 cursor-pointer hover:bg-dash-dark-purple transition-all"
                                    >
                                      Start Now
                                    </button>
                                  ) : (
                                    <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 border border-amber-200/50 px-1.5 py-0.5 rounded-full uppercase">
                                      Locked
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </header>
        )}





        {activeTab === 'technical' && !activeAssignment && (
          <div className="w-full flex flex-col gap-6 animate-fade-in">
            {loadingAssignments ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-dash-primary-purple border-t-transparent animate-spin" />
                <p className="text-sm font-semibold text-dash-light-purple">Loading your assessments...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] shadow-sm max-w-2xl mx-auto w-full text-center p-8">
                <div className="w-16 h-16 rounded-full bg-dash-primary-purple/10 flex items-center justify-center text-dash-primary-purple mb-4">
                  <Terminal size={32} />
                </div>
                <h3 className="font-plus-jakarta font-extrabold text-xl text-dash-dark-purple">
                  No Assessments Assigned Yet
                </h3>
                <p className="text-sm text-dash-light-purple font-semibold mt-2 max-w-md">
                  Your recruiter will assign technical assessments for you to take here. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assignments.map((assignment) => {
                  const asm = assignment?.assessment || assignment || {};
                  const isCompleted = assignment.status === 'COMPLETED';
                  const isInProgress = assignment.status === 'IN_PROGRESS';

                  return (
                    <div
                      key={assignment.id}
                      className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_25px_rgba(87,82,170,0.02)] flex flex-col justify-between gap-5 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase border bg-dash-soft-pink border-dash-border-gray/50 text-dash-dark-purple">
                          {asm.difficulty}
                        </span>

                        {/* Status Badge */}
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${isCompleted
                          ? 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20'
                          : isInProgress
                            ? 'text-[#f97316] bg-[#f97316]/10 border-[#f97316]/20'
                            : 'text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/20'
                          }`}>
                          {assignment.status}
                        </span>
                      </div>

                      {/* Title & Subjects */}
                      <div>
                        <h4 className="font-plus-jakarta font-extrabold text-lg text-dash-dark-purple tracking-tight line-clamp-1">
                          {asm.name}
                        </h4>
                        <p className="text-xs font-bold text-dash-light-purple mt-1 font-mono">
                          Subjects: {asm.subjects ? (Array.isArray(asm.subjects) ? asm.subjects.join(', ') : asm.subjects) : ''}
                        </p>
                      </div>

                      {/* Detail Metrics Grid */}
                      <div className="grid grid-cols-2 gap-3 w-full bg-dash-light-blue-bg/40 border border-dash-border-gray/30 rounded-2xl p-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider">Duration</span>
                          <span className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple">{asm.duration}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider">Questions</span>
                          <span className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple">{asm.questionsCount} items</span>
                        </div>
                        <div className="flex flex-col gap-0.5 col-span-2 border-t border-dash-border-gray/25 pt-2 mt-1">
                          <span className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider">Assigned Date</span>
                          <span className="font-semibold text-xs text-dash-dark-purple">
                            {new Date(assignment.assignedAt).toLocaleString()}
                          </span>
                        </div>
                        {assignment.dueDate && (
                          <div className="flex flex-col gap-0.5 col-span-2 border-t border-dash-border-gray/25 pt-2">
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Due Date</span>
                            <span className="font-semibold text-xs text-red-600">
                              {new Date(assignment.dueDate).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {isCompleted ? (
                        <div className="w-full py-3 rounded-xl bg-dash-success-green/10 text-dash-success-green text-center font-bold text-sm border border-dash-success-green/20 flex items-center justify-center gap-2">
                          <CheckCircle2 size={16} />
                          <span>Completed</span>
                        </div>
                      ) : (() => {
                        const startTimeVal = assignment.startTime || assignment.start_time;
                        const isFuture = startTimeVal ? new Date(startTimeVal).getTime() > Date.now() : false;
                        if (isFuture) {
                          return (
                            <div className="flex flex-col gap-2 w-full text-center">
                              <button
                                disabled
                                className="w-full py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                              >
                                <Clock size={14} />
                                <span>Scheduled Test</span>
                              </button>
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200/40 p-2 rounded-xl">
                                ⚠️ This assessment is not available yet. Please wait until the scheduled time: {new Date(startTimeVal).toLocaleString()}
                              </span>
                            </div>
                          );
                        }
                        return (
                          <button
                            onClick={() => handleStartExam(assignment)}
                            className="w-full py-3 rounded-xl bg-dash-primary-purple text-dash-white-card font-bold text-sm hover:bg-dash-dark-purple transition-all duration-200 shadow-md cursor-pointer border-0 flex items-center justify-center gap-2"
                          >
                            <Play size={14} />
                            <span>{isInProgress ? 'Resume Assessment' : 'Start Assessment'}</span>
                          </button>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'technical' && activeAssignment && examState.submitted && (
          <div className="flex justify-center items-center py-12 animate-fade-in w-full">
            <div className="w-full max-w-2xl bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-10 shadow-[0_4px_25px_rgba(87,82,170,0.02)] flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-full bg-dash-success-green/10 flex items-center justify-center text-dash-success-green mb-2 animate-bounce">
                <Check size={40} />
              </div>
              <div>
                <h3 className="font-plus-jakarta font-extrabold text-2xl text-dash-dark-purple tracking-tight">
                  Assessment Completed!
                </h3>
                <p className="text-sm text-dash-light-purple font-semibold mt-3 max-w-md mx-auto leading-relaxed">
                  Thank you for taking the assessment. Your response has been securely saved and submitted to your recruiter.
                </p>
              </div>

              {examSecurity?.autoSubmittedDueToViolations && (
                <div className="w-full bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2">
                  <span>Your assessment has been automatically submitted because you exited full-screen mode multiple times.</span>
                </div>
              )}

              <button
                onClick={() => setActiveAssignment(null)}
                className="px-8 py-3 rounded-xl bg-dash-primary-purple text-dash-white-card font-bold text-sm hover:bg-dash-dark-purple transition-all duration-200 shadow-md cursor-pointer border-0"
              >
                Return to Assessment List
              </button>
            </div>
          </div>
        )}

        {activeTab === 'technical' && activeAssignment && !examState.submitted && (() => {
          const asm = activeAssignment?.assessment || activeAssignment || {};
          const questions = asm.questions || [];
          const currentIdx = examState.currentQuestionIndex;
          const question = questions[currentIdx];

          if (!question) {
            return (
              <div className="text-center py-20 bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-8 max-w-2xl mx-auto w-full">
                <p className="text-sm font-semibold text-red-500 mb-4">Error: No questions found in this assessment.</p>
                <button onClick={() => setActiveAssignment(null)} className="px-4 py-2 bg-dash-primary-purple text-white rounded-lg border-0 cursor-pointer">Go Back</button>
              </div>
            );
          }

          const mcqQuestions = questions.filter(q => (q.type || q.question_type || '').toUpperCase() === 'MCQ');
          const scenarioQuestions = questions.filter(q => (q.type || q.question_type || '').toUpperCase() !== 'MCQ');

          const totalMcqs = mcqQuestions.length;
          const totalScenarios = scenarioQuestions.length;

          const isMcqPhase = totalMcqs > 0 && currentIdx < totalMcqs;
          const currentPhaseLabel = isMcqPhase
            ? `Phase 1 of ${totalScenarios > 0 ? 2 : 1} — MCQ Questions`
            : `Phase ${totalMcqs > 0 ? 2 : 1} of ${totalMcqs > 0 ? 2 : 1} — Scenario Questions`;

          const phaseQuestionNum = isMcqPhase
            ? currentIdx + 1
            : (totalMcqs > 0 ? currentIdx - totalMcqs + 1 : currentIdx + 1);

          const phaseTotalQuestions = isMcqPhase ? totalMcqs : totalScenarios;
          const currentTopic = question.topic || question.subject || "General";
          const answeredCount = questions.filter((q, idx) => isQuestionAnswered(q, idx, examState.answers)).length;
          const overallProgressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

          const hasOptions = question && Array.isArray(question.options) && question.options.length > 0;
          const isSql = !hasOptions && question ? (((question.type === 'SCENARIO' || question.type === 'SCENARIO_CODING' || question.type === 'CODING') && (question.subject || question.language || '').toLowerCase() === 'sql') || (question.question || '').toUpperCase().includes('SELECT')) : false;
          const isCoding = !hasOptions && (isSql || (question && (
            question.type === 'CODING' ||
            question.type === 'PYTHON_CODING' ||
            question.type === 'SCENARIO_CODING' ||
            (question.subject || question.language || '').toLowerCase().includes('python') ||
            (question.subject || question.language || '').toLowerCase().includes('sql')
          )));

          const hasPrev = currentIdx > 0;
          const hasNext = currentIdx < questions.length - 1;

          return (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start animate-fade-in w-full">

              {/* LEFT: Navigator & Progress Side */}
              <div className="xl:col-span-1 bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-5 shadow-[0_4px_20px_rgba(87,82,170,0.02)] flex flex-col gap-6">

                {/* Header Timer */}
                <div className="flex flex-col gap-1 text-center bg-dash-soft-pink border border-dash-border-gray/50 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider">Time Remaining</span>
                  <span className="font-plus-jakarta font-extrabold text-2xl text-red-600 font-mono tracking-wider">
                    {formatTime(examState.timeLeft)}
                  </span>
                </div>

                {/* Questions Grid Selector Grouped by Phase */}
                <div className="flex flex-col gap-4">
                  {totalMcqs > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Phase 1 – MCQs ({totalMcqs})</h4>
                        {isMcqPhase && <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">Active</span>}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {mcqQuestions.map((q, idx) => {
                          const isCurrent = idx === currentIdx;
                          const isAnswered = isQuestionAnswered(q, idx, examState.answers);
                          return (
                            <button
                              key={idx}
                              onClick={() => setExamState(prev => ({ ...prev, currentQuestionIndex: idx }))}
                              className={`w-10 h-10 rounded-xl font-extrabold text-xs flex items-center justify-center cursor-pointer border transition-all duration-200 ${isCurrent
                                ? 'bg-dash-primary-purple text-white border-dash-primary-purple shadow-sm'
                                : isAnswered
                                  ? 'bg-dash-success-green/10 text-dash-success-green border-[#22c55e]/20 hover:bg-dash-success-green/20'
                                  : 'bg-dash-soft-pink border border-dash-border-gray/50 text-dash-light-purple hover:bg-dash-border-gray'
                                }`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {totalScenarios > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Phase 2 – Scenario ({totalScenarios})</h4>
                        {!isMcqPhase && <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">Active</span>}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {scenarioQuestions.map((q, sIdx) => {
                          const realIdx = totalMcqs + sIdx;
                          const isCurrent = realIdx === currentIdx;
                          const isAnswered = isQuestionAnswered(q, realIdx, examState.answers);
                          return (
                            <button
                              key={realIdx}
                              onClick={() => setExamState(prev => ({ ...prev, currentQuestionIndex: realIdx }))}
                              className={`w-10 h-10 rounded-xl font-extrabold text-xs flex items-center justify-center cursor-pointer border transition-all duration-200 ${isCurrent
                                ? 'bg-dash-primary-purple text-white border-dash-primary-purple shadow-sm'
                                : isAnswered
                                  ? 'bg-dash-success-green/10 text-dash-success-green border-[#22c55e]/20 hover:bg-dash-success-green/20'
                                  : 'bg-dash-soft-pink border border-dash-border-gray/50 text-dash-light-purple hover:bg-dash-border-gray'
                                }`}
                            >
                              {realIdx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Stats */}
                <div className="border-t border-dash-border-gray/25 pt-4 flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-bold text-dash-light-purple">
                    <span>Progress</span>
                    <span className="text-dash-dark-purple">
                      {answeredCount} / {questions.length} Done
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-dash-light-blue-bg overflow-hidden">
                    <div
                      className="h-full bg-dash-primary-purple rounded-full transition-all duration-300"
                      style={{ width: `${overallProgressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Emergency Submit */}
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>Submit Assessment</span>
                </button>
              </div>

              {/* RIGHT: Active Question Display */}
              <div className="xl:col-span-3 flex flex-col gap-6">

                {/* Question Info Header */}
                <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)] flex flex-col gap-4">
                  {/* Phase & Topic Banner */}
                  <div className="bg-gradient-to-r from-purple-50 via-indigo-50/70 to-blue-50 border border-purple-100/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-dash-primary-purple text-white shadow-xs">
                        {currentPhaseLabel}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-dash-dark-purple flex items-center gap-1.5">
                          <span className="text-slate-400 font-bold">Topic:</span>
                          <span className="text-dash-primary-purple">{currentTopic}</span>
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          Question {phaseQuestionNum} of {phaseTotalQuestions} in this Phase
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-purple-100/60 pt-2 sm:pt-0">
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Overall Progress</span>
                        <span className="text-xs font-extrabold text-dash-primary-purple">{overallProgressPercent}% Complete</span>
                      </div>
                      <div className="w-20 h-2 rounded-full bg-slate-200 overflow-hidden shrink-0">
                        <div className="h-full bg-dash-primary-purple rounded-full transition-all duration-300" style={{ width: `${overallProgressPercent}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-3">
                    <span className="text-xs font-bold text-dash-light-purple uppercase tracking-wider">
                      Question {currentIdx + 1} of {questions.length} (Sequence #{question.sequence_order || currentIdx + 1})
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-dash-soft-pink border border-dash-border-gray/50 text-dash-primary-purple">
                      {isSql ? 'SQL QUERY' : (isCoding ? 'PYTHON CODING' : (question.options && question.options.length > 0 ? 'MCQ' : 'SCENARIO'))}
                    </span>
                  </div>

                  {/* Question Scenario if SCENARIO type and not SQL and not Coding */}
                  {question.scenario && !isCoding && (
                    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-5">
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Scenario Context:</h5>
                      <p className="text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-line">
                        {question.scenario}
                      </p>
                    </div>
                  )}

                  {/* Question text if not coding */}
                  {!isCoding && (
                    <div>
                      <h3 className="font-plus-jakarta font-extrabold text-lg text-dash-dark-purple leading-relaxed">
                        {question.question}
                      </h3>
                    </div>
                  )}

                  {/* Options (MCQ) or Monaco Editor (Coding/Python/SQL) */}
                  {isCoding ? (
                    <div className="flex flex-col lg:flex-row gap-5 items-stretch mt-2 w-full select-none">
                      {/* Left: Problem Details */}
                      <div className="flex-1 flex flex-col gap-4 bg-slate-50 border border-slate-200/60 rounded-2xl p-5 overflow-y-auto max-h-[550px] select-text">
                        {isSql ? (
                          <div className="flex flex-col gap-3">
                            {question.scenario && (
                              <div>
                                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Scenario Context</h4>
                                <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-line bg-white border border-slate-200/50 rounded-xl p-3">
                                  {question.scenario}
                                </p>
                              </div>
                            )}
                            <div>
                              <h4 className="text-xs font-extrabold text-dash-primary-purple uppercase tracking-wider mb-1.5">SQL Query Task</h4>
                              <p className="text-xs font-bold text-slate-800 leading-relaxed whitespace-pre-wrap">
                                {question.question || question.problemStatement}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {question.scenario && (
                              <div className="bg-white border border-slate-200/60 rounded-xl p-3.5">
                                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Scenario Context</h4>
                                <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-line">
                                  {question.scenario}
                                </p>
                              </div>
                            )}
                            <div>
                              <h4 className="text-xs font-extrabold text-dash-primary-purple uppercase tracking-wider mb-1.5">Problem Description</h4>
                              <p className="text-xs font-bold text-slate-800 leading-relaxed whitespace-pre-wrap">
                                {question.question || question.problemStatement || question.title}
                              </p>
                            </div>
                            {(question.function_name || question.functionName) && (
                              <div className="bg-purple-50/70 border border-purple-200/50 rounded-xl p-3 flex items-center gap-2">
                                <Code size={13} className="text-dash-primary-purple shrink-0" />
                                <span className="text-xs font-bold text-dash-dark-purple">
                                  Expected Function: <code className="font-mono text-purple-700 font-extrabold bg-white px-2 py-0.5 rounded border border-purple-200/50">{question.function_name || question.functionName}(...)</code>
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {isSql ? (
                          <>
                            <DatabaseSchemaVisualizer
                              schemaLines={question.databaseSchema}
                              dataLines={question.sampleData}
                            />
                            {(question.expectedOutput || question.exampleOutput) && (
                              <div className="mt-2 bg-white border border-slate-200/50 rounded-xl p-3">
                                <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Expected Output Format:</span>
                                <pre className="text-xs font-mono font-semibold text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 overflow-x-auto whitespace-pre-wrap">{question.expectedOutput || question.exampleOutput}</pre>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {question.inputFormat && (
                              <div>
                                <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Input Format</h4>
                                <p className="text-xs font-medium text-slate-600 leading-normal">{question.inputFormat}</p>
                              </div>
                            )}
                            {question.outputFormat && (
                              <div>
                                <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Output Format</h4>
                                <p className="text-xs font-medium text-slate-600 leading-normal">{question.outputFormat}</p>
                              </div>
                            )}
                            {question.constraints && question.constraints.length > 0 && (
                              <div>
                                <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Constraints</h4>
                                <ul className="list-disc pl-4 text-xs font-medium text-slate-600 space-y-1">
                                  {question.constraints.map((c, i) => <li key={i}>{c}</li>)}
                                </ul>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              <div className="bg-white border border-slate-200/50 rounded-xl p-3">
                                <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1.5">Sample Input:</span>
                                <pre className="text-xs font-mono font-semibold text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 overflow-x-auto whitespace-pre-wrap">{question.sampleInput || question.exampleInput || "No input."}</pre>
                              </div>
                              <div className="bg-white border border-slate-200/50 rounded-xl p-3">
                                <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1.5">Sample Output:</span>
                                <pre className="text-xs font-mono font-semibold text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 overflow-x-auto whitespace-pre-wrap">{question.sampleOutput || question.exampleOutput || "No output."}</pre>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Right: Monaco Editor and Console */}
                      <div className={`flex-1 flex flex-col gap-4 border border-dash-border-gray rounded-2xl p-4 bg-[#1e1e1e] text-white shadow-lg relative ${isFullscreen ? 'fixed inset-0 z-50 p-6' : ''}`}>
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                          <div className="flex items-center gap-2">
                            <Code size={14} className="text-dash-primary-purple" />
                            <span className="text-xs font-bold text-zinc-300">
                              {isSql ? 'SQL Query Editor' : 'Python 3 Editor'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleResetCode(currentIdx)}
                              title="Reset query template"
                              className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer bg-transparent border-0"
                            >
                              <RotateCcw size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsFullscreen(!isFullscreen)}
                              className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer bg-transparent border-0"
                            >
                              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                            </button>
                          </div>
                        </div>

                        {/* Monaco Editor Component */}
                        <div className={`w-full overflow-hidden rounded-xl border border-zinc-800 ${isFullscreen ? 'h-[60vh]' : 'h-[300px]'}`}>
                          <Editor
                            key={`editor_${currentIdx}_${isSql ? 'sql' : 'python'}`}
                            height="100%"
                            defaultLanguage={isSql ? "sql" : "python"}
                            language={isSql ? "sql" : "python"}
                            value={examState.answers[currentIdx] || ''}
                            onChange={(val) => setExamState(prev => ({
                              ...prev,
                              answers: { ...prev.answers, [currentIdx]: val || '' }
                            }))}
                            theme="vs-dark"
                            options={{
                              fontSize: 12,
                              fontFamily: 'Fira Code, Source Code Pro, monospace',
                              minimap: { enabled: false },
                              lineNumbers: 'on',
                              automaticLayout: true,
                              cursorBlinking: 'smooth',
                              tabSize: 4,
                              bracketPairColorization: { enabled: true },
                              autoIndent: 'advanced'
                            }}
                          />
                        </div>

                        {/* Run/Submit Actions */}
                        <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
                            <Terminal size={12} className="text-zinc-500" />
                            <span>Console</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRunCode(examState.answers[currentIdx], question)}
                              disabled={isExecuting || isSubmittingCode}
                              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-zinc-700 transition-colors disabled:opacity-50"
                            >
                              {isExecuting ? (
                                <Loader2 size={12} className="animate-spin text-dash-primary-purple" />
                              ) : (
                                <Play size={12} className="text-emerald-400" />
                              )}
                              <span>{isExecuting ? 'Running...' : (isSql ? 'Run Query' : 'Run Code')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSubmitCode(examState.answers[currentIdx], question)}
                              disabled={isExecuting || isSubmittingCode}
                              className="px-4 py-2 bg-dash-primary-purple hover:bg-dash-dark-purple text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border-0 transition-colors disabled:opacity-50 shadow-md"
                            >
                              {isSubmittingCode ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={12} />
                              )}
                              <span>{isSubmittingCode ? 'Submitting...' : (isSql ? 'Submit Query' : 'Submit Code')}</span>
                            </button>
                          </div>
                        </div>

                        {/* Output and Input Tabs console */}
                        <div className="bg-[#151515] border border-zinc-800/80 rounded-xl p-3.5 flex flex-col gap-3">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-2">
                              <button
                                type="button"
                                onClick={() => setConsoleTab('output')}
                                className={`text-[10px] font-extrabold uppercase tracking-wider pb-1 px-1 border-b-2 transition-all cursor-pointer bg-transparent border-0 ${consoleTab === 'output' ? 'border-dash-primary-purple text-white' : 'border-transparent text-zinc-500'}`}
                              >
                                Console Output
                              </button>
                              <button
                                type="button"
                                onClick={() => setConsoleTab('input')}
                                className={`text-[10px] font-extrabold uppercase tracking-wider pb-1 px-1 border-b-2 transition-all cursor-pointer bg-transparent border-0 ${consoleTab === 'input' ? 'border-dash-primary-purple text-white' : 'border-transparent text-zinc-500'}`}
                              >
                                Custom Test Input
                              </button>
                            </div>

                            {consoleTab === 'output' ? (
                              <div className="text-xs font-mono select-text max-h-[160px] overflow-y-auto pr-1 flex flex-col gap-2">
                                {executionStatus && (
                                  <div className="flex items-center justify-between bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${executionStatus === 'Success'
                                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                                      : executionStatus === 'Syntax Error'
                                        ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                                        : 'bg-red-950/80 text-red-400 border border-red-800/50'
                                      }`}>
                                      {executionStatus}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 font-semibold">
                                      Execution Time: <strong className="text-zinc-200">{executionTime}s</strong>
                                    </span>
                                  </div>
                                )}

                                {syntaxError && (
                                  <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg p-2.5 flex flex-col gap-1">
                                    <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">Syntax Error:</span>
                                    <pre className="text-amber-300 whitespace-pre-wrap leading-relaxed">{syntaxError}</pre>
                                  </div>
                                )}

                                {runtimeError && (
                                  <div className="bg-red-950/40 border border-red-800/50 rounded-lg p-2.5 flex flex-col gap-1">
                                    <span className="text-[10px] font-extrabold uppercase text-red-400 tracking-wider">Runtime Error:</span>
                                    <pre className="text-red-300 whitespace-pre-wrap leading-relaxed">{runtimeError}</pre>
                                  </div>
                                )}

                                {sqlQueryResult && sqlQueryResult.columns && sqlQueryResult.columns.length > 0 ? (
                                  <div className="flex flex-col gap-2 my-1">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                                      <span className="text-emerald-400">Query Result Table ({sqlQueryResult.rowCount || sqlQueryResult.rows?.length || 0} rows)</span>
                                    </div>
                                    <div className="overflow-x-auto overflow-y-auto max-h-[220px] rounded-xl border border-zinc-800 bg-[#111111]">
                                      <table className="min-w-full divide-y divide-zinc-800 text-left text-xs text-zinc-200">
                                        <thead className="bg-zinc-900 font-bold uppercase tracking-wider text-[10px] text-zinc-400 sticky top-0 z-10">
                                          <tr>
                                            <th className="px-3 py-2 text-zinc-500 w-10">#</th>
                                            {sqlQueryResult.columns.map((col, idx) => (
                                              <th key={idx} className="px-3 py-2 whitespace-nowrap text-dash-primary-purple">{col}</th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                                          {sqlQueryResult.rows.map((row, rowIdx) => (
                                            <tr key={rowIdx} className="hover:bg-zinc-800/40 transition-colors">
                                              <td className="px-3 py-1.5 text-zinc-500 font-sans text-[10px]">{rowIdx + 1}</td>
                                              {sqlQueryResult.columns.map((col, colIdx) => (
                                                <td key={colIdx} className="px-3 py-1.5 whitespace-nowrap text-zinc-300">
                                                  {row[col] !== null && row[col] !== undefined ? String(row[col]) : <em className="text-zinc-600 font-sans">NULL</em>}
                                                </td>
                                              ))}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ) : consoleOutput && (
                                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-2.5 flex flex-col gap-1">
                                    <span className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider">Output:</span>
                                    <pre className="text-zinc-200 whitespace-pre-wrap leading-relaxed">{consoleOutput}</pre>
                                  </div>
                                )}

                                {!syntaxError && !runtimeError && !consoleOutput && !sqlQueryResult && !isExecuting && (
                                  <span className="text-zinc-500 italic p-1">Click "Run Query" or "Run Code" to execute script and see output here.</span>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col gap-2">
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Piped directly to stdin:</span>
                                <textarea
                                  value={customInput}
                                  onChange={(e) => setCustomInput(e.target.value)}
                                  placeholder="Enter custom inputs for execution..."
                                  rows={2}
                                  className="w-full p-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono rounded-lg focus:outline-none focus:border-dash-primary-purple transition-all resize-none"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : question.options && question.options.length > 0 ? (
                    <div className="flex flex-col gap-3 mt-2">
                      {question.options.map((option, optIdx) => {
                        const isSelected = examState.answers[currentIdx] === option;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => setExamState(prev => ({
                              ...prev,
                              answers: { ...prev.answers, [currentIdx]: option }
                            }))}
                            className={`w-full text-left p-4 rounded-2xl border font-semibold text-sm transition-all duration-200 cursor-pointer flex items-between items-center group ${isSelected
                              ? 'bg-dash-primary-purple/10 border-dash-primary-purple text-dash-dark-purple shadow-sm'
                              : 'bg-dash-soft-pink border-dash-border-gray/50 text-dash-light-purple hover:bg-dash-border-gray hover:text-dash-dark-purple'
                              }`}
                          >
                            <span className="flex-1 pr-4">{option}</span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${isSelected
                              ? 'border-dash-primary-purple bg-dash-primary-purple text-white'
                              : 'border-dash-border-gray/60 group-hover:border-dash-light-purple'
                              }`}>
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 mt-2">
                      {question.exampleInput && (
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700">
                          <div>
                            <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Example Input:</span>
                            <span className="block">{question.exampleInput}</span>
                          </div>
                          <div>
                            <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Example Output:</span>
                            <span className="block">{question.exampleOutput}</span>
                          </div>
                        </div>
                      )}
                      <textarea
                        value={examState.answers[currentIdx] || ''}
                        onChange={(e) => setExamState(prev => ({
                          ...prev,
                          answers: { ...prev.answers, [currentIdx]: e.target.value }
                        }))}
                        placeholder="Write your code or answer explanation here..."
                        rows={10}
                        className="w-full p-4 rounded-2xl border border-dash-border-gray/50 bg-[#fafafa] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-dash-primary-purple/40 focus:border-dash-primary-purple transition-all resize-y"
                      />
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between border-t border-dash-border-gray/25 pt-5 mt-3">
                    <button
                      onClick={() => setExamState(prev => ({ ...prev, currentQuestionIndex: currentIdx - 1 }))}
                      disabled={!hasPrev}
                      className={`px-5 py-2.5 rounded-xl border border-dash-border-gray/50 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${hasPrev
                        ? 'bg-dash-soft-pink text-dash-dark-purple hover:bg-dash-border-gray'
                        : 'opacity-50 cursor-not-allowed text-dash-light-purple bg-transparent'
                        }`}
                    >
                      <ChevronLeft size={16} />
                      <span>Previous</span>
                    </button>

                    {hasNext ? (
                      <button
                        onClick={() => setExamState(prev => ({ ...prev, currentQuestionIndex: currentIdx + 1 }))}
                        className="px-6 py-2.5 rounded-xl bg-dash-primary-purple text-dash-white-card font-bold text-xs hover:bg-dash-dark-purple transition-all flex items-center gap-1.5 cursor-pointer border-0"
                      >
                        <span>Next</span>
                        <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsSubmitModalOpen(true)}
                        className="px-6 py-2.5 rounded-xl bg-[#22c55e] text-white font-bold text-xs hover:bg-[#16a34a] transition-all flex items-center gap-1.5 cursor-pointer border-0"
                      >
                        <CheckCircle2 size={16} />
                        <span>Finish & Submit</span>
                      </button>
                    )}
                  </div>

                </div>
              </div>

            </div>
          );
        })()}

        {activeTab === 'english' && (
          <div className="w-full flex-1 flex flex-col gap-6 animate-fade-in select-text">
            {englishLoading && !englishInterview && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-dash-primary-purple" size={40} />
                <p className="text-sm font-semibold text-dash-light-purple">Initializing English Assessment...</p>
              </div>
            )}

            {englishInterview && (englishInterview.status === 'NOT_STARTED' || !englishInterview.status) && (
              <div className="w-full flex justify-center items-center py-6">
                <div className="w-full max-w-2xl bg-dash-white-card border border-dash-border-gray/50 rounded-[28px] p-8 sm:p-10 shadow-[0_4px_25px_rgba(87,82,170,0.02)] text-center flex flex-col items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-dash-primary-purple/10 flex items-center justify-center text-dash-primary-purple">
                    <Volume2 size={32} />
                  </div>
                  <div>
                    <h3 className="font-plus-jakarta font-extrabold text-2xl text-dash-dark-purple tracking-tight">
                      English Speaking Assessment
                    </h3>
                    <p className="text-xs font-bold text-dash-light-purple mt-1 uppercase tracking-wider">AI HR Interviewer</p>
                  </div>

                  <div className="bg-dash-soft-pink/40 border border-dash-border-gray/40 rounded-2xl p-6 text-left w-full space-y-4 text-xs font-medium text-dash-dark-purple leading-relaxed">
                    <p className="font-bold text-sm border-b border-dash-border-gray/25 pb-2 text-dash-primary-purple">Welcome to the English Assessment.</p>
                    <p>Hello! I am your AI HR Interviewer today.</p>
                    <p>I will evaluate your English communication skills through a realistic, conversational HR interview tailored to your uploaded resume background.</p>
                    <p>• The interview will take approximately <strong>15 minutes</strong>.</p>
                    <p>• You can type your answers or speak using your microphone (Speech-to-Text).</p>
                    <p>Please answer naturally and professionally. Good luck!</p>
                  </div>

                  {englishInterview.is_eligible === false ? (
                    <div className="w-full p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs">
                      ⚠️ You must successfully complete the Technical Assessment first before starting the English Assessment.
                    </div>
                  ) : englishUploading ? (
                    <div className="w-full p-6 border border-dash-border-gray/50 rounded-2xl bg-slate-50 flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-dash-primary-purple" size={32} />
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-dash-primary-purple transition-all duration-350" style={{ width: `${englishUploadProgress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-dash-primary-purple">Uploading & Analyzing Resume... {englishUploadProgress}%</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 w-full">
                      {/* Drag & Drop Zone */}
                      <div
                        onDragOver={(e) => { e.preventDefault(); setEnglishDragOver(true); }}
                        onDragLeave={() => setEnglishDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setEnglishDragOver(false);
                          const files = e.dataTransfer.files;
                          if (files && files.length > 0) {
                            uploadEnglishResume(files[0]);
                          }
                        }}
                        onClick={() => englishFileInputRef.current && englishFileInputRef.current.click()}
                        className={`w-full py-8 border-2 border-dashed rounded-[20px] transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${englishDragOver
                            ? 'border-dash-primary-purple bg-dash-primary-purple/5 scale-[0.99]'
                            : 'border-dash-border-gray hover:border-dash-primary-purple hover:bg-dash-light-blue-bg/40'
                          }`}
                      >
                        <input
                          type="file"
                          ref={englishFileInputRef}
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              uploadEnglishResume(files[0]);
                            }
                          }}
                          accept=".pdf"
                          className="hidden"
                        />
                        <UploadCloud size={24} className="text-dash-light-purple animate-pulse" />
                        <span className="text-xs font-extrabold text-dash-dark-purple">Upload Resume to Start HR Interview</span>
                        <span className="text-[10px] text-slate-400 font-bold">Drag & Drop Resume PDF or click to browse (max 5MB)</span>
                      </div>

                      {englishUploadError && (
                        <p className="text-[10px] font-bold text-red-500">{englishUploadError}</p>
                      )}

                      {/* If candidate already has a resume on file, let them start directly */}
                      {candidate && candidate.resume && candidate.resume > 0 && (
                        <div className="flex flex-col items-center gap-2 mt-2">
                          <span className="text-[10px] text-slate-400 font-bold">— OR —</span>
                          <button
                            type="button"
                            onClick={handleStartEnglish}
                            className="px-8 py-3.5 rounded-xl bg-dash-primary-purple text-white font-bold text-xs hover:bg-dash-dark-purple transition-all duration-200 shadow-md cursor-pointer border-0 flex items-center gap-2 justify-center w-full"
                          >
                            <Play size={13} />
                            <span>Start Interview with Previously Uploaded Resume</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {englishInterview && englishInterview.status === 'IN_PROGRESS' && (() => {
              const conversations = englishInterview.conversations || [];
              const currentQ = englishInterview.current_question || {};
              const currentQNum = conversations.length;
              const activeQuestionText = currentQ.ai_question || englishInterview.ai_question || "Please introduce yourself.";

              return (
                <div className="flex flex-col gap-6 w-full flex-1 animate-fade-in select-text">
                  <style>{`
                    @keyframes ripple {
                      0% { transform: scale(0.95); opacity: 0.8; }
                      50% { transform: scale(1.15); opacity: 0.4; }
                      100% { transform: scale(1.35); opacity: 0; }
                    }
                    .animate-ripple-fast {
                      animation: ripple 1.2s infinite ease-out;
                    }
                    .animate-ripple-medium {
                      animation: ripple 2s infinite ease-out;
                    }
                    .animate-ripple-slow {
                      animation: ripple 3.5s infinite ease-out;
                    }
                  `}</style>

                  {/* Header / Mode Switcher bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-dash-white-card border border-dash-border-gray/50 rounded-[20px] p-4 shadow-sm w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse" />
                      <span className="text-xs font-bold text-dash-dark-purple">Sophia - RecruitAI AI HR Manager</span>
                    </div>

                    <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/50">
                      <button
                        type="button"
                        onClick={() => setVoiceMode(true)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer border-none ${voiceMode
                          ? 'bg-dash-primary-purple text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                          }`}
                      >
                        🎙️ Calling Mode
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceMode(false)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer border-none ${!voiceMode
                          ? 'bg-dash-primary-purple text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                          }`}
                      >
                        💬 Chat Mode
                      </button>
                    </div>
                  </div>

                  {voiceMode ? (
                    /* VOICE CALL MODE CONTAINER */
                    <div className="w-full flex flex-col items-center justify-between bg-gradient-to-b from-[#1c133a] to-[#0a0614] border border-[#2d1b54]/40 rounded-[32px] p-6 sm:p-10 shadow-[0_10px_35px_rgba(45,27,84,0.3)] min-h-[500px] text-center gap-8 relative overflow-hidden select-none">

                      {/* Interactive Waveform / Avatar center */}
                      <div className="flex flex-col items-center gap-5 my-auto relative z-10 w-full">
                        <div className="relative w-44 h-44 flex items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.15)]">

                          {/* Pulse wave rings based on state */}
                          {isRecording && (
                            <>
                              <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ripple-fast" style={{ animationDelay: '0s' }} />
                              <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ripple-fast" style={{ animationDelay: '0.4s' }} />
                              <div className="absolute inset-0 rounded-full border border-emerald-500/10 animate-ripple-fast" style={{ animationDelay: '0.8s' }} />
                            </>
                          )}

                          {aiIsSpeaking && (
                            <>
                              <div className="absolute inset-0 rounded-full border border-violet-500/30 animate-ripple-medium" style={{ animationDelay: '0s' }} />
                              <div className="absolute inset-0 rounded-full border border-violet-500/20 animate-ripple-medium" style={{ animationDelay: '0.6s' }} />
                              <div className="absolute inset-0 rounded-full border border-violet-500/10 animate-ripple-medium" style={{ animationDelay: '1.2s' }} />
                            </>
                          )}

                          {(aiTyping || englishLoading) && (
                            <>
                              <div className="absolute inset-0 rounded-full border border-slate-400/20 animate-ripple-slow" style={{ animationDelay: '0s' }} />
                              <div className="absolute inset-0 rounded-full border border-slate-400/10 animate-ripple-slow" style={{ animationDelay: '1.5s' }} />
                            </>
                          )}

                          {/* Inner Avatar Box */}
                          <div className={`w-28 h-28 rounded-full flex items-center justify-center text-white shadow-2xl relative z-10 transition-all duration-500 ${isRecording
                              ? 'bg-emerald-600 shadow-emerald-500/30 border-2 border-emerald-400/40'
                              : aiIsSpeaking
                                ? 'bg-violet-600 shadow-violet-500/30 border-2 border-violet-400/40'
                                : 'bg-[#231b42] border border-[#40356c]'
                            }`}>
                            <Volume2 size={40} className={isRecording ? "animate-pulse" : aiIsSpeaking ? "animate-bounce" : ""} />
                          </div>
                        </div>

                        {/* Speech status label */}
                        <div className="bg-white/5 border border-white/10 rounded-full px-5 py-1.5 text-xs font-bold text-white shadow-sm flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isRecording
                              ? 'bg-emerald-500 animate-ping'
                              : aiIsSpeaking
                                ? 'bg-violet-500 animate-pulse'
                                : 'bg-slate-400'
                            }`} />
                          <span>
                            {isRecording
                              ? 'Listening... Please speak'
                              : aiIsSpeaking
                                ? 'Sophia is speaking...'
                                : aiTyping || englishLoading
                                  ? 'Thinking...'
                                  : 'Sophia is ready'}
                          </span>
                        </div>
                      </div>

                      {/* Question Text Box */}
                      <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-5 shadow-inner text-center z-10">
                        <p className="text-white font-plus-jakarta font-extrabold text-base leading-relaxed">
                          "{activeQuestionText}"
                        </p>
                      </div>

                      {/* Candidate response bubble transcript */}
                      <div className="w-full max-w-2xl z-10">
                        {englishText ? (
                          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 text-left shadow-sm flex flex-col gap-1.5">
                            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Captured Response (Transcript)</span>
                            <p className="text-xs font-bold text-emerald-100 leading-relaxed font-sans">{englishText}</p>
                          </div>
                        ) : isRecording ? (
                          <p className="text-xs text-slate-400 font-bold italic animate-pulse">Start speaking now... your answer transcript will appear here in real time.</p>
                        ) : (
                          <p className="text-xs text-slate-400 font-bold italic">Click the microphone to record your response.</p>
                        )}
                      </div>

                      {/* Audio room control bar */}
                      <div className="w-full max-w-2xl flex items-center justify-between border-t border-white/10 pt-6 z-10 gap-4 mt-auto">
                        {/* Remaining Time */}
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Remaining Time</span>
                          <span className="font-mono text-sm font-extrabold text-red-400">{formatTime(englishTimeLeft)}</span>
                        </div>

                        {/* Main Call controls */}
                        <div className="flex items-center gap-3">
                          {/* Mute button */}
                          <button
                            type="button"
                            onClick={toggleMute}
                            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer shadow-md ${isMuted
                                ? 'bg-amber-600 border-amber-600 text-white hover:bg-amber-700'
                                : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                              }`}
                            title={isMuted ? "Unmute Sophia's Voice" : "Mute Sophia's Voice"}
                          >
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                          </button>

                          {/* Record toggle */}
                          <button
                            type="button"
                            onClick={toggleRecording}
                            disabled={englishLoading || aiTyping || aiIsSpeaking}
                            className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${isRecording
                                ? 'bg-red-600 border-red-600 text-white hover:bg-red-700 animate-pulse'
                                : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                            title={isRecording ? "Stop Recording" : "Start Speaking"}
                          >
                            <Mic size={24} className={isRecording ? "animate-pulse" : ""} />
                          </button>

                          {/* Done Speaking (Send) */}
                          <button
                            type="button"
                            onClick={handleRespondEnglish}
                            disabled={!englishText.trim() || englishLoading || aiTyping}
                            className="px-5 h-12 rounded-full bg-[#10b981] hover:bg-[#059669] text-white flex items-center justify-center font-bold text-xs transition-all duration-200 cursor-pointer shadow-md border-none disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Send response to Sophia"
                          >
                            Done Speaking (Send)
                          </button>

                          {/* Conclude Interview */}
                          <button
                            type="button"
                            onClick={handleCompleteEnglish}
                            disabled={englishLoading || aiTyping || conversations.length < 3}
                            className="px-5 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center font-bold text-xs transition-all duration-200 cursor-pointer shadow-md border-none disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Finish conversation and generate report"
                          >
                            Conclude Interview
                          </button>
                        </div>

                        {/* Conversation Turns info */}
                        <div className="flex flex-col text-right">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Conversation</span>
                          <span className="text-sm font-extrabold text-white">{currentQNum} turns</span>
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* CHAT TEXT MODE CONTAINER */
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch w-full flex-1 min-h-[550px]">

                      {/* LEFT PANEL: AI HR Avatar & Status */}
                      <div className="xl:col-span-1 bg-dash-white-card border border-dash-border-gray/50 rounded-[28px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)] flex flex-col justify-between items-center text-center gap-6">

                        <div className="flex flex-col items-center gap-4 w-full">
                          {/* Visual Pulse Avatar */}
                          <div className="relative w-36 h-36 flex items-center justify-center rounded-full bg-dash-primary-purple/10 border-4 border-dash-primary-purple/20 shadow-[0_0_30px_rgba(87,82,170,0.1)] overflow-hidden">
                            <div className={`absolute inset-0 rounded-full border border-dash-primary-purple/20 animate-ping opacity-60 ${isRecording ? 'duration-1000' : ''}`} style={{ animationDuration: isRecording ? '1.5s' : '3s' }} />
                            <div className="w-20 h-20 rounded-full bg-dash-primary-purple flex items-center justify-center text-white shadow-lg relative z-10">
                              <Volume2 size={32} className={isRecording ? "animate-bounce" : aiTyping ? "animate-pulse" : ""} />
                            </div>
                          </div>

                          <div>
                            <h4 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple leading-tight">AI HR Interviewer</h4>
                            <span className="text-[10px] text-dash-light-purple font-bold uppercase tracking-wider mt-1 block">Active Evaluation</span>
                          </div>
                        </div>

                        {/* Meta stats grid */}
                        <div className="grid grid-cols-2 gap-4 w-full bg-dash-light-blue-bg/40 border border-dash-border-gray/30 rounded-2xl p-4 text-xs font-semibold text-dash-dark-purple">
                          <div className="flex flex-col gap-0.5 border-r border-dash-border-gray/20 pr-2">
                            <span className="text-[9px] font-bold text-dash-light-purple uppercase tracking-wider">Interview Time</span>
                            <span className="font-mono text-sm font-extrabold text-red-500">{formatTime(englishTimeLeft)}</span>
                          </div>
                          <div className="flex flex-col gap-0.5 pl-2">
                            <span className="text-[9px] font-bold text-dash-light-purple uppercase tracking-wider">Turns</span>
                            <span className="font-extrabold text-sm">{currentQNum} spoken</span>
                          </div>
                          <div className="flex flex-col gap-0.5 col-span-2 border-t border-dash-border-gray/25 pt-2 mt-1 items-center">
                            <span className="text-[9px] font-bold text-dash-light-purple uppercase tracking-wider">Connection Status</span>
                            <span className="flex items-center gap-1.5 mt-1 text-[11px] font-bold">
                              <span className={`w-2 h-2 rounded-full ${englishLoading ? 'bg-amber-400 animate-pulse' : 'bg-[#22c55e]'}`} />
                              {englishLoading ? 'Processing...' : 'Online & Connected'}
                            </span>
                          </div>
                        </div>

                        {/* Mute and Guidelines footer */}
                        <div className="flex flex-col gap-3 w-full border-t border-dash-border-gray/25 pt-4">
                          <button
                            onClick={toggleMute}
                            className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${isMuted
                              ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                          >
                            {isMuted ? 'Unmute AI HR Voice' : 'Mute AI HR Voice'}
                          </button>
                          <p className="text-[10px] text-dash-light-purple font-medium leading-normal px-2">
                            Speak clearly into the microphone. You can edit the transcribed text before clicking Send.
                          </p>
                        </div>

                      </div>

                      {/* RIGHT PANEL: Chat History & Input */}
                      <div className="xl:col-span-2 bg-dash-white-card border border-dash-border-gray/50 rounded-[28px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)] flex flex-col justify-between gap-4">

                        {/* Chat Messages Log */}
                        <div className="flex-1 min-h-[300px] max-h-[380px] overflow-y-auto pr-1 flex flex-col gap-4 border-b border-dash-border-gray/20 pb-4">
                          {conversations.map((msg, index) => {
                            const isLastItem = index === conversations.length - 1;
                            return (
                              <div key={index} className="flex flex-col gap-3">
                                {/* AI Question */}
                                <div className="flex items-start gap-2.5 max-w-[85%] self-start animate-fade-in">
                                  <div className="w-7 h-7 rounded-lg bg-dash-primary-purple/10 flex items-center justify-center text-dash-primary-purple shrink-0 mt-0.5 text-xs font-bold">HR</div>
                                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl rounded-tl-none p-3.5 text-xs font-medium text-slate-800 leading-relaxed shadow-xs">
                                    {msg.ai_question}
                                  </div>
                                </div>

                                {/* Candidate Answer */}
                                {msg.candidate_answer && (
                                  <div className="flex items-start gap-2.5 max-w-[85%] self-end justify-end animate-fade-in">
                                    <div className="bg-dash-primary-purple text-white rounded-2xl rounded-tr-none p-3.5 text-xs font-medium leading-relaxed shadow-sm">
                                      {msg.candidate_answer}
                                    </div>
                                    <div className="w-7 h-7 rounded-full bg-dash-primary-purple flex items-center justify-center text-white shrink-0 mt-0.5 text-[10px] font-bold">ME</div>
                                  </div>
                                )}

                                {/* Typing Indicator inside active item */}
                                {isLastItem && aiTyping && !msg.candidate_answer && (
                                  <div className="flex items-center gap-2 text-xs font-semibold text-dash-light-purple ml-9 mt-1 italic animate-pulse">
                                    <Loader2 size={12} className="animate-spin" />
                                    <span>AI HR is evaluating and generating next question...</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {conversations.length === 0 && (
                            <div className="h-full flex items-center justify-center text-center text-xs text-dash-light-purple italic">
                              Click Start to begin. The AI HR interviewer will speak and present questions here.
                            </div>
                          )}
                        </div>

                        {/* Mode Switcher Action Buttons */}
                        <div className="flex items-center justify-between border-t border-dash-border-gray/20 pt-2 mt-1">
                          <span className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider">
                            {conversations.length} turns recorded
                          </span>
                          <button
                            type="button"
                            onClick={handleCompleteEnglish}
                            disabled={englishLoading || aiTyping || conversations.length < 3}
                            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                          >
                            Conclude Interview
                          </button>
                        </div>

                        {/* Response Input Control Panel */}
                        <div className="flex flex-col gap-3">
                          {/* Spoken indicator banner */}
                          {isRecording && (
                            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-2.5 text-xs font-bold flex items-center gap-2 animate-pulse">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 animate-ping" />
                              <span>Listening... Speak naturally. Click Microphone button to stop.</span>
                            </div>
                          )}

                          <div className="flex items-end gap-2.5">
                            <textarea
                              value={englishText}
                              onChange={(e) => setEnglishText(e.target.value)}
                              placeholder="Type your response here or click the microphone to speak..."
                              rows={3}
                              disabled={englishLoading || aiTyping}
                              className="flex-1 p-3 text-xs font-semibold bg-[#fafafa] border border-dash-border-gray/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dash-primary-purple/40 focus:border-dash-primary-purple transition-all resize-none shadow-inner"
                            />

                            <div className="flex flex-col gap-2 shrink-0">
                              {/* Microphone Button */}
                              <button
                                type="button"
                                onClick={toggleRecording}
                                disabled={englishLoading || aiTyping}
                                className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer shadow-md ${isRecording
                                  ? 'bg-red-600 text-white border-red-600 animate-pulse hover:bg-red-700'
                                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                                  }`}
                                title="Speak Response"
                              >
                                <Mic size={16} />
                              </button>

                              {/* Send Button */}
                              <button
                                type="button"
                                onClick={handleRespondEnglish}
                                disabled={!englishText.trim() || englishLoading || aiTyping}
                                className="w-11 h-11 rounded-xl bg-dash-primary-purple text-white flex items-center justify-center hover:bg-dash-dark-purple transition-all duration-200 cursor-pointer shadow-md border-0 disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Send Message"
                              >
                                <Send size={16} />
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}
                </div>
              );
            })()}

            {englishInterview && englishInterview.status === 'COMPLETED' && (
              <div className="w-full flex justify-center items-center py-10 animate-fade-in">
                <div className="w-full max-w-xl bg-dash-white-card border border-dash-border-gray/50 rounded-[28px] p-8 sm:p-10 shadow-[0_4px_25px_rgba(87,82,170,0.02)] text-center flex flex-col items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-[#10b981]">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="font-plus-jakarta font-extrabold text-2xl text-dash-dark-purple tracking-tight">
                      Interview Completed!
                    </h3>
                    <p className="text-xs font-bold text-dash-light-purple mt-1 uppercase tracking-wider">English Speaking Assessment</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 text-center w-full space-y-3.5 text-xs font-medium text-slate-700 leading-relaxed shadow-sm">
                    <p className="font-bold text-sm text-dash-primary-purple">Thank you for taking the assessment.</p>
                    <p>Your conversational AI HR interview has been successfully completed and saved.</p>
                    <p>All evaluation scores, summary analysis, strengths, weaknesses, and dialogue transcripts have been securely submitted to the recruiter for processing.</p>
                    <p className="text-[10px] text-dash-light-purple italic mt-2">You can safely navigate away or wait for updates from your recruiter.</p>
                  </div>

                  <div className="flex w-full justify-center mt-2">
                    <button
                      onClick={handleRetryEnglish}
                      disabled={englishLoading}
                      className="px-6 py-3 rounded-xl bg-dash-primary-purple text-white font-bold text-xs hover:bg-dash-dark-purple transition-all duration-200 shadow-md cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <RotateCcw size={14} />
                      <span>Retry Assessment</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {activeTab !== 'technical' && activeTab !== 'english' && (
          <section className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-8 shadow-sm flex flex-col items-center justify-center min-h-[350px] text-center">
            <div className="p-4 rounded-full bg-dash-light-blue-bg text-dash-primary-purple mb-4">
              <Clock size={36} className="animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <h3 className="font-plus-jakarta font-extrabold text-lg text-dash-dark-purple">
              Page Under Construction
            </h3>
            <p className="text-sm text-dash-light-purple font-medium mt-2 max-w-sm">
              We are working hard to bring this view to your RecruitAI candidate portal workspace.
            </p>
          </section>
        )}
      </main>

      {activeAssignment && !examState.submitted && (
        <ExamSecurityMonitor
          securityState={examSecurity}
          assessmentName={activeAssignment?.assessmentName || activeAssignment?.assessment?.name || 'Technical Assessment'}
          onAutoSubmit={(secData) => handleSubmitExam(activeAssignment?.id, secData)}
        />
      )}

      {/* Manual Submission Confirmation Modal */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                <CheckCircle2 size={30} />
              </div>
              <h3 className="font-outfit font-extrabold text-xl text-slate-900 mb-2">
                Submit Assessment?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Are you sure you want to submit your assessment? After submission, you will not be able to modify your answers.
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  disabled={isSubmittingManual}
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingManual}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmitExam();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {isSubmittingManual ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Assessment</span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CandidateDashboard;