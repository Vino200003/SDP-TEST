import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../styles/OrdersManagement.css';
import * as orderService from '../services/orderService';
// import { toast } from 'react-toastify'; // Uncomment after installing react-toastify

function OrdersManagement() {
  // State for orders
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [orderStats, setOrderStats] = useState({
    total_orders: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    in_progress: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    orderType: '',
    dateRange: {
      startDate: '',
      endDate: ''
    },
    searchTerm: '',
    page: 1,
    limit: 10
  });

  // Simple notification function until react-toastify is installed
  const notify = (message, type = 'info') => {
    console.log(`[${type}] ${message}`);
    alert(message);
  };

  // Fetch orders and stats on component mount
  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
  }, []);

  // Fetch orders when filters change
  useEffect(() => {
    fetchOrders();
  }, [filters.page, filters.limit, filters.status, filters.orderType]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getAllOrders({
        page: filters.page,
        limit: filters.limit,
        status: filters.status,
        orderType: filters.orderType,
      });
      
      // Check the structure of the returned data
      if (data.orders) {
        setOrders(data.orders);
        setFilteredOrders(data.orders);
        
        // If pagination info is provided
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        // If orders data is at the root level (depends on your API)
        setOrders(data);
        setFilteredOrders(data);
      }
    } catch (error) {
      notify(`Error fetching orders: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const data = await orderService.getOrderStats(
        filters.dateRange.startDate,
        filters.dateRange.endDate
      );
      
      // Set stats based on the returned data structure
      setOrderStats({
        total_orders: data.total_orders || 0,
        pending: data.pending_orders || 0,
        completed: data.completed_orders || 0,
        cancelled: data.cancelled_orders || 0,
        in_progress: data.orders_in_progress || 0
      });
    } catch (error) {
      console.error('Error fetching order stats:', error);
    }
  };

  // Apply search filter locally
  useEffect(() => {
    if (filters.searchTerm) {
      applySearchFilter();
    } else {
      setFilteredOrders(orders);
    }
  }, [filters.searchTerm, orders]);

  const applySearchFilter = () => {
    const searchLower = filters.searchTerm.toLowerCase();
    const result = orders.filter(
      order => 
        order.order_id.toString().includes(searchLower) ||
        (order.user_id && order.user_id.toString().includes(searchLower))
    );
    setFilteredOrders(result);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'startDate' || name === 'endDate') {
      setFilters({
        ...filters,
        dateRange: {
          ...filters.dateRange,
          [name]: value
        }
      });
    } else {
      setFilters({
        ...filters,
        [name]: value,
        // Reset to page 1 when changing filters
        page: 1
      });
    }
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      orderType: '',
      dateRange: {
        startDate: '',
        endDate: ''
      },
      searchTerm: '',
      page: 1,
      limit: 10
    });
  };

  const handleViewDetails = async (orderId) => {
    try {
      setIsLoading(true);
      const orderDetails = await orderService.getOrderById(orderId);
      setSelectedOrder(orderDetails);
      setIsDetailsModalOpen(true);
    } catch (error) {
      notify(`Error fetching order details: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      
      // Update local state
      const updatedOrders = orders.map(order => 
        order.order_id === orderId 
          ? { ...order, order_status: newStatus } 
          : order
      );
      
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders.filter(order => 
        !filters.status || order.order_status === filters.status
      ));
      
      // If we're viewing this order in the modal, update it there too
      if (selectedOrder && selectedOrder.order_id === orderId) {
        setSelectedOrder({ ...selectedOrder, order_status: newStatus });
      }
      
      // Refresh order stats
      fetchOrderStats();
      
      notify(`Order #${orderId} status updated to ${newStatus}`, 'success');
    } catch (error) {
      notify(`Error updating order status: ${error.message}`, 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'status-completed';
      case 'In Progress': return 'status-processing';
      case 'Pending': return 'status-pending';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    
    setFilters({
      ...filters,
      page: newPage
    });
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <Header title="Orders Management" />
        
        <div className="orders-overview">
          <div className="order-stat-card pending">
            <h3>Pending</h3>
            <p className="stat-number">{orderStats.pending}</p>
          </div>
          <div className="order-stat-card in-progress">
            <h3>In Progress</h3>
            <p className="stat-number">{orderStats.in_progress}</p>
          </div>
          <div className="order-stat-card completed">
            <h3>Completed</h3>
            <p className="stat-number">{orderStats.completed}</p>
          </div>
          <div className="order-stat-card cancelled">
            <h3>Cancelled</h3>
            <p className="stat-number">{orderStats.cancelled}</p>
          </div>
        </div>
        
        <div className="filters-section">
          <div className="search-bar">
            <input
              type="text"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleFilterChange}
              placeholder="Search orders by ID or customer"
            />
          </div>
          
          <div className="filter-options">
            <select 
              name="status" 
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            
            <select 
              name="orderType" 
              value={filters.orderType}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="Dine-in">Dine-in</option>
              <option value="Takeaway">Takeaway</option>
              <option value="Delivery">Delivery</option>
            </select>
            
            <div className="date-filters">
              <input
                type="date"
                name="startDate"
                value={filters.dateRange.startDate}
                onChange={handleFilterChange}
                placeholder="Start Date"
              />
              <input
                type="date"
                name="endDate"
                value={filters.dateRange.endDate}
                onChange={handleFilterChange}
                placeholder="End Date"
              />
            </div>
            
            <button className="reset-filters-btn" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading">Loading orders...</div>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.order_id}>
                      <td>#{order.order_id}</td>
                      <td>{order.user_id ? `User #${order.user_id}` : 'Guest'}</td>
                      <td>{order.order_type}</td>
                      <td>{formatDate(order.created_at)}</td>
                      <td>Rs. {parseFloat(order.total_amount).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td>
                        <div className="order-actions">
                          <button 
                            className="view-btn"
                            onClick={() => handleViewDetails(order.order_id)}
                          >
                            View Details
                          </button>
                          
                          <select 
                            className="status-update-select"
                            value={order.order_status}
                            onChange={(e) => handleUpdateStatus(order.order_id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-orders">
                      No orders match the current filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Add pagination controls */}
            {pagination.pages > 1 && (
              <div className="pagination-controls">
                <button 
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                >
                  Previous
                </button>
                <span>Page {filters.page} of {pagination.pages}</span>
                <button 
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === pagination.pages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Order Details Modal */}
        {isDetailsModalOpen && selectedOrder && (
          <div className="modal-overlay">
            <div className="modal-content order-details-modal">
              <div className="modal-header">
                <h2>Order #{selectedOrder.order_id} Details</h2>
                <button 
                  className="close-modal-btn"
                  onClick={() => setIsDetailsModalOpen(false)}
                >
                  &times;
                </button>
              </div>
              
              <div className="order-details-content">
                <div className="order-info-section">
                  <div className="order-info-group">
                    <h3>Order Information</h3>
                    <p><strong>Status:</strong> {selectedOrder.order_status}</p>
                    <p><strong>Type:</strong> {selectedOrder.order_type}</p>
                    <p><strong>Date:</strong> {formatDate(selectedOrder.created_at)}</p>
                    <p><strong>Last Updated:</strong> {formatDate(selectedOrder.updated_at)}</p>
                  </div>
                  
                  <div className="order-info-group">
                    <h3>Customer Information</h3>
                    <p><strong>User ID:</strong> {selectedOrder.user_id || 'Guest'}</p>
                    {selectedOrder.email && <p><strong>Email:</strong> {selectedOrder.email}</p>}
                    {selectedOrder.phone_number && <p><strong>Phone:</strong> {selectedOrder.phone_number}</p>}
                  </div>
                </div>
                
                <div className="order-items-section">
                  <h3>Ordered Items</h3>
                  <table className="order-items-table">
                    <thead>
                      <tr>
                        <th>Item ID</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items && selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>#{item.menu_id}</td>
                          <td>Rs. {parseFloat(item.price).toFixed(2)}</td>
                          <td>{item.quantity}</td>
                          <td>Rs. {(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="order-total">
                        <td colSpan="3" className="summary-label">Total</td>
                        <td>Rs. {parseFloat(selectedOrder.total_amount).toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                {selectedOrder.order_type === 'Delivery' && selectedOrder.delivery_person_id && (
                  <div className="delivery-section">
                    <h3>Delivery Information</h3>
                    <p><strong>Delivery Person ID:</strong> {selectedOrder.delivery_person_id}</p>
                  </div>
                )}
                
                <div className="order-actions-footer">
                  <select 
                    value={selectedOrder.order_status}
                    onChange={(e) => {
                      handleUpdateStatus(selectedOrder.order_id, e.target.value);
                      setSelectedOrder({...selectedOrder, order_status: e.target.value});
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  
                  <button className="print-order-btn">
                    Print Order
                  </button>
                  
                  <button 
                    className="close-details-btn"
                    onClick={() => setIsDetailsModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default OrdersManagement;
