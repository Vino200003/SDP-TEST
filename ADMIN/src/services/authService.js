import { API_URL } from '../config/constants';

// Auth token key for localStorage
const TOKEN_KEY = 'adminToken';
const USER_KEY = 'adminUser';

/**
 * Login admin user
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise} - Promise with admin data
 */
export const login = async (credentials) => {
  // Simulate API delay
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.username && credentials.password) {
        // Store token in localStorage
        localStorage.setItem('auth_token', 'mock_token_value');
        resolve(true);
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 800);
  });
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
export const isAuthenticated = () => {
  return localStorage.getItem('auth_token') !== null;
};

/**
 * Get current user
 * @returns {Object|null} - User object or null
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Get auth token
 * @returns {string|null} - Auth token or null
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get user's authentication status and data
 * @returns {Object} - Auth status and user data
 */
export const getAuthStatus = () => {
  return {
    isAuthenticated: isAuthenticated(),
    user: getCurrentUser(),
  };
};

/**
 * Check if token is valid by making a request to the backend
 * @returns {Promise<boolean>} - True if token is valid
 */
export const validateToken = async () => {
  try {
    const token = getToken();
    
    if (!token) return false;
    
    const response = await fetch(`${API_URL}/api/admin/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// For demo purposes, auto-login during development
if (process.env.NODE_ENV === 'development' && !localStorage.getItem('auth_token')) {
  localStorage.setItem('auth_token', 'dev_token');
}
