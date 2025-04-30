import { useState } from 'react';
import Footer from '../components/Footer';
import '../styles/SignupPage.css';

const SignupPage = () => {
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    password: '',
    confirm_password: ''
  });

  // Error states
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
    
    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Phone number validation
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone_number.replace(/\D/g, ''))) {
      newErrors.phone_number = 'Phone number must be 10 digits';
    }
    
    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
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
      // Prepare data for API - remove confirm_password as it's not needed for the backend
      const { confirm_password, ...apiData } = formData;
      
      // Make API call using the correct URL format with proxy
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
        credentials: 'include' // Include cookies if any are set
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Registration successful
      setSubmitSuccess(true);
      console.log('Registration successful:', data);
      
      // Reset form after successful submission
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        address: '',
        password: '',
        confirm_password: ''
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError(error.message || 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-header">
        <div className="signup-overlay"></div>
        <div className="signup-content">
          <h2>Join VANNI INN</h2>
          <p>Create an account to enjoy exclusive benefits and seamless dining experiences.</p>
        </div>
      </div>
      
      <div className="signup-container">
        <div className="signup-form-container">
          <h1>Create Account</h1>
          
          {submitSuccess && (
            <div className="success-message">
              Registration successful! You can now <a href="/login">login</a>.
            </div>
          )}
          
          {submitError && (
            <div className="error-message">
              {submitError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={errors.first_name ? 'error' : ''}
                />
                {errors.first_name && <span className="error-text">{errors.first_name}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={errors.last_name ? 'error' : ''}
                />
                {errors.last_name && <span className="error-text">{errors.last_name}</span>}
              </div>
            </div>
            
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
              <label htmlFor="phone_number">Phone Number</label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className={errors.phone_number ? 'error' : ''}
                placeholder="e.g., 1234567890"
              />
              {errors.phone_number && <span className="error-text">{errors.phone_number}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
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
            
            <div className="form-group">
              <label htmlFor="confirm_password">Confirm Password</label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className={errors.confirm_password ? 'error' : ''}
              />
              {errors.confirm_password && <span className="error-text">{errors.confirm_password}</span>}
            </div>
            
            <button type="submit" className="signup-button" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="login-link">
            Already have an account? <a href="/login">Login</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignupPage;
