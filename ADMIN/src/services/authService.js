import { API_URL } from '../config/constants';

// Direct API service methods - useful for components not using AuthContext

// Login admin directly with the API
export const loginAPI = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Validate token with the API
export const validateToken = async (token) => {
  try {
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

// Get token from localStorage
export const getStoredToken = () => {
  return localStorage.getItem('auth_token') || localStorage.getItem('adminToken');
};

// Get admin from localStorage
export const getStoredAdmin = () => {
  const adminStr = localStorage.getItem('admin_user');
  return adminStr ? JSON.parse(adminStr) : null;
};

// This file now serves as a bridge to the AuthContext
// But also provides direct API access for components not using context

/**
 * NOTE: These functions require the AuthContext to be properly set up
 * They're kept here for backward compatibility with existing code
 * Ideally, components should use the useAuth hook directly
 */

// The following methods are deprecated in favor of useAuth()
export const login = async (credentials) => {
  console.warn('Using deprecated login method in authService. Use useAuth().login instead');
  // Provide a fallback implementation that directly uses the API
  return loginAPI(credentials);
};

export const logout = () => {
  console.warn('Using deprecated logout method in authService. Use useAuth().logout instead');
  // Clear localStorage as a fallback
  localStorage.removeItem('auth_token');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('admin_user');
};

export const isAuthenticated = () => {
  console.warn('Using deprecated isAuthenticated method in authService. Use useAuth().isAuthenticated instead');
  return !!getStoredToken();
};

export const getCurrentUser = () => {
  console.warn('Using deprecated getCurrentUser method in authService. Use useAuth().user instead');
  return getStoredAdmin();
};

export const getToken = () => {
  console.warn('Using deprecated getToken method in authService. Use useAuth().getToken instead');
  return getStoredToken();
};
