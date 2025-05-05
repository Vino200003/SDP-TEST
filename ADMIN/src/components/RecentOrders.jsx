import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RecentOrders.css';
import * as orderService from '../services/orderService';

function RecentOrders() {
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      setIsLoading(true);
      // Fetch only 5 most recent orders
      const data = await orderService.getAllOrders({ limit: 5, page: 1 });
      
      if (data.orders) {
        setRecentOrders(data.orders);
      } else {
        // If the orders are returned at the root level
        setRecentOrders(data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    } finally {
      setIsLoading(false);
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const orderDate = new Date(dateString);
    const now = new Date();
    const diffMs = now - orderDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const handleViewDetails = (orderId) => {
    navigate(`/orders?id=${orderId}`);
  };

  const navigateToAllOrders = () => {
    navigate('/orders');
  };

  return (
    <div className="recent-orders">
      <h2>Recent Orders</h2>
      {isLoading ? (
        <div className="loading">Loading recent orders...</div>
      ) : (
        <>
          <div className="order-table-container">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.order_id}>
                      <td>#{order.order_id}</td>
                      <td>{order.user_id ? `User #${order.user_id}` : 'Guest'}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td>Rs. {parseFloat(order.total_amount).toFixed(2)}</td>
                      <td>{formatDate(order.created_at)}</td>
                      <td>
                        <button 
                          className="view-details-btn"
                          onClick={() => handleViewDetails(order.order_id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>No recent orders</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="see-all-container">
            <button className="see-all-btn" onClick={navigateToAllOrders}>
              See All Orders
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default RecentOrders;
