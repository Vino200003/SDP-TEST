import { createContext, useState, useContext } from 'react';
import { API_URL } from '../config/constants';

// Create the Auth Context
const AuthContext = createContext(null);

// AuthProvider component that wraps your app and makes auth object available to any child component that calls useAuth().
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Method to login with admin credentials
  const login = async (credentials) => {
    try {
      // For now, let's just mock successful authentication
      // This will be replaced with actual API call later
      console.log('Login attempt with:', credentials);
      
      // Mock successful login
      const mockUser = {
        id: 1,
        email: credentials.username,
        name: 'Admin User'
      };
      
      const mockToken = 'mock-jwt-token';
      
      // Set auth state
      setUser(mockUser);
      setToken(mockToken);
      setIsAuthenticated(true);
      
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  // Method to log out
  const logout = () => {
    // Reset auth state
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Add console log for debugging
    console.log('User logged out successfully');
  };
  
  // Get auth token method
  const getToken = () => token;

  // Make the context object with all values/methods to be provided
  const authContext = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    getToken
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
