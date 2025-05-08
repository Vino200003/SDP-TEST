import { API_URL } from '../config/constants';

// This file now serves as a bridge to the AuthContext
// The actual authentication logic has been moved to AuthContext.jsx

/**
 * NOTE: These functions require the AuthContext to be properly set up
 * They're kept here for backward compatibility with existing code
 * Ideally, components should use the useAuth hook directly
 */

// This will be deprecated - components should use useAuth().login
export const login = async (credentials) => {
  // This function is kept for backward compatibility
  // The actual implementation is now in AuthContext
  console.warn('Using deprecated login method in authService. Use useAuth().login instead');
  
  // This will throw an error if not within AuthProvider
  // Proper implementation would require passing the login function here
  throw new Error('Please update your code to use useAuth().login instead');
};

// This will be deprecated - components should use useAuth().logout
export const logout = () => {
  console.warn('Using deprecated logout method in authService. Use useAuth().logout instead');
  throw new Error('Please update your code to use useAuth().logout instead');
};

// This will be deprecated - components should use useAuth().isAuthenticated
export const isAuthenticated = () => {
  console.warn('Using deprecated isAuthenticated method in authService. Use useAuth().isAuthenticated instead');
  throw new Error('Please update your code to use useAuth().isAuthenticated instead');
};

// This will be deprecated - components should use useAuth().user
export const getCurrentUser = () => {
  console.warn('Using deprecated getCurrentUser method in authService. Use useAuth().user instead');
  throw new Error('Please update your code to use useAuth().user instead');
};

// This will be deprecated - components should use useAuth().getToken
export const getToken = () => {
  console.warn('Using deprecated getToken method in authService. Use useAuth().getToken instead');
  throw new Error('Please update your code to use useAuth().getToken instead');
};

// This will be deprecated - components should use useAuth() directly
export const getAuthStatus = () => {
  console.warn('Using deprecated getAuthStatus method in authService. Use useAuth() instead');
  throw new Error('Please update your code to use useAuth() instead');
};

// This function can be retained but should use the auth context
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
