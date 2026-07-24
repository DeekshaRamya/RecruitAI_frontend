import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  Briefcase,
  Users,
  Award,
  TrendingUp,
  Search,
  X,
  Check,
  Settings,
  Bell,
  Menu,
  ChevronRight,
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
  Globe,
  Plus,
  LogOut,
  Edit2,
  Lock,
  ArrowUpRight,
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
  Eye,
  UserPlus,
  Send,
  Code,
  Database,
  Brain,
  PieChart
} from 'lucide-react';
import api from '../api';

const questionPool = {
  Python: [
    {
      question: 'Which keyword is used to define a generator function in Python?',
      options: [
        { label: 'A', text: 'return', isCorrect: false },
        { label: 'B', text: 'yield', isCorrect: true },
        { label: 'C', text: 'async', isCorrect: false },
        { label: 'D', text: 'lambda', isCorrect: false }
      ]
    },
    {
      question: 'What is the output of: list(map(lambda x: x**2, [1, 2, 3, 4]))?',
      options: [
        { label: 'A', text: '[1, 4, 9, 16]', isCorrect: true },
        { label: 'B', text: '[2, 4, 6, 8]', isCorrect: false },
        { label: 'C', text: '[1, 2, 3, 4]', isCorrect: false },
        { label: 'D', text: 'Error', isCorrect: false }
      ]
    },
    {
      question: 'Which decorator defines a class method that takes the class as the first argument?',
      options: [
        { label: 'A', text: '@staticmethod', isCorrect: false },
        { label: 'B', text: '@property', isCorrect: false },
        { label: 'C', text: '@classmethod', isCorrect: true },
        { label: 'D', text: '@instancemethod', isCorrect: false }
      ]
    },
    {
      question: 'Which of the following is a mutable data type in Python?',
      options: [
        { label: 'A', text: 'tuple', isCorrect: false },
        { label: 'B', text: 'string', isCorrect: false },
        { label: 'C', text: 'list', isCorrect: true },
        { label: 'D', text: 'int', isCorrect: false }
      ]
    }
  ],
  SQL: [
    {
      question: 'Which SQL clause is used to filter group results after aggregation?',
      options: [
        { label: 'A', text: 'WHERE', isCorrect: false },
        { label: 'B', text: 'HAVING', isCorrect: true },
        { label: 'C', text: 'GROUP BY', isCorrect: false },
        { label: 'D', text: 'ORDER BY', isCorrect: false }
      ]
    },
    {
      question: 'What type of JOIN returns all records when there is a match in either left or right table?',
      options: [
        { label: 'A', text: 'INNER JOIN', isCorrect: false },
        { label: 'B', text: 'LEFT JOIN', isCorrect: false },
        { label: 'C', text: 'FULL OUTER JOIN', isCorrect: true },
        { label: 'D', text: 'RIGHT JOIN', isCorrect: false }
      ]
    },
    {
      question: 'Which SQL constraint uniquely identifies each record in a database table?',
      options: [
        { label: 'A', text: 'UNIQUE', isCorrect: false },
        { label: 'B', text: 'PRIMARY KEY', isCorrect: true },
        { label: 'C', text: 'FOREIGN KEY', isCorrect: false },
        { label: 'D', text: 'CHECK', isCorrect: false }
      ]
    }
  ],
  Aptitude: [
    {
      question: 'A work can be completed by 8 men in 12 days. How many days will 6 men take to complete the same work?',
      options: [
        { label: 'A', text: '16 days', isCorrect: true },
        { label: 'B', text: '15 days', isCorrect: false },
        { label: 'C', text: '18 days', isCorrect: false },
        { label: 'D', text: '14 days', isCorrect: false }
      ]
    },
    {
      question: 'If a seller buys an item for $100 and sells it for $120, what is the profit percentage?',
      options: [
        { label: 'A', text: '10%', isCorrect: false },
        { label: 'B', text: '15%', isCorrect: false },
        { label: 'C', text: '20%', isCorrect: true },
        { label: 'D', text: '25%', isCorrect: false }
      ]
    },
    {
      question: 'What is the next number in the series: 2, 6, 12, 20, 30, ...?',
      options: [
        { label: 'A', text: '40', isCorrect: false },
        { label: 'B', text: '42', isCorrect: true },
        { label: 'C', text: '44', isCorrect: false },
        { label: 'D', text: '46', isCorrect: false }
      ]
    }
  ]
};

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

  // Saved Assessments State
  const [savedAssessments, setSavedAssessments] = useState([]);
  const [selectedAssessmentForView, setSelectedAssessmentForView] = useState(null);

  // Fetch assessments and candidates from backend on mount
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await api.get('/api/assessment');
        if (response.data && Array.isArray(response.data)) {
          setSavedAssessments(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch assessments from backend:", err);
        showToast("Error loading assessments from server.");
      }
    };

    const fetchCandidates = async () => {
      try {
        const response = await api.get('/api/candidates');
        if (response.data && Array.isArray(response.data)) {
          setCandidates(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch candidates from backend:", err);
        showToast("Error loading candidates from server.");
      }
    };

    fetchAssessments();
    fetchCandidates();
  }, []);

  // Sidebar navigation state
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search, filter, and sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [sortBy, setSortBy] = useState('newest');

  // Interactive UI Drawer states
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Candidate Pagination & Dropdown states
  const [candidatePage, setCandidatePage] = useState(1);
  const [assignSearch, setAssignSearch] = useState('');
  const [selectedAssignCandidate, setSelectedAssignCandidate] = useState(null);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [assigningAssessment, setAssigningAssessment] = useState(null);

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
  }, [searchQuery, selectedStatus, candidates.length]);

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

  const handleDeleteTopic = (subject, topic) => {
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

  const renderAddTopicControl = (subject) => {
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
  const [previewQuestions, setPreviewQuestions] = useState([
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

  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Dynamic states for active assessments metric count
  const [activeAssessmentsCount, setActiveAssessmentsCount] = useState(18);

  // AI-generated questions list (starts with default demo questions, updated on AI generation)
  const [generatedQuestions, setGeneratedQuestions] = useState([
    {
      id: 1,
      type: 'SCENARIO_CODING',
      subject: 'Python',
      topic: 'Functions & Strings',
      difficulty: 'Medium',
      estimatedTime: '15 Minutes',
      question: 'Write a Python function that checks whether a given string is a palindrome without using Python\'s built-in reverse methods.',
      problemStatement: 'Write a Python function that checks whether a given string is a palindrome without using Python\'s built-in reverse methods.',
      exampleInput: 'madam',
      exampleOutput: 'True',
      constraints: ['Length <= 1000', 'Ignore Case', 'Ignore Spaces'],
      expectedAnswer: 'def is_palindrome(text):\n    cleaned = text.replace(" ","").lower()\n    return cleaned == cleaned[::-1]',
      explanation: 'The input string is first converted into lowercase and spaces are removed. The cleaned string is then compared with its reversed version.',
      isSaved: false
    },
    {
      id: 2,
      type: 'SCENARIO_CODING',
      subject: 'SQL',
      topic: 'Window Functions & Subqueries',
      difficulty: 'Hard',
      estimatedTime: '20 Minutes',
      question: 'Find the second highest salary from an Employee table without using the LIMIT clause.',
      problemStatement: 'Write an SQL query to find the second highest salary from the Employee table. If there is no second highest salary, the query should return NULL. Do not use the LIMIT or OFFSET clauses.',
      exampleInput: 'Employee Table:\n+----+--------+\n| Id | Salary |\n+----+--------+\n| 1  | 100    |\n| 2  | 200    |\n| 3  | 300    |\n+----+--------+',
      exampleOutput: '+---------------------+\n| SecondHighestSalary |\n+---------------------+\n| 200                 |\n+---------------------+',
      constraints: ['Do not use LIMIT', 'Do not use OFFSET', 'Handle duplicates gracefully', 'Return NULL if no second highest exists'],
      expectedAnswer: 'SELECT MAX(Salary) AS SecondHighestSalary\nFROM Employee\nWHERE Salary < (SELECT MAX(Salary) FROM Employee);',
      explanation: 'The subquery finds the maximum salary in the Employee table. The outer query then finds the maximum salary that is strictly less than the absolute maximum salary, effectively yielding the second highest salary.',
      isSaved: false
    },
    {
      id: 3,
      type: 'MCQ',
      subject: 'Python',
      topic: 'Generators & Decorators',
      difficulty: 'Medium',
      estimatedTime: '5 Minutes',
      question: 'Which keyword is used to define a generator function in Python?',
      options: ['return', 'yield', 'async', 'lambda'],
      correctAnswer: 'yield',
      explanation: 'The yield keyword is used to return a value from a generator function, pausing its execution and maintaining its local state.',
      isSaved: false
    },
    {
      id: 4,
      type: 'MCQ',
      subject: 'Python',
      topic: 'Exception Handling',
      difficulty: 'Easy',
      estimatedTime: '5 Minutes',
      question: 'A developer wants to read a file that may not exist. The application should handle this gracefully without crashing and log a warning. Which approach is the best?',
      options: [
        'Ignore the error',
        'Use try-except block to catch FileNotFoundError',
        'Use a while loop to check continuously',
        'Restart the application when error occurs'
      ],
      correctAnswer: 'Use try-except block to catch FileNotFoundError',
      explanation: 'Using try-except allows the application to intercept specific exceptions like FileNotFoundError, handle them (e.g., logging a warning), and resume normal execution.',
      isSaved: false
    }
  ]);

  // Dropdown open states
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Statistics data (dynamic active assessments)
  const stats = [
    { label: 'Total Candidates', value: (Array.isArray(candidates) ? candidates.length : 0).toString(), change: '+12% this week', icon: Users },
    { label: 'Active Assessments', value: activeAssessmentsCount.toString(), change: '+2 new today', icon: Briefcase },
    { label: 'Completion Rate', value: '84.5%', change: '+3% avg. rate', icon: TrendingUp },
    { label: 'Average Score', value: '78.2%', change: '+1.4% improvement', icon: Award },
  ];

  // List of roles and statuses for filters
  const statuses = ['All Statuses', 'Completed', 'In Progress', 'Under Review', 'Failed'];

  // Handle Search, Filters, and Sorting
  const filteredCandidates = (Array.isArray(candidates) ? candidates : [])
    .filter(candidate => {
      const nameVal = (candidate.full_name || candidate.name || '').toLowerCase();
      const emailVal = (candidate.email || '').toLowerCase();

      const matchesSearch = nameVal.includes(searchQuery.toLowerCase()) ||
        emailVal.includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'All Statuses' || (candidate.status || 'Active') === selectedStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        const dateB = b.created_at ? new Date(b.created_at) : new Date(b.date || 0);
        const dateA = a.created_at ? new Date(a.created_at) : new Date(a.date || 0);
        return dateB - dateA;
      }
      if (sortBy === 'score-high') {
        return (b.final || 0) - (a.final || 0);
      }
      if (sortBy === 'score-low') {
        return (a.final || 0) - (b.final || 0);
      }
      return 0;
    });

  const candidatesPerPage = 5;
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage) || 1;
  const paginatedCandidates = filteredCandidates.slice(
    (candidatePage - 1) * candidatesPerPage,
    candidatePage * candidatesPerPage
  );

  // Action: Create Assessment (legacy submit)
  const handleCreateAssessmentSubmit = (e) => {
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

    const payload = {
      title: assessmentTitle || `${selectedSubjects.join(' & ')} Technical Assessment`,
      subjects: selectedSubjects,
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
    setIsGenerating(true);

    try {
      const response = await api.post('/api/assessment/generate', payload);

      if (response.data && response.data.questions) {
        const data = response.data;
        const formatted = data.questions.map((q, idx) => ({
          id: idx + 1,
          subject: q.subject,
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
        showToast(`Successfully generated assessment containing ${formatted.length} questions across ${selectedSubjects.join(', ')}!`);
        setActiveAssessmentsCount(prev => prev + 1);

        setActiveTab('preview-questions');
      } else {
        throw new Error('Invalid questions format returned from backend');
      }
    } catch (err) {
      console.error("AI assessment generation failed:", err);
      const errMsg = err.response?.data?.detail || err.message || err;
      showToast(`Error: ${errMsg}. Falling back to preview...`);
      setActiveTab('preview-questions');
    } finally {
      setIsGenerating(false);
    }
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
        setSavedAssessments(prev => [savedAsm, ...prev]);
        showToast('Assessment saved successfully!');
        setActiveAssessmentsCount(prev => prev + 1);

        if (andAssign) {
          setAssigningAssessment(savedAsm);
          setActiveTab('assessments');
        } else {
          setActiveTab('assessments');
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
          // Refresh saved assessments
          const assessmentsRes = await api.get('/api/assessment');
          if (assessmentsRes.data) {
            setSavedAssessments(assessmentsRes.data);
          }
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

  const getHeaderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Recruiter Workspace',
          tag: 'v1.2',
          subtitle: 'Analyze candidate assessments and coordinate evaluation flows.'
        };
      case 'create-assessment':
        return {
          title: 'Create Assessment',
          tag: 'AI Generator',
          subtitle: 'Select topics by subject. AI will generate questions automatically.'
        };
      case 'preview-questions':
        return {
          title: 'Assessment Preview',
          tag: 'QA Mode',
          subtitle: 'Review AI-generated questions before saving and assigning to candidates.'
        };
      case 'assessments':
        return {
          title: 'Saved Assessments',
          tag: 'Pool',
          subtitle: 'Manage, view, and assign generated assessments for candidate evaluation.'
        };
      default:
        return {
          title: 'Recruiter Workspace',
          tag: 'v1.2',
          subtitle: 'Coordinate evaluation flows.'
        };
    }
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

      {/* 1. SIDEBAR (Full-Height Solid Layout) */}
      <aside className="hidden lg:flex flex-col w-[260px] h-screen shrink-0 bg-dash-sidebar-bg pt-8 pb-8 pl-6 pr-0 relative z-30 text-dash-white-card shadow-[4px_0_24px_rgba(0,0,0,0.03)] justify-between">
        <div>
          {/* Branding */}
          <div className="flex items-center gap-3 px-2 py-4 mb-6">
            <div className="w-9 h-9 rounded-xl bg-dash-primary-purple flex items-center justify-center shadow-md">
              <span className="font-outfit font-extrabold text-dash-white-card text-lg tracking-wider">R</span>
            </div>
            <div>
              <h1 className="font-outfit font-bold text-base tracking-tight text-dash-white-card leading-none">RecruitAI</h1>
              <span className="text-[10px] text-dash-light-purple font-medium tracking-widest uppercase">Recruiter Portal</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
              { id: 'create-assessment', label: 'Create Assessment', icon: Plus },
              { id: 'preview-questions', label: 'Preview Questions', icon: FileText },
              { id: 'assessments', label: 'Assessments', icon: Save },
              { id: 'results', label: 'Results', icon: Award },
              { id: 'groups', label: 'Candidate Groups', icon: Users },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-l-[24px] rounded-r-none text-sm font-bold transition-all duration-300 relative group ${isActive
                    ? 'sidebar-active-tab shadow-sm'
                    : 'text-dash-light-purple hover:text-dash-white-card hover:bg-dash-primary-purple/20'
                    }`}
                >
                  <Icon size={18} className="relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Recruiter Sidebar Animation */}
          <div className="flex items-center justify-center -mt-3 px-4">
            <div className="w-56 h-56 flex items-center justify-center overflow-hidden">
              <DotLottieReact
                src="https://lottie.host/5521a48e-619e-490f-a9b2-f4fb0386526e/5IWtyksCcc.lottie"
                loop
                autoplay
                style={{ width: '100%', height: '100%', transform: 'scale(1.35)', transformOrigin: 'center center' }}
              />
            </div>
          </div>
        </div>

        {/* User Profile, Logout & Cookies Button */}
        <div className="space-y-4">
          <div className="border-t border-dash-border-gray/25 pt-4 px-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-dash-primary-purple flex items-center justify-center font-semibold text-dash-white-card">
                RA
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-semibold text-dash-white-card truncate">Recruiter Admin</h4>
                <span className="text-[10px] text-dash-light-purple truncate block">Recruiter</span>
              </div>
            </div>
          </div>

          <div className="px-2 flex flex-col gap-2.5">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-dash-light-purple hover:bg-dash-primary-purple/20 transition-all duration-200 cursor-pointer"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>



            {/* Cookie Manager Button matching image */}
            <button
              onClick={() => showToast('Cookie preferences updated!')}
              className="w-full text-left px-3 py-2 rounded-lg bg-dash-white-card border border-dash-border-gray hover:bg-dash-soft-pink text-dash-dark-purple text-[10px] font-bold transition-all duration-200 cursor-pointer shadow-sm"
            >
              Manage cookies or opt out
            </button>

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
            className="fixed top-0 bottom-0 left-0 w-[270px] pt-6 pb-6 pl-6 pr-0 z-50 lg:hidden flex flex-col bg-dash-sidebar-bg text-dash-white-card border-r border-dash-border-gray/25"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-dash-primary-purple flex items-center justify-center">
                  <span className="font-outfit font-extrabold text-dash-white-card text-base">R</span>
                </div>
                <h1 className="font-outfit font-bold text-base text-dash-white-card">RecruitAI</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-dash-primary-purple/20 text-dash-light-purple hover:text-dash-white-card"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-1 flex-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
                { id: 'create-assessment', label: 'Create Assessment', icon: Plus },
                { id: 'preview-questions', label: 'Preview Questions', icon: FileText },
                { id: 'assessments', label: 'Assessments', icon: Save },
                { id: 'results', label: 'Results', icon: Award },
                { id: 'groups', label: 'Candidate Groups', icon: Users },
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
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-l-[24px] rounded-r-none text-sm font-bold transition-all duration-200 ${isActive
                      ? 'sidebar-active-tab shadow-sm'
                      : 'text-dash-light-purple hover:text-dash-white-card hover:bg-dash-primary-purple/20'
                      }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-dash-border-gray/25 pt-4 space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="w-9 h-9 rounded-full bg-dash-primary-purple flex items-center justify-center font-semibold text-dash-white-card">
                  RA
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-dash-white-card">Recruiter Admin</h4>
                  <span className="text-[10px] text-dash-light-purple">Recruiter</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-dash-light-purple hover:bg-dash-primary-purple/20 transition-all duration-200"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 relative z-20 overflow-y-auto h-screen max-h-screen">
        {/* HEADER SECTION */}
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

          <div className="flex items-center gap-3.5 self-end sm:self-auto">
            {activeTab === 'preview-questions' ? (
              <>
                <button
                  onClick={() => setActiveTab('create-assessment')}
                  className="px-4 py-2 rounded-xl border border-dash-border-gray hover:bg-dash-soft-pink text-dash-dark-purple text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2"
                >
                  <span>← Back</span>
                </button>
                <button
                  onClick={() => handleSaveAssessment(false)}
                  className="px-4 py-2 rounded-xl border border-dash-primary-purple text-dash-primary-purple text-xs font-bold hover:bg-dash-primary-purple/5 transition-all duration-200 cursor-pointer flex items-center gap-2 bg-dash-white-card"
                >
                  <Save size={14} />
                  <span>Save</span>
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSaveAssessment(true)}
                  className="px-4.5 py-2.5 rounded-xl bg-dash-primary-purple border border-dash-primary-purple text-dash-white-card font-bold text-sm cursor-pointer shadow-md hover:bg-dash-dark-purple hover:border-dash-dark-purple transition-all duration-300 flex items-center gap-2"
                >
                  <Check size={16} strokeWidth={2.5} />
                  <span>Save & Assign</span>
                </motion.button>
              </>
            ) : (
              <>
                {/* Notifications */}
                <button className="relative p-2.5 rounded-xl bg-dash-white-card border border-dash-border-gray text-dash-primary-purple hover:bg-dash-soft-pink transition-all duration-300 hover:scale-105">
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-dash-primary-purple animate-pulse" />
                  <Bell size={18} />
                </button>

                {/* Create Assessment Button (Primary Purple style) */}
                {activeTab !== 'create-assessment' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('create-assessment')}
                    className="px-4.5 py-2.5 rounded-xl bg-dash-primary-purple border border-dash-primary-purple text-dash-white-card font-bold text-sm cursor-pointer shadow-md hover:bg-dash-dark-purple hover:border-dash-dark-purple transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Create Assessment</span>
                  </motion.button>
                )}
              </>
            )}
          </div>
        </header>

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
            <section className="bg-dash-white-card border border-dash-border-gray rounded-[20px] shadow-sm flex-1 flex flex-col overflow-hidden">

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

                {/* Filter Dropdowns */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">



                  {/* Status Select */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setStatusDropdownOpen(!statusDropdownOpen);
                        setRoleDropdownOpen(false);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-dash-white-card border border-dash-border-gray text-xs font-bold text-dash-dark-purple flex items-center gap-2 hover:border-dash-primary-purple transition-all duration-200 cursor-pointer"
                    >
                      <span className="text-dash-light-purple font-medium">Status:</span>
                      <span>{selectedStatus}</span>
                      <SlidersHorizontal size={12} className="text-dash-primary-purple" />
                    </button>

                    <AnimatePresence>
                      {statusDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setStatusDropdownOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-44 rounded-xl bg-dash-white-card border border-dash-border-gray shadow-lg z-50 py-1 overflow-hidden"
                          >
                            {statuses.map((status) => (
                              <button
                                key={status}
                                onClick={() => {
                                  setSelectedStatus(status);
                                  setStatusDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-dash-dark-purple hover:bg-dash-soft-pink flex items-center justify-between cursor-pointer border-none"
                              >
                                <span>{status}</span>
                                {selectedStatus === status && <Check size={12} className="text-dash-primary-purple" />}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sort Selector */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-2.5 py-2 rounded-lg bg-dash-white-card border border-dash-border-gray text-xs font-bold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple cursor-pointer hover:border-dash-primary-purple transition-all duration-200"
                  >
                    <option value="newest">Date Applied</option>
                    <option value="score-high">Score: High to Low</option>
                    <option value="score-low">Score: Low to High</option>
                  </select>

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
              <div className="flex-1 overflow-x-auto dashboard-scrollbar">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
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
                      <th className="px-6 py-4.5">Full Name</th>
                      <th className="px-6 py-4.5">Email Address</th>
                      <th className="px-6 py-4.5">Phone Number</th>
                      <th className="px-6 py-4.5">Registration Date</th>
                      <th className="px-6 py-4.5">Status</th>
                      <th className="px-6 py-4.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dash-border-gray">
                    <AnimatePresence mode="popLayout">
                      {paginatedCandidates.map((candidate) => {
                        const regDate = candidate.created_at
                          ? new Date(candidate.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : (candidate.date || 'N/A');

                        const isCompleted = candidate.status === 'Completed';
                        let statusColor = isCompleted ? '#149470' : '#5752AA';
                        let statusBg = isCompleted ? 'rgba(20, 148, 112, 0.1)' : 'rgba(87, 82, 170, 0.1)';

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
                            {/* Full Name */}
                            <td className="px-6 py-4">
                              <h4 className="text-xs font-bold text-dash-dark-purple group-hover:text-dash-primary-purple transition-colors duration-200">
                                {candidate.full_name || candidate.name}
                              </h4>
                            </td>

                            {/* Email Address */}
                            <td className="px-6 py-4 text-xs font-semibold text-dash-dark-purple">
                              {candidate.email}
                            </td>

                            {/* Phone Number */}
                            <td className="px-6 py-4 text-xs font-semibold text-dash-light-purple">
                              {candidate.phone || 'N/A'}
                            </td>

                            {/* Registration Date */}
                            <td className="px-6 py-4 text-xs font-semibold text-dash-light-purple">
                              {regDate}
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4">
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border"
                                style={{
                                  borderColor: `${statusColor}30`,
                                  backgroundColor: statusBg,
                                  color: statusColor,
                                }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: statusColor }}
                                />
                                {candidate.status || 'Active'}
                              </span>
                            </td>

                             {/* Actions / Report & Delete */}
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedCandidate(candidate)}
                                  className="px-3 py-1.5 rounded-lg bg-dash-white-card border border-dash-border-gray hover:border-dash-primary-purple text-dash-primary-purple text-xs font-bold hover:bg-dash-soft-pink transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Eye size={13} />
                                  <span>Report</span>
                                </button>
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
                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-dash-light-purple">
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
                        className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center font-bold text-xs border transition-colors cursor-pointer ${
                          candidatePage === page
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
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 ${
                          isSelected
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
                            onChange={() => {}}
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
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                    isQuestionDistValid
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
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                    isDifficultyDistValid
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
            showToast={showToast}
            setActiveTab={setActiveTab}
            setSelectedAssessmentForView={setSelectedAssessmentForView}
            onAssignClick={setAssigningAssessment}
          />
        )}

        {/* 9. RESULTS TAB SCREEN */}
        {activeTab === 'results' && (
          <ResultsManager
            showToast={showToast}
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
                        { name: 'English Score', value: selectedCandidate.english },
                        { name: 'Final Score', value: selectedCandidate.final }
                      ].map((skill) => (
                        <div key={skill.name}>
                          <div className="flex justify-between text-xs font-medium mb-1.5">
                            <span className="text-dash-light-purple">{skill.name}</span>
                            <span className="text-dash-dark-purple font-bold">{skill.value}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-dash-soft-pink overflow-hidden">
                            <div
                              className="h-full bg-dash-primary-purple rounded-full"
                              style={{ width: `${skill.value}%` }}
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
                        setSavedAssessments(assessmentsRes.data);
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
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-dash-primary-purple text-dash-white-card text-xs font-bold hover:bg-dash-dark-purple transition-colors cursor-pointer border-none shadow-md animate-pulse"
                  >
                    Assign Assessment
                  </button>
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

const QuestionPreviewHub = ({ generatedQuestions, setGeneratedQuestions, showToast, onSave, onSaveAndAssign }) => {
  const [selectedId, setSelectedId] = useState(generatedQuestions[0]?.id || null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

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

  const selectedQuestion = generatedQuestions.find(q => q.id === selectedId);

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
        marks: selectedQuestion.marks || 10
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

  const handleSaveQuestionToggle = (qId) => {
    setGeneratedQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        const nextSaved = !q.isSaved;
        showToast(nextSaved ? "Question saved to assessment pool!" : "Question removed from saved pool.");
        return { ...q, isSaved: nextSaved };
      }
      return q;
    }));
  };

  const handleDeleteQuestion = (qId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this question?");
    if (!confirmDelete) return;

    const remaining = generatedQuestions.filter(q => q.id !== qId);
    setGeneratedQuestions(remaining);
    showToast("Question deleted from pool.");

    // Select another question
    if (remaining.length > 0) {
      setSelectedId(remaining[0].id);
    } else {
      setSelectedId(null);
    }
  };

  // Simulates AI regeneration of the question
  const handleRegenerateQuestion = (qId) => {
    setIsGenerating(true);
    showToast("Generating alternative scenario with AI...");

    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedQuestions(prev => prev.map(q => {
        if (q.id === qId) {
          if (q.type?.includes('CODING') || q.type === 'SCENARIO_CODING' || q.type === 'SCENARIO') {
            if (q.subject === 'Python') {
              return {
                ...q,
                question: 'Write a Python function to find the length of the longest substring without repeating characters.',
                problemStatement: 'Write a Python function to find the length of the longest substring without repeating characters.',
                exampleInput: 'abcabcbb',
                exampleOutput: '3',
                constraints: ['Length <= 5 * 10^4', 'ASCII characters only', 'Time complexity O(N)'],
                expectedAnswer: 'def length_of_longest_substring(s):\n    char_map = {}\n    max_len = start = 0\n    for idx, char in enumerate(s):\n        if char in char_map and char_map[char] >= start:\n            start = char_map[char] + 1\n        char_map[char] = idx\n        max_len = max(max_len, idx - start + 1)\n    return max_len',
                explanation: 'A sliding window approach is used. The start pointer is moved to one position past the last occurrence of the duplicate character when a duplicate is found in the current window.',
                difficulty: 'Hard',
                estimatedTime: '20 Minutes'
              };
            } else {
              // SQL
              return {
                ...q,
                question: 'Write an SQL query to find employees who have the highest salary in each of the departments.',
                problemStatement: 'Write an SQL query to find employees who have the highest salary in each of the departments. Return the Department, Employee name, and Salary.',
                exampleInput: 'Employee Table:\n+----+-------+--------+--------------+\n| Id | Name  | Salary | DepartmentId |\n+----+-------+--------+--------------+\n| 1  | Joe   | 70000  | 1            |\n| 2  | Jim   | 90000  | 1            |\n| 3  | Henry | 80000  | 2            |\n| 4  | Sam   | 60000  | 2            |\n+----+-------+--------+--------------+\n\nDepartment Table:\n+----+-------+\n| Id | Name  |\n+----+-------+\n| 1  | IT    |\n| 2  | Sales |\n+----+-------+',
                exampleOutput: '+------------+----------+--------+\n| Department | Employee | Salary |\n+------------+----------+--------+\n| IT         | Jim      | 90000  |\n| Sales      | Henry    | 80000  |\n+------------+----------+--------+',
                constraints: ['Handle department empty cases', 'Include multiple employees if salaries tie'],
                expectedAnswer: 'SELECT d.Name AS Department, e.Name AS Employee, e.Salary\nFROM Employee e\nJOIN Department d ON e.DepartmentId = d.Id\nWHERE (e.DepartmentId, e.Salary) IN (\n    SELECT DepartmentId, MAX(Salary)\n    FROM Employee\n    GROUP BY DepartmentId\n);',
                explanation: 'The query joins the Employee and Department tables. It filters rows where the employee\'s department and salary match the department maximum salary computed in the subquery.',
                difficulty: 'Medium',
                estimatedTime: '15 Minutes'
              };
            }
          } else {
            // MCQ
            return {
              ...q,
              question: 'Which of the following is correct about Python decorators?',
              options: [
                'Decorators are function modifiers that alter a function dynamically',
                'Decorators must always return the input function unmodified',
                'Decorators can only be applied to class methods, not plain functions',
                'Decorators are executed every time the decorated function is called'
              ],
              correctAnswer: 'Decorators are function modifiers that alter a function dynamically',
              explanation: 'Decorators allow wrapping another function to extend the behavior of the wrapped function without permanently modifying it.',
              difficulty: 'Hard'
            };
          }
        }
        return q;
      }));
      showToast("Question successfully regenerated with alternative AI scenario!");
    }, 1200);
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    
    let parsedHiddenTestCases = [];
    try {
      parsedHiddenTestCases = JSON.parse(editForm.hiddenTestCases || '[]');
      if (!Array.isArray(parsedHiddenTestCases)) {
        showToast("Hidden test cases must be a JSON array.");
        return;
      }
    } catch (err) {
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
          marks: parseFloat(editForm.marks) || 10
        };
      }
      return q;
    }));
    setIsEditing(false);
    showToast("Changes saved successfully!");
  };

  const filteredQuestions = generatedQuestions.filter(q => {
    const query = searchQuery.toLowerCase();
    const qText = (q.question || q.problemStatement || '').toLowerCase();
    const qSub = (q.subject || '').toLowerCase();
    const qTopic = (q.topic || '').toLowerCase();
    return qText.includes(query) || qSub.includes(query) || qTopic.includes(query);
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Assessment Question Pool Sub-Header */}
      <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-5 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-outfit font-extrabold text-base text-dash-dark-purple">
            Confirm AI Assessment Question Pool
          </h3>
          <p className="text-xs text-dash-light-purple font-medium mt-1">
            Review the questions generated by AI before finalizing and assigning.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
      {/* LEFT PANEL: QUESTION LIST POOL */}
      <div className="lg:col-span-4 bg-dash-white-card border border-dash-border-gray rounded-[24px] p-5 shadow-[0_4px_20px_rgba(87,82,170,0.02)] flex flex-col gap-4 min-h-[450px] lg:h-[720px]">
        <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-dash-primary-purple animate-pulse" />
            <h3 className="font-outfit font-extrabold text-sm text-dash-dark-purple uppercase tracking-wider">
              AI Question Pool
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

        {/* Add Custom Question Button */}
        <button
          onClick={() => {
            const newQ = {
              id: 'custom-' + Date.now(),
              subject: 'Python',
              topic: 'General',
              type: 'PYTHON_CODING',
              difficulty: 'Medium',
              question: 'Write a Python function to...',
              correctAnswer: 'def solution():\n    pass\n\nif __name__ == "__main__":\n    solution()',
              exampleInput: '',
              exampleOutput: '',
              inputFormat: '',
              outputFormat: '',
              constraints: [],
              sampleInput: '',
              sampleOutput: '',
              hiddenTestCases: [],
              marks: 10,
              isSaved: true
            };
            setGeneratedQuestions(prev => [...prev, newQ]);
            setSelectedId(newQ.id);
            setIsEditing(true);
            showToast("Custom Python Coding question created!");
          }}
          className="w-full py-2 bg-dash-primary-purple/10 border border-dash-primary-purple/30 text-dash-primary-purple font-bold text-xs rounded-xl hover:bg-dash-primary-purple/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer border-dashed"
        >
          <Plus size={12} strokeWidth={3} />
          <span>Add Custom Question</span>
        </button>

        {/* Question List container */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 dashboard-scrollbar">
          {filteredQuestions.map((q, idx) => {
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
                    {isCoding ? 'Scenario Coding' : 'MCQ'} #{actualIndex}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${diffColor}`}>
                      {q.difficulty}
                    </span>
                    {q.isSaved && (
                      <CheckCircle className="w-3.5 h-3.5 text-dash-success-green" fill="currentColor" stroke="white" strokeWidth={2.5} />
                    )}
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

      {/* RIGHT PANEL: SCENARIO-BASED PREVIEW CARD / EDIT INTERFACE */}
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
              Select an AI generated question from the pool on the left to preview and customize it.
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
                  <div>
                    <label className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider block mb-1">Hidden Test Cases (JSON Array of input/output objects)</label>
                    <textarea
                      rows="3"
                      value={editForm.hiddenTestCases}
                      onChange={(e) => setEditForm(prev => ({ ...prev, hiddenTestCases: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono text-slate-700 focus:outline-none focus:border-dash-primary-purple resize-y"
                      placeholder='[\n  {"input": "racecar", "output": "True"},\n  {"input": "hello", "output": "False"}\n]'
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
              {/* Loader overlay for Simulated AI Regeneration */}
              {isGenerating && (
                <div className="absolute inset-0 bg-dash-white-card/90 z-20 flex flex-col items-center justify-center gap-3 animate-fade-in">
                  <div className="p-3 rounded-full bg-dash-primary-purple/10 text-dash-primary-purple animate-spin">
                    <Sparkles size={28} />
                  </div>
                  <span className="text-xs font-bold text-dash-primary-purple font-outfit uppercase tracking-widest animate-pulse">
                    AI Generating Scenario...
                  </span>
                </div>
              )}

              {/* Preview Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-dash-border-gray/25 pb-3">
                <div>
                  <span className="text-[10px] text-dash-primary-purple font-extrabold tracking-widest uppercase font-outfit">
                    {selectedQuestion.type === 'PYTHON_CODING' ? 'Python Coding Question' : (selectedQuestion.type === 'MCQ' ? 'Multiple Choice Question' : 'Scenario Based Question')}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-outfit font-extrabold text-base text-dash-dark-purple">
                      Previewing Question Details
                    </span>
                    {selectedQuestion.isSaved && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-dash-success-green/10 text-dash-success-green border border-dash-success-green/20 flex items-center gap-1">
                        <Check size={10} strokeWidth={3} />
                        Saved
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-dash-light-purple">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-dash-dark-purple/80 bg-dash-light-blue-bg border border-dash-border-gray/30 px-2.5 py-1 rounded-xl">
                    <BookOpen size={12} className="text-dash-primary-purple" />
                    {selectedQuestion.subject}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-dash-dark-purple/80 bg-dash-light-blue-bg border border-dash-border-gray/30 px-2.5 py-1 rounded-xl">
                    <Clock size={12} className="text-dash-primary-purple" />
                    {selectedQuestion.estimatedTime || '15 Minutes'}
                  </span>
                </div>
              </div>

              {/* Premium Question Card Details Metadata Block */}
              <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray/40 rounded-2xl p-4.5 grid grid-cols-3 gap-4 items-center">
                <div>
                  <span className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider block mb-1">
                    Question No
                  </span>
                  <span className="text-xs font-extrabold text-dash-dark-purple font-outfit">
                    {generatedQuestions.findIndex(q => q.id === selectedId) + 1}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider block mb-1">
                    Category
                  </span>
                  <span className="text-xs font-extrabold text-dash-dark-purple font-outfit">
                    {selectedQuestion.subject}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider block mb-1">
                    Estimated Time
                  </span>
                  <span className="text-xs font-extrabold text-dash-dark-purple font-outfit">
                    {selectedQuestion.estimatedTime || '15 Minutes'}
                  </span>
                </div>

                <div className="col-span-3 pt-3.5 mt-1.5 border-t border-dash-border-gray/40 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider">
                    Difficulty Level
                  </span>
                  <div className="flex items-center gap-1 bg-dash-white-card border border-dash-border-gray/80 p-0.5 rounded-lg">
                    {['Easy', 'Medium', 'Hard'].map((lvl) => {
                      const isActive = selectedQuestion.difficulty === lvl;
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
                          onClick={() => handleDifficultyChange(selectedQuestion.id, lvl)}
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
                {/* 1. Problem Statement */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-extrabold text-dash-primary-purple uppercase tracking-wider">
                    Problem Statement
                  </h4>
                  <p className="text-xs font-semibold text-dash-dark-purple leading-relaxed bg-dash-white-card border border-dash-border-gray/40 p-4 rounded-2xl shadow-[0_2px_8px_rgba(87,82,170,0.01)] select-text">
                    {selectedQuestion.problemStatement || selectedQuestion.question || selectedQuestion.scenario}
                  </p>
                </div>

                {/* MCQ Options Display (for MCQ type) */}
                {!(selectedQuestion.type?.includes('CODING') || selectedQuestion.type === 'SCENARIO_CODING' || selectedQuestion.type === 'SCENARIO') && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-extrabold text-dash-primary-purple uppercase tracking-wider">
                      Options & Correct Answer
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {selectedQuestion.options?.map((opt, idx) => {
                        const isCorrect = opt === selectedQuestion.correctAnswer;
                        const label = ['A', 'B', 'C', 'D'][idx] || '';
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

                {/* Example Input / Output (only for coding scenario) */}
                {selectedQuestion.type === 'PYTHON_CODING' ? (
                  <div className="space-y-3.5 bg-slate-50 border border-slate-200/50 rounded-2xl p-4 shadow-[0_2px_8px_rgba(87,82,170,0.01)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-200/40 pb-3">
                      <div>
                        <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Input Format:</span>
                        <p className="text-xs font-semibold text-slate-700">{selectedQuestion.inputFormat || "N/A"}</p>
                      </div>
                      <div>
                        <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Output Format:</span>
                        <p className="text-xs font-semibold text-slate-700">{selectedQuestion.outputFormat || "N/A"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sample Input</span>
                        <pre className="bg-white border border-slate-200 rounded-xl p-2.5 font-mono text-[11px] text-slate-700 whitespace-pre-wrap select-text">{selectedQuestion.sampleInput || "N/A"}</pre>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sample Output</span>
                        <pre className="bg-white border border-slate-200 rounded-xl p-2.5 font-mono text-[11px] text-slate-700 whitespace-pre-wrap select-text">{selectedQuestion.sampleOutput || "N/A"}</pre>
                      </div>
                    </div>
                    {selectedQuestion.hiddenTestCases && selectedQuestion.hiddenTestCases.length > 0 && (
                      <div className="space-y-1 mt-2 border-t border-slate-200/40 pt-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Hidden Test Cases Configured</span>
                        <span className="text-xs font-bold text-dash-primary-purple bg-dash-primary-purple/10 px-3 py-1 rounded-md border border-dash-primary-purple/10">{selectedQuestion.hiddenTestCases.length} Test Cases</span>
                      </div>
                    )}
                  </div>
                ) : (selectedQuestion.type?.includes('CODING') || selectedQuestion.type === 'SCENARIO_CODING' || selectedQuestion.type === 'SCENARIO') ? (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-extrabold text-dash-primary-purple uppercase tracking-wider">
                      Example
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Input Box */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-dash-light-purple uppercase tracking-wider">Input</span>
                        <div className="bg-[#fafafc] border border-dash-border-gray/50 rounded-xl p-3 font-mono text-[11px] text-dash-dark-purple flex items-center gap-2">
                          <Terminal size={12} className="text-dash-light-purple shrink-0" />
                          <span className="select-text whitespace-pre-wrap">{selectedQuestion.exampleInput || 'No input details'}</span>
                        </div>
                      </div>
                      {/* Output Box */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-dash-light-purple uppercase tracking-wider">Output</span>
                        <div className="bg-[#fafafc] border border-dash-border-gray/50 rounded-xl p-3 font-mono text-[11px] text-dash-dark-purple flex items-center gap-2">
                          <Play size={12} className="text-dash-light-purple shrink-0" />
                          <span className="select-text whitespace-pre-wrap">{selectedQuestion.exampleOutput || 'No output details'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Constraints (only for coding scenario) */}
                {(selectedQuestion.type?.includes('CODING') || selectedQuestion.type === 'SCENARIO_CODING' || selectedQuestion.type === 'SCENARIO') && selectedQuestion.constraints && selectedQuestion.constraints.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-extrabold text-dash-primary-purple uppercase tracking-wider">
                      Constraints
                    </h4>
                    <div className="bg-[#fefaf6] border border-[#f59e0b]/15 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
                      {selectedQuestion.constraints.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-semibold text-dash-dark-purple/85">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expected Answer (Code Box or correct option) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-extrabold text-dash-primary-purple uppercase tracking-wider">
                      {selectedQuestion.type === 'MCQ' ? 'Correct Answer Details' : 'Expected Answer'}
                    </h4>
                    {selectedQuestion.expectedAnswer && (
                      <button
                        onClick={() => handleCopyCode(selectedQuestion.expectedAnswer, selectedQuestion.id)}
                        className="px-2.5 py-1 rounded-lg border border-dash-border-gray text-[9px] font-bold text-dash-primary-purple hover:bg-dash-soft-pink transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === selectedQuestion.id ? (
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

                  {selectedQuestion.type === 'MCQ' ? (
                    <div className="bg-green-50/40 border border-green-200 text-green-700 rounded-xl p-3.5 font-semibold text-xs flex items-center gap-2">
                      <CheckCircle className="text-green-600 shrink-0" size={16} />
                      <span>{selectedQuestion.correctAnswer}</span>
                    </div>
                  ) : (
                    <div className="bg-[#fafafc] border border-dash-border-gray/50 rounded-2xl p-4.5 overflow-hidden shadow-inner border-l-4 border-l-dash-primary-purple relative">
                      <div className="absolute right-3.5 top-3.5 text-[9px] font-bold text-dash-light-purple/60 font-mono uppercase tracking-wider select-none">
                        python
                      </div>
                      <SyntaxHighlighter
                        code={selectedQuestion.expectedAnswer}
                        language={selectedQuestion.subject.toLowerCase() === 'sql' ? 'sql' : 'python'}
                      />
                    </div>
                  )}
                </div>

                {/* Explanation */}
                {selectedQuestion.explanation && (
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

            {/* Preview Action Buttons Footer */}
            <div className="flex items-center gap-3 border-t border-dash-border-gray/25 pt-4 mt-4">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1 py-3 rounded-xl border border-dash-border-gray/80 hover:bg-dash-soft-pink text-dash-dark-purple font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 size={13} />
                <span>Edit Question</span>
              </button>

              <button
                type="button"
                onClick={() => handleRegenerateQuestion(selectedQuestion.id)}
                className="flex-1 py-3 rounded-xl border border-dash-primary-purple/20 hover:border-dash-primary-purple/40 bg-dash-primary-purple/5 hover:bg-dash-primary-purple/10 text-dash-primary-purple font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={13} />
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={() => handleDeleteQuestion(selectedQuestion.id)}
                className="py-3 px-4 rounded-xl border border-red-200 hover:border-red-300 bg-red-50/50 hover:bg-red-50 text-red-600 font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                title="Delete Question"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveQuestionToggle(selectedQuestion.id)}
                className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 border cursor-pointer ${selectedQuestion.isSaved
                    ? 'bg-dash-success-green border-dash-success-green text-dash-white-card shadow-sm hover:opacity-90'
                    : 'bg-dash-primary-purple border-dash-primary-purple text-dash-white-card shadow-md hover:bg-dash-dark-purple hover:border-dash-dark-purple shadow-[0_4px_12px_rgba(87,82,170,0.15)]'
                  }`}
              >
                <Save size={13} />
                <span>{selectedQuestion.isSaved ? 'Question Saved' : 'Save Question'}</span>
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
// 9. ASSESSMENTS MANAGER COMPONENT
// ==========================================
const AssessmentsManager = ({
  savedAssessments,
  setSavedAssessments,
  showToast,
  setActiveTab,
  setSelectedAssessmentForView,
  onAssignClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredAssessments = savedAssessments.filter(asm => {
    const query = searchQuery.toLowerCase();
    const nameMatch = asm.name.toLowerCase().includes(query);
    const subjectMatch = asm.subjects.some(sub => sub.toLowerCase().includes(query));
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
            placeholder="Search saved assessments by name or subject..."
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

        <button
          onClick={() => setActiveTab('create-assessment')}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-dash-primary-purple border border-dash-primary-purple text-dash-white-card font-bold text-xs hover:bg-dash-dark-purple transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>New Assessment</span>
        </button>
      </div>

      {/* Grid of Saved Assessments */}
      {filteredAssessments.length === 0 ? (
        <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-12 text-center flex flex-col items-center justify-center min-h-[350px] shadow-sm">
          <div className="p-4 rounded-full bg-dash-light-blue-bg text-dash-primary-purple mb-4">
            <BookOpen size={36} className="animate-pulse" />
          </div>
          <h3 className="font-plus-jakarta font-extrabold text-base text-dash-dark-purple">
            No Assessments Found
          </h3>
          <p className="text-xs text-dash-light-purple font-medium mt-2 max-w-sm leading-relaxed">
            {searchQuery
              ? `No assessments match "${searchQuery}". Try refining your search query.`
              : 'You have not saved any AI generated assessments yet. Create one using the AI Generator.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setActiveTab('create-assessment')}
              className="mt-5 px-4.5 py-2.5 rounded-xl bg-dash-primary-purple text-dash-white-card font-bold text-xs hover:bg-dash-dark-purple transition-all cursor-pointer border-none shadow-md"
            >
              Get Started with AI
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAssessments.map((asm) => {
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
                  <div className="grid grid-cols-2 gap-3.5 bg-dash-light-blue-bg/25 border border-dash-border-gray/30 p-3 rounded-xl mb-4 text-xs font-semibold text-dash-dark-purple">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-dash-primary-purple" />
                      <span>{asm.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-dash-primary-purple" />
                      <span>{asm.questionsCount} Questions</span>
                    </div>
                  </div>

                  {/* Candidates Assigned Status */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-dash-light-purple">
                    <div className={`w-1.5 h-1.5 rounded-full ${asm.candidatesAssigned > 0 ? 'bg-dash-success-green' : 'bg-dash-primary-purple/40'}`} />
                    <span>
                      {asm.candidatesAssigned > 0
                        ? `Assigned to ${asm.candidatesAssigned} Candidate(s)`
                        : 'Not assigned to candidates yet'}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="border-t border-dash-border-gray/30 pt-4 mt-1">
                  <div className="flex items-center justify-between gap-2.5 w-full">
                    <button
                      onClick={() => setSelectedAssessmentForView(asm)}
                      className="flex-1 py-2.5 rounded-xl border border-dash-border-gray/80 hover:bg-dash-soft-pink text-dash-dark-purple font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer bg-dash-white-card"
                    >
                      <Eye size={13} />
                      <span>View Questions</span>
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

const ResultsManager = ({ showToast }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('All');
  const [sortBy, setSortBy] = useState('score-desc');
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
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
  };

  const handleOpenDetail = async (assignmentId) => {
    try {
      setDetailLoading(true);
      const response = await api.get(`/api/results/${assignmentId}`);
      setSelectedResult(response.data);
      const initialExpanded = {};
      if (response.data?.questionsAnalysis) {
        response.data.questionsAnalysis.forEach(q => {
          initialExpanded[q.questionId] = true;
        });
      }
      setExpandedQuestions(initialExpanded);
    } catch (err) {
      console.error("Failed to load result details:", err);
      showToast("Error loading result details.");
    } finally {
      setDetailLoading(false);
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
              <span class="meta-val">${new Date(result.createdAt).toLocaleDateString()} ${new Date(result.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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

  const filteredAndSortedResults = results
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
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dash-light-purple" size={18} />
          <input
            type="text"
            placeholder="Search candidates or assessments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dash-white-card border border-dash-border-gray/50 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-dash-dark-purple placeholder:text-dash-light-purple focus:border-dash-primary-purple outline-none transition-all duration-200"
          />
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

      <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] shadow-[0_4px_25px_rgba(87,82,170,0.02)] overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex flex-col justify-center items-center py-20 text-dash-light-purple gap-3">
            <RefreshCw className="animate-spin text-dash-primary-purple" size={32} />
            <span className="font-semibold text-xs">Loading assessment results...</span>
          </div>
        ) : (
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
                              onClick={() => handleOpenDetail(res.assignmentId)}
                              className="px-3 py-1.5 rounded-lg bg-dash-white-card border border-dash-border-gray hover:border-dash-primary-purple text-dash-primary-purple text-xs font-bold hover:bg-dash-soft-pink transition-all duration-300 flex items-center gap-1.5 ml-auto cursor-pointer"
                            >
                              <Eye size={13} />
                              <span>View Details</span>
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

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray rounded-xl p-3.5">
                    <span className="text-[10px] text-dash-light-purple font-bold uppercase tracking-wider block mb-1">Assessment</span>
                    <span className="text-xs font-bold text-dash-dark-purple">{selectedResult.assessmentName}</span>
                  </div>
                  <div className="bg-dash-light-blue-bg/30 border border-dash-border-gray rounded-xl p-3.5">
                    <span className="text-[10px] text-dash-light-purple font-bold uppercase tracking-wider block mb-1">Submitted On</span>
                    <span className="text-xs font-semibold text-dash-dark-purple">
                      {new Date(selectedResult.createdAt).toLocaleDateString()} {new Date(selectedResult.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
                            className={`text-dash-light-purple transition-transform duration-200 shrink-0 ${
                              isExpanded ? 'rotate-90' : ''
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
                              {q.type === 'CODING' || q.type === 'PYTHON_CODING' ? (
                                <div className="space-y-4 w-full">
                                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 relative font-mono overflow-x-auto text-[11px] text-zinc-100 max-h-[300px]">
                                    <div className="absolute right-3.5 top-3 text-[9px] font-bold text-zinc-600 uppercase tracking-wider select-none">Submitted Code</div>
                                    <SyntaxHighlighter code={q.candidateAnswer || '# No answer submitted.'} language="python" />
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
};

