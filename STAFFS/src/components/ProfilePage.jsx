import React, { useState, useEffect } from 'react';
import '../../styles/ProfilePage.css';
import Header from './Header';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const ProfilePage = ({ staffData, dashboardType, onBack, onLogout }) => {
  console.log('ProfilePage received staffData:', staffData);
  
  const [profile, setProfile] = useState(staffData || {
    name: '',
    role: '',
    email: '',
    phone_number: '',
    joinDate: '',
    nic: '',
    first_name: '',
    last_name: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({...profile});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Update document title
  useEffect(() => {
    document.title = dashboardType === "kitchen" ? 
      "Kitchen Staff Profile" : "Delivery Staff Profile";
    return () => {
      document.title = dashboardType === "kitchen" ? 
        "Kitchen Dashboard" : "Delivery Dashboard";
    };
  }, [dashboardType]);
  
  // Use staffData if provided, otherwise fetch from API
  useEffect(() => {
    if (staffData && Object.keys(staffData).length > 0) {
      // If we have staffData, use it directly
      const formattedData = {
        ...staffData,
        name: staffData.name || `${staffData.first_name || ''} ${staffData.last_name || ''}`,
        role: staffData.role === 'chef' ? 'Kitchen Staff' : 'Delivery Staff'
      };
      setProfile(formattedData);
      setFormData(formattedData);
      setIsLoading(false);
      return;
    }
    
    // Only fetch if staffData was not provided 
    // (This code path should not be reached anymore since we're always passing staffData)
    const fetchProfileData = async () => {
      // ...existing code...
    };
    
    if (!staffData || Object.keys(staffData).length === 0) {
      fetchProfileData();
    }
  }, [staffData, dashboardType, onLogout]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name?.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name?.trim()) newErrors.last_name = "Last name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    
    if (!formData.phone_number?.trim()) newErrors.phone_number = "Phone number is required";
    if (!formData.nic?.trim()) newErrors.nic = "NIC number is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) newErrors.currentPassword = "Current password is required";
    if (!passwordData.newPassword) newErrors.newPassword = "New password is required";
    else if (passwordData.newPassword.length < 6) newErrors.newPassword = "Password must be at least 6 characters";
    
    if (!passwordData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (passwordData.newPassword !== passwordData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setError('');
      
      // Get staff ID from staffData or localStorage as fallback
      const staffId = staffData?.staff_id || localStorage.getItem('staffId');
      
      if (!staffId || staffId === 'null') {
        setError('Staff ID not found. Please login again.');
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await axios.put(`${API_URL}/staff/profile/${staffId}`, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: formData.phone_number,
          nic: formData.nic
        });
        
        console.log('Profile updated:', response.data);
        
        const updatedProfile = {
          ...response.data,
          name: `${response.data.first_name} ${response.data.last_name}`
        };
        
        setProfile(updatedProfile);
        setFormData(updatedProfile);
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        
        // Update localStorage with new name if it changed
        localStorage.setItem('staffName', updatedProfile.name);
        localStorage.setItem('staffEmail', updatedProfile.email);
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (error) {
        console.error('Error updating profile:', error);
        setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (validatePasswordForm()) {
      setIsLoading(true);
      setError('');
      
      // Get staff ID from staffData or localStorage as fallback
      const staffId = staffData?.staff_id || localStorage.getItem('staffId');
      
      if (!staffId || staffId === 'null') {
        setError('Staff ID not found. Please login again.');
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await axios.put(`${API_URL}/staff/profile/${staffId}/password`, {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        });
        
        console.log('Password updated:', response.data);
        
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setSuccessMessage('Password changed successfully!');
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (error) {
        console.error('Error updating password:', error);
        setError(error.response?.data?.message || 'Failed to update password. Please ensure your current password is correct.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <div className="dashboard-container">
      <Header 
        title={dashboardType === "kitchen" ? "Kitchen Dashboard" : "Delivery Dashboard"}
        staffName={profile.name}
        staffRole={profile.role}
        onLogout={onLogout}
      />
      
      <div className="dashboard-content">
        <div className="profile-header">
          <button className="back-button" onClick={onBack}>
            <i className="fas fa-arrow-left"></i> 
            Back to {dashboardType === "kitchen" ? "Kitchen" : "Delivery"} Dashboard
          </button>
          <h1>My Profile</h1>
        </div>
        
        {isLoading && (
          <div className="loading-message">
            <i className="fas fa-spinner fa-spin"></i> Loading profile...
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}
        
        {successMessage && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i> {successMessage}
          </div>
        )}
        
        {!isLoading && !error && (
          <div className="profile-container">
            <div className="profile-sidebar">
              <div className="profile-image">
                <div className="avatar">
                  <i className={dashboardType === "kitchen" ? "fas fa-utensils" : "fas fa-motorcycle"}></i>
                </div>
                <h2>{profile.name}</h2>
                <p className="role-badge">{profile.role}</p>
              </div>
              
              <div className="sidebar-menu">
                <button 
                  className={!isChangingPassword ? "active" : ""}
                  onClick={() => setIsChangingPassword(false)}
                >
                  <i className="fas fa-user-circle"></i> Profile Information
                </button>
                <button 
                  className={isChangingPassword ? "active" : ""}
                  onClick={() => setIsChangingPassword(true)}
                >
                  <i className="fas fa-lock"></i> Change Password
                </button>
              </div>
            </div>
            
            <div className="profile-content">
              {!isChangingPassword ? (
                <>
                  <div className="section-header">
                    <h3>Profile Information</h3>
                    {!isEditing ? (
                      <button className="edit-button" onClick={() => setIsEditing(true)} disabled={isLoading}>
                        <i className="fas fa-edit"></i> Edit Profile
                      </button>
                    ) : (
                      <button className="cancel-button" onClick={() => {
                        setIsEditing(false);
                        setFormData({...profile});
                        setErrors({});
                      }} disabled={isLoading}>
                        <i className="fas fa-times"></i> Cancel
                      </button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="profile-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>First Name</label>
                          <input 
                            type="text" 
                            name="first_name" 
                            value={formData.first_name || ''} 
                            onChange={handleInputChange}
                            className={errors.first_name ? "error" : ""}
                            disabled={isLoading}
                          />
                          {errors.first_name && <div className="error-message">{errors.first_name}</div>}
                        </div>
                        
                        <div className="form-group">
                          <label>Last Name</label>
                          <input 
                            type="text" 
                            name="last_name" 
                            value={formData.last_name || ''} 
                            onChange={handleInputChange}
                            className={errors.last_name ? "error" : ""}
                            disabled={isLoading}
                          />
                          {errors.last_name && <div className="error-message">{errors.last_name}</div>}
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Email</label>
                          <input 
                            type="email" 
                            name="email" 
                            value={formData.email || ''} 
                            onChange={handleInputChange}
                            className={errors.email ? "error" : ""}
                            disabled={isLoading}
                          />
                          {errors.email && <div className="error-message">{errors.email}</div>}
                        </div>
                        
                        <div className="form-group">
                          <label>Phone Number</label>
                          <input 
                            type="tel" 
                            name="phone_number" 
                            value={formData.phone_number || ''} 
                            onChange={handleInputChange}
                            className={errors.phone_number ? "error" : ""}
                            disabled={isLoading}
                          />
                          {errors.phone_number && <div className="error-message">{errors.phone_number}</div>}
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>NIC Number</label>
                          <input 
                            type="text" 
                            name="nic" 
                            value={formData.nic || ''} 
                            onChange={handleInputChange}
                            className={errors.nic ? "error" : ""}
                            disabled={isLoading}
                          />
                          {errors.nic && <div className="error-message">{errors.nic}</div>}
                        </div>
                        
                        <div className="form-group">
                          <label>Join Date</label>
                          <input 
                            type="text" 
                            name="joinDate" 
                            value={formData.joinDate || ''} 
                            disabled={true}
                            readOnly
                          />
                        </div>
                      </div>
                      
                      <div className="form-actions">
                        <button type="submit" className="save-button" disabled={isLoading}>
                          {isLoading ? (
                            <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                          ) : (
                            <><i className="fas fa-save"></i> Save Changes</>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="profile-details">
                      <div className="detail-row">
                        <div className="detail-group">
                          <span className="detail-label">First Name</span>
                          <span className="detail-value">{profile.first_name}</span>
                        </div>
                        
                        <div className="detail-group">
                          <span className="detail-label">Last Name</span>
                          <span className="detail-value">{profile.last_name}</span>
                        </div>
                      </div>
                      
                      <div className="detail-row">
                        <div className="detail-group">
                          <span className="detail-label">Email</span>
                          <span className="detail-value">{profile.email}</span>
                        </div>
                        
                        <div className="detail-group">
                          <span className="detail-label">Phone Number</span>
                          <span className="detail-value">{profile.phone_number}</span>
                        </div>
                      </div>
                      
                      <div className="detail-row">
                        <div className="detail-group">
                          <span className="detail-label">NIC Number</span>
                          <span className="detail-value">{profile.nic || 'Not provided'}</span>
                        </div>
                        
                        <div className="detail-group">
                          <span className="detail-label">Join Date</span>
                          <span className="detail-value">{profile.joinDate}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="section-header">
                    <h3>Change Password</h3>
                    <button className="cancel-button" onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setErrors({});
                    }} disabled={isLoading}>
                      <i className="fas fa-times"></i> Cancel
                    </button>
                  </div>
                  
                  <form onSubmit={handlePasswordSubmit} className="profile-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <input 
                        type="password" 
                        name="currentPassword" 
                        value={passwordData.currentPassword} 
                        onChange={handlePasswordChange}
                        className={errors.currentPassword ? "error" : ""}
                        disabled={isLoading}
                      />
                      {errors.currentPassword && <div className="error-message">{errors.currentPassword}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label>New Password</label>
                      <input 
                        type="password" 
                        name="newPassword" 
                        value={passwordData.newPassword} 
                        onChange={handlePasswordChange}
                        className={errors.newPassword ? "error" : ""}
                        disabled={isLoading}
                      />
                      {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input 
                        type="password" 
                        name="confirmPassword" 
                        value={passwordData.confirmPassword} 
                        onChange={handlePasswordChange}
                        className={errors.confirmPassword ? "error" : ""}
                        disabled={isLoading}
                      />
                      {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                    </div>
                    
                    <div className="password-requirements">
                      <h4>Password Requirements:</h4>
                      <ul>
                        <li>At least 6 characters</li>
                        <li>Include uppercase and lowercase letters</li>
                        <li>Include at least one number</li>
                        <li>Include at least one special character</li>
                      </ul>
                    </div>
                    
                    <div className="form-actions">
                      <button type="submit" className="save-button" disabled={isLoading}>
                        {isLoading ? (
                          <><i className="fas fa-spinner fa-spin"></i> Changing Password...</>
                        ) : (
                          <><i className="fas fa-key"></i> Change Password</>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
