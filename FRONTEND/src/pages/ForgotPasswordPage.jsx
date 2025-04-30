import { useState } from 'react';
import Footer from '../components/Footer';
import '../styles/ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  // Form state
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  // Validate form
  const validateForm = () => {
    if (!email.trim()) {
      return 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Email is invalid';
    }
    return '';
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // In a real application, you would make an API call to reset password
      // For now we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset successful
      setSubmitSuccess(true);
      
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-header">
        <div className="forgot-password-overlay"></div>
        <div className="forgot-password-content">
          <h2>Forgot Password</h2>
          <p>Enter your email address to reset your password</p>
        </div>
      </div>
      
      <div className="forgot-password-container">
        <div className="forgot-password-form-container">
          <h1>Reset Your Password</h1>
          
          {submitSuccess ? (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              <p>Password reset instructions have been sent to your email.</p>
              <p>Please check your inbox and follow the instructions to reset your password.</p>
              <div className="back-to-login">
                <a href="/login">Back to Login</a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="forgot-password-form">
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  className={error ? 'error' : ''}
                  placeholder="Enter your email address"
                />
                {error && error.includes('Email') && <span className="error-text">{error}</span>}
              </div>
              
              <button type="submit" className="reset-button" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Reset Password'}
              </button>
            </form>
          )}
          
          {!submitSuccess && (
            <div className="login-link">
              Remember your password? <a href="/login">Login</a>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
