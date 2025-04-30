import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { getUserProfile, updateUserProfile, getUserReservations } from '../utils/api';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  
  // State for user data
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: ''
  });
  
  // State for form handling
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  
  // State for orders and reservations
  const [orderHistory, setOrderHistory] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
          // Redirect to login if not logged in
          navigate('/login');
          return;
        }
        
        // Fetch user profile data
        const data = await getUserProfile();
        setUserData(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load your profile data. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  // Fetch reservations when the reservations tab is active
  useEffect(() => {
    if (activeTab === 'reservations') {
      const fetchReservations = async () => {
        try {
          setIsLoadingReservations(true);
          setSubmitError(''); // Clear any previous errors
          
          console.log('Fetching reservations...');
          const reservationsData = await getUserReservations();
          
          console.log('Received reservations:', reservationsData);
          setReservations(reservationsData);
        } catch (err) {
          console.error('Error fetching reservations:', err);
          setSubmitError('Could not load your reservations. Please try again later.');
        } finally {
          setIsLoadingReservations(false);
        }
      };
      
      fetchReservations();
    }
  }, [activeTab]);
  
  // Start editing profile
  const handleEditClick = () => {
    setIsEditing(true);
    setEditedData({...userData});
  };
  
  // Cancel editing
  const handleCancelClick = () => {
    setIsEditing(false);
    setFormErrors({});
  };
  
  // Handle input changes while editing
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData({
      ...editedData,
      [name]: value
    });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    // First name validation
    if (!editedData.first_name?.trim()) {
      errors.first_name = 'First name is required';
    }
    
    // Last name validation
    if (!editedData.last_name?.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    // Email validation
    if (!editedData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editedData.email)) {
      errors.email = 'Email is invalid';
    }
    
    // Phone number validation
    if (!editedData.phone_number?.trim()) {
      errors.phone_number = 'Phone number is required';
    } else if (!/^\d{10}$/.test(editedData.phone_number.replace(/\D/g, ''))) {
      errors.phone_number = 'Phone number must be 10 digits';
    }
    
    // Address validation is required but no specific format
    if (!editedData.address?.trim()) {
      errors.address = 'Address is required';
    }
    
    return errors;
  };
  
  // Handle save button click
  const handleSaveClick = async () => {
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setSubmitError('');
      
      // Call API to update profile
      const updatedData = await updateUserProfile(editedData);
      
      // Update local state with new data
      setUserData(updatedData);
      
      // Update user data in localStorage if needed
      const storedUser = JSON.parse(localStorage.getItem('user')) || {};
      localStorage.setItem('user', JSON.stringify({
        ...storedUser,
        id: updatedData.user_id,
        first_name: updatedData.first_name,
        last_name: updatedData.last_name,
        name: `${updatedData.first_name} ${updatedData.last_name}`,
        email: updatedData.email
      }));
      
      // Exit edit mode and show success message
      setIsEditing(false);
      setSubmitSuccess(true);
      
      // Reset success message after a delay
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
      
      // Dispatch event to update navbar
      window.dispatchEvent(new Event('authChange'));
      
    } catch (err) {
      console.error('Failed to update profile:', err);
      setSubmitError(err.message || 'Failed to update your profile. Please try again.');
    }
  };
  
  // Format date for display (YYYY-MM-DD to user-friendly format)
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };
  
  // Format price to show as currency
  const formatPrice = (price) => {
    return `LKR ${parseFloat(price).toFixed(2)}`;
  };
  
  // Add this function to handle reservation cancellation
  const handleCancelReservation = async (reservationId) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        setIsLoadingReservations(true);
        
        // For now, just use a simple approach without an actual API call
        console.log('Cancelling reservation:', reservationId);
        
        // Simulate an API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Remove the reservation from the local state
        setReservations(prev => prev.filter(res => res.reserve_id !== reservationId));
        
        setIsLoadingReservations(false);
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      } catch (err) {
        console.error('Failed to cancel reservation:', err);
        setIsLoadingReservations(false);
        setSubmitError('Failed to cancel reservation. Please try again.');
        setTimeout(() => setSubmitError(''), 5000);
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-container loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-container error-container">
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
            <button onClick={() => navigate('/')}>Return to Home</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-overlay"></div>
        <div className="profile-content">
          <h2>My Account</h2>
          <p>Manage your profile, orders, and reservations</p>
        </div>
      </div>
      
      <div className="profile-container">
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user"></i> Profile
          </button>
          <button 
            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className="fas fa-shopping-bag"></i> Order History
          </button>
          <button 
            className={`tab-button ${activeTab === 'reservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservations')}
          >
            <i className="fas fa-calendar-alt"></i> Reservations
          </button>
        </div>
        
        <div className="profile-content-area">
          {submitSuccess && (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              <span>Profile updated successfully!</span>
            </div>
          )}
          
          {submitError && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              <span>{submitError}</span>
            </div>
          )}
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-tab-content">
              <h3>Personal Information</h3>
              
              {!isEditing ? (
                <div className="profile-info">
                  <div className="info-row">
                    <div className="info-label">Name</div>
                    <div className="info-value">{userData.first_name} {userData.last_name}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Email</div>
                    <div className="info-value">{userData.email}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Phone</div>
                    <div className="info-value">{userData.phone_number}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Address</div>
                    <div className="info-value">{userData.address || 'Not provided'}</div>
                  </div>
                  
                  <button 
                    className="edit-profile-btn" 
                    onClick={handleEditClick}
                  >
                    <i className="fas fa-edit"></i> Edit Profile
                  </button>
                </div>
              ) : (
                <div className="profile-edit-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="first_name">First Name</label>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={editedData.first_name || ''}
                        onChange={handleChange}
                        className={formErrors.first_name ? 'error' : ''}
                      />
                      {formErrors.first_name && <span className="error-text">{formErrors.first_name}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="last_name">Last Name</label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={editedData.last_name || ''}
                        onChange={handleChange}
                        className={formErrors.last_name ? 'error' : ''}
                      />
                      {formErrors.last_name && <span className="error-text">{formErrors.last_name}</span>}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={editedData.email || ''}
                        onChange={handleChange}
                        className={formErrors.email ? 'error' : ''}
                      />
                      {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone_number">Phone Number</label>
                      <input
                        type="tel"
                        id="phone_number"
                        name="phone_number"
                        value={editedData.phone_number || ''}
                        onChange={handleChange}
                        className={formErrors.phone_number ? 'error' : ''}
                        placeholder="e.g., 1234567890"
                      />
                      {formErrors.phone_number && <span className="error-text">{formErrors.phone_number}</span>}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={editedData.address || ''}
                      onChange={handleChange}
                      className={formErrors.address ? 'error' : ''}
                    />
                    {formErrors.address && <span className="error-text">{formErrors.address}</span>}
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      className="save-btn" 
                      onClick={handleSaveClick}
                    >
                      Save Changes
                    </button>
                    <button 
                      className="cancel-btn" 
                      onClick={handleCancelClick}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              <div className="account-security">
                <h3>Account Security</h3>
                <button className="change-password-btn">
                  <i className="fas fa-lock"></i> Change Password
                </button>
              </div>
            </div>
          )}
          
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="orders-tab-content">
              <h3>Order History</h3>
              
              {orderHistory.length === 0 ? (
                <div className="no-data-message">
                  <i className="fas fa-shopping-bag"></i>
                  <p>You haven't placed any orders yet.</p>
                  <button onClick={() => navigate('/menu')}>Browse Menu</button>
                </div>
              ) : (
                <div className="orders-list">
                  <div className="order-list-header">
                    <span className="order-id">Order ID</span>
                    <span className="order-date">Date</span>
                    <span className="order-total">Total</span>
                    <span className="order-status">Status</span>
                    <span className="order-actions">Actions</span>
                  </div>
                  
                  {orderHistory.map(order => (
                    <div key={order.id} className="order-item">
                      <div className="order-id">#{order.id}</div>
                      <div className="order-date">{formatDate(order.date)}</div>
                      <div className="order-total">{formatPrice(order.total)}</div>
                      <div className={`order-status status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </div>
                      <div className="order-actions">
                        <button className="view-order-details">
                          <i className="fas fa-eye"></i> View
                        </button>
                        <button className="reorder-btn">
                          <i className="fas fa-redo-alt"></i> Reorder
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Reservations Tab */}
          {activeTab === 'reservations' && (
            <div className="reservations-tab-content">
              <h3>Your Reservations</h3>
              
              {isLoadingReservations ? (
                <div className="loading-container" style={{ minHeight: '200px' }}>
                  <div className="loading-spinner"></div>
                  <p>Loading your reservations...</p>
                </div>
              ) : reservations.length === 0 ? (
                <div className="no-data-message">
                  <i className="fas fa-calendar-alt"></i>
                  <p>You don't have any reservations yet.</p>
                  <button onClick={() => navigate('/reservation')}>Make a Reservation</button>
                </div>
              ) : (
                <div className="reservations-list">
                  <div className="reservation-list-header">
                    <span className="reservation-id">Reservation ID</span>
                    <span className="reservation-date">Date</span>
                    <span className="reservation-time">Time</span>
                    <span className="reservation-table">Table</span>
                    <span className="reservation-status">Status</span>
                    <span className="reservation-actions">Actions</span>
                  </div>
                  
                  {reservations.map(reservation => {
                    const reservationDate = new Date(reservation.date_time);
                    const isPast = reservationDate < new Date();
                    const status = isPast ? 'Completed' : 'Confirmed';
                    
                    return (
                      <div key={reservation.reserve_id} className="reservation-item">
                        <div className="reservation-id">#{reservation.reserve_id}</div>
                        <div className="reservation-date">{formatDate(reservation.date_time)}</div>
                        <div className="reservation-time">{formatTime(reservation.date_time)}</div>
                        <div className="reservation-table">
                          Table {reservation.table_no}
                          {reservation.capacity ? ` (seats ${reservation.capacity})` : ''}
                          {/* Only show location if it exists */}
                        </div>
                        <div className={`reservation-status status-${status.toLowerCase()}`}>
                          {status}
                        </div>
                        <div className="reservation-actions">
                          <button 
                            className="view-reservation-details"
                            onClick={() => {
                              alert(`
                                Reservation Details:
                                Date: ${formatDate(reservation.date_time)}
                                Time: ${formatTime(reservation.date_time)}
                                Table: ${reservation.table_no}
                                ${reservation.capacity ? `Capacity: ${reservation.capacity} people` : ''}
                                ${reservation.special_requests ? `Special Requests: ${reservation.special_requests}` : 'No special requests'}
                              `);
                            }}
                          >
                            <i className="fas fa-eye"></i> View
                          </button>
                          {!isPast && (
                            <button 
                              className="cancel-reservation-btn"
                              onClick={() => handleCancelReservation(reservation.reserve_id)}
                            >
                              <i className="fas fa-times"></i> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="new-reservation">
                <button 
                  className="new-reservation-btn"
                  onClick={() => navigate('/reservation')}
                >
                  <i className="fas fa-plus"></i> New Reservation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
