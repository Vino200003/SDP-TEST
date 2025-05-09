import { createContext, useState, useContext, useEffect } from 'react';
import { API_URL } from '../config/constants';

// Create the Auth Context
const AuthContext = createContext(null);

// AuthProvider component that wraps your app and makes auth object available to any child component that calls useAuth().
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('admin_user');
      
      if (storedToken && storedUser) {
        try {
          // Verify token is still valid with the backend
          const isValid = await validateToken(storedToken);
          
          if (isValid) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('admin_user');
          }
        } catch (error) {
          console.error('Error validating stored token:', error);
        }
      }
      
      setIsLoading(false);
    };
    
    loadStoredAuth();
  }, []);

  // Method to login with admin credentials
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      // Make actual API call to backend for authentication
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }
      
      // Set auth state
      setUser(data.admin);
      setToken(data.token);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.admin));
      
      return { success: true, user: data.admin };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Method to log out
  const logout = () => {
    // Reset auth state
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin_user');
    
    console.log('User logged out successfully');
  };
  
  // Validate token with backend
  const validateToken = async (tokenToValidate) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/profile`, {
        headers: {
          'Authorization': `Bearer ${tokenToValidate}`,
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };
  
  // Get auth token method
  const getToken = () => token;

  // Make the context object with all values/methods to be provided
  const authContext = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getToken,
    validateToken
  };

  // Pass the value to provider and return
  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook that simplifies access to the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
