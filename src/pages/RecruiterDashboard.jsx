import React, { useState } from 'react';
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
  Phone,
  Calendar,
  Globe,
  Plus,
  LogOut,
  Edit2,
  Lock,
  ArrowUpRight,
  FileText,
  Trash2,
  RefreshCw,
  Eye
} from 'lucide-react';

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

const RecruiterDashboard = ({ onLogout }) => {
  // Candidate dataset state
  const [candidates, setCandidates] = useState([
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
  ]);

  // Sidebar navigation state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search, filter, and sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [sortBy, setSortBy] = useState('newest');

  // Interactive UI Drawer states
  const [selectedCandidate, setSelectedCandidate] = useState(null);

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

  // Selected topics state (Python topics selected by default as in screenshot)
  const [selectedTopics, setSelectedTopics] = useState({
    Python: ['Variables & Data Types', 'Control Flow & Loops'],
    SQL: [],
    Aptitude: []
  });

  // Topic configuration state: maps topic names to their MCQ and Scenario-Based counts
  const [topicConfigs, setTopicConfigs] = useState({
    'Variables & Data Types': { mcqCount: 2, scenarioCount: 1 },
    'Control Flow & Loops': { mcqCount: 2, scenarioCount: 1 }
  });

  // Assessment Settings states
  const [difficulty, setDifficulty] = useState('Medium');
  const [duration, setDuration] = useState('60 minutes');

  // Dynamic assessment calculations
  const totalSelectedTopics = selectedTopics.Python.length + selectedTopics.SQL.length + selectedTopics.Aptitude.length;
  const activeSubjectsCount = (selectedTopics.Python.length > 0 ? 1 : 0) + (selectedTopics.SQL.length > 0 ? 1 : 0) + (selectedTopics.Aptitude.length > 0 ? 1 : 0);

  // Sum up MCQ and Scenario questions from active configurations
  const totalMCQs = Object.keys(selectedTopics).reduce((sum, subject) => {
    const list = selectedTopics[subject];
    return sum + list.reduce((subSum, topicName) => {
      const config = topicConfigs[topicName] || { mcqCount: 0 };
      return subSum + (config.mcqCount || 0);
    }, 0);
  }, 0);

  const totalScenarios = Object.keys(selectedTopics).reduce((sum, subject) => {
    const list = selectedTopics[subject];
    return sum + list.reduce((subSum, topicName) => {
      const config = topicConfigs[topicName] || { scenarioCount: 0 };
      return subSum + (config.scenarioCount || 0);
    }, 0);
  }, 0);

  const totalQuestions = totalMCQs + totalScenarios;

  const updateTopicConfig = (topicName, field, value) => {
    setTopicConfigs(prev => ({
      ...prev,
      [topicName]: {
        ...(prev[topicName] || { mcqCount: 0, scenarioCount: 0 }),
        [field]: value
      }
    }));
  };

  const getAssessmentPayload = () => {
    const payloadSubjects = [];
    Object.keys(selectedTopics).forEach(subjectName => {
      const list = selectedTopics[subjectName];
      if (list.length > 0) {
        const topicsPayload = list.map(topicName => {
          const config = topicConfigs[topicName] || { mcqCount: 0, scenarioCount: 0 };
          return {
            name: topicName,
            mcqCount: config.mcqCount || 0,
            scenarioCount: config.scenarioCount || 0
          };
        });
        payloadSubjects.push({
          name: subjectName,
          topics: topicsPayload
        });
      }
    });

    return {
      subjects: payloadSubjects,
      difficulty: difficulty,
      duration: duration
    };
  };

  // Toggle selection for a topic
  const toggleTopic = (subject, topic) => {
    setSelectedTopics(prev => {
      const currentList = prev[subject];
      const isSelected = currentList.includes(topic);
      const newList = isSelected
        ? currentList.filter(t => t !== topic)
        : [...currentList, topic];

      if (!isSelected) {
        setTopicConfigs(prevConfigs => ({
          ...prevConfigs,
          [topic]: prevConfigs[topic] || { mcqCount: 2, scenarioCount: 1 }
        }));
      }

      return {
        ...prev,
        [subject]: newList
      };
    });
  };

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
      subject: 'Python',
      topic: 'Generators & Decorators',
      difficulty: 'Medium',
      type: 'MCQ',
      question: 'Which keyword is used to define a generator function in Python?',
      options: ['return', 'yield', 'async', 'lambda'],
      correctAnswer: 'yield'
    },
    {
      id: 2,
      subject: 'Python',
      topic: 'Exception Handling',
      difficulty: 'Medium',
      type: 'SCENARIO',
      scenario: 'A developer wants to read a file that may not exist. The application should handle this gracefully without crashing and log a warning.',
      question: 'Which approach is the best?',
      options: [
        'Ignore the error',
        'Use try-except',
        'Use continue',
        'Restart the application'
      ],
      correctAnswer: 'Use try-except'
    },
    {
      id: 3,
      subject: 'SQL',
      topic: 'JOINs',
      difficulty: 'Medium',
      type: 'MCQ',
      question: 'Which SQL join returns all rows from the left table, and the matched rows from the right table?',
      options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
      correctAnswer: 'LEFT JOIN'
    }
  ]);

  // Dropdown open states
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Statistics data (dynamic active assessments)
  const stats = [
    { label: 'Total Candidates', value: '1,248', change: '+12% this week', icon: Users },
    { label: 'Active Assessments', value: activeAssessmentsCount.toString(), change: '+2 new today', icon: Briefcase },
    { label: 'Completion Rate', value: '84.5%', change: '+3% avg. rate', icon: TrendingUp },
    { label: 'Average Score', value: '78.2%', change: '+1.4% improvement', icon: Award },
  ];

  // List of roles and statuses for filters
  const statuses = ['All Statuses', 'Completed', 'In Progress', 'Under Review', 'Failed'];

  // Handle Search, Filters, and Sorting
  const filteredCandidates = candidates
    .filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'All Statuses' || candidate.status === selectedStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortBy === 'score-high') {
        return (b.final || 0) - (a.final || 0);
      }
      if (sortBy === 'score-low') {
        return (a.final || 0) - (b.final || 0);
      }
      return 0;
    });

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

  // Action: Generate Assessment with AI

  const handleGenerateAssessment = async () => {
    const payload = getAssessmentPayload();
    showToast("Generating assessment with AI... Please wait.");
    setIsGenerating(true);

    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch('/api/assessment/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errDetails = await response.json().catch(() => ({}));
        throw new Error(errDetails.detail || `Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data && data.questions) {
        // Format the questions from the API response
        const formatted = data.questions.map((q, idx) => ({
          id: idx + 1,
          subject: q.subject,
          topic: q.topic,
          type: q.type,
          difficulty: q.difficulty,
          scenario: q.scenario,
          question: q.question,
          q: q.question, // fallback
          options: q.options,
          correctAnswer: q.correctAnswer
        }));
        setGeneratedQuestions(formatted);
        showToast(`Successfully generated assessment containing ${formatted.length} questions across ${totalSelectedTopics} topics!`);
        setActiveAssessmentsCount(prev => prev + 1);
        
        // Go to preview questions tab
        setActiveTab('preview-questions');
      } else {
        throw new Error('Invalid questions format returned from backend');
      }
    } catch (err) {
      console.error("AI assessment generation failed:", err);
      showToast(`Error: ${err.message || err}. Falling back to preview...`);
      // Fallback: proceed to preview screen with existing mock list so user experience is not broken
      setActiveTab('preview-questions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndAssign = () => {
    showToast('Assessment saved and assigned successfully!');
    setActiveAssessmentsCount(prev => prev + 1);
    setSelectedTopics({
      Python: [],
      SQL: [],
      Aptitude: []
    });
    setActiveTab('dashboard');
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
      case 'monitor':
        return {
          title: 'Assessment Monitor',
          tag: 'Live Analytics',
          subtitle: 'Track candidate completion rates and performance analytics in real-time.'
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
              { id: 'monitor', label: 'Monitor', icon: TrendingUp },
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
                { id: 'monitor', label: 'Monitor', icon: TrendingUp },
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
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveAndAssign}
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

                </div>

              </div>

              {/* CANDIDATE LIST DATA TABLE */}
              <div className="flex-1 overflow-x-auto dashboard-scrollbar">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-dash-soft-pink border-b border-dash-border-gray text-[10px] font-extrabold text-dash-dark-purple tracking-widest uppercase">
                      <th className="px-6 py-4.5">Candidate</th>
                      <th className="px-6 py-4.5">Resume</th>
                      <th className="px-6 py-4.5">Python</th>
                      <th className="px-6 py-4.5">SQL</th>
                      <th className="px-6 py-4.5">Aptitude</th>
                      <th className="px-6 py-4.5">English</th>
                      <th className="px-6 py-4.5">Final</th>
                      <th className="px-6 py-4.5">AI Recommendation</th>
                      <th className="px-6 py-4.5">Status</th>
                      <th className="px-6 py-4.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dash-border-gray">
                    <AnimatePresence mode="popLayout">
                      {filteredCandidates.map((candidate) => {
                        const getScoreColor = (val) => {
                          if (val >= 80) return '#149470';
                          if (val >= 60) return '#d97706';
                          return '#84492D';
                        };

                        let statusColor = '';
                        let statusBg = '';
                        if (candidate.status === 'Completed') {
                          statusColor = '#149470';
                          statusBg = 'rgba(20, 148, 112, 0.1)';
                        } else {
                          statusColor = '#5752AA'; // Purple/Blue for In Progress
                          statusBg = 'rgba(87, 82, 170, 0.1)';
                        }

                        let recColor = '';
                        let recPrefix = '';
                        if (candidate.recommendation === 'Strong Hire') {
                          recColor = '#149470';
                          recPrefix = '✓ ';
                        } else if (candidate.recommendation === 'Moderate') {
                          recColor = '#d97706';
                          recPrefix = '~ ';
                        } else {
                          recColor = '#84492D';
                          recPrefix = 'X ';
                        }

                        return (
                          <motion.tr
                            key={candidate.id}
                            layout
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="bg-dash-white-card hover:bg-dash-soft-pink transition-colors duration-200 group"
                          >
                            {/* Candidate info (name and role) */}
                            <td className="px-6 py-4">
                              <div>
                                <h4 className="text-xs font-bold text-dash-dark-purple group-hover:text-dash-primary-purple transition-colors duration-200">
                                  {candidate.name}
                                </h4>
                                <span className="text-[10px] text-dash-light-purple font-medium">
                                  {candidate.role}
                                </span>
                              </div>
                            </td>

                            {/* Resume score */}
                            <td className="px-6 py-4 text-xs font-bold" style={{ color: getScoreColor(candidate.resume) }}>
                              {candidate.resume}%
                            </td>

                            {/* Python score */}
                            <td className="px-6 py-4 text-xs font-bold" style={{ color: getScoreColor(candidate.python) }}>
                              {candidate.python}%
                            </td>

                            {/* SQL score */}
                            <td className="px-6 py-4 text-xs font-bold" style={{ color: getScoreColor(candidate.sql) }}>
                              {candidate.sql}%
                            </td>

                            {/* Aptitude score */}
                            <td className="px-6 py-4 text-xs font-bold" style={{ color: getScoreColor(candidate.aptitude) }}>
                              {candidate.aptitude}%
                            </td>

                            {/* English score */}
                            <td className="px-6 py-4 text-xs font-bold" style={{ color: getScoreColor(candidate.english) }}>
                              {candidate.english}%
                            </td>

                            {/* Final score */}
                            <td className="px-6 py-4 text-xs font-bold" style={{ color: getScoreColor(candidate.final) }}>
                              {candidate.final}%
                            </td>

                            {/* AI Recommendation */}
                            <td className="px-6 py-4 text-xs font-bold" style={{ color: recColor }}>
                              {recPrefix}{candidate.recommendation}
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
                                {candidate.status}
                              </span>
                            </td>

                            {/* Actions / Report */}
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setSelectedCandidate(candidate)}
                                className="px-3 py-1.5 rounded-lg bg-dash-white-card border border-dash-border-gray hover:border-dash-primary-purple text-dash-primary-purple text-xs font-bold hover:bg-dash-soft-pink transition-all duration-300 flex items-center gap-1.5 ml-auto cursor-pointer"
                              >
                                <Eye size={13} />
                                <span>Report</span>
                              </button>
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
              <div className="p-4 border-t border-dash-border-gray bg-dash-white-card flex items-center justify-between text-[11px] text-dash-light-purple font-semibold px-6">
                <span>Showing {filteredCandidates.length} of {candidates.length} candidates</span>
                <span>Total 18 assessments listed in workspace</span>
              </div>

            </section>
          </>
        )}

        {/* 6. INTERACTIVE CREATE ASSESSMENT SCREEN */}
        {activeTab === 'create-assessment' && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
            {/* Left Pane: Subjects Grid (3/5 width) */}
            <div className="xl:col-span-3 flex flex-col gap-6">

              {/* Python Card */}
              <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-3">
                  <h3 className="font-outfit font-bold text-base text-dash-dark-purple">Python</h3>
                  <span className="text-xs font-bold text-dash-light-purple">
                    {selectedTopics.Python.length} of {subjectsData.Python.length} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {subjectsData.Python.map((topic) => {
                    const isSelected = selectedTopics.Python.includes(topic);
                    return (
                      <button
                        key={topic}
                        onClick={() => toggleTopic('Python', topic)}
                        className={`relative pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer flex items-center gap-1.5 group/btn ${isSelected
                            ? 'bg-dash-primary-purple border-dash-primary-purple text-dash-white-card shadow-sm'
                            : 'bg-dash-white-card border-dash-border-gray hover:bg-dash-soft-pink hover:border-dash-primary-purple/40 text-dash-dark-purple'
                          }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                        <span>{topic}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTopic('Python', topic);
                          }}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/btn:opacity-60 hover:!opacity-100 p-0.5 rounded transition-all duration-150 ${isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-red-50 text-red-500'
                            }`}
                          title={`Delete "${topic}"`}
                        >
                          <X size={10} strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                  {renderAddTopicControl('Python')}
                </div>
              </div>

              {/* SQL Card */}
              <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-3">
                  <h3 className="font-outfit font-bold text-base text-dash-dark-purple">SQL</h3>
                  <span className="text-xs font-bold text-dash-light-purple">
                    {selectedTopics.SQL.length} of {subjectsData.SQL.length} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {subjectsData.SQL.map((topic) => {
                    const isSelected = selectedTopics.SQL.includes(topic);
                    return (
                      <button
                        key={topic}
                        onClick={() => toggleTopic('SQL', topic)}
                        className={`relative pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer flex items-center gap-1.5 group/btn ${isSelected
                            ? 'bg-dash-primary-purple border-dash-primary-purple text-dash-white-card shadow-sm'
                            : 'bg-dash-white-card border-dash-border-gray hover:bg-dash-soft-pink hover:border-dash-primary-purple/40 text-dash-dark-purple'
                          }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                        <span>{topic}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTopic('SQL', topic);
                          }}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/btn:opacity-60 hover:!opacity-100 p-0.5 rounded transition-all duration-150 ${isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-red-50 text-red-500'
                            }`}
                          title={`Delete "${topic}"`}
                        >
                          <X size={10} strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                  {renderAddTopicControl('SQL')}
                </div>
              </div>

              {/* Aptitude Card (Amber styles matching the user's screenshot) */}
              <div className="bg-dash-white-card border border-[#d97706]/20 rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-3">
                  <h3 className="font-outfit font-bold text-base text-dash-dark-purple">Aptitude</h3>
                  <span className="text-xs font-bold text-dash-light-purple">
                    {selectedTopics.Aptitude.length} of {subjectsData.Aptitude.length} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {subjectsData.Aptitude.map((topic) => {
                    const isSelected = selectedTopics.Aptitude.includes(topic);
                    return (
                      <button
                        key={topic}
                        onClick={() => toggleTopic('Aptitude', topic)}
                        className={`relative pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer flex items-center gap-1.5 group/btn ${isSelected
                            ? 'bg-[#d97706] border-[#d97706] text-dash-white-card shadow-sm'
                            : 'bg-dash-white-card border-[#d97706]/40 hover:bg-[#fef3c7] hover:border-[#d97706] text-[#b45309]'
                          }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                        <span>{topic}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTopic('Aptitude', topic);
                          }}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/btn:opacity-60 hover:!opacity-100 p-0.5 rounded transition-all duration-150 ${isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-red-50 text-red-600'
                            }`}
                          title={`Delete "${topic}"`}
                        >
                          <X size={10} strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                  {renderAddTopicControl('Aptitude')}
                </div>
              </div>

            </div>

            {/* Right Pane: Settings & Summary (2/5 width) */}
            <div className="xl:col-span-2 flex flex-col gap-6">

              {/* Assessment Settings Card */}
              <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-6 shadow-sm flex flex-col gap-5">
                <h3 className="font-outfit font-bold text-base text-dash-dark-purple border-b border-dash-border-gray/25 pb-3">
                  Assessment Settings
                </h3>


                {/* Question Configuration */}
                <div className="flex flex-col gap-3 border-b border-dash-border-gray/25 pb-4">
                  <label className="text-xs font-bold text-dash-light-purple uppercase tracking-wider">
                    Question Configuration
                  </label>

                  {totalSelectedTopics === 0 ? (
                    <div className="text-xs font-medium text-dash-light-purple italic py-2">
                      No topics selected. Select topics to configure questions.
                    </div>
                  ) : (
                    <div className="space-y-4 h-[115px] overflow-y-auto pr-1 scrollbar-thin">
                      {Object.keys(selectedTopics).map((subject) => {
                        const topics = selectedTopics[subject];
                        if (topics.length === 0) return null;

                        return (
                          <div key={subject} className="space-y-2">
                            <div className="text-xs font-bold text-dash-dark-purple flex items-center gap-1.5">
                              <span className="text-[10px]">▼</span>
                              <span>{subject}</span>
                            </div>

                            <div className="pl-3 space-y-3">
                              {topics.map((topic) => {
                                const config = topicConfigs[topic] || { mcqCount: 2, scenarioCount: 1 };
                                return (
                                  <div key={topic} className="space-y-2 border-l border-dash-border-gray/50 pl-3">
                                    <div className="text-xs font-semibold text-dash-dark-purple">
                                      {topic}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-dash-light-purple uppercase">
                                          MCQ Questions
                                        </label>
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          value={config.mcqCount}
                                          onChange={(e) => {
                                            let val = e.target.value.replace(/[^0-9]/g, '');
                                            if (val === '') {
                                              updateTopicConfig(topic, 'mcqCount', 0);
                                            } else {
                                              let parsed = parseInt(val, 10);
                                              if (parsed > 100) parsed = 100;
                                              if (parsed < 0) parsed = 0;
                                              updateTopicConfig(topic, 'mcqCount', parsed);
                                            }
                                          }}
                                          onKeyDown={(e) => {
                                            if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                                              e.preventDefault();
                                            }
                                          }}
                                          className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-1.5 px-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple transition-all"
                                        />
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-dash-light-purple uppercase">
                                          Scenario-Based
                                        </label>
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          value={config.scenarioCount}
                                          onChange={(e) => {
                                            let val = e.target.value.replace(/[^0-9]/g, '');
                                            if (val === '') {
                                              updateTopicConfig(topic, 'scenarioCount', 0);
                                            } else {
                                              let parsed = parseInt(val, 10);
                                              if (parsed > 100) parsed = 100;
                                              if (parsed < 0) parsed = 0;
                                              updateTopicConfig(topic, 'scenarioCount', parsed);
                                            }
                                          }}
                                          onKeyDown={(e) => {
                                            if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                                              e.preventDefault();
                                            }
                                          }}
                                          className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-1.5 px-3 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple transition-all"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Difficulty Level selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-dash-light-purple uppercase tracking-wider">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Easy', 'Medium', 'Hard'].map((lvl) => {
                      const isActive = difficulty === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setDifficulty(lvl)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${isActive
                              ? 'bg-dash-primary-purple/10 border-dash-primary-purple text-dash-primary-purple shadow-sm'
                              : 'bg-dash-white-card border-dash-border-gray text-dash-light-purple hover:border-dash-primary-purple/55 hover:text-dash-primary-purple'
                            }`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration select */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-dash-light-purple uppercase tracking-wider">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-dash-white-card border border-dash-border-gray rounded-xl py-2.5 px-4 text-xs font-semibold text-dash-dark-purple focus:outline-none focus:border-dash-primary-purple cursor-pointer transition-all"
                  >
                    <option value="30 minutes">30 minutes</option>
                    <option value="45 minutes">45 minutes</option>
                    <option value="60 minutes">60 minutes</option>
                    <option value="90 minutes">90 minutes</option>
                    <option value="120 minutes">120 minutes</option>
                  </select>
                </div>

              </div>

              {/* Summary Card */}
              <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
                <h3 className="font-outfit font-bold text-base text-dash-dark-purple border-b border-dash-border-gray/25 pb-3">
                  Summary
                </h3>

                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-dash-light-purple">Topics selected</span>
                    <span className="text-dash-dark-purple font-bold">{totalSelectedTopics}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-dash-light-purple">Active subjects</span>
                    <span className="text-dash-dark-purple font-bold">{activeSubjectsCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-dash-light-purple">Total questions</span>
                    <span className="text-dash-dark-purple font-bold">{totalQuestions}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-dash-light-purple">Difficulty</span>
                    <span className="text-dash-dark-purple font-bold">{difficulty}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-dash-light-purple">Duration</span>
                    <span className="text-dash-dark-purple font-bold">{totalQuestions > 0 ? duration : '--'}</span>
                  </div>
                </div>

                {totalSelectedTopics > 0 && totalQuestions === 0 && (
                  <div className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 rounded-xl p-2.5 text-center mt-1 animate-pulse">
                    ⚠️ Configure at least 1 question to generate assessment.
                  </div>
                )}

                <button
                  onClick={handleGenerateAssessment}
                  disabled={totalQuestions === 0 || isGenerating}
                  className="w-full mt-3 py-3.5 rounded-xl bg-dash-primary-purple border border-dash-primary-purple text-dash-white-card font-bold text-sm hover:bg-dash-dark-purple hover:border-dash-dark-purple transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="animate-spin" size={15} />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Globe size={15} />
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
          <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
            <h3 className="font-outfit font-bold text-base text-dash-dark-purple border-b border-dash-border-gray/25 pb-3">
              AI Question Preview Pool
            </h3>
            {generatedQuestions.length > 0 ? (
              <div className="space-y-4">
                {generatedQuestions.map((item, index) => (
                  <QuestionPreviewRenderer key={item.id} question={item} index={index} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-dash-white-card border border-dash-border-gray rounded-[24px]">
                <AlertCircle className="mx-auto mb-3 text-dash-light-purple animate-pulse" size={32} />
                <p className="text-sm font-bold text-dash-light-purple">No questions in the preview pool.</p>
                <button
                  onClick={() => setActiveTab('create-assessment')}
                  className="mt-4 px-4.5 py-2.5 rounded-xl bg-dash-primary-purple text-dash-white-card text-xs font-bold hover:bg-dash-dark-purple transition-all shadow-md cursor-pointer"
                >
                  Create Assessment
                </button>
              </div>
            )}
          </div>
        )}

        {/* 8. MONITOR ACTIVE SCREEN */}
        {activeTab === 'monitor' && (
          <div className="bg-dash-white-card border border-dash-border-gray rounded-[24px] p-8 text-center flex flex-col items-center justify-center min-h-[350px]">
            <div className="p-4 rounded-full bg-dash-light-blue-bg text-dash-primary-purple mb-4">
              <TrendingUp size={36} className="animate-pulse" />
            </div>
            <h3 className="font-plus-jakarta font-extrabold text-lg text-dash-dark-purple">
              Live Evaluation Analytics
            </h3>
            <p className="text-sm text-dash-light-purple font-medium mt-2 max-w-sm">
              Real-time candidate telemetry and evaluation logs are active. Awaiting submissions for the current cycle.
            </p>
          </div>
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



    </div>
  );
};

// Scalable Question Preview Components
const MCQQuestionPreview = ({ question, index }) => {
  const optionLabels = ['A', 'B', 'C', 'D'];
  return (
    <div className="p-4 rounded-xl bg-dash-light-blue-bg/40 border border-dash-border-gray/20 flex flex-col gap-3 hover:bg-dash-soft-pink transition-colors">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-dash-border-gray/15 pb-2">
        <div className="flex items-center gap-2.5">
          <span className="font-outfit font-extrabold text-xs text-dash-dark-purple">
            Q{index + 1}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-dash-primary-purple/10 text-dash-primary-purple border border-dash-primary-purple/20">
              {question.subject}
            </span>
            <span className="text-[9px] font-bold text-dash-light-purple">
              {question.topic}
            </span>
          </div>
        </div>
        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-dash-success-green/10 text-dash-success-green border border-dash-success-green/20">
          {question.difficulty}
        </span>
      </div>

      {/* Question Text */}
      <p className="text-[11px] font-bold text-dash-dark-purple leading-relaxed">
        {question.question || question.q}
      </p>

      {/* Options Grid */}
      {question.options && question.options.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-0.5">
          {question.options.map((option, idx) => {
            const isCorrect = option === question.correctAnswer;
            const label = optionLabels[idx] || '';
            return (
              <div
                key={idx}
                className={`py-2 px-3 rounded-lg border flex items-center gap-2.5 transition-all ${
                  isCorrect
                    ? 'border-dash-success-green bg-dash-success-green/5 text-dash-success-green font-bold'
                    : 'border-dash-border-gray/40 bg-dash-white-card/85 text-dash-dark-purple'
                }`}
              >
                {isCorrect ? (
                  <Check size={12} className="text-dash-success-green shrink-0" strokeWidth={3} />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-dash-light-purple/60 shrink-0" />
                )}
                <span className="text-[11px] font-medium">
                  {label}. {option}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Correct Answer Display */}
      {question.correctAnswer && (
        <div className="mt-1 pt-2 border-t border-dash-border-gray/15 flex flex-col gap-1">
          <span className="text-[9px] font-extrabold text-dash-light-purple uppercase tracking-wider">
            Correct Answer
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-dash-success-green">
            <Check size={12} strokeWidth={3} className="text-dash-success-green" />
            <span>
              {optionLabels[question.options.indexOf(question.correctAnswer)] || ''}. {question.correctAnswer}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const ScenarioQuestionPreview = ({ question, index }) => {
  return (
    <div className="p-4 rounded-xl bg-dash-light-blue-bg/40 border border-dash-border-gray/20 flex flex-col gap-3 hover:bg-dash-soft-pink transition-colors">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-dash-border-gray/15 pb-2">
        <div className="flex items-center gap-2.5">
          <span className="font-outfit font-extrabold text-xs text-dash-dark-purple">
            Q{index + 1}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-dash-primary-purple/10 text-dash-primary-purple border border-dash-primary-purple/20">
              {question.subject}
            </span>
            <span className="text-[9px] font-bold text-dash-light-purple">
              {question.topic}
            </span>
          </div>
        </div>
        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-dash-success-green/10 text-dash-success-green border border-dash-success-green/20">
          {question.difficulty}
        </span>
      </div>

      {/* Scenario Context */}
      <div className="flex flex-col gap-1">
        <h4 className="text-[9px] font-extrabold text-dash-primary-purple uppercase tracking-wider">
          Scenario
        </h4>
        <p className="text-[11px] font-semibold text-dash-dark-purple leading-relaxed bg-dash-white-card/50 p-2.5 rounded-lg border border-dash-border-gray/20">
          {question.scenario}
        </p>
      </div>

      {/* Question Text */}
      <div className="flex flex-col gap-1">
        <h4 className="text-[9px] font-extrabold text-dash-primary-purple uppercase tracking-wider">
          Question
        </h4>
        <p className="text-[11px] font-bold text-dash-dark-purple leading-relaxed">
          {question.question || question.q}
        </p>
      </div>

      {/* Correct Answer Display */}
      {question.correctAnswer && (
        <div className="mt-1 pt-2 border-t border-dash-border-gray/15 flex flex-col gap-1">
          <span className="text-[9px] font-extrabold text-dash-light-purple uppercase tracking-wider">
            Correct Answer
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-dash-success-green">
            <Check size={12} strokeWidth={3} className="text-dash-success-green" />
            <span>
              {question.correctAnswer}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const DefaultQuestionPreview = ({ question, index }) => {
  return (
    <div className="p-4 rounded-xl bg-dash-light-blue-bg/40 border border-dash-border-gray/20 flex flex-col gap-3 hover:bg-dash-soft-pink transition-colors">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-dash-border-gray/15 pb-2">
        <div className="flex items-center gap-2.5">
          <span className="font-outfit font-extrabold text-xs text-dash-dark-purple">
            Q{index + 1}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-dash-primary-purple/10 text-dash-primary-purple border border-dash-primary-purple/20">
              {question.subject}
            </span>
            <span className="text-[9px] font-bold text-dash-light-purple">
              {question.topic}
            </span>
          </div>
        </div>
        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-dash-success-green/10 text-dash-success-green border border-dash-success-green/20">
          {question.difficulty}
        </span>
      </div>

      {/* Question Text */}
      <p className="text-[11px] font-semibold text-dash-dark-purple leading-relaxed">
        {question.question || question.q}
      </p>
    </div>
  );
};

const QuestionPreviewRenderer = ({ question, index }) => {
  const typeNormalized = (question.type || '').toUpperCase();
  switch (typeNormalized) {
    case 'MCQ':
      return <MCQQuestionPreview question={question} index={index} />;
    case 'SCENARIO':
      return <ScenarioQuestionPreview question={question} index={index} />;
    default:
      return <DefaultQuestionPreview question={question} index={index} />;
  }
};

export default RecruiterDashboard;
