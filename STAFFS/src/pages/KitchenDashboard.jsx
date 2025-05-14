import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';
import '../../styles/KitchenDashboard.css';
import '../../styles/OrderTable.css';
import Header from '../components/Header';
import OrderStats from '../components/OrderStats';
import ProfilePage from '../components/ProfilePage';
import axios from 'axios';

// Hardcoded API URL for development - replace with environment variable in production
const API_URL = 'http://localhost:5000/api';

const KitchenDashboard = ({ onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [expandedItems, setExpandedItems] = useState({});
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [showProfile, setShowProfile] = useState(false);
  const [staffData, setStaffData] = useState({
    name: "",
    role: "Kitchen Staff",
    email: "",
    phone_number: "",
    nic: "",
    joinDate: "",
  });

  // Update document title
  useEffect(() => {
    document.title = "Kitchen Dashboard";
    return () => {
      document.title = "Restaurant Staff Portal"; // Reset on unmount
    };
  }, []);

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
        
        // Ensure this is a kitchen staff
        if (staffRole !== 'chef') {
          console.warn('Non-kitchen staff attempting to access kitchen dashboard');
          alert('You are not authorized to access this dashboard');
          onLogout(); // Redirect to login
          return;
        }
        
        const response = await axios.get(`${API_URL}/staff/profile/${staffId}`);
        if (response.data) {
          setStaffData({
            name: `${response.data.first_name} ${response.data.last_name}`,
            role: 'Kitchen Staff',
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

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/kitchen/orders${activeFilter !== 'All' ? `?status=${activeFilter}` : ''}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      setOrders(data);
      setLastRefreshed(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
      // Initialize with empty array in case of error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and set up refresh interval
  useEffect(() => {
    fetchOrders();
    
    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(fetchOrders, 30000);
    
    // Clean up interval when component unmounts
    return () => clearInterval(intervalId);
  }, [activeFilter]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchOrders();
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/kitchen/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kitchen_status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      // Update local state to reflect the change
      setOrders(orders.map(order => 
        order.order_id === orderId ? { ...order, kitchen_status: newStatus } : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    }
  };

  const toggleItems = (orderId) => {
    setExpandedItems(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getFilteredOrders = () => {
    let result = [...orders];
    
    // Apply type filter only, since status filter is applied at API level
    if (typeFilter !== 'All') {
      result = result.filter(order => order.order_type === typeFilter);
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.order_id.toString().includes(term) || 
        (order.items && order.items.some(item => (item.name || '').toLowerCase().includes(term)))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  };

  const filteredOrders = getFilteredOrders();

  // Calculate stats based on current orders
  const stats = {
    total: orders.length,
    new: orders.filter(order => order.kitchen_status === 'Pending').length,
    preparing: orders.filter(order => order.kitchen_status === 'Preparing').length,
    ready: orders.filter(order => order.kitchen_status === 'Ready').length,
    completed: orders.filter(order => order.kitchen_status === 'Cancelled').length
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  const getTimeElapsed = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const orderTime = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1 minute ago';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const hours = Math.floor(diffInMinutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };
  
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Pending': return 'badge-pending';
      case 'Preparing': return 'badge-preparing';
      case 'Ready': return 'badge-ready';
      case 'Cancelled': return 'badge-cancelled';
      default: return '';
    }
  };
  
 

  // Handle profile button click in header
  const handleProfileClick = () => {
    console.log('Profile button clicked, sending staffData:', staffData);
    setShowProfile(true);
  };
  
  // Return to dashboard from profile page
  const handleBackToDashboard = () => {
    setShowProfile(false);
  };
  
  // If showing profile page, render the profile component with kitchen staff data
  if (showProfile) {
    return <ProfilePage 
      staffData={staffData} 
      dashboardType="kitchen"
      onBack={handleBackToDashboard} 
      onLogout={onLogout} 
    />;
  }

  return (
    <div className="dashboard-container">
      <Header 
        title="Kitchen Dashboard" 
        staffName={staffData.name} 
        staffRole={staffData.role} 
        onLogout={onLogout}
        onProfileClick={handleProfileClick}
      />
      
      <div className="dashboard-content">
        <OrderStats stats={stats} />
        
        <div className="dashboard-main-content">
          <div className="orders-section">
            <div className="orders-header">
              <h2><i className="fas fa-utensils"></i> Incoming Orders</h2>
              <div className="dashboard-actions">
                <button 
                  className="refresh-button" 
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  {loading ? (
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
                    className={`filter-button ${activeFilter === 'Pending' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('Pending')}
                  >
                    Pending
                  </button>
                  <button 
                    className={`filter-button ${activeFilter === 'Preparing' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('Preparing')}
                  >
                    Preparing
                  </button>
                  <button 
                    className={`filter-button ${activeFilter === 'Ready' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('Ready')}
                  >
                    Ready
                  </button>
                  <button 
                    className={`filter-button ${activeFilter === 'Cancelled' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('Cancelled')}
                  >
                    Cancelled
                  </button>
                </div>
              </div>
            </div>
            
            <div className="filter-summary">
              <p>
                Showing {filteredOrders.length} orders
                {activeFilter !== 'All' && ` with status "${activeFilter}"`}
                {typeFilter !== 'All' && ` of type "${typeFilter}"`}
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
              {(activeFilter !== 'All' || typeFilter !== 'All' || searchTerm) && (
                <button 
                  className="clear-filters-btn"
                  onClick={() => {
                    setActiveFilter('All');
                    setTypeFilter('All');
                    setSearchTerm('');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
            
            <div className="order-types-container">
              <div className="order-type-section">
                <h3 className="section-title">Orders Queue</h3>
                <div className="orders-grid">
                  {loading ? (
                    <div className="loading-indicator">
                      <i className="fas fa-spinner fa-spin"></i>
                      <p>Loading orders...</p>
                    </div>
                  ) : error ? (
                    <div className="error-message">
                      <i className="fas fa-exclamation-triangle"></i>
                      <p>{error}</p>
                      <button onClick={fetchOrders} className="retry-btn">
                        Retry
                      </button>
                    </div>
                  ) : filteredOrders.length > 0 ? (
                    <div className="order-table-container">
                      <table className="order-table">
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'center' }}>Order ID</th>
                            <th style={{ textAlign: 'center' }}>Type</th>
                            <th style={{ textAlign: 'center' }}>Time</th>
                            <th style={{ textAlign: 'center' }}>Table/Delivery</th>
                            <th style={{ textAlign: 'center' }}>Kitchen Status</th>
                            <th style={{ textAlign: 'center' }}>Amount</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map(order => (
                            <React.Fragment key={order.order_id}>
                              <tr>
                                <td className="order-id">#{order.order_id}</td>
                                <td>
                                  <div className="order-type-cell">
                                    <span className={`order-type-badge ${(order.order_type || '').toLowerCase()}`}>
                                      {order.order_type || 'Unknown'}
                                    </span>
                                  </div>
                                </td>
                                <td title={formatDateTime(order.created_at)}>
                                  {getTimeElapsed(order.created_at)}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  {order.order_type === 'Dine-in' && `Table ${order.table_no || 'N/A'}`}
                                  {order.order_type === 'Delivery' && 'Delivery'}
                                  {order.order_type === 'Takeaway' && 'Pickup'}
                                  {!order.order_type && 'Unknown'}
                                </td>
                                <td className="status-column" style={{ textAlign: 'center' }}>
                                  <span className={`status-badge ${getStatusBadgeClass(order.kitchen_status)}`}>
                                    {order.kitchen_status || 'Unknown'}
                                  </span>
                                </td>
                                <td className="amount-cell" style={{ textAlign: 'center' }}>
                                  LKR {parseFloat(order.total_amount || 0).toFixed(2)}
                                </td>
                                <td className="actions-column" style={{ textAlign: 'center' }}>
                                  <select 
                                    className="update-status-select"
                                    value={order.kitchen_status || ''}
                                    onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Preparing">Preparing</option>
                                    <option value="Ready">Ready</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                  <button 
                                    className="update-button"
                                    onClick={() => {
                                      const statusOptions = ['Pending', 'Preparing', 'Ready'];
                                      const currentIndex = statusOptions.indexOf(order.kitchen_status || '');
                                      if (currentIndex < statusOptions.length - 1) {
                                        updateOrderStatus(order.order_id, statusOptions[currentIndex + 1]);
                                      }
                                    }}
                                  >
                                    Update
                                  </button>
                                </td>
                              </tr>
                              <tr>
                                <td colSpan="7">
                                  <button 
                                    className="toggle-items-btn" 
                                    onClick={() => toggleItems(order.order_id)}
                                  >
                                    <i className={`fas fa-${expandedItems[order.order_id] ? 'chevron-down' : 'chevron-right'}`}></i>
                                    {expandedItems[order.order_id] ? 'Hide Items' : 'Show Items'} ({(order.items || []).length})
                                  </button>
                                  
                                  {expandedItems[order.order_id] && (
                                    <div className="items-wrapper">
                                      <table className="items-table">
                                        <thead>
                                          <tr>
                                            <th width="10%">Qty</th>
                                            <th width="40%">Item</th>
                                            <th width="30%">Notes</th>
                                            <th width="20%">Price</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(order.items || []).map((item, idx) => (
                                            <tr key={idx}>
                                              <td className="item-quantity">{item.quantity || 1}x</td>
                                              <td>{item.name || 'Unknown item'}</td>
                                              <td className="item-notes">{item.notes || '-'}</td>
                                              <td className="amount-cell">LKR {((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                      
                                      {order.special_instructions && (
                                        <div className="instructions-text">
                                          <strong>Special Instructions:</strong> {order.special_instructions}
                                        </div>
                                      )}
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
                      <i className="fas fa-utensils"></i>
                      <p>No orders match your filter</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenDashboard;