import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { initializeApiService } from '../services/apiService';

const useApiServices = () => {
  const { getToken, logout } = useAuth();
  
  useEffect(() => {
    // Initialize API service with token getter
    initializeApiService(getToken);
    
    // Set up listener for unauthorized events
    const handleUnauthorized = () => {
      console.warn('Unauthorized request detected. Logging out...');
      logout();
    };
    
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [getToken, logout]);
};

export default useApiServices;
