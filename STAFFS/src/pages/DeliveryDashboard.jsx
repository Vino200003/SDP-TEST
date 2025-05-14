import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';
import '../../styles/DeliveryDashboard.css';
import Header from '../components/Header';
import DeliveryStats from '../components/DeliveryStats';
import ProfilePage from '../components/ProfilePage';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const DeliveryDashboard = ({ onLogout }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedItems, setExpandedItems] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshMessage, setShowRefreshMessage] = useState(false);

  // Add state for showing profile page
  const [showProfile, setShowProfile] = useState(false);
  const [staffData, setStaffData] = useState({
    name: "",
    role: "Delivery Staff",
    email: "",
    phone_number: "",
    nic: "",
    joinDate: "",
  });
  
  // Update document title
  useEffect(() => {
    document.title = "Delivery Dashboard";
    return () => {
      document.title = "Restaurant Staff Portal"; // Reset on unmount
    };
  }, []);
  
  // Fetch delivery orders assigned to this staff member
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const staffId = localStorage.getItem('staffId');
      
      if (!staffId) {
        console.log('No staff ID found in localStorage');
        setError('Authentication error. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_URL}/delivery/staff/${staffId}/deliveries`);
      setDeliveries(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
      setError('Failed to load deliveries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check authorization and fetch staff data
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const staffId = localStorage.getItem('staffId');
        const staffRole = localStorage.getItem('staffRole');
        
        if (!staffId || staffId === 'null') {
          console.log('No staff ID found in localStorage');
          onLogout(); // Redirect to login if no ID
          return;
        }
        
        // Ensure this is a delivery staff
        if (staffRole !== 'delivery') {
          console.warn('Non-delivery staff attempting to access delivery dashboard');
          alert('You are not authorized to access this dashboard');
          onLogout(); // Redirect to login
          return;
        }
        
        const response = await axios.get(`${API_URL}/staff/profile/${staffId}`);
        if (response.data) {
          setStaffData({
            name: `${response.data.first_name} ${response.data.last_name}`,
            role: 'Delivery Staff',
            email: response.data.email,
            phone_number: response.data.phone_number,
            nic: response.data.nic,
            joinDate: response.data.joinDate,
            // Store the full data for profile page
            ...response.data
          });
        }
      } catch (error) {
        console.error('Error fetching staff data:', error);
        if (error.response && error.response.status === 401) {
          onLogout(); // Unauthorized, redirect to login
        }
      }
    };
    
    checkAuthAndFetchData();
  }, [onLogout]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchDeliveries();
    
    // Set up auto-refresh every 2 minutes
    const intervalId = setInterval(fetchDeliveries, 120000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      // Extract the numeric order ID from the delivery ID (e.g., "DEL-001" -> "1")
      const orderId = deliveryId.replace('DEL-', '').replace(/^0+/, '');
      
      // Map frontend status to backend status
      let backendStatus;
      if (newStatus === 'In Transit') {
        backendStatus = 'on_the_way';
      } else if (newStatus === 'Delivered') {
        backendStatus = 'delivered';
      } else if (newStatus === 'Canceled') {
        backendStatus = 'cancelled';
      } else {
        backendStatus = 'pending';
      }
      
      await axios.put(`${API_URL}/delivery/orders/${orderId}/status`, {
        status: backendStatus
      });
      
      // Update local state to reflect the change
      setDeliveries(deliveries.map(delivery => 
        delivery.id === deliveryId ? { ...delivery, status: newStatus } : delivery
      ));
    } catch (err) {
      console.error('Error updating delivery status:', err);
      alert('Failed to update delivery status. Please try again.');
    }
  };

  const updatePaymentStatus = async (deliveryId, newStatus) => {
    try {
      // Extract the numeric order ID from the delivery ID
      const orderId = deliveryId.replace('DEL-', '').replace(/^0+/, '');
      
      // Update payment status in the database
      await axios.put(`${API_URL}/orders/${orderId}`, {
        payment_status: newStatus === 'Paid' ? 'paid' : 'unpaid'
      });
      
      // Update local state
      setDeliveries(deliveries.map(delivery => 
        delivery.id === deliveryId 
          ? { ...delivery, payment: { ...delivery.payment, status: newStatus } } 
          : delivery
      ));
    } catch (err) {
      console.error('Error updating payment status:', err);
      alert('Failed to update payment status. Please try again.');
    }
  };

  const filteredDeliveries = activeFilter === 'All' 
    ? deliveries 
    : deliveries.filter(delivery => delivery.status === activeFilter);

  const toggleItems = (deliveryId) => {
    setExpandedItems(prev => ({
      ...prev,
      [deliveryId]: !prev[deliveryId]
    }));
  };

  const stats = {
    total: deliveries.length,
    assigned: deliveries.filter(d => d.status === 'Assigned').length,
    inTransit: deliveries.filter(d => d.status === 'In Transit').length,
    delivered: deliveries.filter(d => d.status === 'Delivered').length,
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getBadgeClass = (status) => {
    switch(status) {
      case 'Assigned': return 'badge-pickup';
      case 'In Transit': return 'badge-delivery';
      case 'Delivered': return 'badge-delivered';
      case 'Canceled': return 'badge-cancelled';
      default: return '';
    }
  };

  const getPaymentBadgeClass = (method, status) => {
    if (status === 'Paid') return 'badge-paid';
    return 'badge-pending-payment';
  };

  // Handle profile button click in header
  const handleProfileClick = () => {
    setShowProfile(true);
  };
  
  // Return to dashboard from profile page
  const handleBackToDashboard = () => {
    setShowProfile(false);
  };
  
  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      await fetchDeliveries();
      
      // Show a temporary success message
      setShowRefreshMessage(true);
      setTimeout(() => {
        setShowRefreshMessage(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // If showing profile page, render the profile component with delivery staff data
  if (showProfile) {
    return <ProfilePage 
      staffData={staffData} 
      dashboardType="delivery"
      onBack={handleBackToDashboard} 
      onLogout={onLogout} 
    />;
  }

  return (
    <div className="dashboard-container">
      <Header 
        title="Delivery Dashboard" 
        staffName={staffData.name}
        staffRole={staffData.role}
        onLogout={onLogout}
        onProfileClick={handleProfileClick}
      />
      
      <div className="dashboard-content">
        <DeliveryStats stats={stats} />
        
        {showRefreshMessage && (
          <div className="refresh-success-message">
            <i className="fas fa-check-circle"></i> Dashboard refreshed!
          </div>
        )}
        
        <div className="dashboard-main-content">
          <div className="deliveries-section">
            <div className="orders-header">
              <h2><i className="fas fa-motorcycle"></i> Assigned Deliveries</h2>
              <div className="dashboard-actions">
                <button 
                  className="refresh-button" 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <><i className="fas fa-spinner fa-spin"></i> Refreshing...</>
                  ) : (
                    <><i className="fas fa-sync-alt"></i> Refresh</>
                  )}
                </button>
                <div className="order-filters">
                  <button 
                    className={`filter-button ${activeFilter === 'All' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('All')}
                  >
                    All
                  </button>
                  <button 
                    className={`filter-button ${activeFilter === 'Assigned' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('Assigned')}
                  >
                    Assigned
                  </button>
                  <button 
                    className={`filter-button ${activeFilter === 'In Transit' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('In Transit')}
                  >
                    In Transit
                  </button>
                  <button 
                    className={`filter-button ${activeFilter === 'Delivered' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('Delivered')}
                  >
                    Delivered
                  </button>
                </div>
              </div>
            </div>
            
            <div className="orders-grid">
              {loading ? (
                <div className="loading-indicator">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading deliveries...</p>
                </div>
              ) : error ? (
                <div className="error-message">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>{error}</p>
                  <button onClick={fetchDeliveries} className="retry-btn">
                    Retry
                  </button>
                </div>
              ) : filteredDeliveries.length > 0 ? (
                <div className="order-table-container">
                  <table className="order-table">
                    <thead>
                      <tr>
                        <th>Delivery ID</th>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Address</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Payment</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDeliveries.map(delivery => (
                        <React.Fragment key={delivery.id}>
                          <tr>
                            <td className="delivery-id">{delivery.id}</td>
                            <td>{delivery.orderId}</td>
                            <td>
                              <div className="customer-name">{delivery.customer.name}</div>
                              <div className="customer-phone">
                                <a href={`tel:${delivery.customer.phone}`}>
                                  {delivery.customer.phone}
                                </a>
                              </div>
                            </td>
                            <td className="address-cell">{delivery.customer.address}</td>
                            <td title={new Date(delivery.timestamp).toLocaleString()}>
                              {formatTime(delivery.timestamp)}
                            </td>
                            <td className="status-column">
                              <span className={`status-badge ${getBadgeClass(delivery.status)}`}>
                                {delivery.status}
                              </span>
                            </td>
                            <td className="amount-cell">
                              {delivery.totalAmount}
                            </td>
                            <td className="payment-column">
                              <div className="payment-method">
                                {delivery.payment.method}
                              </div>
                              <span className={`status-badge ${getPaymentBadgeClass(delivery.payment.method, delivery.payment.status)}`}>
                                {delivery.payment.status}
                              </span>
                              {delivery.payment.method === 'Cash' && delivery.payment.status === 'Pending' && (
                                <button 
                                  className="mark-paid-btn"
                                  onClick={() => updatePaymentStatus(delivery.id, 'Paid')}
                                >
                                  Mark Paid
                                </button>
                              )}
                            </td>
                            <td className="actions-column">
                              <select 
                                className="update-status-select"
                                value={delivery.status}
                                onChange={(e) => updateDeliveryStatus(delivery.id, e.target.value)}
                              >
                                <option value="Assigned">Assigned</option>
                                <option value="In Transit">In Transit</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Canceled">Canceled</option>
                              </select>
                              <button 
                                className="update-button"
                                onClick={() => {
                                  const statusOptions = ['Assigned', 'In Transit', 'Delivered'];
                                  const currentIndex = statusOptions.indexOf(delivery.status);
                                  if (currentIndex < statusOptions.length - 1) {
                                    updateDeliveryStatus(delivery.id, statusOptions[currentIndex + 1]);
                                  }
                                }}
                              >
                                Update
                              </button>
                              <button 
                                className="toggle-items-btn" 
                                onClick={() => toggleItems(delivery.id)}
                              >
                                <i className={`fas fa-${expandedItems[delivery.id] ? 'chevron-down' : 'chevron-right'}`}></i>
                                {expandedItems[delivery.id] ? 'Hide Items' : 'Show Items'} ({delivery.items.length})
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="9">
                              {expandedItems[delivery.id] && (
                                <div className="items-wrapper">
                                  <table className="items-table">
                                    <thead>
                                      <tr>
                                        <th width="10%">Qty</th>
                                        <th width="90%">Item</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {delivery.items.map((item, idx) => (
                                        <tr key={idx}>
                                          <td className="item-quantity">{item.quantity}x</td>
                                          <td>{item.name}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  <div className="estimated-time-info">
                                    <i className="fas fa-clock"></i> Estimated delivery time: {delivery.estimatedDeliveryTime}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-orders-message">
                  <i className="fas fa-inbox"></i>
                  <p>No deliveries match the selected filter</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;