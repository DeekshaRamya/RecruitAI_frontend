import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

let lastClickedButton = null;
let lastClickTime = 0;

if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn) {
      if (btn.disabled || btn.classList.contains('btn-loading')) return;
      lastClickedButton = btn;
      lastClickTime = Date.now();
    }
  }, true);
}

// Request interceptor to attach JWT token and button loading state
api.interceptors.request.use(
  (config) => {
    if (lastClickedButton && (Date.now() - lastClickTime < 300)) {
      const btn = lastClickedButton;
      config.clickedButton = btn;
      
      // Apply loading spinner to the button
      btn.classList.add('btn-loading');
      btn.disabled = true;
      
      // Clear tracking so subsequent parallel requests don't duplicate
      lastClickedButton = null;
    }
    
    const token = localStorage.getItem('recruitai_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const clearLoadingState = (config) => {
  if (config && config.clickedButton) {
    const btn = config.clickedButton;
    btn.classList.remove('btn-loading');
    btn.disabled = false;
  }
};

// Response interceptor to handle token expiration and loading state cleanup
api.interceptors.response.use(
  (response) => {
    clearLoadingState(response.config);
    return response;
  },
  (error) => {
    if (error.config) {
      clearLoadingState(error.config);
    }
    if (error.response && error.response.status === 401) {
      // Clear token and user details if unauthorized
      localStorage.removeItem('recruitai_access_token');
      localStorage.removeItem('recruitai_refresh_token');
      localStorage.removeItem('recruitai_user');
      
      // Prevent infinite redirect loops on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
