import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthGuard({ children }) {
  const { isAuthenticated } = useAuth();
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  // If authenticated, render the protected component
  return children;
}

export default AuthGuard;
