import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import logo from '../assets/logo.png';

function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Simple validation
      if (!credentials.username || !credentials.password) {
        throw new Error('Username and password are required');
      }
      
      // For development/testing: accept any credentials
      // Store token in multiple formats to ensure compatibility with our token helper
      localStorage.setItem('auth_token', 'mock_token_value');
      localStorage.setItem('adminToken', 'mock_token_value'); // Add this format as well
      localStorage.setItem('admin_user', JSON.stringify({
        name: credentials.username,
        role: 'admin'
      }));
      
      // Call the onLogin callback to update auth state
      if (onLogin) onLogin();
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="Restaurant Logo" className="login-logo" />
          <h1>Restaurant Admin</h1>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        {/* Development helper */}
        <div className="login-footer">
          <p>For testing, enter any username and password</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
