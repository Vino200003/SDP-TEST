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
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    orderType: '',
    dateRange: {
      startDate: '',
      endDate: ''
    },
    searchTerm: ''
  });

  // Simple notification function until react-toastify is installed
  const notify = (message, type = 'info') => {
    console.log(`[${type}] ${message}`);
    alert(message);
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    applyFilters();
  }, [filters, orders]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      notify(`Error fetching orders: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...orders];
    
    // Filter by status
    if (filters.status) {
      result = result.filter(order => order.order_status === filters.status);
    }
    
    // Filter by order type
    if (filters.orderType) {
      result = result.filter(order => order.order_type === filters.orderType);
    }
    
    // Filter by date range
    if (filters.dateRange.startDate && filters.dateRange.endDate) {
      const startDate = new Date(filters.dateRange.startDate);
      const endDate = new Date(filters.dateRange.endDate);
      
      result = result.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }
    
    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(
        order => 
          order.order_id.toString().includes(searchLower) ||
          (order.user_name && order.user_name.toLowerCase().includes(searchLower))
      );
    }
    
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
        [name]: value
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
      searchTerm: ''
    });
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
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
      notify(`Order #${orderId} status updated to ${newStatus}`, 'success');
    } catch (error) {
      notify(`Error updating order status: ${error.message}`, 'error');
    }
  };

  const formatDate = (dateString) => {
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

  // Calculate total number of orders for each status
  const totalOrdersByStatus = {
    pending: orders.filter(order => order.order_status === 'Pending').length,
    inProgress: orders.filter(order => order.order_status === 'In Progress').length,
    completed: orders.filter(order => order.order_status === 'Completed').length,
    cancelled: orders.filter(order => order.order_status === 'Cancelled').length
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <Header title="Orders Management" />
        
        <div className="orders-overview">
          <div className="order-stat-card pending">
            <h3>Pending</h3>
            <p className="stat-number">{totalOrdersByStatus.pending}</p>
          </div>
          <div className="order-stat-card in-progress">
            <h3>In Progress</h3>
            <p className="stat-number">{totalOrdersByStatus.inProgress}</p>
          </div>
          <div className="order-stat-card completed">
            <h3>Completed</h3>
            <p className="stat-number">{totalOrdersByStatus.completed}</p>
          </div>
          <div className="order-stat-card cancelled">
            <h3>Cancelled</h3>
            <p className="stat-number">{totalOrdersByStatus.cancelled}</p>
          </div>
        </div>
        
        <div className="filters-section">
          <div className="search-bar">
            <input
              type="text"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleFilterChange}
              placeholder="Search orders by ID or customer name"
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
                      <td>{order.user_name || 'Guest Customer'}</td>
                      <td>{order.order_type}</td>
                      <td>{formatDate(order.created_at)}</td>
                      <td>LKR {order.total_amount.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td>
                        <div className="order-actions">
                          <button 
                            className="view-btn"
                            onClick={() => handleViewDetails(order)}
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
                    <p><strong>Name:</strong> {selectedOrder.user_name || 'Guest Customer'}</p>
                    {selectedOrder.email && <p><strong>Email:</strong> {selectedOrder.email}</p>}
                    {selectedOrder.phone_number && <p><strong>Phone:</strong> {selectedOrder.phone_number}</p>}
                    {selectedOrder.address && <p><strong>Address:</strong> {selectedOrder.address}</p>}
                  </div>
                </div>
                
                <div className="order-items-section">
                  <h3>Ordered Items</h3>
                  <table className="order-items-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items && selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.menu_name}</td>
                          <td>LKR {parseFloat(item.price).toFixed(2)}</td>
                          <td>{item.quantity}</td>
                          <td>LKR {(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="summary-label">Subtotal</td>
                        <td>LKR {selectedOrder.total_amount.toFixed(2)}</td>
                      </tr>
                      {selectedOrder.discount_amount > 0 && (
                        <tr>
                          <td colSpan="3" className="summary-label">Discount</td>
                          <td>-LKR {selectedOrder.discount_amount.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="order-total">
                        <td colSpan="3" className="summary-label">Total</td>
                        <td>LKR {(selectedOrder.total_amount - (selectedOrder.discount_amount || 0)).toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                <div className="payment-section">
                  <h3>Payment Information</h3>
                  {selectedOrder.payment ? (
                    <div className="payment-info">
                      <p><strong>Method:</strong> {selectedOrder.payment.payment_type}</p>
                      <p><strong>Status:</strong> {selectedOrder.payment.payment_status}</p>
                      <p><strong>Paid On:</strong> {formatDate(selectedOrder.payment.paid_at)}</p>
                      <p><strong>Amount:</strong> LKR {selectedOrder.payment.amount.toFixed(2)}</p>
                    </div>
                  ) : (
                    <p>No payment information available</p>
                  )}
                </div>
                
                {selectedOrder.order_type === 'Delivery' && selectedOrder.delivery_person_id && (
                  <div className="delivery-section">
                    <h3>Delivery Information</h3>
                    <p><strong>Delivery Person:</strong> {selectedOrder.delivery_person_name || `ID: ${selectedOrder.delivery_person_id}`}</p>
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
