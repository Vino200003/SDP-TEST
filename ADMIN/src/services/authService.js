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
export const login = async (email, password) => {
  try {
    console.log('Logging in with:', { email, password: '****' });
    console.log('API URL:', `${API_URL}/api/admin/login`);
    
    const response = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('Login response status:', response.status);
    console.log('Response data:', data);

    if (!response.ok) {
      console.error('Login failed with status:', response.status);
      throw new Error(data.message || 'Login failed');
    }

    // Store token and user data in localStorage
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.admin));
    
    return { success: true, data };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
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
  return localStorage.getItem(TOKEN_KEY) !== null;
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
