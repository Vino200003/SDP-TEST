import React, { useState } from 'react';
import '../../styles/Login.css';
import Logo from '../components/Logo';

const Login = ({ onLogin }) => {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Kitchen staff mock credentials
    const isKitchenStaff = staffId === 'K1001' && password === 'kitchen123';
    
    // Delivery staff mock credentials
    const isDeliveryStaff = staffId === 'D2001' && password === 'delivery123';
    
    if (isKitchenStaff) {
      onLogin('kitchen');
    } else if (isDeliveryStaff) {
      onLogin('delivery');
    } else {
      setError('Invalid credentials. Please try again.');
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
            <label htmlFor="staffId">Staff ID</label>
            <div className="input-with-icon">
              <i className="fas fa-user"></i>
              <input
                type="text"
                id="staffId"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="Enter your staff ID"
                required
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
              />
            </div>
          </div>
          
          <button type="submit" className="login-button">
            <span>Login</span>
            <i className="fas fa-arrow-right"></i>
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
              <span>ID: K1001</span>
              <span>Password: kitchen123</span>
            </div>
            <div className="credential-item">
              <strong>Delivery Staff:</strong> 
              <span>ID: D2001</span>
              <span>Password: delivery123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;