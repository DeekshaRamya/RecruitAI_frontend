import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Editor from '@monaco-editor/react';
import api from '../api';
import { useExamSecurity } from '../hooks/useExamSecurity';
import { ExamSecurityMonitor } from '../components/ExamSecurityMonitor';
import {
  Briefcase,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  Award,
  TrendingUp,
  Plus,
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
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCcw,
  Code,
  HelpCircle,
  Database,
  Table,
  Key
} from 'lucide-react';

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

const CandidateDashboard = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
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
  const [examState, setExamState] = useState({
    currentQuestionIndex: 0,
    answers: {},
    timeLeft: 0,
    submitted: false
  });

  const isExamActive = !!(activeAssignment && !examState.submitted && activeTab === 'technical');

  // Initialize Exam Security hook
  const examSecurity = useExamSecurity({
    active: isExamActive,
    maxViolations: 5,
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

  const parseDuration = (durStr) => {
    const parsed = parseInt(durStr.replace(/\D/g, ''), 10);
    return isNaN(parsed) ? 30 : parsed;
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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

      setAssignments(prev => prev.map(a => a.id === assignment.id ? { ...a, status: 'IN_PROGRESS' } : a));

      const initialAnswers = {};
      activeQuestions.forEach((q, idx) => {
        const isCoding = q.type === 'CODING' || q.type === 'PYTHON_CODING';
        const isSql = (q.type === 'SCENARIO' || q.type === 'SCENARIO_CODING' || q.type === 'CODING') && (q.subject || q.language || '').toLowerCase() === 'sql';
        if (isSql) {
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
          questions: activeQuestions
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
    const targetId = assignmentIdOverride || activeAssignment?.id;
    if (!targetId) return;

    try {
      const asm = activeAssignment?.assessment || activeAssignment || {};
      const questions = asm.questions || [];
      const answersPayload = questions.map((q, idx) => ({
        questionId: String(q.id || q.question),
        answer: examState.answers[idx] || ""
      }));

      const durationSeconds = parseDuration(asm.duration || "30") * 60;
      const timeTaken = Math.max(0, durationSeconds - examState.timeLeft);

      const payload = {
        assignmentId: targetId,
        answers: answersPayload,
        timeTaken: timeTaken,
        autoSubmitted: securityMetadata?.autoSubmitted ?? (examSecurity.fullscreenExitCount >= 4),
        submissionReason: securityMetadata?.submissionReason || null,
        warningCount: securityMetadata?.warningCount ?? examSecurity.fullscreenExitCount ?? 0,
        warningHistory: securityMetadata?.warningHistory || examSecurity.warningHistory || []
      };

      await api.post('/api/assessment/submit', payload);

      setExamState(prev => ({ ...prev, submitted: true }));
      await fetchAssignments();
    } catch (err) {
      console.error("Failed to submit exam:", err);
      showToast("Error submitting assessment. Please try again.");
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
      } catch (e) {
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
        } else {
          setSqlQueryResult(null);
          setConsoleOutput('');
          setRuntimeError(data.runtime_error || 'SQL Query Execution Error');
          setSyntaxError(data.syntax_error || '');
          setExecutionTime((data.executionTime || 0) / 1000);
          setExecutionStatus('Error');
        }
      } catch (err) {
        console.error("Failed to run SQL query:", err);
        const errMsg = err.response?.data?.detail || err.message || "SQL Execution error.";
        setSqlQueryResult(null);
        setRuntimeError(errMsg);
        setExecutionStatus('Error');
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
      setConsoleOutput(data.output || data.stdout || '');
      setRuntimeError(data.runtime_error || '');
      setSyntaxError(data.syntax_error || '');
      setExecutionTime(data.execution_time || 0);
      setExecutionStatus(data.status || 'Success');
    } catch (err) {
      console.error("Failed to run code:", err);
      const errMsg = err.response?.data?.detail || err.message || "Execution error.";
      setRuntimeError(errMsg);
      setExecutionStatus('Error');
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
      const isSql = q && (q.type === 'SCENARIO' || q.type === 'SCENARIO_CODING' || q.type === 'CODING') && (q.subject || q.language || '').toLowerCase() === 'sql';
      const template = isSql
        ? 'SELECT * FROM '
        : `def solution():\n    pass\n\nif __name__ == "__main__":\n    solution()`;

      setExamState(prev => ({
        ...prev,
        answers: {
          ...prev.answers,
          [currentIdx]: template
        }
      }));
      showToast("Code reset to template.");
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
      case 'dashboard':
        return {
          title: 'Candidate Dashboard',
          tag: 'Portal',
          subtitle: `Welcome back, ${firstName}. Track your assessment progress here.`
        };
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

  const stats = [
    {
      label: 'Resume',
      value: candidate.resume > 0 ? 'Uploaded' : 'Pending',
      subtext: candidate.resume > 0 ? (candidate.resume_filename || `${candidate.name.replace(/\s+/g, '_')}_CV.pdf`) : 'No file uploaded',
      icon: FileText,
      colorClass: 'text-white bg-white/20',
      cardBg: 'bg-gradient-to-br from-[#5E80B4] to-[#4D6D9E] text-white border-0 shadow-md'
    },
    {
      label: 'Avg Skill Match',
      value: candidate?.final > 0 ? `${candidate.final}%` : '—',
      subtext: 'Across 4 categories',
      icon: Award,
      colorClass: 'text-white bg-white/20',
      cardBg: 'bg-gradient-to-br from-[#8B95C9] to-[#7380BD] text-white border-0 shadow-md'
    },
    {
      label: 'Assessment',
      value: `${[candidate?.python || 0, candidate?.sql || 0, candidate?.aptitude || 0, candidate?.english || 0].filter(s => s > 0).length} / 4`,
      subtext: 'Modules completed',
      icon: Briefcase,
      colorClass: 'text-white bg-white/20',
      cardBg: 'bg-gradient-to-br from-[#E57E88] to-[#D06774] text-white border-0 shadow-md'
    },
    {
      label: 'Final Score',
      value: candidate?.final > 0 ? `${candidate.final}%` : '—',
      subtext: candidate?.final > 0 ? 'Unlock complete' : 'Complete all to unlock',
      icon: TrendingUp,
      colorClass: 'text-white bg-white/20',
      cardBg: 'bg-gradient-to-br from-[#768CB5] to-[#5C7CAE] text-white border-0 shadow-md'
    }
  ];

  // Journey steps based on mock
  const journeySteps = [
    {
      title: 'Resume Upload',
      description: candidate?.resume > 0 ? `${(candidate?.name || candidate?.full_name || 'Candidate').replace(/\s+/g, '_')}_CV.pdf uploaded successfully` : 'Upload your resume to begin',
      status: candidate?.resume > 0 ? 'Completed' : 'Pending',
      statusColor: candidate.resume > 0 ? 'text-dash-success-green bg-dash-success-green/10 border-dash-success-green/20' : 'text-dash-light-purple bg-dash-border-gray/30 border-dash-border-gray/40'
    },
    {
      title: 'AI Analysis',
      description: candidate.resume > 0 ? 'Skills extracted & matched against 4 categories' : 'Awaiting resume upload',
      status: candidate.resume > 0 ? 'Completed' : 'Pending',
      statusColor: candidate.resume > 0 ? 'text-dash-success-green bg-dash-success-green/10 border-dash-success-green/20' : 'text-dash-light-purple bg-dash-border-gray/30 border-dash-border-gray/40'
    },
    {
      title: 'Technical Assessment',
      description: '30 questions · 60 min · Python, SQL, Aptitude',
      status: (candidate.python > 0 || candidate.sql > 0 || candidate.aptitude > 0)
        ? ((candidate.python > 0 && candidate.sql > 0 && candidate.aptitude > 0) ? 'Completed' : 'In Progress')
        : 'Pending',
      statusColor: (candidate.python > 0 && candidate.sql > 0 && candidate.aptitude > 0)
        ? 'text-dash-success-green bg-dash-success-green/10 border-dash-success-green/20'
        : (candidate.python > 0 || candidate.sql > 0 || candidate.aptitude > 0)
          ? 'text-dash-primary-purple bg-dash-primary-purple/10 border-dash-primary-purple/20'
          : 'text-dash-light-purple bg-dash-border-gray/30 border-dash-border-gray/40'
    },
    {
      title: 'English Speaking',
      description: '5 AI-generated resume-based questions',
      status: candidate.english > 0 ? 'Completed' : 'Pending',
      statusColor: candidate.english > 0
        ? 'text-dash-success-green bg-dash-success-green/10 border-dash-success-green/20'
        : 'text-dash-light-purple bg-dash-border-gray/30 border-dash-border-gray/40'
    }
  ];

  // Skills progress based on mock
  const skills = [
    { name: 'Python', percent: candidate.python || 0, colorClass: 'bg-gradient-to-r from-[#5E80B4] to-[#4D6D9E]' },
    { name: 'SQL', percent: candidate.sql || 0, colorClass: 'bg-gradient-to-r from-[#8B95C9] to-[#7380BD]' },
    { name: 'Aptitude', percent: candidate.aptitude || 0, colorClass: 'bg-gradient-to-r from-[#E57E88] to-[#D06774]' },
    { name: 'English', percent: candidate.english || 0, colorClass: 'bg-gradient-to-r from-[#768CB5] to-[#5C7CAE]' }
  ];

  // Strengths tags
  const strengths = candidate.resume > 0 ? ['Python', 'SQL', 'Aptitude', 'English'] : ['Pending Assessment'];

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
            <div className="w-9 h-9 rounded-xl bg-dash-primary-purple flex items-center justify-center shadow-md">
              <span className="font-outfit font-extrabold text-dash-white-card text-lg tracking-wider">R</span>
            </div>
            <div>
              <h1 className="font-outfit font-bold text-base tracking-tight text-dash-dark-purple leading-none">RecruitAI</h1>
              <span className="text-[10px] text-dash-light-purple font-medium tracking-widest uppercase">Candidate Portal</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
              { id: 'resume', label: 'Resume Upload', icon: FileText },
              { id: 'technical', label: 'Technical Test', icon: Terminal },
              { id: 'english', label: 'English Speaking', icon: Volume2 },
              { id: 'results', label: 'My Results', icon: Award },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id !== 'dashboard' && item.id !== 'resume' && item.id !== 'technical') {
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
                    <div className="w-8 h-8 rounded-lg bg-dash-primary-purple flex items-center justify-center">
                      <span className="font-outfit font-extrabold text-dash-white-card text-base">R</span>
                    </div>
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
                    { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
                    { id: 'resume', label: 'Resume Upload', icon: FileText },
                    { id: 'technical', label: 'Technical Test', icon: Terminal },
                    { id: 'english', label: 'English Speaking', icon: Volume2 },
                    { id: 'results', label: 'My Results', icon: Award },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                          if (item.id !== 'dashboard' && item.id !== 'resume' && item.id !== 'technical') {
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

        {activeTab === 'dashboard' && (
          <>
            {/* 3. STATISTICS CARDS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    whileHover={{ y: -5 }}
                    className={`border rounded-[24px] p-5.5 flex flex-col justify-between shadow-[0_4px_15px_rgba(87,82,170,0.02)] transition-all duration-300 group cursor-default min-h-[135px] ${stat.cardBg || 'bg-dash-white-card border-dash-border-gray/50 text-dash-dark-purple hover:bg-dash-soft-pink'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${stat.cardBg ? 'text-white/80' : 'text-dash-light-purple group-hover:text-dash-primary-purple'}`}>
                        {stat.label}
                      </span>
                      <div className={`p-2 rounded-xl transition-all duration-300 ${stat.colorClass} group-hover:scale-110`}>
                        <Icon size={18} />
                      </div>
                    </div>
                    <div>
                      <h3 className={`text-2xl font-plus-jakarta font-extrabold mt-2 tracking-tight ${stat.cardBg ? 'text-white' : 'text-dash-dark-purple'}`}>
                        {stat.value}
                      </h3>
                      <p className={`text-xs font-semibold mt-1 ${stat.cardBg ? 'text-white/90' : 'text-dash-light-purple'}`}>
                        {stat.subtext}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </section>

            {/* 4. DETAILS SECTION (JOURNEY & SKILLS MATRIX) */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
              {/* LEFT: ASSESSMENT JOURNEY */}
              <section className="xl:col-span-3 bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)] flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-4">
                  <h3 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple tracking-tight">
                    Assessment Journey
                  </h3>
                  <span className="text-xs font-bold text-dash-light-purple">4 Steps Total</span>
                </div>

                <div className="flex flex-col gap-4">
                  {journeySteps.map((step, idx) => (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      whileHover={{ x: 4 }}
                      className="p-4 rounded-2xl bg-dash-soft-pink border border-dash-border-gray/50 flex items-center justify-between gap-4 hover:bg-dash-border-gray transition-all duration-200"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="mt-1 flex items-center justify-center text-dash-primary-purple">
                          <CheckCircle2 size={18} className={step.status === 'Completed' ? 'text-dash-success-green' : 'text-dash-light-purple/60'} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-dash-dark-purple tracking-tight">
                            {step.title}
                          </h4>
                          <p className="text-xs text-dash-light-purple font-medium mt-0.5">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border ${step.statusColor}`}>
                          {step.status}
                        </span>
                        <ChevronRight size={16} className="text-dash-light-purple/40" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* RIGHT: SKILLS MATRIX */}
              <section className="xl:col-span-2 bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)] flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-4">
                  <h3 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple tracking-tight">
                    Resume Skill Match
                  </h3>
                  <span className="text-xs font-bold text-dash-light-purple">Core Strength Match</span>
                </div>

                {/* Progress bars list */}
                <div className="space-y-4">
                  {skills.map((skill) => (
                    <div key={skill.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-dash-dark-purple">{skill.name}</span>
                        <span className="text-dash-primary-purple">{skill.percent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-dash-light-blue-bg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.percent}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${skill.colorClass}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Strengths tags */}
                <div className="border-t border-dash-border-gray/25 pt-4">
                  <h4 className="text-xs font-bold text-dash-light-purple uppercase tracking-wider mb-3">
                    Your Strengths
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {strengths.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-xl bg-dash-soft-pink border border-dash-border-gray/50 text-xs font-bold text-dash-dark-purple hover:bg-dash-primary-purple hover:text-dash-white-card transition-all duration-200 cursor-default"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </>
        )}

        {activeTab === 'resume' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
            {/* Left Area: Drag & Drop Upload Zone or AI Analysis Results */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {(!candidate.resume || candidate.resume === 0 || uploading) ? (
                <div
                  className={`bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-8 shadow-[0_4px_20px_rgba(87,82,170,0.02)] min-h-[400px] flex flex-col items-center justify-center text-center transition-all duration-300 ${dragOver ? 'bg-dash-primary-purple/5 border-dash-primary-purple border-2' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="hidden"
                  />

                  {uploading ? (
                    <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                      <Loader2 className="animate-spin text-dash-primary-purple" size={48} />
                      <div>
                        <h3 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple">
                          Analyzing Resume...
                        </h3>
                        <p className="text-xs text-dash-light-purple font-medium mt-1">
                          Our AI is extracting skills and matching experience.
                        </p>
                      </div>
                      <div className="w-full bg-dash-light-blue-bg h-2 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-dash-primary-purple h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-dash-primary-purple">{uploadProgress}%</span>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-dash-border-gray rounded-2xl p-12 w-full flex flex-col items-center justify-center gap-4 hover:bg-dash-soft-pink/30 transition-all duration-300">
                      <div className="w-14 h-14 rounded-full bg-dash-primary-purple/10 flex items-center justify-center text-dash-primary-purple">
                        <UploadCloud size={28} />
                      </div>
                      <div>
                        <h3 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple">
                          Drag & drop your resume
                        </h3>
                        <p className="text-xs text-dash-light-purple font-medium mt-1">
                          Supports PDF files up to 5MB
                        </p>
                      </div>
                      {uploadError && (
                        <p className="text-xs text-red-500 font-semibold bg-red-50 border border-red-100 rounded-xl px-4 py-2 mt-1">
                          {uploadError}
                        </p>
                      )}
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="mt-2 px-6 py-2.5 rounded-xl bg-dash-primary-purple text-dash-white-card font-bold text-sm hover:bg-dash-dark-purple transition-all duration-200 shadow-md cursor-pointer border-0"
                      >
                        Browse Files
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Premium AI Analysis Dashboard Card */
                <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6.5 shadow-[0_4px_20px_rgba(87,82,170,0.02)] flex flex-col gap-6 animate-fade-in">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-dash-border-gray/25 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-dash-success-green/10 flex items-center justify-center text-dash-success-green">
                        <CheckCircle2 size={22} />
                      </div>
                      <div>
                        <h3 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple">
                          Resume Analyzed
                        </h3>
                        <p className="text-xs text-dash-light-purple font-semibold mt-0.5">
                          File: <span className="text-dash-primary-purple font-bold">{candidate?.resume_filename || `${(candidate?.name || candidate?.full_name || 'Candidate').replace(/\s+/g, '_')}_CV.pdf`}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        // Reset resume to allow upload again
                        setCandidate(prev => ({ ...prev, resume: 0 }));
                      }}
                      className="px-4 py-2 rounded-xl border border-dash-border-gray hover:bg-dash-soft-pink text-xs font-bold text-dash-dark-purple transition-all duration-200 cursor-pointer bg-transparent"
                    >
                      Upload New Resume
                    </button>
                  </div>

                  {/* Score & Profile Summary Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-dash-soft-pink/40 border border-dash-border-gray/50 rounded-[20px] p-5">
                    {/* SVG Circular Progress Gauge */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-dash-border-gray/30"
                            fill="transparent"
                          />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-dash-primary-purple"
                            strokeDasharray="264"
                            initial={{ strokeDashoffset: 264 }}
                            animate={{ strokeDashoffset: 264 - (264 * candidate.resume) / 100 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            fill="transparent"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="font-plus-jakarta font-extrabold text-2xl text-dash-dark-purple">{candidate.resume}%</span>
                          <span className="text-[9px] font-bold text-dash-light-purple uppercase tracking-wider">Score</span>
                        </div>
                      </div>
                      <h4 className="font-outfit font-bold text-xs text-dash-dark-purple mt-2.5">AI Resume Grade</h4>
                    </div>

                    {/* Skill profile and overview */}
                    <div className="md:col-span-2 flex flex-col gap-3">
                      <h4 className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple">
                        Profile Overview
                      </h4>
                      <p className="text-xs text-dash-light-purple font-medium leading-relaxed">
                        Our AI models evaluated your credentials against core role competencies. Your skill matching metrics have been updated below. You are now prepared to complete the remaining assessment steps.
                      </p>

                      {/* Dashboard updated alert */}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dash-primary-purple/10 border border-dash-primary-purple/20 text-[11px] font-bold text-dash-primary-purple animate-pulse">
                        <Sparkles size={14} className="shrink-0" />
                        <span>Core skill metrics have been synchronized with your profile.</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Feedback & Analysis Bullet Points */}
                  <div className="flex flex-col gap-4">
                    <h4 className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple">
                      AI Strengths & Observations
                    </h4>

                    <div className="flex flex-col gap-3">
                      {(candidate.resume_analysis || [
                        "Demonstrates solid background in core Python development.",
                        "Demonstrates practical hands-on experience in SQL database schema design.",
                        "Clear project organization and excellent written communication."
                      ]).map((point, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.15 }}
                          className="p-3.5 rounded-xl bg-dash-soft-pink border-l-4 border-l-dash-primary-purple border border-dash-border-gray/40 flex items-start gap-3 hover:bg-dash-border-gray/30 transition-all duration-200"
                        >
                          <span className="w-5 h-5 rounded-full bg-dash-primary-purple/10 flex items-center justify-center text-[10px] font-extrabold text-dash-primary-purple shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-xs font-semibold text-dash-dark-purple leading-relaxed">
                            {point}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Area: Stacked Cards */}
            <div className="flex flex-col gap-6">
              {/* Card 1: Supported Formats */}
              <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)] hover:bg-dash-soft-pink transition-all duration-300">
                <h4 className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple tracking-tight mb-4">
                  Supported Formats
                </h4>
                <div className="space-y-3">
                  {[
                    'PDF (.pdf)',
                    'Max size: 5MB'
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-xs font-semibold text-dash-dark-purple">
                      <CheckCircle2 size={16} className="text-dash-success-green" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: AI Extracts */}
              <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)] hover:bg-dash-soft-pink transition-all duration-300">
                <h4 className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple tracking-tight mb-4">
                  AI Extracts
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Skills', 'Languages', 'Projects', 'Experience',
                    'Education', 'Certifications', 'Tools', 'Technologies'
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-xl bg-dash-light-blue-bg border border-dash-border-gray/30 text-xs font-bold text-dash-dark-purple hover:bg-dash-primary-purple hover:text-dash-white-card transition-all duration-200 cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card 3: Information Card */}
              <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)] hover:bg-dash-soft-pink transition-all duration-300">
                <p className="text-xs text-dash-dark-purple font-medium leading-relaxed">
                  AI analyzes your resume and compares it against assessment categories to personalize your test experience.
                </p>
              </div>
            </div>
          </div>
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
                  const isAssigned = assignment.status === 'ASSIGNED';

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
          const hasOptions = question && Array.isArray(question.options) && question.options.length > 0;
          const isSql = !hasOptions && question ? (((question.type === 'SCENARIO' || question.type === 'SCENARIO_CODING' || question.type === 'CODING') && (question.subject || question.language || '').toLowerCase() === 'sql') || (question.question || '').toUpperCase().includes('SELECT')) : false;
          const isCoding = !hasOptions && (isSql || (question && (
            question.type === 'CODING' ||
            question.type === 'PYTHON_CODING' ||
            question.type === 'SCENARIO_CODING' ||
            (question.subject || question.language || '').toLowerCase().includes('python') ||
            (question.subject || question.language || '').toLowerCase().includes('sql')
          )));

          if (!question) {
            return (
              <div className="text-center py-20 bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-8 max-w-2xl mx-auto w-full">
                <p className="text-sm font-semibold text-red-500 mb-4">Error: No questions found in this assessment.</p>
                <button onClick={() => setActiveAssignment(null)} className="px-4 py-2 bg-dash-primary-purple text-white rounded-lg border-0 cursor-pointer">Go Back</button>
              </div>
            );
          }

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

                {/* Questions Grid Selector */}
                <div>
                  <h4 className="text-xs font-bold text-dash-dark-purple uppercase tracking-wider mb-3">Questions</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {questions.map((_, idx) => {
                      const isCurrent = idx === currentIdx;
                      const isAnswered = examState.answers[idx] !== undefined && examState.answers[idx] !== '';
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

                {/* Progress Stats */}
                <div className="border-t border-dash-border-gray/25 pt-4 flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-bold text-dash-light-purple">
                    <span>Progress</span>
                    <span className="text-dash-dark-purple">
                      {Object.keys(examState.answers).length} / {questions.length} Done
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-dash-light-blue-bg overflow-hidden">
                    <div
                      className="h-full bg-dash-primary-purple rounded-full transition-all duration-300"
                      style={{ width: `${(Object.keys(examState.answers).length / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Emergency Submit */}
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to submit your assessment? You cannot make any changes after submission.")) {
                      handleSubmitExam();
                    }
                  }}
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
                  <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-3">
                    <span className="text-xs font-bold text-dash-light-purple uppercase tracking-wider">
                      Question {currentIdx + 1} of {questions.length}
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
                        onClick={() => {
                          if (window.confirm("Are you sure you want to submit your assessment? You cannot make any changes after submission.")) {
                            handleSubmitExam();
                          }
                        }}
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
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start animate-fade-in">
            {/* LEFT: Question + Mic + AI Criteria (col-span-2) */}
            <div className="xl:col-span-2 flex flex-col gap-6">
              {/* Question Card */}
              <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)]">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-bold text-dash-light-purple uppercase tracking-wider">Question 1 of 5</span>
                  <span className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase border text-dash-primary-purple bg-dash-primary-purple/10 border-dash-primary-purple/20">AI Generated from Resume</span>
                </div>

                {/* Question Text Box */}
                <div className="bg-dash-soft-pink border border-dash-border-gray/50 rounded-2xl p-5 mb-6">
                  <p className="font-plus-jakarta font-bold text-base text-dash-dark-purple leading-relaxed">
                    "Can you briefly introduce yourself and walk me through your background?"
                  </p>
                </div>

                {/* Mic Button */}
                <div className="flex flex-col items-center gap-3 py-4">
                  <button
                    onClick={() => showToast('Recording started...')}
                    className="w-16 h-16 rounded-full bg-dash-primary-purple text-dash-white-card flex items-center justify-center hover:bg-dash-dark-purple transition-all duration-200 shadow-lg hover:scale-110 cursor-pointer border-0"
                  >
                    <Volume2 size={28} />
                  </button>
                  <span className="text-xs font-semibold text-dash-primary-purple">Click the mic to start recording</span>
                </div>
              </div>

              {/* AI Evaluation Criteria */}
              <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)]">
                <h4 className="text-xs font-bold text-dash-dark-purple uppercase tracking-wider mb-4">AI Evaluation Criteria</h4>
                <div className="grid grid-cols-5 gap-3">
                  {['Fluency', 'Pronunciation', 'Grammar', 'Vocabulary', 'Confidence'].map((criterion) => (
                    <div key={criterion} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-dash-soft-pink border border-dash-border-gray/50 hover:bg-dash-border-gray transition-all duration-200 cursor-default">
                      <Volume2 size={18} className="text-dash-primary-purple" />
                      <span className="text-[10px] font-bold text-dash-dark-purple text-center tracking-tight">{criterion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Question List + Progress */}
            <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(87,82,170,0.02)] flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-4">
                <h3 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple tracking-tight">Questions</h3>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { num: 1, text: 'Can you briefly introduce yourself and walk me through your background?', active: true, done: false },
                  { num: 2, text: 'You mentioned a Machine Learning project on your resume — can you explain what problem it solved?', active: false, done: false },
                  { num: 3, text: 'What challenges did you face during your internship and how did you overcome them?', active: false, done: false },
                  { num: 4, text: 'Why did you choose Python as your primary programming language for most of your projects?', active: false, done: false },
                  { num: 5, text: 'Where do you see yourself in the next 3 years in your career?', active: false, done: false }
                ].map((q) => (
                  <div
                    key={q.num}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${q.active
                      ? 'bg-dash-primary-purple/20 border-dash-primary-purple/40'
                      : 'bg-dash-soft-pink border border-dash-border-gray/50 hover:bg-dash-border-gray'
                      }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5 ${q.active ? 'bg-dash-primary-purple text-dash-white-card' : 'bg-dash-border-gray/40 text-dash-light-purple'
                      }`}>
                      {q.num}
                    </span>
                    <p className={`text-xs font-semibold leading-relaxed ${q.active ? 'text-dash-dark-purple' : 'text-dash-light-purple'
                      }`}>
                      {q.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Progress Footer */}
              <div className="border-t border-dash-border-gray/25 pt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-dash-light-purple uppercase tracking-wider">Completed</span>
                <span className="text-xs font-extrabold text-dash-dark-purple">0 / 5</span>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'dashboard' && activeTab !== 'resume' && activeTab !== 'technical' && activeTab !== 'english' && (
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
    </div>
  );
};

export default CandidateDashboard;