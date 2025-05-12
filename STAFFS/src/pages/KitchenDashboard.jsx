import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';
import '../../styles/KitchenDashboard.css';
import '../../styles/OrderTable.css';
import Header from '../components/Header';
import OrderStats from '../components/OrderStats';

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

  return (
    <div className="dashboard-container">
      <Header 
        title="Kitchen Dashboard" 
        staffName="Michael Chen" 
        staffRole="Kitchen Staff" 
        onLogout={onLogout}
      />
      
      <div className="dashboard-content">
        <OrderStats stats={stats} />
        
        <div className="orders-controls">
          <div className="orders-header">
            <h2>Orders Queue</h2>
            
            <div className="header-actions">
              <button 
                className="refresh-btn" 
                onClick={handleRefresh}
                disabled={loading}
              >
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
              <div className="last-refreshed">
                Last updated: {formatDateTime(lastRefreshed)}
              </div>
            </div>
            
            <div className="advanced-filters">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search order id or item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button 
                  className="search-btn"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  {searchTerm ? <i className="fas fa-times"></i> : <i className="fas fa-search"></i>}
                </button>
              </div>
              
              <div className="filter-group">
                <label>Status:</label>
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
              
              <div className="filter-group">
                <label>Type:</label>
                <div className="order-filters">
                  <button 
                    className={`filter-button ${typeFilter === 'All' ? 'active' : ''}`}
                    onClick={() => setTypeFilter('All')}
                  >
                    All
                  </button>
                  <button 
                    className={`filter-button ${typeFilter === 'Dine-in' ? 'active' : ''}`}
                    onClick={() => setTypeFilter('Dine-in')}
                  >
                    Dine-in
                  </button>
                  <button 
                    className={`filter-button ${typeFilter === 'Takeaway' ? 'active' : ''}`}
                    onClick={() => setTypeFilter('Takeaway')}
                  >
                    Takeaway
                  </button>
                  <button 
                    className={`filter-button ${typeFilter === 'Delivery' ? 'active' : ''}`}
                    onClick={() => setTypeFilter('Delivery')}
                  >
                    Delivery
                  </button>
                </div>
              </div>
              
              <div className="sort-control">
                <label>Sort:</label>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="sort-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
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
                        <th>Order ID</th>
                        <th>Type</th>
                        <th>Time</th>
                        <th>Table/Delivery</th>
                        <th>Kitchen Status</th>
                        <th>Amount</th>
                        <th>Actions</th>
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
                            <td>
                              {order.order_type === 'Dine-in' && `Table ${order.table_no || 'N/A'}`}
                              {order.order_type === 'Delivery' && 'Delivery'}
                              {order.order_type === 'Takeaway' && 'Pickup'}
                              {!order.order_type && 'Unknown'}
                            </td>
                            <td className="status-column">
                              <span className={`status-badge ${getStatusBadgeClass(order.kitchen_status)}`}>
                                {order.kitchen_status || 'Unknown'}
                              </span>
                            </td>
                            <td className="amount-cell">
                              ${parseFloat(order.total_amount || 0).toFixed(2)}
                            </td>
                            <td className="actions-column">
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
                                          <td className="amount-cell">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
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
  );
};

export default KitchenDashboard;