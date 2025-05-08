import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../utils/api';
import Footer from '../components/Footer';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect message from location state if available
  const [redirectMessage, setRedirectMessage] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Error and loading states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Call the loginUser function from api.js
      const response = await loginUser(formData);
      
      // Login successful
      setSubmitSuccess(true);
      console.log('Login successful:', response);
      
      // Store token in localStorage for future authenticated requests
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      // Store basic user info if needed
      if (response.user) {
        localStorage.setItem('user', JSON.stringify({
          id: response.user.user_id,
          name: `${response.user.first_name} ${response.user.last_name}`,
          email: response.user.email,
          first_name: response.user.first_name,
          last_name: response.user.last_name
        }));
      }
      
      // Dispatch event to notify navbar of authentication change
      window.dispatchEvent(new Event('authChange'));
      
      // Redirect to home page after successful login (setTimeout for visual feedback)
      setTimeout(() => {
        if (window.navigateTo) {
          window.navigateTo('/');
        } else {
          window.location.href = '/';
        }
      }, 1500);
      
    } catch (error) {
      console.error('Login error:', error);
      setSubmitError(error.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check for redirect message on component mount
  useEffect(() => {
    if (location.state?.message) {
      setRedirectMessage(location.state.message);
      // Remove the message after displaying it so it doesn't persist on page refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="login-page">
      <div className="login-header">
        <div className="login-overlay"></div>
        <div className="login-content">
          <h2>Welcome Back</h2>
          <p>Sign in to your account to access your profile, orders, and reservations.</p>
        </div>
      </div>
      
      <div className="login-container">
        <div className="login-form-container">
          <h1>Sign In</h1>
          
          {redirectMessage && (
            <div className="info-message">
              {redirectMessage}
            </div>
          )}
          
          {submitSuccess && (
            <div className="success-message">
              Login successful!
            </div>
          )}
          
          {submitError && (
            <div className="error-message">
              {submitError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            
            <div className="forgot-password">
              <a 
                href="/forgot-password" 
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/forgot-password';
                }}
              >
                Forgot password?
              </a>
            </div>
            
            <button type="submit" className="login-button" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div className="signup-link">
            Don't have an account? <a href="/signup">Create Account</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
