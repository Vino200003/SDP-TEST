const db = require('../config/db');

// Get all orders with pagination and filtering
exports.getAllOrders = (req, res) => {
  const { status, type, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT o.*, u.user_id, s.staff_id 
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.user_id
    LEFT JOIN staff s ON o.delivery_person_id = s.staff_id
    WHERE 1=1
  `;
  let params = [];
  
  if (status) {
    query += ' AND o.order_status = ?';
    params.push(status);
  }
  
  if (type) {
    query += ' AND o.order_type = ?';
    params.push(type);
  }
  
  query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ 
        message: 'Error fetching orders', 
        error: err.message 
      });
    }
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total FROM orders o
      WHERE 1=1 ${status ? ' AND o.order_status = ?' : ''} ${type ? ' AND o.order_type = ?' : ''}
    `;
    const countParams = [];
    if (status) countParams.push(status);
    if (type) countParams.push(type);
    
    db.query(countQuery, countParams, (countErr, countResults) => {
      if (countErr) {
        console.error('Error counting orders:', countErr);
        return res.status(500).json({ 
          message: 'Error counting orders', 
          error: countErr.message 
        });
      }
      
      res.json({
        orders: results,
        pagination: {
          total: countResults[0].total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(countResults[0].total / limit)
        }
      });
    });
  });
};

// Get order by ID with its items
exports.getOrderById = (req, res) => {
  const orderId = req.params.id;
  
  // Get order details
  const orderQuery = `
    SELECT o.*, u.user_id, u.email, u.phone_number, s.staff_id 
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.user_id
    LEFT JOIN staff s ON o.delivery_person_id = s.staff_id
    WHERE o.order_id = ?
  `;
  
  // Get order items
  const itemsQuery = `
    SELECT oi.*, m.menu_name
    FROM order_items oi
    JOIN menu m ON oi.menu_id = m.menu_id
    WHERE oi.order_id = ?
  `;
  
  db.query(orderQuery, [orderId], (err, orderResults) => {
    if (err) {
      console.error('Error fetching order:', err);
      return res.status(500).json({ 
        message: 'Error fetching order', 
        error: err.message 
      });
    }
    
    if (orderResults.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    db.query(itemsQuery, [orderId], (itemsErr, itemsResults) => {
      if (itemsErr) {
        console.error('Error fetching order items:', itemsErr);
        return res.status(500).json({ 
          message: 'Error fetching order items', 
          error: itemsErr.message 
        });
      }
      
      const order = orderResults[0];
      order.items = itemsResults;
      
      res.json(order);
    });
  });
};

// Create a new order
exports.createOrder = (req, res) => {
  const { user_id, order_type, items, delivery_person_id = null } = req.body;
  
  if (!user_id || !order_type || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Invalid order data. Required fields: user_id, order_type, items (array)' });
  }
  
  // Extract menu IDs to validate
  const menuIds = items.map(item => item.menu_id);
  
  // Begin transaction
  db.beginTransaction(err => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ 
        message: 'Error creating order', 
        error: err.message 
      });
    }
    
    // First validate that all menu items exist
    const menuValidationQuery = 'SELECT menu_id FROM menu WHERE menu_id IN (?)';
    db.query(menuValidationQuery, [menuIds], (validationErr, validationResults) => {
      if (validationErr) {
        return db.rollback(() => {
          console.error('Error validating menu items:', validationErr);
          res.status(500).json({ 
            message: 'Error validating menu items', 
            error: validationErr.message 
          });
        });
      }
      
      // Check if all menu items exist
      const foundMenuIds = validationResults.map(item => item.menu_id);
      const missingMenuIds = menuIds.filter(id => !foundMenuIds.includes(id));
      
      if (missingMenuIds.length > 0) {
        return db.rollback(() => {
          res.status(400).json({ 
            message: 'Some menu items do not exist', 
            missingMenuIds 
          });
        });
      }
      
      // Calculate total amount
      const total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Create order
      const orderData = {
        user_id,
        order_type,
        total_amount,
        delivery_person_id: delivery_person_id
      };
      
      db.query('INSERT INTO orders SET ?', orderData, (orderErr, orderResult) => {
        if (orderErr) {
          return db.rollback(() => {
            console.error('Error creating order:', orderErr);
            res.status(500).json({ 
              message: 'Error creating order', 
              error: orderErr.message 
            });
          });
        }
        
        const order_id = orderResult.insertId;
        
        // Insert order items
        const orderItems = items.map(item => [
          order_id,
          item.menu_id,
          item.quantity,
          item.price
        ]);
        
        const itemsQuery = 'INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES ?';
        
        db.query(itemsQuery, [orderItems], (itemsErr) => {
          if (itemsErr) {
            return db.rollback(() => {
              console.error('Error adding order items:', itemsErr);
              res.status(500).json({ 
                message: 'Error adding order items', 
                error: itemsErr.message 
              });
            });
          }
          
          // Commit transaction
          db.commit(commitErr => {
            if (commitErr) {
              return db.rollback(() => {
                console.error('Error committing transaction:', commitErr);
                res.status(500).json({ 
                  message: 'Error creating order', 
                  error: commitErr.message 
                });
              });
            }
            
            res.status(201).json({
              message: 'Order created successfully',
              order_id,
              total_amount
            });
          });
        });
      });
    });
  });
};

// Update order status
exports.updateOrderStatus = (req, res) => {
  const orderId = req.params.id;
  const { order_status, delivery_person_id } = req.body;
  
  if (!order_status) {
    return res.status(400).json({ message: 'Order status is required' });
  }
  
  const updateData = { order_status };
  
  // Add delivery person if provided
  if (delivery_person_id) {
    updateData.delivery_person_id = delivery_person_id;
  }
  
  db.query('UPDATE orders SET ? WHERE order_id = ?', [updateData, orderId], (err, result) => {
    if (err) {
      console.error('Error updating order status:', err);
      return res.status(500).json({ 
        message: 'Error updating order status', 
        error: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({
      message: 'Order status updated successfully',
      order_id: orderId,
      order_status
    });
  });
};

// Delete an order
exports.deleteOrder = (req, res) => {
  const orderId = req.params.id;
  
  // Begin transaction
  db.beginTransaction(err => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ 
        message: 'Error deleting order', 
        error: err.message 
      });
    }
    
    // Delete order items first (though they would be deleted by CASCADE)
    db.query('DELETE FROM order_items WHERE order_id = ?', [orderId], (itemsErr) => {
      if (itemsErr) {
        return db.rollback(() => {
          console.error('Error deleting order items:', itemsErr);
          res.status(500).json({ 
            message: 'Error deleting order items', 
            error: itemsErr.message 
          });
        });
      }
      
      // Delete the order
      db.query('DELETE FROM orders WHERE order_id = ?', [orderId], (orderErr, result) => {
        if (orderErr) {
          return db.rollback(() => {
            console.error('Error deleting order:', orderErr);
            res.status(500).json({ 
              message: 'Error deleting order', 
              error: orderErr.message 
            });
          });
        }
        
        if (result.affectedRows === 0) {
          return db.rollback(() => {
            res.status(404).json({ message: 'Order not found' });
          });
        }
        
        // Commit transaction
        db.commit(commitErr => {
          if (commitErr) {
            return db.rollback(() => {
              console.error('Error committing transaction:', commitErr);
              res.status(500).json({ 
                message: 'Error deleting order', 
                error: commitErr.message 
              });
            });
          }
          
          res.json({ message: 'Order deleted successfully' });
        });
      });
    });
  });
};

// Get order statistics
exports.getOrderStats = (req, res) => {
  const { start_date, end_date } = req.query;
  
  let dateFilter = '';
  let params = [];
  
  if (start_date && end_date) {
    dateFilter = 'WHERE created_at BETWEEN ? AND ?';
    params = [start_date, end_date];
  }
  
  const query = `
    SELECT 
      COUNT(*) as total_orders,
      SUM(total_amount) as total_revenue,
      COUNT(CASE WHEN order_status = 'Completed' THEN 1 END) as completed_orders,
      COUNT(CASE WHEN order_status = 'Cancelled' THEN 1 END) as cancelled_orders,
      COUNT(CASE WHEN order_type = 'Dine-in' THEN 1 END) as dine_in_orders,
      COUNT(CASE WHEN order_type = 'Takeaway' THEN 1 END) as takeaway_orders,
      COUNT(CASE WHEN order_type = 'Delivery' THEN 1 END) as delivery_orders
    FROM orders
    ${dateFilter}
  `;
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching order statistics:', err);
      return res.status(500).json({ 
        message: 'Error fetching order statistics', 
        error: err.message 
      });
    }
    
    res.json(results[0]);
  });
};
