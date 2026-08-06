import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import logo from '../assets/systech.jpg';
import ActionButton from '../components/ActionButton';
import {
  Briefcase,
  Users,
  Award,
  Search,
  X,
  Check,
  Menu,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  Mail,
  User,
  Clock,
  Download,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Phone,
  Calendar,
  Plus,
  UserPlus,
  LogOut,
  FileText,
  Sparkles,
  Trash2,
  Save,
  Copy,
  Terminal,
  HelpCircle,
  CheckCircle,
  Edit3,
  Play,
  BookOpen,
  RefreshCw,
  RotateCcw,
  Eye,
  Code,
  Database,
  Brain,
  PieChart,
  Volume2,
  BarChart2,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import api from '../api';

const RecruiterDashboard = ({ onLogout, initialTab = 'dashboard' }) => {
  // Candidate dataset state
  const [candidates, setCandidates] = useState(() => {
    const saved = localStorage.getItem('recruitai_candidates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
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
      },
      {
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
      },
      {
        id: 4,
        name: 'Divya Krishnan',
        email: 'divya.krishnan@recruitai.com',
        role: 'Full Stack Developer',
        date: '2026-07-05',
        resume: 78,
        python: 74,
        sql: 70,
        aptitude: 68,
        english: 82,
        final: 74,
        recommendation: 'Moderate',
        status: 'In Progress'
      },
      {
        id: 5,
        name: 'Rahul Verma',
        email: 'rahul.verma@recruitai.com',
        role: 'Backend Engineer',
        date: '2026-07-04',
        resume: 72,
        python: 65,
        sql: 88,
        aptitude: 58,
        english: 72,
        final: 72,
        recommendation: 'Moderate',
        status: 'Completed'
      },
      {
        id: 6,
        name: 'Karan Mehta',
        email: 'karan.mehta@recruitai.com',
        role: 'Data Engineer',
        date: '2026-07-03',
        resume: 62,
        python: 48,
        sql: 54,
        aptitude: 44,
        english: 58,
        final: 48,
        recommendation: 'Not Ready',
        status: 'Completed'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('recruitai_candidates', JSON.stringify(candidates));
  }, [candidates]);

  // Deduplicate assessments helper by ID or signature
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

  // Saved Assessments & Assignments State
  const [savedAssessments, setSavedAssessments] = useState([]);
  const [selectedAssessmentForView, setSelectedAssessmentForView] = useState(null);
  const [assignments, setAssignments] = useState([]);

  // Create Candidate Modal State
  const [showCreateCandidateModal, setShowCreateCandidateModal] = useState(false);
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateEmail, setNewCandidateEmail] = useState('');
  const [newCandidatePassword, setNewCandidatePassword] = useState('Candidate@123');
  const [newCandidatePhone, setNewCandidatePhone] = useState('');
  const [isCreatingCandidate, setIsCreatingCandidate] = useState(false);

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

  // Fetch assessments, candidates, and assignments from backend on mount
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await api.get('/api/assessment');
        if (response.data && Array.isArray(response.data)) {
          setSavedAssessments(deduplicateAssessments(response.data));
        }
      } catch (err) {
        console.error("Failed to fetch assessments from backend:", err);
        showToast("Error loading assessments from server.");
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

    fetchAssessments();
    fetchCandidates();
    fetchAssignments();
    fetchDashboardStats();
  }, []);

  // Sidebar navigation state
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(true);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive UI Drawer states
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // English report visualizer states
  const [englishReport, setEnglishReport] = useState(null);
  const [loadingEnglishReport, setLoadingEnglishReport] = useState(false);
  const [showEnglishReportModal, setShowEnglishReportModal] = useState(false);

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

  // Candidate Pagination & Dropdown states
  const [candidatePage, setCandidatePage] = useState(1);
  const [assignSearch, setAssignSearch] = useState('');
  const [selectedAssignCandidate, setSelectedAssignCandidate] = useState(null);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [assigningAssessment, setAssigningAssessment] = useState(null);
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  // Group states
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [candidateGroups, setCandidateGroups] = useState(() => {
    const saved = localStorage.getItem('recruitai_candidate_groups');
    return saved ? JSON.parse(saved) : [];
  });
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [assigningGroup, setAssigningGroup] = useState(null);

  // Assign to group states in assessment modal
  const [assignType, setAssignType] = useState('individual'); // 'individual' | 'group'
  const [selectedAssignGroup, setSelectedAssignGroup] = useState(null);

  // Sync groups to localStorage
  useEffect(() => {
    localStorage.setItem('recruitai_candidate_groups', JSON.stringify(candidateGroups));
  }, [candidateGroups]);

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
      // Fallback local deletion
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
      // Fallback local deletion
      setCandidates(prev => (Array.isArray(prev) ? prev.filter(c => !selectedCandidateIds.includes(c.id)) : []));
      setSelectedCandidateIds([]);
      showToast("Selected candidates deleted.");
    }
  };

  useEffect(() => {
    setCandidatePage(1);
  }, [searchQuery, candidates.length]);

  useEffect(() => {
    if (assigningAssessment) {
      setAssignSearch('');
      setSelectedAssignCandidate(null);
      setShowAssignDropdown(false);
      if (assigningGroup) {
        setAssignType('group');
        setSelectedAssignGroup(assigningGroup);
      } else {
        setAssignType('individual');
        setSelectedAssignGroup(null);
      }
    }
  }, [assigningAssessment, assigningGroup]);

  // Subjects and topics dataset as state so recruiters can dynamically add/edit topics
  const [subjectsData, setSubjectsData] = useState({
    Python: [
      'Variables & Data Types',
      'Control Flow & Loops',
      'Functions',
      'OOP & Classes',
      'Exception Handling',
      'File Handling',
      'Collections',
      'Generators & Decorators',
      'Async Programming',
      'Unit Testing'
    ],
    SQL: [
      'SELECT & Projection',
      'WHERE & Filtering',
      'GROUP BY & Aggregation',
      'HAVING',
      'JOINs',
      'Subqueries',
      'Window Functions',
      'CTEs',
      'Stored Procedures',
      'Indexing & Performance'
    ],
    Aptitude: [
      'Percentages',
      'Profit & Loss',
      'Time & Work',
      'Time & Distance',
      'Number System',
      'Logical Reasoning',
      'Data Interpretation',
      'Ratios & Proportions',
      'Probability',
      'Series & Patterns'
    ]
  });

  // State to track adding a new topic
  const [addingTopicTo, setAddingTopicTo] = useState(null);
  const [newTopicVal, setNewTopicVal] = useState('');

  const handleAddTopic = (subject) => {
    const trimmedVal = newTopicVal.trim();
    if (!trimmedVal) return;

    if (subjectsData[subject].some(t => t.toLowerCase() === trimmedVal.toLowerCase())) {
      showToast(`Topic "${trimmedVal}" already exists in ${subject}!`);
      return;
    }

    setSubjectsData(prev => ({
      ...prev,
      [subject]: [...prev[subject], trimmedVal]
    }));

    // Auto-select the newly added topic
    setSelectedTopics(prev => ({
      ...prev,
      [subject]: [...prev[subject], trimmedVal]
    }));

    setTopicConfigs(prevConfigs => ({
      ...prevConfigs,
      [trimmedVal]: { mcqCount: 2, scenarioCount: 1 }
    }));

    showToast(`Added and selected topic "${trimmedVal}" under ${subject}!`);
    setAddingTopicTo(null);
    setNewTopicVal('');
  };

  const _handleDeleteTopic = (subject, topic) => {
    setSubjectsData(prev => ({
      ...prev,
      [subject]: prev[subject].filter(t => t !== topic)
    }));

    setSelectedTopics(prev => ({
      ...prev,
      [subject]: prev[subject].filter(t => t !== topic)
    }));

    setTopicConfigs(prevConfigs => {
      const next = { ...prevConfigs };
      delete next[topic];
      return next;
    });

    showToast(`Deleted topic "${topic}" from ${subject}.`);
  };

  const _renderAddTopicControl = (subject) => {
    const isAdding = addingTopicTo === subject;
    const accentColorClass = subject === 'Aptitude' ? 'border-[#d97706] text-[#b45309]' : 'border-dash-primary-purple text-dash-primary-purple';
    const bgClass = subject === 'Aptitude' ? 'bg-[#fef3c7]/30 hover:bg-[#fef3c7] hover:border-[#d97706]' : 'bg-dash-primary-purple/5 hover:bg-dash-primary-purple/10 hover:border-dash-primary-purple';
    const checkBtnBg = subject === 'Aptitude' ? 'bg-[#d97706] hover:bg-[#b45309]' : 'bg-dash-primary-purple hover:bg-dash-dark-purple';

    if (isAdding) {
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTopic(subject);
          }}
          className="flex items-center gap-1.5"
        >
          <input
            type="text"
            placeholder={`New ${subject} topic...`}
            value={newTopicVal}
            onChange={(e) => setNewTopicVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setAddingTopicTo(null);
                setNewTopicVal('');
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border bg-dash-white-card text-dash-dark-purple focus:outline-none w-36 shadow-sm ${subject === 'Aptitude' ? 'border-[#d97706] focus:border-[#d97706]' : 'border-dash-primary-purple focus:border-dash-primary-purple'}`}
            autoFocus
          />
          <button type="submit" className={`p-2 rounded-xl text-dash-white-card transition-all duration-200 cursor-pointer flex items-center justify-center ${checkBtnBg}`}>
            <Check size={12} strokeWidth={3} />
          </button>
          <button type="button" onClick={() => { setAddingTopicTo(null); setNewTopicVal(''); }} className="p-2 rounded-xl bg-dash-border-gray/30 text-dash-dark-purple hover:bg-dash-border-gray/50 transition-all duration-200 cursor-pointer flex items-center justify-center">
            <X size={12} strokeWidth={3} />
          </button>
        </form>
      );
    }

    return (
      <button
        onClick={() => { setAddingTopicTo(subject); setNewTopicVal(''); }}
        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border border-dashed transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${accentColorClass} ${bgClass}`}
      >
        <Plus size={12} strokeWidth={3} />
        <span>Add Topic</span>
      </button>
    );
  };

  // Redesigned Assessment Creation state
  const [selectedSubjects, setSelectedSubjects] = useState(['Python', 'SQL']);
  const [assessmentTitle, setAssessmentTitle] = useState('Python & SQL Technical Assessment');
  const [durationInput, setDurationInput] = useState('60 minutes');

  // Percentage distribution states
  const [questionDist, setQuestionDist] = useState({ mcq: 70, scenario: 30 });
  const [difficultyDist, setDifficultyDist] = useState({ easy: 20, medium: 50, hard: 30 });

  // Toggle subject selection
  const toggleSubject = (subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  // Validations
  const isQuestionDistValid = (questionDist.mcq + questionDist.scenario) === 100;
  const isDifficultyDistValid = (difficultyDist.easy + difficultyDist.medium + difficultyDist.hard) === 100;
  const isSubjectsValid = selectedSubjects.length > 0;

  const isValidForGeneration = isSubjectsValid && isQuestionDistValid && isDifficultyDistValid;

  // Create assessment form state (legacy fallback, unused but kept for compatibility)
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    role: 'Frontend Engineer',
    duration: '45',
    difficulty: 'Medium'
  });

  // Successful assessment toast/alert notification
  const [toastMessage, setToastMessage] = useState('');

  // AI Generated preview questions state
  const [_previewQuestions, _setPreviewQuestions] = useState([
    {
      id: 1,
      subject: 'Python',
      difficulty: 'Medium',
      question: 'Which keyword is used to define a generator function in Python?',
      options: [
        { label: 'A', text: 'return', isCorrect: false },
        { label: 'B', text: 'yield', isCorrect: true },
        { label: 'C', text: 'async', isCorrect: false },
        { label: 'D', text: 'lambda', isCorrect: false }
      ]
    },
    {
      id: 2,
      subject: 'Python',
      difficulty: 'Easy',
      question: 'What is the output of: list(map(lambda x: x**2, [1, 2, 3, 4]))?',
      options: [
        { label: 'A', text: '[1, 4, 9, 16]', isCorrect: true },
        { label: 'B', text: '[2, 4, 6, 8]', isCorrect: false },
        { label: 'C', text: '[1, 2, 3, 4]', isCorrect: false },
        { label: 'D', text: 'Error', isCorrect: false }
      ]
    },
    {
      id: 3,
      subject: 'Python',
      difficulty: 'Medium',
      question: 'Which decorator defines a class method that takes the class as the first argument?',
      options: [
        { label: 'A', text: '@staticmethod', isCorrect: false },
        { label: 'B', text: '@property', isCorrect: false },
        { label: 'C', text: '@classmethod', isCorrect: true },
        { label: 'D', text: '@instancemethod', isCorrect: false }
      ]
    }
  ]);

  const [_editingQuestionId, _setEditingQuestionId] = useState(null);
  const [_editingText, _setEditingText] = useState('');
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

  // Dynamic states for active assessments metric count
  const [activeAssessmentsCount, setActiveAssessmentsCount] = useState(0);

  // AI-generated questions list (starts empty, updated on AI assessment creation)
  const [generatedQuestions, setGeneratedQuestions] = useState([]);


  // Dynamic valid active assessments filter
  const validActiveAssessments = useMemo(() => {
    if (!Array.isArray(savedAssessments)) return [];
    const filtered = savedAssessments.filter(asm => {
      if (!asm || !asm.id || !asm.name) return false;
      const st = (asm.status || 'Active').toUpperCase();
      return st === 'ACTIVE' || st === 'CREATED';
    });
    return deduplicateAssessments(filtered);
  }, [savedAssessments]);

  // Dynamic completed assessments count
  const completedAssessmentsCount = useMemo(() => {
    let count = 0;
    if (Array.isArray(assignments) && assignments.length > 0) {
      count = assignments.filter(a =>
        a.status === 'SUBMITTED' || a.status === 'COMPLETED' || a.status === 'Submitted' || a.status === 'Completed'
      ).length;
    }
    if (count === 0 && Array.isArray(candidates)) {
      count = candidates.filter(c => c.status === 'Completed' || c.status === 'SUBMITTED').length;
    }
    return count;
  }, [assignments, candidates]);

  // Dynamic candidate groups count
  const candidateGroupsCount = useMemo(() => {
    return Array.isArray(candidateGroups) ? candidateGroups.length : 0;
  }, [candidateGroups]);

  // Statistics data (all fetched & calculated dynamically without hardcoded values)
  const stats = [
    {
      label: 'Total Candidates',
      value: (Array.isArray(candidates) ? candidates.length : 0).toString(),
      change: 'Total candidates',
      icon: Users
    },
    {
      label: 'Active Assessments',
      value: (Array.isArray(savedAssessments) ? validActiveAssessments.length : activeAssessmentsCount).toString(),
      change: 'Active in workspace',
      icon: Briefcase
    },
    {
      label: 'Completed Assessments',
      value: completedAssessmentsCount.toString(),
      change: 'Successfully submitted',
      icon: CheckCircle
    },
    {
      label: 'Candidate Groups',
      value: candidateGroupsCount.toString(),
      change: 'Total unique groups',
      icon: SlidersHorizontal
    },
  ];


  // Handle Search filtering
  const filteredCandidates = (Array.isArray(candidates) ? candidates : []).filter(candidate => {
    const nameVal = (candidate.full_name || candidate.name || '').toLowerCase();
    const emailVal = (candidate.email || '').toLowerCase();
    return nameVal.includes(searchQuery.toLowerCase()) || emailVal.includes(searchQuery.toLowerCase());
  });

  const candidatesPerPage = 5;
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage) || 1;
  const paginatedCandidates = filteredCandidates.slice(
    (candidatePage - 1) * candidatesPerPage,
    candidatePage * candidatesPerPage
  );

  // Action: Create Assessment (legacy submit)
  const _handleCreateAssessmentSubmit = (e) => {
    e.preventDefault();
    if (!newAssessment.title.trim()) return;

    setIsCreateModalOpen(false);
    showToast(`Assessment "${newAssessment.title}" successfully created!`);

    // Reset form
    setNewAssessment({
      title: '',
      role: 'Frontend Engineer',
      duration: '45',
      difficulty: 'Medium'
    });
  };

  const handleGenerateAssessment = async () => {
    if (!isValidForGeneration) {
      showToast("Please fix validation errors before generating assessment.");
      return;
    }

    const topicsList = [...selectedSubjects];
    if (topicsList.length === 0) {
      showToast("Please select at least one topic.");
      return;
    }

    setIsGenerating(true);

    // ==========================================
    // SINGLE TOPIC FLOW (Normal Generation)
    // ==========================================
    if (topicsList.length === 1) {
      const singleTopic = topicsList[0];
      const payload = {
        title: assessmentTitle || `${singleTopic} Technical Assessment`,
        subjects: [singleTopic],
        totalQuestions: 15,
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

      showToast("Generating assessment with AI... Please wait.");
      setGenerationProgress({ active: false, topics: [], currentTopicName: '', statusMessage: '', overallPercent: 0, completedTopicsCount: 0, totalTopicsCount: 0 });

      try {
        const response = await api.post('/api/assessment/generate', payload);

        if (response.data && response.data.questions) {
          const data = response.data;
          const formatted = data.questions.map((q, idx) => ({
            id: idx + 1,
            subject: q.subject || singleTopic,
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
            sampleData: q.sampleData || null
          }));

          setGeneratedQuestions(formatted);
          showToast(`Generated ${formatted.length} questions! Click 'Save Assessment' or 'Save & Assign' to save.`);
          setActiveTab('preview-questions');
        } else {
          throw new Error('Invalid questions format returned from backend');
        }
      } catch (err) {
        console.error("AI assessment generation failed:", err);
        const errMsg = err.response?.data?.detail || err.message || err;
        showToast(`Error: ${errMsg}`);
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // ==========================================
    // MULTI-TOPIC FLOW (Progressive Batching)
    // ==========================================
    setGeneratedQuestions([]); // Reset questions array for progressive stream

    const initialTopics = topicsList.map(t => ({
      name: t,
      status: 'pending',
      count: 0,
      error: null
    }));

    setGenerationProgress({
      active: true,
      topics: initialTopics,
      currentTopicName: topicsList[0],
      statusMessage: `Starting AI Generation for ${topicsList.join(', ')}...`,
      overallPercent: 0,
      completedTopicsCount: 0,
      totalTopicsCount: topicsList.length
    });

    setActiveTab('preview-questions');

    let allQuestions = [];
    let completedCount = 0;

    const totalTargetQs = (topicsList.length === 2 ? 20 : 25);
    const perTopicTarget = Math.max(1, Math.round(totalTargetQs / topicsList.length));

    for (let i = 0; i < topicsList.length; i++) {
      const currentTopic = topicsList[i];

      setGenerationProgress(prev => {
        const updatedTopics = prev.topics.map((t, idx) =>
          idx === i ? { ...t, status: 'generating' } : t
        );
        const percent = Math.round((i / topicsList.length) * 100);
        return {
          ...prev,
          topics: updatedTopics,
          currentTopicName: currentTopic,
          statusMessage: i === 0
            ? `Generating ${currentTopic} Questions...`
            : `${topicsList[i - 1]} Completed. Generating ${currentTopic}...`,
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

      try {
        const response = await api.post('/api/assessment/generate', topicPayload);
        if (response.data && response.data.questions) {
          const topicQs = response.data.questions.map((q) => ({
            subject: q.subject || currentTopic,
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
            sampleData: q.sampleData || null
          }));

          allQuestions = [...allQuestions, ...topicQs];
          const indexedQuestions = allQuestions.map((q, idx) => ({ ...q, id: idx + 1 }));

          setGeneratedQuestions(indexedQuestions);
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
        }
      } catch (err) {
        console.error(`Failed to generate ${currentTopic} questions:`, err);
        const errMsg = err.response?.data?.detail || err.message || 'Generation failed';
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
      statusMessage: "Generation Complete! Click 'Save Assessment' or 'Save & Assign' to save.",
      overallPercent: 100
    }));

    showToast(`All topics generated successfully! Click 'Save Assessment' or 'Save & Assign' to save.`);

    setTimeout(() => {
      setIsGenerating(false);
      setGenerationProgress(prev => ({ ...prev, active: false }));
    }, 1500);
  };

  const handleSaveAssessment = async (andAssign = false) => {
    const subjectsInQuestions = [...new Set(generatedQuestions.map(q => q.subject))].filter(Boolean);
    const activeSubjects = subjectsInQuestions.length > 0 ? subjectsInQuestions : (selectedSubjects.length > 0 ? selectedSubjects : ['General']);
    const name = assessmentTitle || `${activeSubjects.join(' & ')} Technical Assessment`;

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
        setSelectedAssessmentForView(savedAsm);
        showToast('Assessment saved successfully!');
        setActiveAssessmentsCount(prev => prev + 1);

        if (andAssign) {
          setAssigningAssessment(savedAsm);
          setActiveTab('assessments');
        } else {
          setActiveTab('preview-questions');
        }
      }
    } catch (err) {
      console.error("Failed to save assessment to backend:", err);
      showToast(`Error saving assessment: ${err.response?.data?.detail || err.message || err}`);
    }
  };

  const handleConfirmAssign = async (email, dueDate, startTime, skipReset = false) => {
    if (!assigningAssessment) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!startTime) {
      alert('Please set a start time.');
      return;
    }

    try {
      const payload = {
        assessmentId: assigningAssessment.id,
        candidateEmail: email,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        startDate: startTime.split('T')[0],
        startTime: startTime.split('T')[1]
      };

      const response = await api.post('/api/assignments', payload);
      if (response.data) {
        if (!skipReset) {
          showToast("Assessment assigned successfully.");
          // Refresh saved assessments & assignments
          const assessmentsRes = await api.get('/api/assessment');
          if (assessmentsRes.data) {
            setSavedAssessments(deduplicateAssessments(assessmentsRes.data));
          }
          await fetchAssignments();
        }
      }
    } catch (err) {
      console.error("Failed to assign assessment:", err);
      const errMsg = err.response?.data?.detail || "Error assigning assessment. Verify candidate exists.";
      if (!skipReset) {
        showToast(errMsg);
      } else {
        throw new Error(errMsg);
      }
    } finally {
      if (!skipReset) {
        setAssigningAssessment(null);
      }
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
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

      {/* 1. SIDEBAR (Fixed Non-Scrolling Grouped Layout) */}
      <aside className="hidden lg:flex flex-col w-[260px] h-screen max-h-screen shrink-0 bg-dash-sidebar-bg p-5 overflow-hidden relative z-30 text-dash-white-card shadow-[4px_0_24px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col h-full justify-between gap-3 overflow-hidden">
          {/* Scrollable Top Area (Branding + Nav) */}
          <div className="flex flex-col gap-4 min-h-0 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {/* Branding */}
            <div className="flex items-center gap-3 px-2 py-1 shrink-0">
              <img src={logo} alt="RecruitAI Logo" className="w-10 h-10 rounded-2xl object-cover shadow-md shrink-0" />
              <div>
                <h1 className="font-outfit font-bold text-base tracking-tight text-dash-white-card leading-none">RecruitAI</h1>
                <span className="text-[10px] text-dash-light-purple font-medium tracking-widest uppercase">Recruiter Portal</span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-4">
              {/* Primary Pages */}
              <div className="space-y-1">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
                  { id: 'create-assessment', label: 'Create Assessment', icon: Plus },
                  { id: 'preview-questions', label: 'Preview Questions', icon: Eye },
                  { id: 'assessments', label: 'Active Assessments', icon: Save },
                  { id: 'groups', label: 'Candidate Groups', icon: Users }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border-none text-left ${isActive
                        ? 'sidebar-active-tab shadow-sm text-dash-white-card'
                        : 'text-dash-light-purple hover:text-dash-white-card hover:bg-dash-primary-purple/20'
                        }`}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Grouped Section: Assessment (Collapsible Dropdown) */}
              <div className="pt-2 border-t border-dash-border-gray/20">
                <button
                  type="button"
                  onClick={() => setIsAssessmentOpen(prev => !prev)}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider text-dash-primary-purple hover:bg-dash-primary-purple/10 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    <Award size={14} className="shrink-0" />
                    <span>Assessment</span>
                  </div>
                  {isAssessmentOpen ? (
                    <ChevronDown size={14} className="shrink-0 text-dash-primary-purple transition-transform duration-200" />
                  ) : (
                    <ChevronRight size={14} className="shrink-0 text-dash-primary-purple transition-transform duration-200" />
                  )}
                </button>

                <AnimatePresence>
                  {isAssessmentOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1 mt-1 pl-2 overflow-hidden"
                    >
                      {[
                        { id: 'results', label: 'Technical Assessment Results', icon: Award },
                        { id: 'english-results', label: 'English Assessment Results', icon: Volume2 },
                        { id: 'overall-results', label: 'Overall Results', icon: BarChart2 }
                      ].map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 cursor-pointer border-none text-left ${isActive
                              ? 'bg-dash-primary-purple text-dash-white-card shadow-sm font-extrabold'
                              : 'text-dash-light-purple hover:text-dash-white-card hover:bg-dash-primary-purple/20'
                              }`}
                          >
                            <Icon size={14} className="shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>
          </div>

          {/* Pinned Bottom Container (Large Prominent Animation + Profile + Logout) */}
          <div className="shrink-0 flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-center py-0.5">
              <div className="w-40 h-40 flex items-center justify-center overflow-hidden">
                <DotLottieReact
                  src="https://lottie.host/5521a48e-619e-490f-a9b2-f4fb0386526e/5IWtyksCcc.lottie"
                  loop
                  autoplay
                  style={{ width: '100%', height: '100%', transform: 'scale(1.25)', transformOrigin: 'center center' }}
                />
              </div>
            </div>

            {/* User Profile & Logout Section */}
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-dash-primary-purple flex items-center justify-center font-semibold text-xs text-dash-white-card shrink-0">
                  RA
                </div>
                <div className="overflow-hidden min-w-0">
                  <h4 className="text-xs font-semibold text-dash-white-card truncate">Recruiter Admin</h4>
                  <span className="text-[10px] text-dash-light-purple truncate block">recruiter@recruitai.com</span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-all duration-200 cursor-pointer border border-rose-500/20 bg-rose-500/10"
              >
                <LogOut size={15} className="shrink-0 text-rose-400" />
                <span className="font-bold text-rose-300 hover:text-white">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Backdrop */}
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

      {/* Mobile Sidebar Content */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
            className="fixed top-0 bottom-0 left-0 w-[270px] p-6 z-50 lg:hidden flex flex-col bg-dash-sidebar-bg text-dash-white-card border-r border-dash-border-gray/25 overflow-hidden"
          >
            <div className="flex flex-col h-full justify-between gap-4">
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <img src={logo} alt="RecruitAI Logo" className="w-9 h-9 rounded-xl object-cover shadow-sm shrink-0" />
                    <h1 className="font-outfit font-bold text-base text-dash-white-card">RecruitAI</h1>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-lg hover:bg-dash-primary-purple/20 text-dash-light-purple hover:text-dash-white-card border-none bg-transparent cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="space-y-4">
                  <div className="space-y-1">
                    {[
                      { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
                      { id: 'create-assessment', label: 'Create Assessment', icon: Plus },
                      { id: 'preview-questions', label: 'Preview Questions', icon: Eye },
                      { id: 'assessments', label: 'Active Assessments', icon: Save },
                      { id: 'groups', label: 'Candidate Groups', icon: Users }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border-none text-left ${isActive
                            ? 'sidebar-active-tab shadow-sm text-dash-white-card'
                            : 'text-dash-light-purple hover:text-dash-white-card hover:bg-dash-primary-purple/20'
                            }`}
                        >
                          <Icon size={16} className="shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Mobile Grouped Section: Assessment (Collapsible Dropdown) */}
                  <div className="pt-2 border-t border-dash-border-gray/20">
                    <button
                      type="button"
                      onClick={() => setIsAssessmentOpen(prev => !prev)}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider text-dash-primary-purple hover:bg-dash-primary-purple/10 transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <div className="flex items-center gap-2">
                        <Award size={14} className="shrink-0" />
                        <span>Assessment</span>
                      </div>
                      {isAssessmentOpen ? (
                        <ChevronDown size={14} className="shrink-0 text-dash-primary-purple transition-transform duration-200" />
                      ) : (
                        <ChevronRight size={14} className="shrink-0 text-dash-primary-purple transition-transform duration-200" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isAssessmentOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-1 mt-1 pl-2 overflow-hidden"
                        >
                          {[
                            { id: 'results', label: 'Technical Assessment Results', icon: Award },
                            { id: 'english-results', label: 'English Assessment Results', icon: Volume2 },
                            { id: 'overall-results', label: 'Overall Results', icon: BarChart2 }
                          ].map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setActiveTab(item.id);
                                  setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 cursor-pointer border-none text-left ${isActive
                                  ? 'bg-dash-primary-purple text-dash-white-card shadow-sm font-extrabold'
                                  : 'text-dash-light-purple hover:text-dash-white-card hover:bg-dash-primary-purple/20'
                                  }`}
                              >
                                <Icon size={14} className="shrink-0" />
                                <span className="truncate">{item.label}</span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </nav>
              </div>

              {/* Mobile Lottie Animation (Large Prominent) */}
              <div className="shrink-0 flex flex-col gap-1.5 pt-1">
                <div className="flex items-center justify-center py-0.5">
                  <div className="w-40 h-40 flex items-center justify-center overflow-hidden">
                    <DotLottieReact
                      src="https://lottie.host/5521a48e-619e-490f-a9b2-f4fb0386526e/5IWtyksCcc.lottie"
                      loop
                      autoplay
                      style={{ width: '100%', height: '100%', transform: 'scale(1.25)', transformOrigin: 'center center' }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-dash-primary-purple flex items-center justify-center font-semibold text-xs text-dash-white-card shrink-0">
                      RA
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <h4 className="text-xs font-semibold text-dash-white-card truncate">Recruiter Admin</h4>
                      <span className="text-[10px] text-dash-light-purple truncate block">recruiter@recruitai.com</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-all duration-200 cursor-pointer border border-rose-500/20 bg-rose-500/10"
                  >
                    <LogOut size={15} className="shrink-0 text-rose-400" />
                    <span className="font-bold text-rose-300 hover:text-white">Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 relative z-20 overflow-y-auto h-screen max-h-screen">
        {/* Mobile Navigation Toggle for Non-Dashboard Tabs */}
        {activeTab !== 'dashboard' && (
          <div className="lg:hidden flex items-center mb-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 rounded-xl bg-dash-white-card border border-dash-border-gray text-dash-primary-purple hover:bg-dash-soft-pink transition-all duration-200"
              aria-label="Open Mobile Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <>
            {/* WELCOME HEADER BANNER */}
            <header className="bg-dash-white-card border border-dash-border-gray/60 rounded-[24px] p-5 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-[0_4px_20px_rgba(87,82,170,0.03)] relative overflow-hidden mb-6">
              {/* Subtle background decoration glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-dash-primary-purple/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

              <div className="flex items-center gap-4 relative z-10">
                {/* Mobile Navigation Toggle */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2.5 rounded-xl bg-dash-white-card border border-dash-border-gray text-dash-primary-purple hover:bg-dash-soft-pink transition-all duration-200 shrink-0"
                  aria-label="Open Mobile Menu"
                >
                  <Menu size={20} />
                </button>

                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-plus-jakarta font-extrabold tracking-tight text-dash-dark-purple">
                      Welcome to the Recruiter Dashboard 👋
                    </h1>
                    <span className="px-3 py-0.5 rounded-full bg-dash-primary-purple/10 border border-dash-primary-purple/20 text-dash-primary-purple font-outfit text-xs font-bold">
                      v1.2
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-dash-light-purple font-semibold mt-1 max-w-2xl leading-relaxed">
                    Manage assessments, monitor candidate progress, and review recruitment insights from one place.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('create-assessment')}
                className="px-4 py-2.5 rounded-xl bg-dash-primary-purple text-white font-bold text-xs hover:bg-dash-dark-purple transition-all duration-200 shadow-sm flex items-center gap-2 cursor-pointer border-none shrink-0 z-10"
              >
                <Plus size={16} />
                <span>Create Assessment</span>
              </button>
            </header>
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
                    className="bg-dash-white-card border border-dash-border-gray hover:bg-dash-soft-pink rounded-2xl p-5 relative overflow-hidden group transition-all duration-300 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-dash-light-purple tracking-wider uppercase">{stat.label}</span>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-dash-primary-purple/10 border-dash-primary-purple/20 text-dash-primary-purple">
                        <Icon size={18} />
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-outfit font-extrabold text-dash-dark-purple tracking-tight leading-none">
                        {stat.value}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-dash-success-green bg-dash-success-green/10 border border-dash-success-green/20 px-2 py-0.5 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </section>

            {/* 4. CANDIDATE ASSESSMENT MANAGEMENT SECTION */}
            <section className="bg-dash-white-card border border-dash-border-gray rounded-[20px] shadow-sm flex flex-col overflow-hidden">

              {/* SEARCH & FILTERS BAR */}
              <div className="p-5 border-b border-dash-border-gray bg-dash-white-card flex flex-col md:flex-row gap-4 items-center justify-between z-20">

                {/* Search Input Box */}
                <div className="relative w-full md:max-w-xs group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-light-purple transition-colors duration-300 group-focus-within:text-dash-primary-purple" size={16} />
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-dash-white-card border border-dash-border-gray rounded-lg py-2.5 pl-9 pr-4 text-xs font-semibold text-dash-dark-purple placeholder-dash-light-purple/60 transition-all duration-300 focus:outline-none focus:border-dash-primary-purple focus:ring-2 focus:ring-dash-primary-purple/10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dash-light-purple hover:text-dash-dark-purple transition-colors duration-200 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Action Buttons for Candidate Management */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setNewCandidateName('');
                      setNewCandidateEmail('');
                      setNewCandidatePassword('Candidate@123');
                      setNewCandidatePhone('');
                      setShowCreateCandidateModal(true);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-dash-primary-purple text-white text-xs font-bold flex items-center gap-2 hover:bg-dash-dark-purple transition-all duration-200 cursor-pointer shadow-md border-none"
                  >
                    <UserPlus size={13} />
                    <span>Create Candidate</span>
                  </button>
                  {selectedCandidateIds.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setGroupName('');
                          setShowCreateGroupModal(true);
                        }}
                        className="px-3.5 py-2 rounded-lg bg-dash-primary-purple text-white text-xs font-bold flex items-center gap-2 hover:bg-dash-dark-purple transition-all duration-200 cursor-pointer shadow-md border-none"
                      >
                        <Users size={13} />
                        <span>Create Group ({selectedCandidateIds.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkDeleteCandidates}
                        className="px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-rose-700 transition-all duration-200 cursor-pointer shadow-md border-none"
                      >
                        <Trash2 size={13} />
                        <span>Delete Selected ({selectedCandidateIds.length})</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* CANDIDATE LIST DATA TABLE */}
              <div className="overflow-x-auto dashboard-scrollbar">
                <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-dash-soft-pink border-b border-dash-border-gray text-[10px] font-extrabold text-dash-dark-purple tracking-widest uppercase">
                      <th className="px-4 py-4.5 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={
                            paginatedCandidates.length > 0 &&
                            paginatedCandidates.every((c) => selectedCandidateIds.includes(c.id))
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              const newSelects = [...selectedCandidateIds];
                              paginatedCandidates.forEach((c) => {
                                if (!newSelects.includes(c.id)) newSelects.push(c.id);
                              });
                              setSelectedCandidateIds(newSelects);
                            } else {
                              const pageIds = paginatedCandidates.map((c) => c.id);
                              setSelectedCandidateIds((prev) =>
                                prev.filter((id) => !pageIds.includes(id))
                              );
                            }
                          }}
                          className="rounded text-dash-primary-purple focus:ring-dash-primary-purple cursor-pointer"
                        />
                      </th>
                      <th className="px-5 py-4.5">Candidate Name</th>
                      <th className="px-5 py-4.5">Email</th>
                      <th className="px-5 py-4.5">Assessment Name</th>
                      <th className="px-5 py-4.5">Assigned Date</th>
                      <th className="px-5 py-4.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dash-border-gray">
                    <AnimatePresence mode="popLayout">
                      {paginatedCandidates.map((candidate) => {
                        // Find candidate's assignment
                        const candAssignment = Array.isArray(assignments)
                          ? assignments.find((a) =>
                            a.candidate_id === candidate.id ||
                            a.candidateId === candidate.id ||
                            a.candidate?.id === candidate.id ||
                            (a.candidateEmail && candidate.email && a.candidateEmail.toLowerCase() === candidate.email.toLowerCase()) ||
                            (a.candidate?.email && candidate.email && a.candidate.email.toLowerCase() === candidate.email.toLowerCase())
                          )
                          : null;

                        // Assessment Name
                        const assessmentName =
                          candAssignment?.assessment?.name ||
                          candAssignment?.assessmentName ||
                          candidate.assessment_name ||
                          candidate.role ||
                          'Not Assigned';

                        // Assigned Date
                        const rawAssignedDate =
                          candAssignment?.assigned_at ||
                          candAssignment?.assignedAt ||
                          candidate.created_at ||
                          candidate.date;
                        const assignedDateDisplay = rawAssignedDate
                          ? new Date(rawAssignedDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                          : 'N/A';

                        return (
                          <motion.tr
                            key={candidate.id}
                            layout
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className={`hover:bg-dash-soft-pink transition-colors duration-200 group ${selectedCandidateIds.includes(candidate.id) ? 'bg-dash-soft-pink/60' : 'bg-dash-white-card'}`}
                          >
                            {/* Checkbox column */}
                            <td className="px-4 py-4 w-12 text-center">
                              <input
                                type="checkbox"
                                checked={selectedCandidateIds.includes(candidate.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCandidateIds((prev) => [...prev, candidate.id]);
                                  } else {
                                    setSelectedCandidateIds((prev) =>
                                      prev.filter((id) => id !== candidate.id)
                                    );
                                  }
                                }}
                                className="rounded text-dash-primary-purple focus:ring-dash-primary-purple cursor-pointer"
                              />
                            </td>

                            {/* Candidate Name */}
                            <td className="px-5 py-4">
                              <h4 className="text-xs font-bold text-dash-dark-purple group-hover:text-dash-primary-purple transition-colors duration-200">
                                {candidate.full_name || candidate.name}
                              </h4>
                            </td>

                            {/* Email */}
                            <td className="px-5 py-4 text-xs font-semibold text-dash-dark-purple">
                              {candidate.email}
                            </td>

                            {/* Assessment Name */}
                            <td className="px-5 py-4 text-xs font-semibold text-dash-dark-purple">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dash-light-blue-bg/60 border border-dash-border-gray text-dash-primary-purple font-bold">
                                {assessmentName}
                              </span>
                            </td>

                            {/* Assigned Date */}
                            <td className="px-5 py-4 text-xs font-semibold text-dash-light-purple">
                              {assignedDateDisplay}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleDeleteCandidate(candidate.id, candidate.full_name || candidate.name)}
                                  className="p-1.5 rounded-lg text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center"
                                  title="Delete Candidate"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>

                    {filteredCandidates.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-dash-light-purple">
                          <AlertCircle className="mx-auto mb-3 text-dash-light-purple" size={32} />
                          No candidates found matching filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TABLE FOOTER */}
              <div className="p-4 border-t border-dash-border-gray bg-dash-white-card flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-dash-light-purple font-semibold px-6">
                <span>
                  Showing {filteredCandidates.length > 0 ? (candidatePage - 1) * candidatesPerPage + 1 : 0} to{' '}
                  {Math.min(filteredCandidates.length, candidatePage * candidatesPerPage)} of{' '}
                  {filteredCandidates.length} candidates
                  {filteredCandidates.length !== (Array.isArray(candidates) ? candidates.length : 0) && ` (filtered from ${(Array.isArray(candidates) ? candidates.length : 0)})`}
                </span>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={candidatePage === 1}
                      onClick={() => setCandidatePage(prev => Math.max(prev - 1, 1))}
                      className="px-2.5 py-1.5 rounded-lg border border-dash-border-gray bg-dash-white-card hover:bg-dash-soft-pink text-dash-dark-purple disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCandidatePage(page)}
                        className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center font-bold text-xs border transition-colors cursor-pointer ${candidatePage === page
                            ? 'bg-dash-primary-purple border-dash-primary-purple text-dash-white-card'
                            : 'bg-dash-white-card border-dash-border-gray text-dash-dark-purple hover:bg-dash-soft-pink'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      disabled={candidatePage === totalPages}
                      onClick={() => setCandidatePage(prev => Math.min(prev + 1, totalPages))}
                      className="px-2.5 py-1.5 rounded-lg border border-dash-border-gray bg-dash-white-card hover:bg-dash-soft-pink text-dash-dark-purple disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}

                <span>Total {savedAssessments.length} assessments listed in workspace</span>
              </div>

            </section>
          </>
        )}

        {/* 6. INTERACTIVE CREATE ASSESSMENT SCREEN */}
        {activeTab === 'create-assessment' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
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
        )}

        {/* 7. PREVIEW QUESTIONS SCREEN */}
        {activeTab === 'preview-questions' && (
          <QuestionPreviewHub
            generatedQuestions={generatedQuestions}
            setGeneratedQuestions={setGeneratedQuestions}
            generationProgress={generationProgress}
            showToast={showToast}
            onSave={() => handleSaveAssessment(false)}
            onSaveAndAssign={() => handleSaveAssessment(true)}
          />
        )}

        {/* 8. ASSESSMENTS ACTIVE SCREEN */}
        {activeTab === 'assessments' && (
          <AssessmentsManager
            savedAssessments={savedAssessments}
            setSavedAssessments={setSavedAssessments}
            setGeneratedQuestions={setGeneratedQuestions}
            assignments={assignments}
            fetchAssignments={fetchAssignments}
            showToast={showToast}
            setActiveTab={setActiveTab}
            setSelectedAssessmentForView={setSelectedAssessmentForView}
            onAssignClick={setAssigningAssessment}
          />
        )}

        {/* EXPIRED ASSESSMENTS SCREEN */}
        {activeTab === 'expired-assessments' && (
          <ExpiredAssessmentsManager
            assignments={assignments}
            fetchAssignments={fetchAssignments}
            showToast={showToast}
            savedAssessments={savedAssessments}
            onAssignClick={setAssigningAssessment}
          />
        )}

        {/* 9. RESULTS TAB SCREEN */}
        {activeTab === 'results' && (
          <ResultsManager
            showToast={showToast}
            candidateGroups={candidateGroups}
            candidates={candidates}
          />
        )}

        {/* 10. CANDIDATE GROUPS TAB SCREEN */}
        {activeTab === 'groups' && (
          <GroupsManager
            candidateGroups={candidateGroups}
            setCandidateGroups={setCandidateGroups}
            candidates={candidates}
            showToast={showToast}
            setAssigningGroup={setAssigningGroup}
            setActiveTab={setActiveTab}
          />
        )}

        {/* 11. ENGLISH ASSESSMENT RESULTS TAB SCREEN */}
        {activeTab === 'english-results' && (
          <EnglishResultsManager
            showToast={showToast}
            handleOpenEnglishReport={handleOpenEnglishReport}
          />
        )}

        {/* 12. OVERALL RESULTS COMPARISON SCREEN */}
        {activeTab === 'overall-results' && (
          <OverallResultsManager
            showToast={showToast}
          />
        )}
      </main>

      {/* 5. DRAWER (Mock candidate detailed report - Light themed) */}
      <AnimatePresence>
        {selectedCandidate && (
          <>
            {/* Dark Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCandidate(null)}
              className="fixed inset-0 bg-dash-dark-purple/40 z-40"
            />

            {/* Slide-out Panel Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed top-0 bottom-0 right-0 w-full sm:w-[460px] bg-dash-white-card border-l border-dash-border-gray shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between pb-4 border-b border-dash-border-gray mb-6">
                  <div>
                    <span className="text-[10px] text-dash-primary-purple font-extrabold tracking-widest uppercase">Evaluation Details</span>
                    <h3 className="text-base font-bold text-dash-dark-purple font-outfit mt-1">{selectedCandidate.name}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="p-1.5 rounded-lg hover:bg-dash-soft-pink text-dash-light-purple hover:text-dash-dark-purple transition-all duration-200 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Candidate Info profile card */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray rounded-xl p-3.5">
                      <span className="text-[10px] text-dash-light-purple font-bold uppercase tracking-wider block mb-1">Applied Role</span>
                      <span className="text-xs font-semibold text-dash-dark-purple">{selectedCandidate.role}</span>
                    </div>
                    <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray rounded-xl p-3.5">
                      <span className="text-[10px] text-dash-light-purple font-bold uppercase tracking-wider block mb-1">Email Address</span>
                      <span className="text-xs font-semibold text-dash-dark-purple truncate block">{selectedCandidate.email}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray rounded-xl p-3.5">
                      <span className="text-[10px] text-dash-light-purple font-bold uppercase tracking-wider block mb-1">Date Applied</span>
                      <span className="text-xs font-semibold text-dash-dark-purple">{selectedCandidate.date}</span>
                    </div>
                    <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray rounded-xl p-3.5">
                      <span className="text-[10px] text-dash-light-purple font-bold uppercase tracking-wider block mb-1">Score Result</span>
                      <span className="text-xs font-semibold text-dash-dark-purple flex items-center gap-1.5 mt-0.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: selectedCandidate.status === 'Completed' ? '#149470' : '#5752AA'
                          }}
                        />
                        {selectedCandidate.final !== undefined ? `${selectedCandidate.final}%` : '--'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Evaluation detailed breakdown values */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-dash-dark-purple tracking-wider uppercase mb-3">Skill breakdown</h4>
                  {selectedCandidate.final !== undefined ? (
                    <div className="space-y-4">
                      {[
                        { name: 'Resume Match', value: selectedCandidate.resume },
                        { name: 'Python Score', value: selectedCandidate.python },
                        { name: 'SQL Score', value: selectedCandidate.sql },
                        { name: 'Aptitude Score', value: selectedCandidate.aptitude },
                        { name: 'English Score', value: selectedCandidate.english, isEnglish: true },
                        { name: 'Final Score', value: selectedCandidate.final }
                      ].map((skill) => (
                        <div key={skill.name}>
                          <div className="flex justify-between text-xs font-medium mb-1.5 items-center">
                            <span className="text-dash-light-purple flex items-center gap-1.5">
                              <span>{skill.name}</span>
                              {skill.isEnglish && skill.value !== undefined && skill.value !== null && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEnglishReport(selectedCandidate.id)}
                                  className="text-[10px] text-dash-primary-purple font-extrabold hover:underline cursor-pointer bg-transparent border-0 p-0"
                                >
                                  (View Report)
                                </button>
                              )}
                            </span>
                            <span className="text-dash-dark-purple font-bold">{skill.value !== undefined && skill.value !== null ? `${skill.value}%` : '--'}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-dash-soft-pink overflow-hidden">
                            <div
                              className="h-full bg-dash-primary-purple rounded-full"
                              style={{ width: `${skill.value || 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 text-center bg-dash-light-blue-bg/30 border border-dash-border-gray rounded-xl">
                      <Clock className="text-dash-accent-brown mx-auto mb-2 animate-pulse" size={24} />
                      <span className="text-xs text-dash-light-purple font-medium leading-relaxed block">
                        Evaluation in progress. Detailed metric score breakdown will be available once submitted by candidate.
                      </span>
                    </div>
                  )}
                </div>

                {/* AI Recommendation Feedback */}
                {selectedCandidate.final !== undefined && (
                  <div className="bg-dash-soft-pink border border-dash-border-gray rounded-xl p-4">
                    <h5 className="text-[10px] text-dash-primary-purple font-bold uppercase tracking-wider mb-1">AI Recommendation Feedback</h5>
                    <p className="text-xs text-dash-dark-purple leading-relaxed">
                      {selectedCandidate.recommendation === 'Strong Hire'
                        ? "Exceptional candidate. Outperformed in logic reasoning, Python, SQL, Aptitude and English sections. Strongly suggest scheduling panel interviews immediately."
                        : selectedCandidate.recommendation === 'Moderate'
                          ? "Moderate performance. Demonstrated average capacity across evaluation sections. Recommend moving to follow-up technical review round."
                          : "Candidate did not meet standard benchmark requirements. Performance in several sections remains below baseline."}
                    </p>
                  </div>
                )}

              </div>

              {/* Drawer footer buttons */}
              <div className="pt-5 border-t border-dash-border-gray flex gap-3 mt-8">
                <button
                  onClick={() => showToast(`Report for ${selectedCandidate.name} downloaded successfully!`)}
                  disabled={selectedCandidate.final === undefined}
                  className="flex-1 py-3 rounded-2xl border border-dash-border-gray hover:bg-dash-soft-pink text-dash-primary-purple font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Report</span>
                </button>
                <button
                  onClick={() => {
                    showToast(`Interview invite sent to ${selectedCandidate.name}!`);
                    setSelectedCandidate(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-dash-primary-purple text-dash-white-card font-bold text-xs transition-all duration-200 hover:bg-dash-dark-purple shadow-[0_4px_12px_rgba(87,82,170,0.2)] flex items-center justify-center gap-1 cursor-pointer border-none"
                >
                  <span>Request Interview</span>
                  <ChevronRight size={14} />
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal for English Speaking Assessment Report */}
      <AnimatePresence>
        {showEnglishReportModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEnglishReportModal(false)}
              className="fixed inset-0 bg-dash-dark-purple/40 z-[9999]"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 sm:inset-10 m-auto w-full max-w-4xl h-fit max-h-[85vh] bg-dash-white-card border border-dash-border-gray rounded-[28px] shadow-2xl z-[10000] p-6 sm:p-8 flex flex-col justify-between overflow-y-auto select-text"
            >
              {loadingEnglishReport ? (
                <div className="p-6 space-y-4 animate-pulse w-full">
                  <div className="h-10 bg-slate-100/80 rounded-xl w-3/4" />
                  <div className="h-24 bg-slate-50 rounded-2xl w-full" />
                  <div className="h-24 bg-slate-50 rounded-2xl w-full" />
                </div>
              ) : englishReport ? (() => {
                const rep = englishReport.report || {};
                const conversations = englishReport.conversations || [];
                const formatTimeVal = (sec) => {
                  if (!sec) return '0s';
                  const m = Math.floor(sec / 60);
                  const s = sec % 60;
                  return `${m}m ${s}s`;
                };

                const rawSummary = rep.summary || '';
                let cleanSummary = rawSummary;
                let cefr = rep.recommended_english_level || null;
                let ss = rep.sentence_structure_score || null;
                let tc = rep.technical_communication_score || null;
                let lu = rep.listening_understanding_score || null;
                let rr = rep.response_relevance_score || null;

                const cefrMatch = rawSummary.match(/\[CEFR:\s*([^\]]+)\]/i);
                const ssMatch = rawSummary.match(/\[Sentence Structure:\s*(\d+)\]/i);
                const tcMatch = rawSummary.match(/\[Technical Communication:\s*(\d+)\]/i);
                const luMatch = rawSummary.match(/\[Listening & Understanding:\s*(\d+)\]/i);
                const rrMatch = rawSummary.match(/\[Response Relevance:\s*(\d+)\]/i);

                if (cefrMatch) cefr = cefrMatch[1];
                if (ssMatch) ss = parseInt(ssMatch[1], 10);
                if (tcMatch) tc = parseInt(tcMatch[1], 10);
                if (luMatch) lu = parseInt(luMatch[1], 10);
                if (rrMatch) rr = parseInt(rrMatch[1], 10);

                cleanSummary = rawSummary.replace(/\[(CEFR|Sentence Structure|Technical Communication|Listening & Understanding|Response Relevance):\s*[^\]]+\]\s*/gi, '').trim();

                return (
                  <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-4">
                      <div>
                        <span className="text-[10px] text-dash-primary-purple font-extrabold tracking-widest uppercase">Linguistic & Communication Profile</span>
                        <h3 className="text-lg font-bold text-dash-dark-purple font-outfit mt-0.5">
                          {selectedCandidate?.name || 'Candidate'} - English Assessment
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowEnglishReportModal(false)}
                        className="p-1.5 rounded-lg hover:bg-dash-soft-pink text-dash-light-purple hover:text-dash-dark-purple transition-all duration-200 cursor-pointer border-none bg-transparent"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Stats & Overview Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">

                      {/* Overall Level Card */}
                      <div className="md:col-span-1 bg-dash-soft-pink border border-dash-border-gray/40 rounded-2xl p-5 flex flex-col justify-center items-center text-center">
                        <span className="text-[9px] font-extrabold text-dash-light-purple uppercase tracking-wider mb-1">Overall English Level</span>
                        <span className="font-plus-jakarta font-extrabold text-xl text-dash-primary-purple leading-tight">{rep.overall_level}</span>
                        {cefr && (
                          <span className="text-[11px] font-extrabold text-dash-primary-purple mt-2 bg-dash-primary-purple/10 px-2.5 py-0.5 rounded-full border border-dash-primary-purple/20">
                            CEFR: {cefr}
                          </span>
                        )}
                        <span className="text-[9px] font-extrabold text-dash-success-green bg-dash-success-green/10 border border-dash-success-green/20 px-3 py-1 rounded-full uppercase mt-3.5 tracking-wider">
                          {rep.recommendation || 'Recommended'}
                        </span>
                      </div>

                      {/* Summary Text Box */}
                      <div className="md:col-span-3 bg-slate-50 border border-slate-200/50 rounded-2xl p-5 flex flex-col gap-2.5">
                        <div className="grid grid-cols-2 gap-4 text-[10px] border-b border-slate-200/50 pb-2 text-slate-500 font-bold uppercase tracking-wider">
                          <div>
                            <span>Interview Date:</span>
                            <span className="text-slate-800 font-extrabold ml-1.5">{englishReport.start_time ? new Date(englishReport.start_time).toLocaleDateString() : '--'}</span>
                          </div>
                          <div>
                            <span>Duration:</span>
                            <span className="text-slate-800 font-extrabold ml-1.5">{formatTimeVal(englishReport.duration)}</span>
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-slate-700 leading-relaxed mt-1">
                          <span className="block font-bold text-dash-primary-purple uppercase tracking-wider text-[9px] mb-1">AI HR Review summary:</span>
                          <p>{cleanSummary}</p>
                        </div>
                      </div>

                    </div>

                    {/* Scores & Observation Bullets Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch border-t border-dash-border-gray/25 pt-5">

                      {/* Scores Breakdown */}
                      <div className="flex flex-col gap-4">
                        <h4 className="text-xs font-bold text-dash-dark-purple tracking-wider uppercase border-b border-dash-border-gray/10 pb-1.5">Linguistic Competence</h4>
                        <div className="space-y-3.5">
                          {[
                            { name: 'Communication', val: rep.communication_score },
                            { name: 'Grammar Accuracy', val: rep.grammar_score },
                            { name: 'Vocabulary range', val: rep.vocabulary_score },
                            { name: 'Sentence Structure', val: ss },
                            { name: 'Oral Fluency', val: rep.fluency_score },
                            { name: 'Listening & Understanding', val: lu },
                            { name: 'Response Relevance', val: rr },
                            { name: 'Technical Communication', val: tc },
                            { name: 'Confidence Estimation', val: rep.confidence_score },
                            { name: 'Professional Etiquette', val: rep.professionalism_score },
                            { name: 'Pronunciation (Speech)', val: rep.pronunciation_score }
                          ].map((item, idx) => {
                            if (item.val === undefined || item.val === null) return null;
                            return (
                              <div key={idx} className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs font-semibold">
                                  <span className="text-dash-light-purple">{item.name}</span>
                                  <span className="text-dash-dark-purple font-extrabold">{item.val}/100</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                  <div className="h-full bg-dash-primary-purple rounded-full" style={{ width: `${item.val}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Observations Bullets */}
                      <div className="flex flex-col gap-4 justify-between">
                        <div className="flex flex-col gap-2.5">
                          <span className="text-[10px] font-extrabold text-[#22c55e] uppercase tracking-wider font-semibold">Observed Strengths</span>
                          <div className="flex flex-col gap-2">
                            {(rep.strengths || []).map((s, idx) => (
                              <div key={idx} className="flex items-start gap-2 p-2 bg-[#22c55e]/5 border border-[#22c55e]/10 rounded-xl text-xs font-medium text-slate-700 leading-normal">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] mt-1.5 shrink-0" />
                                <span>{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2.5 border-t border-dash-border-gray/25 pt-4">
                          <span className="text-[10px] font-extrabold text-[#ef4444] uppercase tracking-wider font-semibold">Specific Mistakes / Weaknesses</span>
                          <div className="flex flex-col gap-2">
                            {(rep.weaknesses || []).map((s, idx) => (
                              <div key={idx} className="flex items-start gap-2 p-2 bg-[#ef4444]/5 border border-[#ef4444]/10 rounded-xl text-xs font-medium text-slate-700 leading-normal">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] mt-1.5 shrink-0" />
                                <span>{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2.5 border-t border-dash-border-gray/25 pt-4">
                          <span className="text-[10px] font-extrabold text-dash-primary-purple uppercase tracking-wider font-semibold">Areas for Improvement</span>
                          <div className="flex flex-col gap-2">
                            {(rep.areas_for_improvement || []).map((s, idx) => (
                              <div key={idx} className="flex items-start gap-2 p-2 bg-dash-primary-purple/5 border border-dash-primary-purple/10 rounded-xl text-xs font-medium text-slate-700 leading-normal">
                                <span className="w-1.5 h-1.5 rounded-full bg-dash-primary-purple mt-1.5 shrink-0" />
                                <span>{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Dialog Transcripts Details */}
                    <div className="flex flex-col gap-4 border-t border-dash-border-gray/25 pt-5">
                      <h4 className="text-xs font-bold text-dash-dark-purple tracking-wider uppercase border-b border-dash-border-gray/10 pb-1.5">
                        AI HR Interview Chat Log ({conversations.length} turns)
                      </h4>
                      <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                        {conversations.map((msg, idx) => (
                          <div key={idx} className="border border-slate-100 rounded-xl bg-slate-50/50 p-4 space-y-3.5 text-xs font-semibold">
                            <div className="flex items-start gap-2 text-slate-800 leading-relaxed">
                              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[9px] shrink-0 mt-0.5">AI HR</span>
                              <p className="flex-1">{msg.ai_question}</p>
                            </div>
                            {msg.candidate_answer && (
                              <div className="flex items-start gap-2 text-dash-dark-purple leading-relaxed pl-4 border-l-2 border-dash-primary-purple/40">
                                <span className="px-2 py-0.5 rounded bg-dash-primary-purple/15 text-dash-primary-purple font-bold uppercase tracking-wider text-[9px] shrink-0 mt-0.5">Candidate</span>
                                <p className="flex-1">{msg.candidate_answer}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })() : (
                <div className="text-center py-10 text-xs text-dash-light-purple font-semibold">
                  English Assessment details not available or error occurred.
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Drawer for Saved Assessment Details */}
      <AnimatePresence>
        {selectedAssessmentForView && (
          <AssessmentDetailsDrawer
            assessment={selectedAssessmentForView}
            onClose={() => setSelectedAssessmentForView(null)}
            showToast={showToast}
          />
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
              className="fixed inset-0 bg-dash-dark-purple/40 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-md h-fit bg-dash-white-card border border-dash-border-gray rounded-[24px] shadow-2xl z-50 p-6 flex flex-col gap-5"
            >
              <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-3">
                <div>
                  <span className="text-[10px] text-dash-primary-purple font-extrabold tracking-widest uppercase">
                    Candidate Account Provisioning
                  </span>
                  <h3 className="text-base font-bold text-dash-dark-purple font-outfit mt-0.5">
                    Create Candidate Account
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateCandidateModal(false)}
                  className="p-1.5 rounded-lg hover:bg-dash-soft-pink text-dash-light-purple hover:text-dash-dark-purple transition-all duration-200 cursor-pointer border-none bg-transparent"
                >
                  <X size={18} />
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

                    showToast(`Candidate account for "${newCandidateName.trim()}" created successfully!`);
                    fetchCandidates();
                    setShowCreateCandidateModal(false);
                  } catch (err) {
                    console.error("Failed to create candidate:", err);
                    const detail = err.response?.data?.detail || err.message || "Failed to create candidate account.";
                    alert(`Error: ${detail}`);
                  } finally {
                    setIsCreatingCandidate(false);
                  }
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newCandidateName}
                    onChange={(e) => setNewCandidateName(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-dash-border-gray rounded-xl py-2.5 px-4 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. candidate@example.com"
                    value={newCandidateEmail}
                    onChange={(e) => setNewCandidateEmail(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-dash-border-gray rounded-xl py-2.5 px-4 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider">
                      Initial Login Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomPass = 'Pass@' + Math.floor(100000 + Math.random() * 900000);
                        setNewCandidatePassword(randomPass);
                      }}
                      className="text-[10px] font-bold text-dash-primary-purple hover:underline bg-transparent border-none cursor-pointer"
                    >
                      Auto-generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Minimum 6 characters"
                    value={newCandidatePassword}
                    onChange={(e) => setNewCandidatePassword(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-dash-border-gray rounded-xl py-2.5 px-4 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple transition-all font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={newCandidatePhone}
                    onChange={(e) => setNewCandidatePhone(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-dash-border-gray rounded-xl py-2.5 px-4 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple transition-all"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateCandidateModal(false)}
                    className="flex-1 py-3 rounded-xl border border-dash-border-gray hover:bg-dash-soft-pink text-dash-light-purple font-bold text-xs cursor-pointer transition-colors bg-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingCandidate}
                    className="flex-1 py-3 rounded-xl bg-dash-primary-purple hover:bg-dash-dark-purple text-white font-bold text-xs cursor-pointer border-none shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isCreatingCandidate ? 'Creating...' : 'Create Account'}
                  </button>
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
              className="fixed inset-0 bg-dash-dark-purple/40 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-md h-fit bg-dash-white-card border border-dash-border-gray rounded-[24px] shadow-2xl z-50 p-6 flex flex-col gap-5"
            >
              <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-3">
                <div>
                  <span className="text-[10px] text-dash-primary-purple font-extrabold tracking-widest uppercase">
                    Create Candidate Group
                  </span>
                  <h3 className="text-base font-bold text-dash-dark-purple font-outfit mt-0.5">
                    New Group
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="p-1.5 rounded-lg hover:bg-dash-soft-pink text-dash-light-purple hover:text-dash-dark-purple transition-all duration-200 cursor-pointer border-none bg-transparent"
                >
                  <X size={18} />
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
                  showToast(`Group "${newGroup.name}" created successfully.`);
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider">
                    Group Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Python Developers Group"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-dash-border-gray rounded-xl py-2.5 px-4 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider">
                    Selected Candidates ({selectedCandidateIds.length})
                  </label>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 border border-dash-border-gray/65 rounded-xl p-3 bg-slate-50/50 dashboard-scrollbar">
                    {candidates
                      .filter(c => selectedCandidateIds.includes(c.id))
                      .map(c => (
                        <div key={c.id} className="text-xs font-bold text-dash-dark-purple flex items-center justify-between">
                          <span>{c.full_name || c.name}</span>
                          <span className="text-[9px] font-medium text-dash-light-purple">{c.email}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateGroupModal(false)}
                    className="flex-1 py-3 rounded-xl border border-dash-border-gray hover:bg-dash-soft-pink text-dash-light-purple font-bold text-xs cursor-pointer transition-colors bg-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-dash-primary-purple hover:bg-dash-dark-purple text-white font-bold text-xs cursor-pointer border-none shadow-md"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal for Assigning Assessment */}
      <AnimatePresence>
        {assigningAssessment && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setAssigningAssessment(null);
                setAssigningGroup(null);
              }}
              className="fixed inset-0 bg-dash-dark-purple/40 z-50"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-md h-fit bg-dash-white-card border border-dash-border-gray rounded-[24px] shadow-2xl z-50 p-6 flex flex-col gap-5"
            >
              <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-3">
                <div>
                  <span className="text-[10px] text-dash-primary-purple font-extrabold tracking-widest uppercase">
                    Assign Assessment
                  </span>
                  <h3 className="text-base font-bold text-dash-dark-purple font-outfit mt-0.5 truncate max-w-[280px]">
                    {assigningAssessment.name}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setAssigningAssessment(null);
                    setAssigningGroup(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-dash-soft-pink text-dash-light-purple hover:text-dash-dark-purple transition-all duration-200 cursor-pointer border-none bg-transparent"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Type Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAssignType('individual')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer border-none transition-all ${assignType === 'individual' ? 'bg-white text-dash-primary-purple shadow-sm font-extrabold' : 'bg-transparent text-dash-light-purple'}`}
                >
                  Individual Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setAssignType('group')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer border-none transition-all ${assignType === 'group' ? 'bg-white text-dash-primary-purple shadow-sm font-extrabold' : 'bg-transparent text-dash-light-purple'}`}
                >
                  Candidate Group
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (isSubmittingAssign) return;
                  setIsSubmittingAssign(true);
                  try {
                    const dueDate = e.target.dueDate.value;
                    const startTime = e.target.startTime.value;

                    if (assignType === 'group') {
                      if (!selectedAssignGroup) {
                        alert('Please select a candidate group.');
                        return;
                      }

                      const groupMemberEmails = (Array.isArray(candidates) ? candidates : [])
                        .filter(c => selectedAssignGroup.candidateIds.includes(c.id))
                        .map(c => c.email);

                      if (groupMemberEmails.length === 0) {
                        alert('This group has no members.');
                        return;
                      }

                      let successCount = 0;
                      let failedCount = 0;
                      for (const email of groupMemberEmails) {
                        try {
                          await handleConfirmAssign(email, dueDate, startTime, true);
                          successCount++;
                        } catch (err) {
                          failedCount++;
                          console.error(`Failed to assign to ${email}:`, err);
                        }
                      }

                      showToast(`Successfully assigned to ${successCount} candidates. ${failedCount > 0 ? `Failed: ${failedCount}.` : ''}`);

                      // Refresh saved assessments
                      try {
                        const assessmentsRes = await api.get('/api/assessment');
                        if (assessmentsRes.data) {
                          setSavedAssessments(deduplicateAssessments(assessmentsRes.data));
                        }
                      } catch (err) {
                        console.error(err);
                      }

                      setAssigningAssessment(null);
                      setAssigningGroup(null);
                    } else {
                      if (!selectedAssignCandidate) {
                        alert('Please select a candidate from the dropdown.');
                        return;
                      }
                      const email = selectedAssignCandidate.email;
                      await handleConfirmAssign(email, dueDate, startTime);
                    }
                  } catch (err) {
                    console.error("Assign submit error:", err);
                  } finally {
                    setIsSubmittingAssign(false);
                  }
                }}
                className="flex flex-col gap-4"
              >
                {assignType === 'individual' ? (
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider">
                      Select Candidate
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search candidate by name or email..."
                        value={assignSearch}
                        onChange={(e) => {
                          setAssignSearch(e.target.value);
                          setSelectedAssignCandidate(null);
                          setShowAssignDropdown(true);
                        }}
                        onFocus={() => setShowAssignDropdown(true)}
                        className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2.5 px-4 text-xs font-semibold text-dash-dark-purple placeholder-dash-light-purple/50 focus:outline-none focus:border-dash-primary-purple transition-all"
                        required={assignType === 'individual' && !selectedAssignCandidate}
                      />
                      {selectedAssignCandidate && (
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-dash-success-green bg-dash-success-green/10 border border-dash-success-green/20 px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>

                    {/* Dropdown Overlay */}
                    <AnimatePresence>
                      {showAssignDropdown && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowAssignDropdown(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 right-0 top-full mt-1.5 max-h-48 overflow-y-auto bg-dash-white-card border border-dash-border-gray rounded-xl shadow-xl z-50 p-1 flex flex-col gap-0.5 dashboard-scrollbar"
                          >
                            {(Array.isArray(candidates) ? candidates : [])
                              .filter(c => {
                                const nameStr = (c.full_name || c.name || '').toLowerCase();
                                const emailStr = (c.email || '').toLowerCase();
                                const query = assignSearch.toLowerCase();
                                return nameStr.includes(query) || emailStr.includes(query);
                              })
                              .map(c => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedAssignCandidate(c);
                                    setAssignSearch(`${c.full_name || c.name} (${c.email})`);
                                    setShowAssignDropdown(false);
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-dash-soft-pink hover:text-dash-primary-purple text-dash-dark-purple transition-colors cursor-pointer border-none flex flex-col gap-0.5"
                                >
                                  <span className="font-bold">{c.full_name || c.name}</span>
                                  <span className="text-[10px] text-dash-light-purple">{c.email}</span>
                                </button>
                              ))}
                            {(Array.isArray(candidates) ? candidates : []).filter(c => {
                              const nameStr = (c.full_name || c.name || '').toLowerCase();
                              const emailStr = (c.email || '').toLowerCase();
                              const query = assignSearch.toLowerCase();
                              return nameStr.includes(query) || emailStr.includes(query);
                            }).length === 0 && (
                                <div className="p-3 text-center text-xs font-semibold text-dash-light-purple">
                                  No candidates found.
                                </div>
                              )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider">
                      Select Candidate Group
                    </label>
                    {candidateGroups.length === 0 ? (
                      <div className="p-3 border border-dashed border-dash-border-gray rounded-xl text-center text-xs font-semibold text-dash-light-purple">
                        No groups created yet.
                      </div>
                    ) : (
                      <select
                        value={selectedAssignGroup ? selectedAssignGroup.id : ''}
                        onChange={(e) => {
                          const group = candidateGroups.find(g => g.id === e.target.value);
                          setSelectedAssignGroup(group || null);
                        }}
                        required={assignType === 'group'}
                        className="w-full bg-[#f8fafc] border border-dash-border-gray rounded-xl py-2.5 px-4 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple transition-all"
                      >
                        <option value="">-- Choose a Group --</option>
                        {candidateGroups.map(g => (
                          <option key={g.id} value={g.id}>
                            {g.name} ({g.candidateIds?.length || 0} members)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider">
                    Start Time (Required)
                  </label>
                  <input
                    name="startTime"
                    type="datetime-local"
                    required
                    className="w-full bg-[#f8fafc] border border-dash-border-gray rounded-xl py-2.5 px-4 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider">
                    Due Date (Optional)
                  </label>
                  <input
                    name="dueDate"
                    type="datetime-local"
                    className="w-full bg-[#f8fafc] border border-dash-border-gray rounded-xl py-2.5 px-4 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple transition-all"
                  />
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-dash-border-gray/25 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAssigningAssessment(null);
                      setAssigningGroup(null);
                    }}
                    className="flex-1 py-3 rounded-xl border border-dash-border-gray text-xs font-bold text-dash-dark-purple hover:bg-dash-soft-pink transition-colors cursor-pointer bg-dash-white-card bg-transparent"
                  >
                    Cancel
                  </button>
                  <ActionButton
                    type="submit"
                    isLoading={isSubmittingAssign}
                    loadingText="Assigning..."
                    disabled={isSubmittingAssign}
                    className="flex-1 py-3 rounded-xl bg-dash-primary-purple text-dash-white-card text-xs font-bold hover:bg-dash-dark-purple transition-colors cursor-pointer border-none shadow-md"
                  >
                    Assign Assessment
                  </ActionButton>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

// Scalable Interactive Question Preview components
const SyntaxHighlighter = ({ code, language }) => {
  if (!code) return null;
  const lang = (language || 'python').toLowerCase();

  if (lang === 'python') {
    const combinedRegex = new RegExp(
      `(?<comment>#.*)|(?<string>"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*')|(?<keyword>\\b(?:def|return|if|else|elif|for|in|while|import|from|as|try|except|finally|with|class|pass|and|or|not|is|None|True|False)\\b)|(?<func>\\b(?:print|len|range|str|int|float|list|dict|set|tuple|type|replace|lower|upper|strip|split|join|append)\\b)|(?<number>\\b\\d+\\b)|(?<other>[\\s\\S])`,
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

const QuestionPreviewHub = ({
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
  const fetchAssessmentData = React.useCallback(async (asmId) => {
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

  React.useEffect(() => {
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
  React.useEffect(() => {
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
                  /* MCQ EDIT FIELDS */
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
                  /* PYTHON CODING EDIT FIELDS */
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
                  /* DEFAULTS TO SCENARIO EDIT FIELDS */
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

                  {/* Example Input / Output for Scenario/Coding */}
                  {(selectedQuestion?.exampleInput || selectedQuestion?.exampleOutput || selectedQuestion?.sampleInput || selectedQuestion?.sampleOutput) && (
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
                        {selectedQuestion?.type === 'MCQ' ? 'Correct Answer Details' : 'Expected Solution'}
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

// ==========================================
// CANDIDATE DETAILS MODAL COMPONENT
// ==========================================
const CandidateDetailsModal = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dash-dark-purple/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-[24px] border border-dash-border-gray shadow-2xl w-full max-w-lg p-6 flex flex-col gap-5"
      >
        <div className="flex items-center justify-between border-b border-dash-border-gray/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-dash-primary-purple text-white flex items-center justify-center font-extrabold text-base shadow-sm">
              {item.candidateName ? item.candidateName[0] : 'C'}
            </div>
            <div>
              <h3 className="font-outfit font-extrabold text-base text-dash-dark-purple">
                {item.candidateName || 'Candidate Information'}
              </h3>
              <span className="text-xs text-dash-light-purple font-medium">
                Candidate ID: {item.candidateId}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-dash-light-purple hover:bg-dash-soft-pink hover:text-dash-dark-purple transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section 1: Candidate Info */}
        <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray/40 rounded-2xl p-4 flex flex-col gap-2.5">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-dash-primary-purple">
            Candidate Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Full Name</p>
              <p className="font-bold text-dash-dark-purple">{item.candidateName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Email Address</p>
              <p className="font-bold text-dash-dark-purple">{item.candidateEmail || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Phone Number</p>
              <p className="font-bold text-dash-dark-purple">{item.candidatePhone || 'Not Provided'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Candidate ID</p>
              <p className="font-mono text-[11px] font-semibold text-dash-dark-purple truncate">{item.candidateId}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Assessment Info */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col gap-2.5">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-dash-primary-purple">
            Assessment Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Assessment Name</p>
              <p className="font-bold text-dash-dark-purple">{item.assessmentName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Assessment ID</p>
              <p className="font-mono text-[11px] font-semibold text-dash-dark-purple truncate">{item.assessmentId}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Assigned Date & Time</p>
              <p className="font-bold text-dash-dark-purple">
                {item.assignedAt ? new Date(item.assignedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Due Date</p>
              <p className="font-bold text-dash-dark-purple">
                {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'No Due Date'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Current Status</p>
              <span className="font-bold text-dash-primary-purple uppercase text-[11px]">{item.status}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-dash-light-purple">Score</p>
              <p className="font-bold text-dash-dark-purple">
                {item.score !== null && item.score !== undefined ? `${item.score}%` : 'Pending Completion'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-dash-dark-purple text-white font-bold text-xs hover:bg-dash-primary-purple transition-all cursor-pointer border-none"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// ASSIGNED CANDIDATES MODAL COMPONENT
// ==========================================
const AssignedCandidatesModal = ({
  assessment,
  assignments = [],
  onClose,
  fetchAssignments,
  showToast,
  onAssignClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState(null);

  if (!assessment) return null;

  const asmAssignments = assignments.filter(
    (a) => String(a.assessmentId) === String(assessment.id) || String(a.assessment_id) === String(assessment.id)
  );

  const filtered = asmAssignments.filter((a) => {
    const name = (a.candidateName || '').toLowerCase();
    const email = (a.candidateEmail || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = name.includes(q) || email.includes(q);

    if (!matchesSearch) return false;
    if (statusFilter !== 'ALL' && (a.status || '').toUpperCase() !== statusFilter) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN_PROGRESS':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'EXPIRED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'SCHEDULED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dash-dark-purple/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-[24px] border border-dash-border-gray shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-dash-border-gray/40 flex items-center justify-between bg-dash-light-blue-bg/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md bg-dash-primary-purple/10 text-dash-primary-purple border border-dash-primary-purple/20">
                  Assigned Candidate Details
                </span>
                <span className="text-xs text-dash-light-purple font-semibold">
                  Assessment ID: {assessment.id}
                </span>
              </div>
              <h2 className="font-outfit font-extrabold text-xl text-dash-dark-purple mt-1">
                {assessment.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-dash-light-purple hover:bg-dash-soft-pink hover:text-dash-dark-purple transition-all cursor-pointer border-none bg-transparent"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex flex-col gap-5">
            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-dash-light-blue-bg/30 border border-dash-border-gray/40">
                <p className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider">Total Assigned</p>
                <p className="text-xl font-extrabold text-dash-dark-purple mt-0.5">{asmAssignments.length}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/50">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">In Progress</p>
                <p className="text-xl font-extrabold text-amber-700 mt-0.5">
                  {asmAssignments.filter(a => a.status === 'IN_PROGRESS').length}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/50">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Completed</p>
                <p className="text-xl font-extrabold text-emerald-700 mt-0.5">
                  {asmAssignments.filter(a => a.status === 'COMPLETED').length}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200/50">
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Expired / Locked</p>
                <p className="text-xl font-extrabold text-rose-700 mt-0.5">
                  {asmAssignments.filter(a => a.status === 'EXPIRED').length}
                </p>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 border border-slate-200/60 p-3 rounded-2xl">
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-light-purple" />
                <input
                  type="text"
                  placeholder="Search candidate name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-dash-border-gray rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <SlidersHorizontal size={14} className="text-dash-light-purple" />
                <span className="text-xs font-bold text-dash-light-purple">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-dash-border-gray rounded-xl py-2 px-3 text-xs font-bold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            </div>

            {/* Candidates Table */}
            {filtered.length === 0 ? (
              <div className="p-12 text-center border border-dash-border-gray/50 rounded-2xl bg-slate-50/50">
                <User size={32} className="mx-auto text-dash-light-purple/50 mb-2" />
                <p className="font-bold text-sm text-dash-dark-purple">
                  No candidate has been assigned to this assessment.
                </p>
                <p className="text-xs text-dash-light-purple mt-1">
                  Assign this assessment to candidates using the "Assign" button.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-dash-border-gray/60 rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-dash-border-gray/50 text-[11px] font-extrabold text-dash-light-purple uppercase tracking-wider">
                      <th className="py-3 px-4">Candidate Details</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Assigned On</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dash-border-gray/30 text-xs font-semibold text-dash-dark-purple">
                    {filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-dash-primary-purple/15 text-dash-primary-purple flex items-center justify-center font-bold text-xs shrink-0">
                              {item.candidateName ? item.candidateName[0] : 'C'}
                            </div>
                            <div>
                              <p className="font-bold text-dash-dark-purple">{item.candidateName || 'Candidate'}</p>
                              <p className="text-[11px] text-dash-light-purple font-medium flex items-center gap-1.5 mt-0.5">
                                <Mail size={11} /> {item.candidateEmail}
                              </p>
                              {item.candidatePhone && (
                                <p className="text-[10px] text-dash-light-purple/80 font-medium flex items-center gap-1.5">
                                  <Phone size={10} /> {item.candidatePhone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border uppercase tracking-wider ${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-dash-light-purple">
                          {item.assignedAt ? new Date(item.assignedAt).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-dash-light-purple">
                          {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'None'}
                        </td>
                        <td className="py-3.5 px-4">
                          {item.score !== null && item.score !== undefined ? (
                            <span className="font-extrabold text-dash-primary-purple bg-dash-primary-purple/10 px-2 py-0.5 rounded-md">
                              {item.score}%
                            </span>
                          ) : (
                            <span className="text-dash-light-purple/60 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedCandidateDetail(item)}
                              className="px-2.5 py-1.5 rounded-xl bg-dash-primary-purple/10 border border-dash-primary-purple/30 text-dash-primary-purple font-bold text-xs hover:bg-dash-primary-purple hover:text-white transition-all cursor-pointer"
                            >
                              Details
                            </button>
                            <ActionButton
                              onClick={async () => {
                                try {
                                  await api.delete(`/api/assignments/${item.id}`);
                                  if (showToast) showToast('Assignment deleted successfully.');
                                  if (fetchAssignments) await fetchAssignments();
                                } catch (err) {
                                  console.error('Failed to delete assignment:', err);
                                  if (showToast) showToast('Failed to delete assignment.');
                                }
                              }}
                              loadingText="Deleting..."
                              icon={Trash2}
                              iconSize={12}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 font-bold text-xs hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                              title="Delete Assignment"
                            >
                              Delete
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Candidate Details Panel Modal */}
      {selectedCandidateDetail && (
        <CandidateDetailsModal
          item={selectedCandidateDetail}
          onClose={() => setSelectedCandidateDetail(null)}
        />
      )}
    </AnimatePresence>
  );
};

// ==========================================
// 9. ASSESSMENTS MANAGER COMPONENT
// ==========================================
const AssessmentsManager = ({
  savedAssessments,
  setSavedAssessments,
  setGeneratedQuestions,
  assignments = [],
  fetchAssignments,
  showToast,
  setActiveTab,
  onAssignClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingAssignedModalAssessment, setViewingAssignedModalAssessment] = useState(null);

  const handlePreviewAssessment = (asm) => {
    if (setGeneratedQuestions) {
      setGeneratedQuestions(asm.questions || []);
    }
    setActiveTab('preview-questions');
    showToast(`Loaded question preview for "${asm.name}".`);
  };

  const handleDeleteAssessment = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${name}"?`);
    if (!confirmDelete) return;

    try {
      await api.delete(`/api/assessment/${id}`);
      setSavedAssessments(prev => prev.filter(asm => asm.id !== id));
      showToast(`Assessment "${name}" deleted successfully.`);
    } catch (err) {
      console.error("Failed to delete assessment from backend:", err);
      showToast("Error deleting assessment.");
    }
  };

  const validActiveAssessments = (() => {
    const raw = (Array.isArray(savedAssessments) ? savedAssessments : []).filter(asm => {
      if (!asm || !asm.id || !asm.name) return false;
      const st = (asm.status || 'Active').toUpperCase();
      return st === 'ACTIVE' || st === 'CREATED';
    });
    const seenIds = new Set();
    const seenNames = new Set();
    return raw.filter(asm => {
      const idKey = asm.id ? String(asm.id) : null;
      const nameKey = asm.name ? String(asm.name).trim().toLowerCase() : null;
      if (idKey && seenIds.has(idKey)) return false;
      if (nameKey && seenNames.has(nameKey)) return false;
      if (idKey) seenIds.add(idKey);
      if (nameKey) seenNames.add(nameKey);
      return true;
    });
  })();

  const filteredAssessments = validActiveAssessments.filter(asm => {
    const query = searchQuery.toLowerCase();
    const nameMatch = asm.name && asm.name.toLowerCase().includes(query);
    const subjectMatch = Array.isArray(asm.subjects) && asm.subjects.some(sub => sub.toLowerCase().includes(query));
    return nameMatch || subjectMatch;
  });

  const getSubjectBadgeClass = (subject) => {
    switch (subject.toLowerCase()) {
      case 'python':
        return 'bg-dash-primary-purple/10 text-dash-primary-purple border-dash-primary-purple/20';
      case 'sql':
        return 'bg-blue-50 text-blue-600 border-blue-200/50';
      case 'aptitude':
        return 'bg-amber-50 text-amber-600 border-amber-200/50';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy':
        return 'text-green-600 bg-green-50 border-green-200/50';
      case 'Medium':
        return 'text-amber-600 bg-amber-50 border-amber-200/50';
      case 'Hard':
        return 'text-rose-600 bg-rose-50 border-rose-200/50';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search & Actions Bar */}
      <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dash-light-purple transition-colors duration-300 group-focus-within:text-dash-primary-purple" size={16} />
          <input
            type="text"
            placeholder="Search active assessments by name or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-dash-dark-purple placeholder-dash-light-purple/60 focus:outline-none focus:border-dash-primary-purple transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dash-light-purple hover:text-dash-dark-purple">
              <X size={14} />
            </button>
          )}
        </div>

      </div>

      {/* Grid of Saved Assessments */}
      {filteredAssessments.length === 0 ? (
        <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-12 text-center flex flex-col items-center justify-center min-h-[350px] shadow-sm">
          <div className="p-4 rounded-full bg-dash-light-blue-bg text-dash-primary-purple mb-4">
            <BookOpen size={36} className="animate-pulse" />
          </div>
          <h3 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple">
            {searchQuery ? "No Assessments Found" : "No active assessments available."}
          </h3>
          <p className="text-xs text-dash-light-purple font-medium mt-2 max-w-sm leading-relaxed">
            {searchQuery
              ? `No active assessments match "${searchQuery}". Try refining your search query.`
              : 'No active assessments have been found in the system.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAssessments.map((asm) => {
            const asmAssignments = assignments.filter(
              (a) => String(a.assessmentId) === String(asm.id) || String(a.assessment_id) === String(asm.id)
            );

            return (
              <motion.div
                key={asm.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-dash-white-card border border-dash-border-gray hover:border-dash-primary-purple/40 rounded-[24px] p-6 shadow-sm flex flex-col justify-between gap-5 transition-all duration-300 relative group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <h4 className="font-outfit font-extrabold text-base text-dash-dark-purple leading-snug group-hover:text-dash-primary-purple transition-colors duration-200 truncate max-w-[200px]" title={asm.name}>
                      {asm.name}
                    </h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 uppercase tracking-wider ${getDifficultyColor(asm.difficulty)}`}>
                      {asm.difficulty}
                    </span>
                  </div>

                  {/* Creation Date */}
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-dash-light-purple mb-4">
                    <Calendar size={12} />
                    <span>Created: {asm.createdDate}</span>
                  </div>

                  {/* Subject Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4.5">
                    {asm.subjects.map(sub => (
                      <span key={sub} className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${getSubjectBadgeClass(sub)}`}>
                        {sub}
                      </span>
                    ))}
                  </div>

                  {/* Meta items */}
                  <div className="grid grid-cols-2 gap-3.5 bg-dash-light-blue-bg/25 border border-dash-border-gray/30 p-3 rounded-xl mb-3 text-xs font-semibold text-dash-dark-purple">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-dash-primary-purple" />
                      <span>{asm.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-dash-primary-purple" />
                      <span>{asm.questionsCount} Questions</span>
                    </div>
                  </div>

                  {/* Candidates Assigned Details Section */}
                  {(() => {
                    if (asmAssignments.length === 0) {
                      return (
                        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 my-2 text-center">
                          <p className="text-[11px] text-slate-500 font-medium">
                            No candidate has been assigned to this assessment.
                          </p>
                        </div>
                      );
                    }

                    if (asmAssignments.length === 1) {
                      const singleAssigned = asmAssignments[0];
                      return (
                        <div className="bg-dash-light-blue-bg/40 border border-dash-primary-purple/20 rounded-xl p-3 my-2 flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-dash-primary-purple/15 text-dash-primary-purple flex items-center justify-center font-bold text-xs shrink-0">
                                <User size={13} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-dash-dark-purple truncate" title={singleAssigned.candidateName}>
                                  {singleAssigned.candidateName || 'Assigned Candidate'}
                                </p>
                                <p className="text-[10px] text-dash-light-purple font-medium truncate" title={singleAssigned.candidateEmail}>
                                  {singleAssigned.candidateEmail}
                                </p>
                              </div>
                            </div>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider shrink-0 ${singleAssigned.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                singleAssigned.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                  singleAssigned.status === 'EXPIRED' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                    'bg-indigo-50 text-indigo-600 border-indigo-200'
                              }`}>
                              {singleAssigned.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-dash-light-purple border-t border-dash-border-gray/30 pt-1.5 mt-1">
                            <span>Assigned: {singleAssigned.assignedAt ? new Date(singleAssigned.assignedAt).toLocaleDateString() : 'Recent'}</span>
                            <button
                              onClick={() => setViewingAssignedModalAssessment(asm)}
                              className="text-dash-primary-purple font-bold hover:underline cursor-pointer border-none bg-transparent"
                            >
                              View Details &rarr;
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="bg-dash-primary-purple/10 border border-dash-primary-purple/20 rounded-xl p-3 my-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-dash-primary-purple text-white">
                            <Users size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-dash-dark-purple">
                              Assigned Candidates: {asmAssignments.length}
                            </p>
                            <p className="text-[10px] text-dash-light-purple font-medium">
                              {asmAssignments.filter(a => a.status === 'COMPLETED').length} Completed, {asmAssignments.filter(a => a.status === 'IN_PROGRESS').length} In Progress
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setViewingAssignedModalAssessment(asm)}
                          className="px-2.5 py-1.5 rounded-lg bg-dash-primary-purple text-white font-bold text-[10px] hover:bg-dash-dark-purple transition-colors cursor-pointer border-none shadow-sm"
                        >
                          View List &rarr;
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Card Actions */}
                <div className="border-t border-dash-border-gray/30 pt-4 mt-1">
                  <div className="flex items-center justify-between gap-2.5 w-full">
                    <button
                      onClick={() => handlePreviewAssessment(asm)}
                      className="flex-1 py-2.5 rounded-xl border border-dash-primary-purple/30 bg-dash-primary-purple/10 hover:bg-dash-primary-purple/20 text-dash-primary-purple font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Preview Questions</span>
                    </button>

                    <button
                      onClick={() => onAssignClick(asm)}
                      className="flex-1 py-2.5 rounded-xl bg-dash-primary-purple/10 border border-dash-primary-purple/20 hover:bg-dash-primary-purple/20 text-dash-primary-purple font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus size={13} />
                      <span>Assign</span>
                    </button>

                    <button
                      onClick={() => handleDeleteAssessment(asm.id, asm.name)}
                      className="p-2.5 rounded-xl border border-red-100 hover:border-red-200 bg-red-50/30 hover:bg-red-50 text-red-600 transition-all duration-200 flex items-center justify-center cursor-pointer"
                      title="Delete Assessment"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal for viewing all assigned candidates */}
      {viewingAssignedModalAssessment && (
        <AssignedCandidatesModal
          assessment={viewingAssignedModalAssessment}
          assignments={assignments}
          onClose={() => setViewingAssignedModalAssessment(null)}
          fetchAssignments={fetchAssignments}
          showToast={showToast}
          onAssignClick={onAssignClick}
        />
      )}
    </div>
  );
};

// ==========================================
// EXPIRED ASSESSMENTS MANAGER COMPONENT
// ==========================================
const ExpiredAssessmentsManager = ({
  assignments = [],
  fetchAssignments,
  showToast,
  savedAssessments = [],
  onAssignClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const expiredAssignments = useMemo(() => {
    const list = Array.isArray(assignments) ? assignments : [];
    const now = Date.now();
    return list.filter(a => {
      if (!a) return false;
      const st = (a.status || '').toUpperCase();
      if (st === 'EXPIRED') return true;

      if (st !== 'COMPLETED' && st !== 'SUBMITTED') {
        const endTimeVal = a.endTime || a.end_time || a.dueDate || a.due_date;
        if (endTimeVal && new Date(endTimeVal).getTime() < now) {
          return true;
        }
      }
      return false;
    });
  }, [assignments]);

  const filteredExpired = expiredAssignments.filter(a => {
    const q = searchQuery.toLowerCase();
    const candName = (a.candidateName || a.candidate?.full_name || a.candidate?.name || '').toLowerCase();
    const candEmail = (a.candidateEmail || a.candidate?.email || '').toLowerCase();
    const asmName = (a.assessmentName || a.assessment?.name || '').toLowerCase();
    return candName.includes(q) || candEmail.includes(q) || asmName.includes(q);
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      {/* Tab Header */}
      <div className="flex items-center justify-between bg-dash-white-card border border-dash-border-gray/50 rounded-[20px] p-5 shadow-sm">
        <div>
          <h2 className="font-outfit font-bold text-lg text-dash-dark-purple leading-tight flex items-center gap-2">
            <Clock size={20} className="text-rose-500" />
            <span>Expired Candidates & Assessments</span>
          </h2>
          <p className="text-xs text-dash-light-purple font-semibold mt-1">
            Track candidates whose assigned assessments have passed their expiration window or due date.
          </p>
        </div>
        <button
          onClick={fetchAssignments}
          className="p-2 border border-dash-border-gray hover:bg-dash-light-blue-bg/40 rounded-xl text-dash-dark-purple font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer bg-white"
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[28px] p-6 shadow-sm overflow-hidden flex flex-col gap-5">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dash-light-purple" />
          <input
            type="text"
            placeholder="Search candidate name, email, or assessment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-dash-border-gray rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple"
          />
        </div>

        {/* Content */}
        {filteredExpired.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
            <AlertCircle size={36} className="text-dash-light-purple/40" />
            <h4 className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple">No Expired Assessments</h4>
            <p className="text-xs text-dash-light-purple font-medium max-w-xs">
              {searchQuery ? `No expired assessments match "${searchQuery}".` : 'There are currently no expired candidate assessments.'}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dash-border-gray/25 text-[10px] text-dash-light-purple font-extrabold uppercase tracking-wider">
                  <th className="pb-3.5 pl-2">Candidate Name</th>
                  <th className="pb-3.5">Assessment Name</th>
                  <th className="pb-3.5">Assigned Date</th>
                  <th className="pb-3.5">Expiration Date</th>
                  <th className="pb-3.5">Status</th>
                  <th className="pb-3.5 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dash-border-gray/10 text-xs font-semibold">
                {filteredExpired.map((a) => {
                  const candidateName = a.candidateName || a.candidate?.full_name || a.candidate?.name || 'Candidate';
                  const candidateEmail = a.candidateEmail || a.candidate?.email || '';
                  const assessmentName = a.assessmentName || a.assessment?.name || 'Assessment';
                  const rawAssigned = a.assignedAt || a.assigned_at || a.created_at;
                  const rawExp = a.dueDate || a.due_date || a.endTime || a.end_time;
                  const matchingAsm = savedAssessments.find(s => String(s.id) === String(a.assessmentId || a.assessment_id));

                  const assignedFormatted = rawAssigned ? new Date(rawAssigned).toLocaleString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : 'N/A';

                  const expFormatted = rawExp ? new Date(rawExp).toLocaleString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : 'Expired';

                  return (
                    <tr key={a.id} className="hover:bg-rose-50/20 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="flex flex-col">
                          <span className="text-dash-dark-purple font-bold text-xs">{candidateName}</span>
                          {candidateEmail && <span className="text-[10px] text-dash-light-purple font-medium">{candidateEmail}</span>}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dash-light-blue-bg/60 border border-dash-border-gray text-dash-primary-purple font-bold text-xs">
                          {assessmentName}
                        </span>
                      </td>
                      <td className="py-4 text-dash-light-purple">
                        {assignedFormatted}
                      </td>
                      <td className="py-4 text-rose-600 font-bold">
                        {expFormatted}
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-rose-50 border border-rose-200 text-rose-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Expired
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <div className="flex items-center justify-end gap-2">
                          <ActionButton
                            onClick={async () => {
                              try {
                                await api.delete(`/api/assignments/${a.id}`);
                                if (showToast) showToast('Expired assignment deleted successfully.');
                                if (fetchAssignments) await fetchAssignments();
                              } catch (err) {
                                console.error('Failed to delete expired assignment:', err);
                                if (showToast) showToast('Failed to delete assignment.');
                              }
                            }}
                            loadingText="Deleting..."
                            icon={Trash2}
                            iconSize={12}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 font-bold text-xs hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                            title="Delete Assignment"
                          >
                            Delete
                          </ActionButton>
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
    </div>
  );
};

// ==========================================
// 10. ASSESSMENT DETAILS DRAWER COMPONENT
// ==========================================
const AssessmentDetailsDrawer = ({ assessment, onClose, showToast }) => {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyCode = (code, qId) => {
    navigator.clipboard.writeText(code);
    setCopiedId(qId);
    showToast("Answer copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-dash-dark-purple/40 z-40"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className="fixed top-0 bottom-0 right-0 w-full sm:w-[500px] bg-dash-white-card border-l border-dash-border-gray shadow-2xl z-50 p-6 flex flex-col justify-between overflow-hidden"
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-dash-border-gray mb-6 shrink-0">
            <div>
              <span className="text-[10px] text-dash-primary-purple font-extrabold tracking-widest uppercase block mb-1">
                Assessment Questions Pool
              </span>
              <h3 className="text-base font-bold text-dash-dark-purple font-outfit mt-0.5 truncate max-w-[380px]">
                {assessment.name}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-dash-soft-pink text-dash-light-purple hover:text-dash-dark-purple transition-all duration-200 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-3 bg-dash-light-blue-bg/30 border border-dash-border-gray/30 p-3.5 rounded-xl mb-6 shrink-0 text-center">
            <div>
              <span className="text-[9px] font-bold text-dash-light-purple uppercase block mb-0.5">Difficulty</span>
              <span className="text-xs font-bold text-dash-dark-purple">{assessment.difficulty}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-dash-light-purple uppercase block mb-0.5">Duration</span>
              <span className="text-xs font-bold text-dash-dark-purple">{assessment.duration}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-dash-light-purple uppercase block mb-0.5">Total Questions</span>
              <span className="text-xs font-bold text-dash-dark-purple">{assessment.questionsCount}</span>
            </div>
          </div>

          {/* Scrollable Questions list */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-5 dashboard-scrollbar">
            {assessment.questions && assessment.questions.length > 0 ? (
              assessment.questions.map((q, idx) => {
                const isCoding = q.type === 'SCENARIO' || q.type === 'SCENARIO_CODING' || q.type?.includes('CODING');
                return (
                  <div key={q.id || idx} className="bg-dash-light-blue-bg/15 border border-dash-border-gray/40 rounded-2xl p-4.5 space-y-3.5 shadow-sm text-left">
                    {/* Info bar */}
                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wide border-b border-dash-border-gray/25 pb-2">
                      <span className="text-dash-primary-purple font-outfit">
                        {isCoding ? 'Scenario Coding' : 'MCQ'} #{idx + 1}
                      </span>
                      <span className="bg-dash-white-card border border-dash-border-gray/30 px-2 py-0.5 rounded text-dash-dark-purple/70 font-semibold">
                        {q.subject}
                      </span>
                    </div>

                    {/* Question text */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-dash-light-purple uppercase tracking-wider block">Question</span>
                      <p className="text-xs font-semibold text-dash-dark-purple leading-relaxed bg-dash-white-card/50 p-3 rounded-xl border border-dash-border-gray/30 select-text">
                        {q.question || q.problemStatement || q.scenario}
                      </p>
                    </div>

                    {/* MCQ Options */}
                    {!isCoding && q.options && q.options.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-dash-light-purple uppercase tracking-wider block">Options</span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = opt === q.correctAnswer;
                            const optLabel = ['A', 'B', 'C', 'D'][oIdx] || '';
                            return (
                              <div
                                key={oIdx}
                                className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs ${isCorrect
                                  ? 'border-green-400 bg-green-50/40 text-green-700 font-bold'
                                  : 'border-dash-border-gray/30 bg-dash-white-card/50 text-dash-dark-purple'
                                  }`}
                              >
                                {isCorrect ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
                                ) : (
                                  <div className="w-3.5 h-3.5 rounded-full border border-dash-light-purple/40 shrink-0 flex items-center justify-center font-bold text-[8px] text-dash-light-purple">
                                    {optLabel}
                                  </div>
                                )}
                                <span>{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Scenario Input/Output */}
                    {isCoding && (
                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        <div className="space-y-1">
                          <span className="font-bold text-dash-light-purple uppercase tracking-wider">Input</span>
                          <div className="bg-dash-white-card/50 border border-dash-border-gray/30 rounded-lg p-2 font-mono text-[9px] text-dash-dark-purple whitespace-pre-wrap select-text">
                            {q.exampleInput || 'N/A'}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold text-dash-light-purple uppercase tracking-wider">Output</span>
                          <div className="bg-dash-white-card/50 border border-dash-border-gray/30 rounded-lg p-2 font-mono text-[9px] text-dash-dark-purple whitespace-pre-wrap select-text">
                            {q.exampleOutput || 'N/A'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Scenario Constraints */}
                    {isCoding && q.constraints && q.constraints.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-dash-light-purple uppercase tracking-wider block">Constraints</span>
                        <div className="bg-amber-50/30 border border-amber-200/40 rounded-xl p-2.5 space-y-1">
                          {q.constraints.map((c, cIdx) => (
                            <div key={cIdx} className="flex items-center gap-1.5 text-[9px] font-semibold text-dash-dark-purple">
                              <div className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                              <span>{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expected Answer */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-dash-light-purple uppercase tracking-wider">
                          {isCoding ? 'Expected Code' : 'Correct Answer'}
                        </span>
                        {isCoding && q.expectedAnswer && (
                          <button
                            onClick={() => handleCopyCode(q.expectedAnswer, q.id)}
                            className="px-2 py-0.5 rounded border border-dash-border-gray/80 text-[8px] font-bold text-dash-primary-purple hover:bg-dash-soft-pink transition-all flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === q.id ? (
                              <>
                                <Check size={8} strokeWidth={3} className="text-green-600" />
                                <span className="text-green-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={8} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {!isCoding ? (
                        <div className="bg-green-50/40 border border-green-200/50 text-green-700 rounded-xl p-2.5 font-semibold text-xs flex items-center gap-1.5">
                          <CheckCircle className="text-green-600 shrink-0" size={14} />
                          <span>{q.correctAnswer}</span>
                        </div>
                      ) : (
                        <div className="bg-[#fafafc] border border-dash-border-gray/40 rounded-xl p-3.5 font-mono text-[9px] text-[#0f172a] whitespace-pre overflow-x-auto relative select-text border-l-2 border-l-dash-primary-purple">
                          <SyntaxHighlighter
                            code={q.expectedAnswer}
                            language={q.subject.toLowerCase() === 'sql' ? 'sql' : 'python'}
                          />
                        </div>
                      )}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="space-y-1 pb-1">
                        <span className="text-[9px] font-bold text-dash-light-purple uppercase tracking-wider block">Explanation</span>
                        <p className="text-[10px] font-medium text-dash-light-purple leading-relaxed bg-dash-white-card/30 p-2.5 rounded-xl border border-dash-border-gray/20 select-text">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-dash-light-purple italic">
                No questions included in this assessment.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-dash-border-gray mt-6 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-dash-primary-purple text-dash-white-card font-bold text-xs hover:bg-dash-dark-purple transition-all duration-200 flex items-center justify-center cursor-pointer border-none shadow-sm"
          >
            <span>Close Preview</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};

const ResultsManager = ({ showToast, candidateGroups = [], candidates = [] }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetailId, setLoadingDetailId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('All');
  const [sortBy, setSortBy] = useState('score-desc');
  const [selectedResult, setSelectedResult] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [recalculating, setRecalculating] = useState(false);

  const [viewMode, setViewMode] = useState('flat'); // 'flat' | 'groups'
  const [selectedGroupForView, setSelectedGroupForView] = useState(null); // null | group object

  const candidateIdToEmailMap = useMemo(() => {
    const map = {};
    (candidates || []).forEach(c => {
      if (c && c.email) {
        map[c.id] = c.email.toLowerCase().trim();
      }
    });
    return map;
  }, [candidates]);

  const groupsWithResults = useMemo(() => {
    return (candidateGroups || []).map(group => {
      const groupEmails = (group.candidateIds || []).map(id => candidateIdToEmailMap[id]).filter(Boolean);
      const groupResults = results.filter(res => {
        const email = res.candidateEmail?.toLowerCase().trim();
        return email && groupEmails.includes(email);
      });

      const totalScore = groupResults.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
      const averageScore = groupResults.length > 0 ? Math.round(totalScore / groupResults.length) : null;

      return {
        ...group,
        results: groupResults,
        averageScore
      };
    });
  }, [candidateGroups, candidateIdToEmailMap, results]);

  const ungroupedResults = useMemo(() => {
    const allGroupedEmails = new Set();
    (candidateGroups || []).forEach(group => {
      (group.candidateIds || []).forEach(id => {
        const email = candidateIdToEmailMap[id];
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

  const fetchResults = React.useCallback(async () => {
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
      console.info(`[Recruiter Dashboard] Requesting details for assessment ID: ${targetId}`);
      const response = await api.get(`/api/results/${targetId}`);
      console.info(`[Recruiter Dashboard] Successfully loaded assessment report for ${response.data?.candidateName || 'candidate'}:`, response.data);
      setSelectedResult(response.data || {});
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
    <div className="space-y-6">
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

                {/* Comprehensive Candidate Activity Monitoring & Violation Audit */}
                {((selectedResult.activityLogs && selectedResult.activityLogs.length > 0) || selectedResult.autoSubmitted || selectedResult.warningCount > 0 || (selectedResult.warningHistory && selectedResult.warningHistory.length > 0)) && (() => {
                  const summary = selectedResult.activitySummary || {};
                  const logs = selectedResult.activityLogs || [];

                  // Map log event type to human readable titles & badges
                  const getActivityDetails = (type) => {
                    const t = (type || "").toUpperCase();
                    switch (t) {
                      case "TAB_SWITCH": return { title: "Tab Switch / Switched Away", color: "text-amber-600 bg-amber-50 border-amber-200" };
                      case "WINDOW_BLUR": return { title: "Window Lost Focus", color: "text-amber-600 bg-amber-50 border-amber-200" };
                      case "WINDOW_FOCUS": return { title: "Returned to Assessment", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
                      case "ESC_KEY": return { title: "Esc Key Pressed", color: "text-rose-600 bg-rose-50 border-rose-200" };
                      case "COPY_ATTEMPT": return { title: "Copy Attempt", color: "text-purple-600 bg-purple-50 border-purple-200" };
                      case "PASTE_ATTEMPT": return { title: "Paste Attempt", color: "text-purple-600 bg-purple-50 border-purple-200" };
                      case "CUT_ATTEMPT": return { title: "Cut Attempt", color: "text-purple-600 bg-purple-50 border-purple-200" };
                      case "RIGHT_CLICK": return { title: "Right Click Attempt", color: "text-slate-700 bg-slate-100 border-slate-200" };
                      case "DEVTOOLS_ATTEMPT": return { title: "DevTools Access Attempt", color: "text-rose-700 bg-rose-100 border-rose-300" };
                      case "FULLSCREEN_EXIT": return { title: "Full-screen Exit", color: "text-rose-600 bg-rose-50 border-rose-200" };
                      case "PAGE_REFRESH":
                      case "PAGE_RELOAD": return { title: "Page Refresh / Reload", color: "text-indigo-600 bg-indigo-50 border-indigo-200" };
                      default: return { title: type, color: "text-slate-600 bg-slate-50 border-slate-200" };
                    }
                  };

                  return (
                    <div className="bg-gradient-to-r from-slate-50 via-rose-50/30 to-amber-50/30 border border-slate-200 rounded-2xl p-5 mb-6">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <ShieldAlert size={18} className="text-rose-600" />
                          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                            Candidate Activity & Violation Summary
                          </h4>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${selectedResult.autoSubmitted ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}`}>
                          {selectedResult.autoSubmitted ? "Auto Submitted" : "Completed Normally"}
                        </span>
                      </div>

                      {/* Summary Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                        <div className="bg-white border border-slate-200/70 rounded-xl p-2.5">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Warnings</span>
                          <span className="text-xs font-extrabold text-rose-600">{summary.totalWarnings || selectedResult.warningCount || 0} / 3</span>
                        </div>
                        <div className="bg-white border border-slate-200/70 rounded-xl p-2.5">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Tab Switches</span>
                          <span className="text-xs font-extrabold text-amber-600">{summary.tabSwitches || 0}</span>
                        </div>
                        <div className="bg-white border border-slate-200/70 rounded-xl p-2.5">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Window Blurs</span>
                          <span className="text-xs font-extrabold text-slate-800">{summary.windowBlurs || 0}</span>
                        </div>
                        <div className="bg-white border border-slate-200/70 rounded-xl p-2.5">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Esc Presses</span>
                          <span className="text-xs font-extrabold text-slate-800">{summary.escPresses || 0}</span>
                        </div>
                        <div className="bg-white border border-slate-200/70 rounded-xl p-2.5">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Copy Attempts</span>
                          <span className="text-xs font-extrabold text-purple-600">{summary.copyAttempts || 0}</span>
                        </div>
                        <div className="bg-white border border-slate-200/70 rounded-xl p-2.5">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Paste Attempts</span>
                          <span className="text-xs font-extrabold text-purple-600">{summary.pasteAttempts || 0}</span>
                        </div>
                        <div className="bg-white border border-slate-200/70 rounded-xl p-2.5">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">DevTools Attempts</span>
                          <span className="text-xs font-extrabold text-rose-700">{summary.devToolsAttempts || 0}</span>
                        </div>
                        <div className="bg-white border border-slate-200/70 rounded-xl p-2.5">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Full-screen Exits</span>
                          <span className="text-xs font-extrabold text-rose-600">{summary.fullScreenExits || 0}</span>
                        </div>
                        <div className="bg-white border border-slate-200/70 rounded-xl p-2.5">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Right-Click Attempts</span>
                          <span className="text-xs font-extrabold text-slate-700">{summary.rightClickAttempts || 0}</span>
                        </div>
                      </div>

                      {/* Candidate Justification Reason */}
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

                      {/* Chronological Activity Timeline */}
                      <div className="bg-white border border-slate-200 rounded-xl p-4">
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
    </div>
  );
};

export default RecruiterDashboard;

const GroupsManager = ({ candidateGroups, setCandidateGroups, candidates, showToast, setAssigningGroup, setActiveTab }) => {
  const handleDeleteGroup = (groupId) => {
    if (confirm("Are you sure you want to delete this group?")) {
      setCandidateGroups(prev => prev.filter(g => g.id !== groupId));
      showToast("Group deleted successfully.");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-plus-jakarta font-extrabold text-xl text-dash-dark-purple tracking-tight">
            Candidate Groups
          </h2>
          <p className="text-xs text-dash-light-purple font-medium mt-0.5">
            Manage groups of candidates and assign assessments collectively.
          </p>
        </div>
      </div>

      {candidateGroups.length === 0 ? (
        <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-12 text-center shadow-sm">
          <Users className="mx-auto mb-3 text-dash-light-purple" size={40} />
          <h4 className="text-sm font-bold text-dash-dark-purple">No groups found</h4>
          <p className="text-xs text-dash-light-purple mt-1 max-w-xs mx-auto font-medium">
            Go to the main Dashboard list, select candidates using checkboxes, and click "Create Group" to create one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidateGroups.map((group) => {
            const groupMembers = (Array.isArray(candidates) ? candidates : [])
              .filter(c => group.candidateIds.includes(c.id));

            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dash-white-card border border-dash-border-gray/50 hover:border-dash-primary-purple/40 rounded-2xl p-5 shadow-[0_4px_20px_rgba(87,82,170,0.02)] flex flex-col gap-4 relative hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-dash-dark-purple group-hover:text-dash-primary-purple transition-all leading-tight font-outfit">
                      {group.name}
                    </h3>
                    <span className="text-[10px] text-dash-light-purple font-semibold mt-1 block">
                      Created: {new Date(group.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-1.5 rounded-lg text-dash-light-purple hover:text-red-500 hover:bg-rose-50 transition-colors cursor-pointer border-none bg-transparent bg-none"
                    title="Delete Group"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="h-px bg-dash-border-gray" />

                <div>
                  <span className="text-[9px] font-extrabold text-dash-primary-purple uppercase tracking-wider block mb-2">
                    Members ({groupMembers.length})
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-2 pr-1 dashboard-scrollbar">
                    {groupMembers.length === 0 ? (
                      <span className="text-[11px] text-dash-light-purple italic">No active candidates in this group</span>
                    ) : (
                      groupMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-dash-soft-pink text-dash-primary-purple flex items-center justify-center text-[10px] font-bold border border-dash-primary-purple/15 shrink-0">
                            {(member.full_name || member.name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-bold text-dash-dark-purple block leading-none">
                              {member.full_name || member.name}
                            </span>
                            <span className="text-[9px] text-dash-light-purple truncate block">
                              {member.email}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  <button
                    onClick={() => {
                      setAssigningGroup(group);
                      setActiveTab('assessments');
                      showToast(`Please select an assessment to assign to "${group.name}".`);
                    }}
                    className="w-full py-2.5 bg-dash-primary-purple hover:bg-dash-dark-purple text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-sm hover:shadow transition-all duration-200"
                  >
                    <Save size={13} />
                    <span>Assign Assessment</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}



const EnglishResultsManager = ({ showToast, handleOpenEnglishReport }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchAssessments = React.useCallback(async () => {
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

const OverallResultsManager = ({ showToast }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRecCandidate, setSelectedRecCandidate] = useState(null);

  const fetchOverallResults = React.useCallback(async () => {
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

