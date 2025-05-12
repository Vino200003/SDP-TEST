const db = require('../config/db');

/**
 * Get all orders for the kitchen dashboard with filtering by kitchen status
 */
exports.getKitchenOrders = (req, res) => {
  try {
    const { status } = req.query;
    
    let query;
    let queryParams = [];
    
    // If specific status is requested, filter by that, otherwise get Pending and Preparing by default
    if (status && status !== 'All') {
      query = `
        SELECT 
          o.*,
          u.first_name, u.last_name, u.email, u.phone_number
        FROM 
          orders o
        LEFT JOIN 
          users u ON o.user_id = u.user_id
        WHERE 
          o.kitchen_status = ?
        ORDER BY 
          o.created_at ASC
      `;
      queryParams = [status];
    } else {
      query = `
        SELECT 
          o.*,
          u.first_name, u.last_name, u.email, u.phone_number
        FROM 
          orders o
        LEFT JOIN 
          users u ON o.user_id = u.user_id
        WHERE 
          o.kitchen_status IN ('Pending', 'Preparing')
        ORDER BY 
          o.created_at ASC
      `;
    }
    
    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error('Error fetching kitchen orders:', err);
        return res.status(500).json({ 
          message: 'Error fetching kitchen orders', 
          error: err.message 
        });
      }
      
      // If no orders, return empty array
      if (results.length === 0) {
        return res.json([]);
      }
      
      // Get all order items for these orders
      const orderIds = results.map(order => order.order_id);
      
      const itemsQuery = `
        SELECT oi.*, m.menu_name, m.price AS menu_price
        FROM order_items oi
        LEFT JOIN menu m ON oi.menu_id = m.menu_id
        WHERE oi.order_id IN (?)
      `;
      
      db.query(itemsQuery, [orderIds], (err, itemsResults) => {
        if (err) {
          console.error('Error fetching order items:', err);
          // Return orders without items if there's an error
          return res.json(results);
        }
        
        // Group items by order_id
        const itemsByOrder = {};
        itemsResults.forEach(item => {
          if (!itemsByOrder[item.order_id]) {
            itemsByOrder[item.order_id] = [];
          }
          itemsByOrder[item.order_id].push({
            name: item.menu_name,
            quantity: item.quantity,
            notes: item.notes || '',
            price: parseFloat(item.price || item.menu_price)
          });
        });
        
        // Add items to each order
        const ordersWithItems = results.map(order => {
          return {
            ...order,
            items: itemsByOrder[order.order_id] || []
          };
        });
        
        res.json(ordersWithItems);
      });
    });
  } catch (error) {
    console.error('Server error in getKitchenOrders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update the kitchen status of an order
 */
exports.updateKitchenStatus = (req, res) => {
  try {
    const orderId = req.params.id;
    const { kitchen_status } = req.body;
    
    if (!kitchen_status) {
      return res.status(400).json({ message: 'Kitchen status is required' });
    }
    
    // Validate status
    const validStatuses = ['Pending', 'Preparing', 'Ready', 'Cancelled'];
    if (!validStatuses.includes(kitchen_status)) {
      return res.status(400).json({ message: 'Invalid kitchen status value' });
    }
    
    // Update order status
    const query = `
      UPDATE orders 
      SET kitchen_status = ?, 
          updated_at = NOW()
      WHERE order_id = ?
    `;
    
    db.query(query, [kitchen_status, orderId], (err, result) => {
      if (err) {
        console.error('Error updating kitchen status:', err);
        return res.status(500).json({ 
          message: 'Error updating kitchen status', 
          error: err.message 
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json({ 
        message: 'Kitchen status updated successfully',
        order_id: orderId,
        kitchen_status
      });
    });
  } catch (error) {
    console.error('Server error in updateKitchenStatus:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
