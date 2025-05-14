import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';
import '../../styles/DeliveryDashboard.css';
import Header from '../components/Header';
import DeliveryStats from '../components/DeliveryStats';
import ProfilePage from '../components/ProfilePage';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const DeliveryDashboard = ({ onLogout }) => {
  const [deliveries, setDeliveries] = useState([
    {
      id: 'DEL-001',
      orderId: 'ORD-002',
      customer: {
        name: 'John Smith',
        address: '123 Main St, Cityville',
        phone: '555-1234'
      },
      items: [
        { name: 'Margherita Pizza', quantity: 1 },
        { name: 'Garlic Bread', quantity: 1 }
      ],
      status: 'Ready for Pickup',
      timestamp: '2023-10-12T10:35:00',
      estimatedDeliveryTime: '25-35 min',
      totalAmount: '$24.99',
      payment: {
        method: 'Card',
        status: 'Paid'
      }
    },
    {
      id: 'DEL-002',
      orderId: 'ORD-005',
      customer: {
        name: 'Emily Johnson',
        address: '456 Oak Ave, Townsville',
        phone: '555-5678'
      },
      items: [
        { name: 'Chicken Curry', quantity: 1 },
        { name: 'Naan Bread', quantity: 2 },
        { name: 'Mango Lassi', quantity: 1 }
      ],
      status: 'Ready for Pickup',
      timestamp: '2023-10-12T10:40:00',
      estimatedDeliveryTime: '35-45 min',
      totalAmount: '$32.50',
      payment: {
        method: 'Cash',
        status: 'Pending'
      }
    },
    {
      id: 'DEL-003',
      orderId: 'ORD-007',
      customer: {
        name: 'Michael Brown',
        address: '789 Pine Blvd, Villagetown',
        phone: '555-9012'
      },
      items: [
        { name: 'Beef Burger', quantity: 2 },
        { name: 'Onion Rings', quantity: 1 },
        { name: 'Chocolate Milkshake', quantity: 2 }
      ],
      status: 'Out for Delivery',
      timestamp: '2023-10-12T10:20:00',
      estimatedDeliveryTime: '10-15 min',
      totalAmount: '$38.75',
      payment: {
        method: 'Cash',
        status: 'Pending'
      }
    }
  ]);

  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedItems, setExpandedItems] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const updateDeliveryStatus = (deliveryId, newStatus) => {
    setDeliveries(deliveries.map(delivery => 
      delivery.id === deliveryId ? { ...delivery, status: newStatus } : delivery
    ));
  };

  const updatePaymentStatus = (deliveryId, newStatus) => {
    setDeliveries(deliveries.map(delivery => 
      delivery.id === deliveryId 
        ? { ...delivery, payment: { ...delivery.payment, status: newStatus } } 
        : delivery
    ));
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
    readyForPickup: deliveries.filter(d => d.status === 'Ready for Pickup').length,
    outForDelivery: deliveries.filter(d => d.status === 'Out for Delivery').length,
    delivered: deliveries.filter(d => d.status === 'Delivered').length,
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getBadgeClass = (status) => {
    switch(status) {
      case 'Ready for Pickup': return 'badge-pickup';
      case 'Out for Delivery': return 'badge-delivery';
      case 'Delivered': return 'badge-delivered';
      default: return '';
    }
  };

  const getPaymentBadgeClass = (method, status) => {
    if (method === 'Card' && status === 'Paid') return 'badge-paid';
    if (method === 'Cash' && status === 'Paid') return 'badge-paid';
    return 'badge-pending-payment';
  };

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
  
  // Fetch staff data on component mount
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const staffId = localStorage.getItem('staffId');
        if (!staffId || staffId === 'null') {
          console.log('No staff ID found in localStorage');
          return;
        }
        
        const response = await axios.get(`${API_URL}/staff/profile/${staffId}`);
        if (response.data) {
          // Check if this staff is a delivery staff (delivery role)
          if (response.data.role === 'delivery') {
            setStaffData({
              name: `${response.data.first_name} ${response.data.last_name}`,
              role: 'Delivery Staff'
            });
          } else {
            console.warn('Non-delivery staff accessing delivery dashboard');
            // Handle unauthorized access if needed
          }
        }
      } catch (error) {
        console.error('Error fetching staff data:', error);
      }
    };
    
    fetchStaffData();
  }, []);

  // Update document title
  useEffect(() => {
    document.title = "Delivery Dashboard";
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

  // Handle profile button click in header
  const handleProfileClick = () => {
    console.log('Profile button clicked, sending staffData:', staffData);
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
      // Refresh deliveries data
      // You would replace this with your actual data fetching logic
      const refreshedDeliveries = [...deliveries];
      setDeliveries(refreshedDeliveries);
      
      // Refresh staff data if needed
      const staffId = localStorage.getItem('staffId');
      if (staffId) {
        const response = await axios.get(`${API_URL}/staff/profile/${staffId}`);
        if (response.data) {
          setStaffData({
            ...response.data,
            name: `${response.data.first_name} ${response.data.last_name}`,
            role: 'Delivery Staff'
          });
        }
      }
      
      // Show a temporary success message
      const successElement = document.createElement('div');
      successElement.className = 'refresh-success-message';
      successElement.innerHTML = '<i class="fas fa-check-circle"></i> Dashboard refreshed!';
      document.body.appendChild(successElement);
      
      setTimeout(() => {
        document.body.removeChild(successElement);
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
                    className={`filter-button ${activeFilter === 'Ready for Pickup' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('Ready for Pickup')}
                  >
                    Ready for Pickup
                  </button>
                  <button 
                    className={`filter-button ${activeFilter === 'Out for Delivery' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('Out for Delivery')}
                  >
                    Out for Delivery
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
              {filteredDeliveries.length > 0 ? (
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
                                <option value="Ready for Pickup">Ready for Pickup</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                              <button 
                                className="update-button"
                                onClick={() => {
                                  const statusOptions = ['Ready for Pickup', 'Out for Delivery', 'Delivered'];
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