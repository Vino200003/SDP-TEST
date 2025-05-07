const db = require('../config/db');

// Get all orders with pagination and filters
exports.getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      type,
      startDate, 
      endDate
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Build WHERE clause for filters
    let whereClause = '';
    const queryParams = [];
    
    if (status) {
      whereClause += 'WHERE order_status = ?';
      queryParams.push(status);
    }
    
    if (type) {
      whereClause += whereClause ? ' AND order_type = ?' : 'WHERE order_type = ?';
      queryParams.push(type);
    }
    
    if (startDate) {
      whereClause += whereClause ? ' AND created_at >= ?' : 'WHERE created_at >= ?';
      queryParams.push(startDate);
    }
    
    if (endDate) {
      whereClause += whereClause ? ' AND created_at <= ?' : 'WHERE created_at <= ?';
      queryParams.push(endDate);
    }
    
    // Check if orders table exists
    db.query('SHOW TABLES LIKE "orders"', (err, tables) => {
      if (err) {
        console.error('Error checking for orders table:', err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      
      if (tables.length === 0) {
        // Return empty data if table doesn't exist yet
        return res.json({
          orders: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0
          }
        });
      }
      
      // Get total count for pagination
      const countQuery = `SELECT COUNT(*) as total FROM orders ${whereClause}`;
      
      db.query(countQuery, queryParams, (err, countResult) => {
        if (err) {
          console.error('Error counting orders:', err);
          return res.status(500).json({ message: 'Error fetching orders', error: err.message });
        }
        
        const total = countResult[0].total;
        const pages = Math.ceil(total / limit);
        
        // Query for orders with pagination
        const queryParams2 = [...queryParams];
        queryParams2.push(parseInt(limit));
        queryParams2.push(offset);
        
        const query = `
          SELECT o.*, u.first_name, u.last_name, u.email, u.phone_number
          FROM orders o
          LEFT JOIN users u ON o.user_id = u.user_id
          ${whereClause}
          ORDER BY o.created_at DESC
          LIMIT ? OFFSET ?
        `;
        
        db.query(query, queryParams2, (err, orders) => {
          if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ message: 'Error fetching orders', error: err.message });
          }
          
          // For each order, get its items
          if (orders.length > 0) {
            const orderIds = orders.map(order => order.order_id);
            const itemsQuery = `
              SELECT oi.*, m.menu_name
              FROM order_items oi
              LEFT JOIN menu m ON oi.menu_id = m.menu_id
              WHERE oi.order_id IN (?)
            `;
            
            db.query(itemsQuery, [orderIds], (err, allItems) => {
              if (err) {
                console.error('Error fetching order items:', err);
                // Continue without items if there's an error
              } else {
                // Group items by order_id
                const itemsByOrder = {};
                allItems.forEach(item => {
                  if (!itemsByOrder[item.order_id]) {
                    itemsByOrder[item.order_id] = [];
                  }
                  itemsByOrder[item.order_id].push(item);
                });
                
                // Add items to each order
                orders.forEach(order => {
                  order.items = itemsByOrder[order.order_id] || [];
                });
              }
              
              // Send response with pagination info
              res.json({
                orders,
                pagination: {
                  page: parseInt(page),
                  limit: parseInt(limit),
                  total,
                  pages
                }
              });
            });
          } else {
            // No orders, return empty result
            res.json({
              orders: [],
              pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages
              }
            });
          }
        });
      });
    });
  } catch (error) {
    console.error('Server error in getAllOrders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build WHERE clause for date filters
    let whereClause = '';
    const queryParams = [];
    
    if (startDate) {
      whereClause += 'WHERE created_at >= ?';
      queryParams.push(startDate);
    }
    
    if (endDate) {
      whereClause += whereClause ? ' AND created_at <= ?' : 'WHERE created_at <= ?';
      queryParams.push(endDate);
    }
    
    // Check if orders table exists
    db.query('SHOW TABLES LIKE "orders"', (err, tables) => {
      if (err) {
        console.error('Error checking for orders table:', err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      
      if (tables.length === 0) {
        // Return empty stats if table doesn't exist yet
        return res.json({
          total_orders: 0,
          total_revenue: 0,
          pending_orders: 0,
          completed_orders: 0,
          cancelled_orders: 0,
          in_progress_orders: 0
        });
      }
      
      // Query for order stats
      const statsQuery = `
        SELECT
          COUNT(*) as total_orders,
          SUM(total_amount) as total_revenue,
          SUM(CASE WHEN order_status = 'Pending' THEN 1 ELSE 0 END) as pending_orders,
          SUM(CASE WHEN order_status = 'Completed' THEN 1 ELSE 0 END) as completed_orders,
          SUM(CASE WHEN order_status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
          SUM(CASE WHEN order_status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_orders
        FROM orders
        ${whereClause}
      `;
      
      db.query(statsQuery, queryParams, (err, results) => {
        if (err) {
          console.error('Error fetching order stats:', err);
          return res.status(500).json({ message: 'Error fetching order stats', error: err.message });
        }
        
        // Convert results to appropriate format
        const stats = results[0];
        
        // Ensure values are numbers, not null
        const formatStats = {
          total_orders: parseInt(stats.total_orders || 0),
          total_revenue: parseFloat(stats.total_revenue || 0).toFixed(2),
          pending_orders: parseInt(stats.pending_orders || 0),
          completed_orders: parseInt(stats.completed_orders || 0),
          cancelled_orders: parseInt(stats.cancelled_orders || 0),
          in_progress_orders: parseInt(stats.in_progress_orders || 0)
        };
        
        res.json(formatStats);
      });
    });
  } catch (error) {
    console.error('Server error in getOrderStats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get order by ID with details
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const query = `
      SELECT o.*, u.first_name, u.last_name, u.email, u.phone_number
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = ?
    `;
    
    db.query(query, [orderId], (err, results) => {
      if (err) {
        console.error('Error fetching order:', err);
        return res.status(500).json({ message: 'Error fetching order', error: err.message });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      const order = results[0];
      
      // Get order items
      const itemsQuery = `
        SELECT oi.*, m.menu_name
        FROM order_items oi
        LEFT JOIN menu m ON oi.menu_id = m.menu_id
        WHERE oi.order_id = ?
      `;
      
      db.query(itemsQuery, [orderId], (err, items) => {
        if (err) {
          console.error('Error fetching order items:', err);
          return res.status(500).json({ message: 'Error fetching order items', error: err.message });
        }
        
        order.items = items;
        
        res.json(order);
      });
    });
  } catch (error) {
    console.error('Server error in getOrderById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Validate status
    const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    db.query('UPDATE orders SET order_status = ?, updated_at = NOW() WHERE order_id = ?', 
      [status, orderId], 
      (err, result) => {
        if (err) {
          console.error('Error updating order status:', err);
          return res.status(500).json({ message: 'Error updating order status', error: err.message });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json({ message: 'Order status updated successfully' });
      }
    );
  } catch (error) {
    console.error('Server error in updateOrderStatus:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
