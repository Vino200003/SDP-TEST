import React, { useState } from 'react';
import '../../styles/Login.css';
import Logo from '../components/Logo';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // API URL - make sure this matches your backend
  const API_URL = 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Demo credentials fallback
    if ((email === 'kitchen@restaurant.com' && password === 'kitchen123') || 
        (email === 'delivery@restaurant.com' && password === 'delivery123')) {
      
      const staffType = email.startsWith('kitchen') ? 'kitchen' : 'delivery';
      console.log(`Using demo credentials for ${staffType} staff`);
      
      setTimeout(() => {
        setIsLoading(false);
        onLogin(staffType);
      }, 500); // Small delay for better UX
      
      return;
    }
    
    try {
      console.log(`Attempting to login with email: ${email}`);
      
      // Call the API endpoint
      const response = await axios.post(`${API_URL}/staff/login`, {
        email,
        password
      });
      
      console.log('Login API response:', response.data);
      
      // Check the response
      if (response.data && response.data.staff) {
        const staff = response.data.staff;
        
        // Determine the staff type from the response
        if (staff.loginType === 'kitchen' || staff.role === 'chef') {
          onLogin('kitchen');
        } else if (staff.loginType === 'delivery' || staff.role === 'delivery') {
          onLogin('delivery');
        } else {
          setError('Your staff role is not authorized for this application.');
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      setError(
        error.response?.data?.message || 
        'Unable to connect to the server. Please try again or use demo credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-card">
        <Logo />
        <h2>Staff Login Portal</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <span>Logging in... <i className="fas fa-circle-notch fa-spin"></i></span>
            ) : (
              <>
                <span>Login</span>
                <i className="fas fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>
        
        <div className="help-text">
          <p>Forgot your credentials? Please contact the manager.</p>
          <p className="support-contact">Support: <a href="tel:+1234567890">123-456-7890</a></p>
        </div>
        
        <div className="demo-credentials">
          <p className="demo-title">Demo Credentials:</p>
          <div className="credential-box">
            <div className="credential-item">
              <strong>Kitchen Staff:</strong> 
              <span>Email: kitchen@restaurant.com</span>
              <span>Password: kitchen123</span>
            </div>
            <div className="credential-item">
              <strong>Delivery Staff:</strong> 
              <span>Email: delivery@restaurant.com</span>
              <span>Password: delivery123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;