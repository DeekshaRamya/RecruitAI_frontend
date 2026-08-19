import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  Download,
} from 'lucide-react';
import api from '../api';
import RecruiterLayout from '../components/layout/RecruiterLayout';
import ActionButton from '../components/ActionButton';
import { Button } from '@/components/ui/button';

// Modular Tab Components
import DashboardOverviewTab from './recruiter/DashboardOverviewTab';
import CandidatesManagementTab from './recruiter/CandidatesManagementTab';
import CreateAssessmentTab from './recruiter/CreateAssessmentTab';
import PreviewQuestionsTab from './recruiter/PreviewQuestionsTab';
import { ActiveAssessmentsTab } from './recruiter/ActiveAssessmentsTab';
import AssignAssessmentTab from './recruiter/AssignAssessmentTab';
import CandidateGroupsTab from './recruiter/CandidateGroupsTab';
import TechnicalResultsTab from './recruiter/TechnicalResultsTab';
import EnglishResultsTab from './recruiter/EnglishResultsTab';
import OverallResultsTab from './recruiter/OverallResultsTab';
import InternalUsersManagementTab from './recruiter/InternalUsersManagementTab';
import LoginHistoryAuditTab from './recruiter/LoginHistoryAuditTab';
import AdminOverviewTab from './recruiter/AdminOverviewTab';

const RecruiterDashboard = ({ onLogout, initialTab = 'dashboard' }) => {
  const { tab: urlTab } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '/recruiter';

  // Navigation state
  const [activeTab, setActiveTabState] = useState(urlTab || initialTab);

  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTabState(urlTab);
    }
  }, [urlTab]);

  const setActiveTab = useCallback((newTab) => {
    setActiveTabState(newTab);
    navigate(`${basePath}/${newTab}`);
  }, [navigate, basePath]);

  const [toastMessage, setToastMessage] = useState('');

  // Current logged in user info
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('recruitai_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }
    return {
      name: 'Recruiter Admin',
      full_name: 'Recruiter Admin',
      email: 'recruiter@recruitai.com',
      photo: '',
      role: 'recruiter'
    };
  });

  // Candidate dataset state
  const [candidates, setCandidates] = useState(() => {
    const saved = localStorage.getItem('recruitai_candidates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Error parsing candidates from localStorage:", e);
      }
    }
    return [
      {
        id: 1,
        name: 'Sneha Patel',
        email: 'sneha.patel@recruitai.com',
        role: 'ML Engineer',
        date: '2026-07-08',
        resume: 95,
        python: 92,
        sql: 84,
        aptitude: 88,
        english: 96,
        final: 91,
        recommendation: 'Strong Hire',
        status: 'Completed'
      },
      {
        id: 2,
        name: 'Priya Nair',
        email: 'priya.nair@recruitai.com',
        role: 'Data Analyst',
        date: '2026-07-07',
        resume: 91,
        python: 88,
        sql: 76,
        aptitude: 82,
        english: 94,
        final: 87,
        recommendation: 'Strong Hire',
        status: 'Completed'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('recruitai_candidates', JSON.stringify(candidates));
  }, [candidates]);

  // Assessments & Assignments State
  const [savedAssessments, setSavedAssessments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeAssessmentsCount, setActiveAssessmentsCount] = useState(0);

  // AI Assessment creation & preview states
  const [selectedSubjects, setSelectedSubjects] = useState(['Python', 'SQL']);
  const [subjectQuestionCounts, setSubjectQuestionCounts] = useState({
    Python: 10,
    SQL: 10,
    Aptitude: 5
  });
  const [assessmentTitle, setAssessmentTitle] = useState('Python & SQL Technical Assessment');
  const [durationInput, setDurationInput] = useState('60 minutes');
  const [questionDist, setQuestionDist] = useState({ mcq: 70, scenario: 30 });
  const [difficultyDist, setDifficultyDist] = useState({ easy: 20, medium: 50, hard: 30 });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    active: false,
    topics: [],
    currentTopicName: '',
    statusMessage: '',
    overallPercent: 0,
    completedTopicsCount: 0,
    totalTopicsCount: 0
  });

  // Candidate Groups state
  const [candidateGroups, setCandidateGroups] = useState(() => {
    const saved = localStorage.getItem('recruitai_candidate_groups');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('recruitai_candidate_groups', JSON.stringify(candidateGroups));
  }, [candidateGroups]);

  // Candidate Drawer & Modals state
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [showCreateCandidateModal, setShowCreateCandidateModal] = useState(false);
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateEmail, setNewCandidateEmail] = useState('');
  const [newCandidatePassword, setNewCandidatePassword] = useState('Candidate@123');
  const [newCandidatePhone, setNewCandidatePhone] = useState('');
  const [isCreatingCandidate, setIsCreatingCandidate] = useState(false);

  // Group creation modal state
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');

  // Assign Assessment navigation state
  const [selectedAssignAssessment, setSelectedAssignAssessment] = useState(null);
  const [assigningCandidate, setAssigningCandidate] = useState(null);

  // English report visualizer states
  const [englishReport, setEnglishReport] = useState(null);
  const [loadingEnglishReport, setLoadingEnglishReport] = useState(false);
  const [showEnglishReportModal, setShowEnglishReportModal] = useState(false);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  }, []);

  const deduplicateAssessments = (list) => {
    if (!Array.isArray(list)) return [];
    const seenIds = new Set();
    const seenNames = new Set();
    return list.filter(asm => {
      if (!asm) return false;
      const idKey = asm.id || asm._id ? String(asm.id || asm._id) : null;
      const nameKey = asm.name ? String(asm.name).trim().toLowerCase() : null;

      if (idKey && seenIds.has(idKey)) return false;
      if (nameKey && seenNames.has(nameKey)) return false;

      if (idKey) seenIds.add(idKey);
      if (nameKey) seenNames.add(nameKey);
      return true;
    });
  };

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/api/candidates');
      if (response.data && Array.isArray(response.data)) {
        setCandidates(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch candidates from backend:", err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/api/assignments?limit=500');
      if (response.data && response.data.assignments) {
        setAssignments(response.data.assignments);
      } else if (Array.isArray(response.data)) {
        setAssignments(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch assignments from backend:", err);
    }
  };

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await api.get('/api/assessment');
        if (response.data && Array.isArray(response.data)) {
          setSavedAssessments(deduplicateAssessments(response.data));
        }
      } catch (err) {
        console.error("Failed to fetch assessments from backend:", err);
      }
    };

    const fetchDashboardStats = async () => {
      try {
        const response = await api.get('/api/recruiter/dashboard');
        if (response.data && response.data.stats && response.data.stats.active_assessments !== undefined) {
          setActiveAssessmentsCount(response.data.stats.active_assessments);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats from backend:", err);
      }
    };

    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/api/auth/me');
        if (response.data) {
          const user = {
            ...response.data,
            name: response.data.full_name || response.data.name || 'Recruiter Admin',
            full_name: response.data.full_name || response.data.name || 'Recruiter Admin',
            email: response.data.email || 'recruiter@recruitai.com',
            photo: response.data.photo || response.data.avatar || response.data.picture || ''
          };
          setCurrentUser(user);
          localStorage.setItem('recruitai_user', JSON.stringify(user));
        }
      } catch (err) {
        // Keep fallback
      }
    };

    const fetchGroups = async () => {
      try {
        const response = await api.get('/api/groups');
        if (response.data && Array.isArray(response.data)) {
          setCandidateGroups(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch candidate groups from database:", err);
      }
    };

    fetchAssessments();
    fetchCandidates();
    fetchAssignments();
    fetchGroups();
    fetchDashboardStats();
    fetchUserProfile();
  }, []);

  const handleOpenEnglishReport = async (candidateId) => {
    try {
      setLoadingEnglishReport(true);
      setShowEnglishReportModal(true);
      setEnglishReport(null);
      const res = await api.get(`/api/recruiter/candidate/${candidateId}/english-assessment`);
      setEnglishReport(res.data);
    } catch (err) {
      console.error("Failed to load candidate English report:", err);
      showToast("English Assessment Report not found or not completed yet.");
      setShowEnglishReportModal(false);
    } finally {
      setLoadingEnglishReport(false);
    }
  };

  const handleDeleteCandidate = async (candidateId, candidateName) => {
    if (!window.confirm(`Are you sure you want to delete candidate "${candidateName || 'this candidate'}"? This action will remove all their assessment records.`)) {
      return;
    }

    try {
      await api.delete(`/api/candidates/${candidateId}`);
      setCandidates(prev => (Array.isArray(prev) ? prev.filter(c => c.id !== candidateId) : []));
      setSelectedCandidateIds(prev => prev.filter(id => id !== candidateId));
      if (selectedCandidate && selectedCandidate.id === candidateId) {
        setSelectedCandidate(null);
      }
      showToast("Candidate deleted successfully.");
    } catch (err) {
      console.error("Failed to delete candidate:", err);
      setCandidates(prev => (Array.isArray(prev) ? prev.filter(c => c.id !== candidateId) : []));
      setSelectedCandidateIds(prev => prev.filter(id => id !== candidateId));
      showToast("Candidate deleted.");
    }
  };

  const handleBulkDeleteCandidates = async () => {
    if (selectedCandidateIds.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedCandidateIds.length} selected candidate(s)?`)) {
      return;
    }

    try {
      await api.delete('/api/candidates', { data: { candidateIds: selectedCandidateIds } });
      setCandidates(prev => (Array.isArray(prev) ? prev.filter(c => !selectedCandidateIds.includes(c.id)) : []));
      setSelectedCandidateIds([]);
      showToast("Selected candidates deleted successfully.");
    } catch (err) {
      console.error("Failed to bulk delete candidates:", err);
      setCandidates(prev => (Array.isArray(prev) ? prev.filter(c => !selectedCandidateIds.includes(c.id)) : []));
      setSelectedCandidateIds([]);
      showToast("Selected candidates deleted.");
    }
  };

  // SSE Stream Consumer Helper
  const streamAssessmentFromBackend = async (payload, onQuestionReceived, onStatusUpdate) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
    const token = localStorage.getItem('recruitai_access_token');
    const endpoint = `${baseURL}/api/assessment/generate-stream`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      let parsedDetail = errText;
      try {
        const jsonErr = JSON.parse(errText);
        parsedDetail = jsonErr.detail || errText;
      } catch (_) {}
      throw new Error(parsedDetail || `Server error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop();

      for (const block of blocks) {
        if (!block.trim()) continue;

        let eventType = 'message';
        let eventData = '';

        const lines = block.split('\n');
        for (const l of lines) {
          if (l.startsWith('event:')) {
            eventType = l.slice(6).trim();
          } else if (l.startsWith('data:')) {
            eventData = l.slice(5).trim();
          }
        }

        if (!eventData) continue;

        try {
          const parsed = JSON.parse(eventData);
          if (eventType === 'status') {
            if (onStatusUpdate) onStatusUpdate(parsed);
          } else if (eventType === 'question') {
            if (onQuestionReceived) onQuestionReceived(parsed);
          } else if (eventType === 'error') {
            throw new Error(parsed.detail || 'Streaming generation error.');
          }
        } catch (e) {
          if (eventType === 'error') throw e;
          console.warn("Could not parse SSE payload:", e, eventData);
        }
      }
    }
  };

  const formatRawQuestion = (q, index, fallbackSubject) => ({
    id: index,
    subject: q.subject || fallbackSubject || 'General',
    topic: q.topic || 'General',
    type: q.type,
    difficulty: q.difficulty,
    scenario: q.scenario || q.problemStatement || '',
    question: q.question,
    q: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation || '',
    problemStatement: q.problemStatement || q.scenario || '',
    candidateTask: q.candidateTask || '',
    expectedAnswer: q.expectedAnswer || q.correctAnswer || '',
    evaluationCriteria: q.evaluationCriteria || '',
    exampleInput: q.exampleInput || '',
    exampleOutput: q.exampleOutput || '',
    databaseSchema: q.databaseSchema || null,
    sampleData: q.sampleData || null,
    inputFormat: q.inputFormat || '',
    outputFormat: q.outputFormat || '',
    sampleInput: q.sampleInput || '',
    sampleOutput: q.sampleOutput || '',
    constraints: q.constraints || [],
    marks: q.marks || (q.type === 'MCQ' ? 1 : 10),
    estimatedTime: q.estimatedTime || (q.type === 'MCQ' ? '2 Minutes' : '15 Minutes')
  });

  // AI Assessment Generation with Real-Time Streaming
  const handleGenerateAssessment = async () => {
    const topicsList = [...selectedSubjects];
    if (topicsList.length === 0) {
      showToast("Please select at least one topic.");
      return;
    }

    setIsGenerating(true);
    setGeneratedQuestions([]);

    // Scroll to preview container smoothly
    setTimeout(() => {
      document.getElementById('assessment-preview-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);

    if (topicsList.length === 1) {
      const singleTopic = topicsList[0];
      const targetCount = Math.max(1, parseInt(subjectQuestionCounts[singleTopic], 10) || 10);
      const payload = {
        title: assessmentTitle || `${singleTopic} Technical Assessment`,
        subjects: [singleTopic],
        totalQuestions: targetCount,
        questionDistribution: {
          mcq: questionDist.mcq,
          scenario: questionDist.scenario
        },
        difficultyDistribution: {
          easy: difficultyDist.easy,
          medium: difficultyDist.medium,
          hard: difficultyDist.hard
        },
        duration: durationInput
      };

      setGenerationProgress({
        active: true,
        topics: [{ name: singleTopic, status: 'generating', count: 0, targetCount }],
        currentTopicName: singleTopic,
        statusMessage: `Streaming AI generation for ${singleTopic}...`,
        overallPercent: 10,
        completedTopicsCount: 0,
        totalTopicsCount: 1
      });

      let accumulated = [];

      try {
        await streamAssessmentFromBackend(
          payload,
          (newQ) => {
            const formatted = formatRawQuestion(newQ, accumulated.length + 1, singleTopic);
            accumulated = [...accumulated, formatted];
            setGeneratedQuestions([...accumulated]);

            const currentCount = accumulated.length;
            const progressPercent = Math.min(95, Math.round((currentCount / targetCount) * 100));

            setGenerationProgress(prev => ({
              ...prev,
              overallPercent: progressPercent,
              statusMessage: `Received question ${currentCount} of ${targetCount} (${newQ.type})...`,
              topics: [{ name: singleTopic, status: 'generating', count: currentCount, targetCount }]
            }));
          },
          (statusObj) => {
            if (statusObj.message) {
              setGenerationProgress(prev => ({
                ...prev,
                statusMessage: statusObj.message
              }));
            }
          }
        );

        setGenerationProgress({
          active: false,
          topics: [{ name: singleTopic, status: 'completed', count: accumulated.length, targetCount }],
          currentTopicName: singleTopic,
          statusMessage: `Generated ${accumulated.length} questions successfully!`,
          overallPercent: 100,
          completedTopicsCount: 1,
          totalTopicsCount: 1
        });

        showToast(`Successfully generated ${accumulated.length} questions!`);
      } catch (err) {
        console.error("AI assessment streaming failed:", err);
        const errMsg = err.response?.data?.detail || err.message || err;
        showToast(`Error: ${errMsg}`);
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // Multi-topic Progressive Streaming Batching
    const initialTopics = topicsList.map(t => ({
      name: t,
      status: 'pending',
      count: 0,
      targetCount: Math.max(1, parseInt(subjectQuestionCounts[t], 10) || 10),
      error: null
    }));

    setGenerationProgress({
      active: true,
      topics: initialTopics,
      currentTopicName: topicsList[0],
      statusMessage: `Starting Real-Time AI Generation for ${topicsList.join(', ')}...`,
      overallPercent: 0,
      completedTopicsCount: 0,
      totalTopicsCount: topicsList.length
    });

    let allQuestions = [];
    let completedCount = 0;

    for (let i = 0; i < topicsList.length; i++) {
      const currentTopic = topicsList[i];
      const perTopicTarget = Math.max(1, parseInt(subjectQuestionCounts[currentTopic], 10) || 10);

      setGenerationProgress(prev => {
        const updatedTopics = prev.topics.map((t, idx) =>
          idx === i ? { ...t, status: 'generating' } : t
        );
        const percent = Math.round((i / topicsList.length) * 100);
        return {
          ...prev,
          topics: updatedTopics,
          currentTopicName: currentTopic,
          statusMessage: `Generating questions for ${currentTopic}...`,
          overallPercent: percent
        };
      });

      const topicPayload = {
        title: assessmentTitle || `${currentTopic} Technical Assessment`,
        subjects: [currentTopic],
        totalQuestions: perTopicTarget,
        questionDistribution: {
          mcq: questionDist.mcq,
          scenario: questionDist.scenario
        },
        difficultyDistribution: {
          easy: difficultyDist.easy,
          medium: difficultyDist.medium,
          hard: difficultyDist.hard
        },
        duration: durationInput
      };

      let topicQs = [];

      try {
        await streamAssessmentFromBackend(
          topicPayload,
          (newQ) => {
            const formatted = formatRawQuestion(newQ, allQuestions.length + topicQs.length + 1, currentTopic);
            topicQs = [...topicQs, formatted];
            const combined = [...allQuestions, ...topicQs].map((q, idx) => ({ ...q, id: idx + 1 }));
            setGeneratedQuestions(combined);

            setGenerationProgress(prev => {
              const updatedTopics = prev.topics.map((t, idx) =>
                idx === i ? { ...t, count: topicQs.length } : t
              );
              return {
                ...prev,
                topics: updatedTopics,
                statusMessage: `Received ${currentTopic} question (${newQ.type})...`
              };
            });
          },
          (statusObj) => {
            if (statusObj.message) {
              setGenerationProgress(prev => ({
                ...prev,
                statusMessage: statusObj.message
              }));
            }
          }
        );

        allQuestions = [...allQuestions, ...topicQs];
        completedCount++;

        setGenerationProgress(prev => {
          const updatedTopics = prev.topics.map((t, idx) =>
            idx === i ? { ...t, status: 'completed', count: topicQs.length } : t
          );
          const nextTopic = topicsList[i + 1];
          const percent = Math.round(((i + 1) / topicsList.length) * 100);
          return {
            ...prev,
            topics: updatedTopics,
            completedTopicsCount: completedCount,
            overallPercent: percent,
            statusMessage: nextTopic
              ? `${currentTopic} Completed (${topicQs.length} Qs). Generating ${nextTopic}...`
              : `${currentTopic} Completed (${topicQs.length} Qs). Generation complete.`
          };
        });

        showToast(`Generated ${topicQs.length} questions for ${currentTopic}!`);
      } catch (err) {
        console.error(`Failed to stream ${currentTopic} questions:`, err);
        const errMsg = err.message || 'Generation failed';
        showToast(`Warning: Failed to generate questions for ${currentTopic}. Continuing remaining topics...`);

        setGenerationProgress(prev => {
          const updatedTopics = prev.topics.map((t, idx) =>
            idx === i ? { ...t, status: 'failed', error: errMsg } : t
          );
          const percent = Math.round(((i + 1) / topicsList.length) * 100);
          return {
            ...prev,
            topics: updatedTopics,
            overallPercent: percent
          };
        });
      }
    }

    setGenerationProgress(prev => ({
      ...prev,
      statusMessage: "Generation Complete! Review your questions and click 'Save Assessment'.",
      overallPercent: 100
    }));

    showToast(`All topics generated successfully! Click 'Save Assessment' to save.`);

    setTimeout(() => {
      setIsGenerating(false);
      setGenerationProgress(prev => ({ ...prev, active: false }));
    }, 1500);
  };

  const resetAssessmentCreationForm = () => {
    setAssessmentTitle('');
    setDurationInput('60 minutes');
    setSelectedSubjects(['Python']);
    setSubjectQuestionCounts({
      Python: 10,
      SQL: 10,
      Aptitude: 5
    });
    setQuestionDist({ mcq: 70, scenario: 30 });
    setDifficultyDist({ easy: 20, medium: 50, hard: 30 });
    setGeneratedQuestions([]);
    setGenerationProgress({
      active: false,
      topics: [],
      currentTopicName: '',
      statusMessage: '',
      overallPercent: 0,
      completedTopicsCount: 0,
      totalTopicsCount: 0
    });
  };

  const handleSaveAssessment = async (andAssign = false) => {
    if (!generatedQuestions || generatedQuestions.length === 0) {
      showToast("No questions to save. Please generate questions first.");
      return;
    }

    const subjectsInQuestions = [...new Set(generatedQuestions.map(q => q.subject))].filter(Boolean);
    const activeSubjects = subjectsInQuestions.length > 0 ? subjectsInQuestions : (selectedSubjects.length > 0 ? selectedSubjects : ['General']);
    const name = assessmentTitle.trim() || `${activeSubjects.join(' & ')} Technical Assessment`;

    const payload = {
      name: name,
      subjects: activeSubjects,
      difficulty: 'Medium',
      duration: durationInput || '60 minutes',
      questionsCount: generatedQuestions.length,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      candidatesAssigned: 0,
      questions: generatedQuestions
    };

    try {
      const response = await api.post('/api/assessment', payload);
      if (response.data) {
        const savedAsm = response.data;
        setSavedAssessments(prev => deduplicateAssessments([savedAsm, ...prev]));
        setActiveAssessmentsCount(prev => prev + 1);

        // Clear the creation form state so a fresh assessment can be configured
        resetAssessmentCreationForm();

        // Pre-select the newly saved assessment and navigate to assign-assessment tab
        setSelectedAssignAssessment(savedAsm);
        setActiveTab('assign-assessment');
        showToast(`Assessment '${name}' saved! Redirecting to assign candidates...`);
      }
    } catch (err) {
      console.error("Failed to save assessment to backend:", err);
      showToast(`Error saving assessment: ${err.response?.data?.detail || err.message || err}`);
    }
  };

  // Assign assessment helper: navigates to dedicated assign-assessment tab
  const handleOpenAssignModal = (asm, group = null, cand = null) => {
    setSelectedAssignAssessment(asm || null);
    setAssigningCandidate(cand || null);
    setActiveTab('assign-assessment');
  };

  return (
    <div className="bg-dash-light-blue-bg text-dash-dark-purple min-h-screen relative overflow-hidden font-inter flex w-full">
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

      {/* Recruiter Layout with Dark Sidebar, Profile, Breadcrumb, and Content Area */}
      <RecruiterLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        user={currentUser}
      >
        {activeTab === 'dashboard' && (
          (currentUser?.role || '').toLowerCase() === 'admin' ? (
            <AdminOverviewTab
              showToast={showToast}
              setActiveTab={setActiveTab}
              currentUser={currentUser}
            />
          ) : (
            <DashboardOverviewTab
              candidates={candidates}
              savedAssessments={savedAssessments}
              activeAssessmentsCount={activeAssessmentsCount}
              assignments={assignments}
              candidateGroups={candidateGroups}
              selectedCandidateIds={selectedCandidateIds}
              setSelectedCandidateIds={setSelectedCandidateIds}
              onCandidateClick={(cand) => setSelectedCandidate(cand)}
              onDeleteCandidate={handleDeleteCandidate}
              onBulkDeleteCandidates={handleBulkDeleteCandidates}
              onCreateCandidateClick={() => setShowCreateCandidateModal(true)}
              onCreateGroupClick={() => setShowCreateGroupModal(true)}
              onOpenEnglishReport={handleOpenEnglishReport}
              setActiveTab={setActiveTab}
              user={currentUser}
            />
          )
        )}

        {activeTab === 'candidates' && (
          <CandidatesManagementTab
            candidates={candidates}
            setCandidates={setCandidates}
            assignments={assignments}
            savedAssessments={savedAssessments}
            candidateGroups={candidateGroups}
            showToast={showToast}
            onCandidateClick={(cand) => setSelectedCandidate(cand)}
            onOpenEnglishReport={handleOpenEnglishReport}
            onAssignCandidateClick={(cand) => handleOpenAssignModal(savedAssessments[0], null, cand)}
            onCreateGroupClick={() => setShowCreateGroupModal(true)}
          />
        )}

        {activeTab === 'create-assessment' && (
          <CreateAssessmentTab
            assessmentTitle={assessmentTitle}
            setAssessmentTitle={setAssessmentTitle}
            durationInput={durationInput}
            setDurationInput={setDurationInput}
            selectedSubjects={selectedSubjects}
            setSelectedSubjects={setSelectedSubjects}
            subjectQuestionCounts={subjectQuestionCounts}
            setSubjectQuestionCounts={setSubjectQuestionCounts}
            toggleSubject={(sub) => {
              setSelectedSubjects(prev =>
                prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
              );
            }}
            questionDist={questionDist}
            setQuestionDist={setQuestionDist}
            difficultyDist={difficultyDist}
            setDifficultyDist={setDifficultyDist}
            isGenerating={isGenerating}
            onGenerate={handleGenerateAssessment}
            handleGenerateAssessment={handleGenerateAssessment}
            generatedQuestions={generatedQuestions}
            setGeneratedQuestions={setGeneratedQuestions}
            generationProgress={generationProgress}
            onSave={handleSaveAssessment}
            onSaveAssessment={handleSaveAssessment}
            onSaveAndAssign={() => handleSaveAssessment(true)}
            showToast={showToast}
          />
        )}

        {activeTab === 'preview-questions' && (
          <PreviewQuestionsTab
            questions={generatedQuestions}
            generatedQuestions={generatedQuestions}
            setQuestions={setGeneratedQuestions}
            setGeneratedQuestions={setGeneratedQuestions}
            generationProgress={generationProgress}
            onSave={handleSaveAssessment}
            onSaveAssessment={handleSaveAssessment}
            onSaveAndAssign={() => handleSaveAssessment(true)}
            showToast={showToast}
          />
        )}

        {activeTab === 'assessments' && (
          <ActiveAssessmentsTab
            savedAssessments={savedAssessments}
            setSavedAssessments={setSavedAssessments}
            setGeneratedQuestions={setGeneratedQuestions}
            assignments={assignments}
            fetchAssignments={fetchAssignments}
            showToast={showToast}
            setActiveTab={setActiveTab}
            currentUser={currentUser}
            onAssignClick={(asm) => handleOpenAssignModal(asm)}
          />
        )}

        {activeTab === 'assign-assessment' && (
          <AssignAssessmentTab
            savedAssessments={savedAssessments}
            candidates={candidates}
            candidateGroups={candidateGroups}
            assignments={assignments}
            fetchAssignments={fetchAssignments}
            showToast={showToast}
            setActiveTab={setActiveTab}
            currentUser={currentUser}
            initialSelectedAssessment={selectedAssignAssessment}
            initialSelectedCandidate={assigningCandidate}
          />
        )}

        {activeTab === 'groups' && (
          <CandidateGroupsTab
            candidateGroups={candidateGroups}
            setCandidateGroups={setCandidateGroups}
            candidates={candidates}
            savedAssessments={savedAssessments}
            showToast={showToast}
            currentUser={currentUser}
            onAssignGroupClick={(group) => {
              if (savedAssessments.length === 0) {
                showToast("Please create an assessment first.");
                return;
              }
              handleOpenAssignModal(savedAssessments[0], group);
            }}
          />
        )}

        {activeTab === 'results' && (
          <TechnicalResultsTab
            showToast={showToast}
            candidateGroups={candidateGroups}
            candidates={candidates}
            savedAssessments={savedAssessments}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'english-results' && (
          <EnglishResultsTab
            candidates={candidates}
            showToast={showToast}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'users' && (
          <InternalUsersManagementTab
            showToast={showToast}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'login-history' && (
          <LoginHistoryAuditTab
            showToast={showToast}
          />
        )}

        {activeTab === 'overall-results' && (
          <OverallResultsTab
            showToast={showToast}
            currentUser={currentUser}
          />
        )}
      </RecruiterLayout>

      {/* Slide-out Panel Drawer for Selected Candidate */}
      <AnimatePresence>
        {selectedCandidate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCandidate(null)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="fixed top-0 bottom-0 right-0 w-full sm:w-[460px] bg-white border-l border-slate-200 shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                  <div>
                    <span className="text-[11px] text-indigo-600 font-semibold uppercase tracking-wider">Candidate Evaluation</span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedCandidate.name || selectedCandidate.full_name}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3.5 mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Applied Role</span>
                      <span className="text-xs font-semibold text-slate-800">
                        {selectedCandidate.role ? selectedCandidate.role.charAt(0).toUpperCase() + selectedCandidate.role.slice(1).toLowerCase() : 'Candidate'}
                      </span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Email Address</span>
                      <span className="text-xs font-semibold text-slate-800 truncate block">{selectedCandidate.email}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Date Created</span>
                      <span className="text-xs font-semibold text-slate-800">{selectedCandidate.date || (selectedCandidate.created_at ? new Date(selectedCandidate.created_at).toLocaleDateString() : 'Recent')}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Overall Score</span>
                      <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`w-2 h-2 rounded-full ${selectedCandidate.status === 'Completed' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        />
                        {selectedCandidate.final !== undefined ? `${selectedCandidate.final}%` : '--'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Skill Evaluation Breakdown</h4>
                  {selectedCandidate.final !== undefined ? (
                    <div className="space-y-3 bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                      {[
                        { name: 'Resume Match', value: selectedCandidate.resume },
                        { name: 'Python Coding', value: selectedCandidate.python },
                        { name: 'SQL Querying', value: selectedCandidate.sql },
                        { name: 'Aptitude & Logic', value: selectedCandidate.aptitude },
                        { name: 'English Communication', value: selectedCandidate.english, isEnglish: true },
                        { name: 'Composite Final Score', value: selectedCandidate.final }
                      ].map((skill) => (
                        <div key={skill.name}>
                          <div className="flex justify-between text-xs font-medium mb-1 items-center">
                            <span className="text-slate-600 flex items-center gap-1.5">
                              <span>{skill.name}</span>
                              {skill.isEnglish && skill.value !== undefined && skill.value !== null && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEnglishReport(selectedCandidate.id)}
                                  className="text-[10px] text-indigo-600 font-semibold hover:underline cursor-pointer bg-transparent border-0 p-0"
                                >
                                  (View Report)
                                </button>
                              )}
                            </span>
                            <span className="text-slate-900 font-bold">{skill.value !== undefined && skill.value !== null ? `${skill.value}%` : '--'}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                (skill.value || 0) >= 75 ? 'bg-emerald-500' : (skill.value || 0) >= 50 ? 'bg-indigo-600' : 'bg-rose-500'
                              }`}
                              style={{ width: `${skill.value || 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 text-center bg-slate-50 border border-slate-200/80 rounded-xl">
                      <Clock className="text-slate-400 mx-auto mb-2" size={22} />
                      <span className="text-xs text-slate-500 font-medium leading-relaxed block">
                        Assessment in progress. Detailed skill metrics will be available once completed by the candidate.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => showToast(`Report for ${selectedCandidate.name || selectedCandidate.full_name} downloaded successfully.`)}
                  disabled={selectedCandidate.final === undefined}
                  className="flex-1 h-9 rounded-lg border-slate-200 text-slate-700 text-xs font-medium"
                >
                  <Download size={14} className="mr-1.5" />
                  <span>Download Report</span>
                </Button>
                <Button
                  onClick={() => {
                    showToast(`Interview invite scheduled for ${selectedCandidate.name || selectedCandidate.full_name}.`);
                    setSelectedCandidate(null);
                  }}
                  className="flex-1 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs"
                >
                  <span>Request Interview</span>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal for Creating Candidate Account */}
      <AnimatePresence>
        {showCreateCandidateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateCandidateModal(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 m-auto w-full max-w-md h-fit bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-6 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] text-indigo-600 font-semibold tracking-wider uppercase">
                    Talent Onboarding
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    Add New Candidate
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateCandidateModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X size={16} />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newCandidateName.trim() || !newCandidateEmail.trim() || !newCandidatePassword.trim()) {
                    alert('Please fill in Name, Email, and Password.');
                    return;
                  }

                  setIsCreatingCandidate(true);
                  try {
                    await api.post('/api/candidates', {
                      name: newCandidateName.trim(),
                      email: newCandidateEmail.trim(),
                      password: newCandidatePassword.trim(),
                      phone: newCandidatePhone.trim() || null
                    });

                    showToast(`Candidate "${newCandidateName.trim()}" created successfully.`);
                    fetchCandidates();
                    setShowCreateCandidateModal(false);
                    setNewCandidateName('');
                    setNewCandidateEmail('');
                    setNewCandidatePhone('');
                  } catch (err) {
                    console.error("Failed to create candidate:", err);
                    const detail = err.response?.data?.detail || err.message || "Failed to create candidate account.";
                    alert(`Error: ${detail}`);
                  } finally {
                    setIsCreatingCandidate(false);
                  }
                }}
                className="flex flex-col gap-3.5"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Johnson"
                    value={newCandidateName}
                    onChange={(e) => setNewCandidateName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex.j@example.com"
                    value={newCandidateEmail}
                    onChange={(e) => setNewCandidateEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-700">
                      Initial Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomPass = 'Pass@' + Math.floor(100000 + Math.random() * 900000);
                        setNewCandidatePassword(randomPass);
                      }}
                      className="text-[11px] font-medium text-indigo-600 hover:underline bg-transparent border-none cursor-pointer"
                    >
                      Generate random
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Minimum 6 characters"
                    value={newCandidatePassword}
                    onChange={(e) => setNewCandidatePassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 (555) 234-5678"
                    value={newCandidatePhone}
                    onChange={(e) => setNewCandidatePhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                <div className="flex gap-2.5 mt-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateCandidateModal(false)}
                    className="flex-1 h-9 rounded-lg border-slate-200 text-slate-700 text-xs font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreatingCandidate}
                    className="flex-1 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs"
                  >
                    {isCreatingCandidate ? 'Creating...' : 'Create Candidate'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal for Group Creation */}
      <AnimatePresence>
        {showCreateGroupModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateGroupModal(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 m-auto w-full max-w-md h-fit bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-6 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] text-indigo-600 font-semibold tracking-wider uppercase">
                    Cohort Organization
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    Create Candidate Group
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X size={16} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!groupName.trim()) {
                    alert('Please enter a group name.');
                    return;
                  }
                  const newGroup = {
                    id: Math.random().toString(36).substring(2, 9),
                    name: groupName.trim(),
                    candidateIds: selectedCandidateIds,
                    createdAt: Date.now()
                  };
                  setCandidateGroups(prev => [newGroup, ...prev]);
                  setSelectedCandidateIds([]);
                  setShowCreateGroupModal(false);
                  setGroupName('');
                  showToast(`Group "${newGroup.name}" created successfully.`);
                }}
                className="flex flex-col gap-3.5"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Backend Engineers 2026"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Selected Candidates ({selectedCandidateIds.length})
                  </label>
                  <div className="max-h-32 overflow-y-auto space-y-1 border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                    {candidates
                      .filter(c => selectedCandidateIds.includes(c.id))
                      .map(c => (
                        <div key={c.id} className="text-xs text-slate-800 flex items-center justify-between py-0.5">
                          <span className="font-medium">{c.full_name || c.name}</span>
                          <span className="text-[11px] text-slate-500">{c.email}</span>
                        </div>
                      ))}
                    {selectedCandidateIds.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No candidates selected from table.</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2.5 mt-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateGroupModal(false)}
                    className="flex-1 h-9 rounded-lg border-slate-200 text-slate-700 text-xs font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs"
                  >
                    Create Group
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default RecruiterDashboard;
