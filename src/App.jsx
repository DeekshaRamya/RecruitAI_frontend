import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ErrorBoundary from './components/ErrorBoundary';

// Route Protection wrapper
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('recruitai_access_token');
  const userStr = localStorage.getItem('recruitai_user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (allowedRole && user.role !== allowedRole) {
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
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
  } catch (e) {
    console.error("Error parsing user role for results redirect:", e);
  }

  if (role === 'recruiter') {
    return <RecruiterDashboard onLogout={onLogout} initialTab="results" />;
  }
  return <Navigate to="/candidate/dashboard" replace />;
};

// Microsoft OAuth Callback handler
const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const role = searchParams.get('role');
    const redirect = searchParams.get('redirect');

    if (accessToken && role) {
      localStorage.setItem('recruitai_access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('recruitai_refresh_token', refreshToken);
      }
      
      localStorage.setItem(
        'recruitai_user',
        JSON.stringify({
          role: role,
          name: 'Microsoft Recruiter',
          email: ''
        })
      );
      
      navigate(redirect || '/recruiter/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Authenticating with Microsoft...</h2>
        <p className="text-sm text-slate-400">Please wait while we complete your secure login.</p>
      </div>
    </div>
  );
};

function App() {
  const handleLogout = () => {
    localStorage.removeItem('recruitai_access_token');
    localStorage.removeItem('recruitai_refresh_token');
    localStorage.removeItem('recruitai_user');
    localStorage.removeItem('current_candidate');
    window.location.href = '/login';
  };

  return (
    <ErrorBoundary>
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
            path="/recruiter/dashboard" 
            element={
              <ProtectedRoute allowedRole="recruiter">
                <RecruiterDashboard onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recruiter/results" 
            element={
              <ProtectedRoute allowedRole="recruiter">
                <RecruiterDashboard onLogout={handleLogout} initialTab="results" />
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
    </ErrorBoundary>
  );
}

export default App;
