import '../styles/RecentOrders.css';

function RecentOrders() {
  // Sample data - in a real app, this would come from an API
  const orders = [
    { id: '#ORD-001', customer: 'John Doe', status: 'Completed', amount: '$124.00', date: '15 min ago' },
    { id: '#ORD-002', customer: 'Jane Smith', status: 'Processing', amount: '$85.50', date: '30 min ago' },
    { id: '#ORD-003', customer: 'Robert Brown', status: 'Pending', amount: '$212.75', date: '45 min ago' },
    { id: '#ORD-004', customer: 'Emily Clark', status: 'Completed', amount: '$59.25', date: '1 hour ago' },
    { id: '#ORD-005', customer: 'Michael Lee', status: 'Cancelled', amount: '$149.99', date: '2 hours ago' },
  ];

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'processing': return 'status-processing';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <div className="recent-orders">
      <h2>Recent Orders</h2>
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
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td>{order.amount}</td>
                <td>{order.date}</td>
                <td>
                  <button className="view-details-btn">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="see-all-container">
        <button className="see-all-btn">See All Orders</button>
      </div>
    </div>
  );
}

export default RecentOrders;
