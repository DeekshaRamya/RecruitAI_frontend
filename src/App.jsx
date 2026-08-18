import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import Login from './pages/Login';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ErrorBoundary from './components/ErrorBoundary';

// Route Protection wrapper
const ProtectedRoute = ({ children, allowedRole, allowedRoles }) => {
  const token = localStorage.getItem('recruitai_access_token');
  const userStr = localStorage.getItem('recruitai_user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    const validRoles = allowedRoles || (allowedRole ? [allowedRole] : null);
    if (validRoles && !validRoles.includes(user.role)) {
      // Admins are allowed to access recruiter routes by default
      if (user.role === 'admin' && validRoles.includes('recruiter')) {
        return children;
      }
      return <Navigate to="/login" replace />;
    }
  } catch (_e) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Smart Results Router for /results URL path
const ResultsRedirect = ({ onLogout }) => {
  const userStr = localStorage.getItem('recruitai_user');
  let role = 'candidate';
  try {
    if (userStr) {
      const user = JSON.parse(userStr);
      role = user.role;
    }
  } catch {
    // Return to candidate dashboard on parse error
  }

  if (role === 'admin' || role === 'recruiter') {
    return <Navigate to="/recruiter/results" replace />;
  }
  return <Navigate to="/candidate/dashboard" replace />;
};

// Dedicated Component to capture Google OAuth / Azure Callback URL token params
const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token') || searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const userParam = searchParams.get('user');
    const roleParam = searchParams.get('role');
    const nameParam = searchParams.get('name');
    const emailParam = searchParams.get('email');
    const userIdParam = searchParams.get('user_id');
    const redirectParam = searchParams.get('redirect');

    if (token) {
      localStorage.setItem('recruitai_access_token', token);
      if (refreshToken) {
        localStorage.setItem('recruitai_refresh_token', refreshToken);
      }

      let userObj = null;
      if (userParam) {
        try {
          userObj = JSON.parse(decodeURIComponent(userParam));
        } catch (e) {
          console.error("Failed to parse user param:", e);
        }
      }

      if (!userObj) {
        userObj = {
          id: userIdParam || '',
          full_name: nameParam ? decodeURIComponent(nameParam) : 'User',
          name: nameParam ? decodeURIComponent(nameParam) : 'User',
          email: emailParam ? decodeURIComponent(emailParam) : '',
          role: roleParam || 'candidate'
        };
      }

      localStorage.setItem('recruitai_user', JSON.stringify(userObj));

      // If user is candidate, prepare candidate profile in localStorage for Candidate Dashboard
      if (userObj.role === 'candidate') {
        const storedCandidates = localStorage.getItem('recruitai_candidates');
        let candidatesList = [];
        if (storedCandidates) {
          try {
            candidatesList = JSON.parse(storedCandidates);
          } catch {
            // Ignore parse error
          }
        }

        let candidate = candidatesList.find(c => c.email?.toLowerCase() === userObj.email?.toLowerCase());
        if (!candidate) {
          candidate = {
            id: userObj.id,
            name: userObj.full_name || userObj.name || 'New Candidate',
            email: userObj.email,
            role: 'Data Analyst',
            date: new Date().toISOString().split('T')[0],
            resume: userObj.resume_score || 0,
            python: userObj.python_score || 0,
            sql: userObj.sql_score || 0,
            aptitude: userObj.aptitude_score || 0,
            english: userObj.english_score || 0,
            final: 0,
            recommendation: 'In Evaluation',
            status: 'Active'
          };
          candidatesList.unshift(candidate);
          localStorage.setItem('recruitai_candidates', JSON.stringify(candidatesList));
        }
        localStorage.setItem('current_candidate', JSON.stringify(candidate));
      }

      // Navigate based on user role
      if (userObj.role === 'admin' || userObj.role === 'recruiter') {
        navigate('/recruiter/dashboard', { replace: true });
      } else {
        navigate('/candidate/dashboard', { replace: true });
      }
    } else {
      const errorMsg = searchParams.get('error');
      if (errorMsg) {
        navigate(`/login?error=${encodeURIComponent(errorMsg)}`, { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 font-inter">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Authenticating with Microsoft...</p>
      </div>
    </div>
  );
};

function App() {
  const handleLogout = () => {
    localStorage.removeItem('recruitai_access_token');
    localStorage.removeItem('recruitai_user');
    localStorage.removeItem('current_candidate');
    window.location.href = '/login';
  };

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            
            {/* Protected Dashboard Routes */}
            <Route 
              path="/candidate/dashboard" 
              element={
                <ProtectedRoute allowedRole="candidate">
                  <CandidateDashboard onLogout={handleLogout} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/candidate/results" 
              element={
                <ProtectedRoute allowedRole="candidate">
                  <Navigate to="/candidate/dashboard" replace />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recruiter" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <Navigate to="/recruiter/dashboard" replace />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recruiter/:tab" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <RecruiterDashboard onLogout={handleLogout} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRole="admin">
                  <Navigate to="/recruiter/dashboard" replace />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/:tab" 
              element={
                <ProtectedRoute allowedRole="admin">
                  <RecruiterDashboard onLogout={handleLogout} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/results" 
              element={
                <ProtectedRoute>
                  <ResultsRedirect onLogout={handleLogout} />
                </ProtectedRoute>
              } 
            />

            {/* Redirects */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
