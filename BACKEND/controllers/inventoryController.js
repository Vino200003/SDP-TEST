const db = require('../config/db');

/**
 * Get all inventory items with pagination and filtering
 */
exports.getAllInventoryItems = (req, res) => {
  try {
    // Extract query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Extract filters
    const { status, search, supplier_id, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    // Build conditions for filtering
    let conditions = [];
    let params = [];
    
    // Status filter
    if (status) {
      conditions.push('i.status = ?');
      params.push(status);
    }
    
    // Search filter
    if (search) {
      conditions.push('i.name LIKE ?');
      params.push(`%${search}%`);
    }
    
    // Supplier filter
    if (supplier_id) {
      conditions.push('i.supplier_id = ?');
      params.push(supplier_id);
    }
    
    // Build the WHERE clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Count total items for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM inventory i
      ${whereClause}
    `;
    
    db.query(countQuery, params, (err, countResults) => {
      if (err) {
        console.error('Error counting inventory items:', err);
        return res.status(500).json({ 
          message: 'Error counting inventory items', 
          error: err.message 
        });
      }
      
      // Get total count
      const total = countResults[0].total;
      const pages = Math.ceil(total / limit);
      
      // Build the query for fetching items with sorting and pagination
      const query = `
        SELECT i.*, s.name as supplier_name
        FROM inventory i
        LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id
        ${whereClause}
        ORDER BY ${sortBy ? `i.${sortBy}` : 'i.name'} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}
        LIMIT ? OFFSET ?
      `;
      
      // Add pagination parameters
      const queryParams = [...params, limit, offset];
      
      // Execute the query
      db.query(query, queryParams, (err, results) => {
        if (err) {
          console.error('Error fetching inventory items:', err);
          return res.status(500).json({ 
            message: 'Error fetching inventory items', 
            error: err.message 
          });
        }
        
        // Send response with pagination info
        res.json({
          items: results,
          pagination: {
            page,
            limit,
            total,
            pages
          }
        });
      });
    });
  } catch (error) {
    console.error('Server error in getAllInventoryItems:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get inventory item by ID
 */
exports.getInventoryItemById = (req, res) => {
  try {
    const itemId = req.params.id;
    
    const query = `
      SELECT i.*, s.name as supplier_name
      FROM inventory i
      LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id
      WHERE i.inventory_id = ?
    `;
    
    db.query(query, [itemId], (err, results) => {
      if (err) {
        console.error('Error fetching inventory item:', err);
        return res.status(500).json({ 
          message: 'Error fetching inventory item', 
          error: err.message 
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }
      
      res.json(results[0]);
    });
  } catch (error) {
    console.error('Server error in getInventoryItemById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a new inventory item
 */
exports.createInventoryItem = (req, res) => {
  try {
    const { 
      name, 
      quantity, 
      unit, 
      price_per_unit, 
      batch_no, 
      manu_date = null, 
      exp_date = null, 
      purchase_date = null, 
      status = 'available', 
      supplier_id 
    } = req.body;
    
    // Validate required fields
    if (!name || quantity === undefined || !unit || !price_per_unit || !batch_no) {
      return res.status(400).json({ 
        message: 'Required fields: name, quantity, unit, price_per_unit, batch_no' 
      });
    }
    
    // Validate that the batch_no is unique
    db.query('SELECT * FROM inventory WHERE batch_no = ?', [batch_no], (err, results) => {
      if (err) {
        console.error('Error checking batch number uniqueness:', err);
        return res.status(500).json({ 
          message: 'Error checking batch number', 
          error: err.message 
        });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ message: 'Batch number must be unique' });
      }
      
      // Create new inventory item
      const newItem = {
        name,
        quantity,
        unit,
        price_per_unit,
        batch_no,
        status,
        supplier_id: supplier_id || null
      };
      
      // Add optional fields if provided
      if (manu_date) newItem.manu_date = manu_date;
      if (exp_date) newItem.exp_date = exp_date;
      if (purchase_date) newItem.purchase_date = purchase_date;
      
      // Insert into database
      db.query('INSERT INTO inventory SET ?', newItem, (err, result) => {
        if (err) {
          console.error('Error creating inventory item:', err);
          return res.status(500).json({ 
            message: 'Error creating inventory item', 
            error: err.message 
          });
        }
        
        // Get the created item to return with supplier info
        db.query(`
          SELECT i.*, s.name as supplier_name
          FROM inventory i
          LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id
          WHERE i.inventory_id = ?
        `, [result.insertId], (err, item) => {
          if (err) {
            console.error('Error fetching created item:', err);
            return res.status(201).json({
              message: 'Inventory item created successfully',
              inventory_id: result.insertId
            });
          }
          
          res.status(201).json(item[0]);
        });
      });
    });
  } catch (error) {
    console.error('Server error in createInventoryItem:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update an inventory item
 */
exports.updateInventoryItem = (req, res) => {
  try {
    const itemId = req.params.id;
    const { 
      name, 
      quantity, 
      unit, 
      price_per_unit, 
      batch_no, 
      manu_date, 
      exp_date, 
      purchase_date, 
      status, 
      supplier_id 
    } = req.body;
    
    console.log('Update inventory request:', { itemId, body: req.body });
    
    // First check if item exists
    db.query('SELECT * FROM inventory WHERE inventory_id = ?', [itemId], (err, results) => {
      if (err) {
        console.error('Error checking inventory item existence:', err);
        return res.status(500).json({ 
          message: 'Error checking inventory item', 
          error: err.message 
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }
      
      const currentItem = results[0];
      
      // If batch number is changing, ensure it's unique
      if (batch_no && batch_no !== currentItem.batch_no) {
        db.query('SELECT * FROM inventory WHERE batch_no = ? AND inventory_id != ?', [batch_no, itemId], (err, batchResults) => {
          if (err) {
            console.error('Error checking batch number uniqueness:', err);
            return res.status(500).json({ 
              message: 'Error checking batch number', 
              error: err.message 
            });
          }
          
          if (batchResults.length > 0) {
            return res.status(400).json({ message: 'Batch number must be unique' });
          }
          
          updateInventoryItemInDb();
        });
      } else {
        updateInventoryItemInDb();
      }
      
      // Function to update inventory item in database
      function updateInventoryItemInDb() {
        // Build update object with only provided fields
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (quantity !== undefined) updateData.quantity = quantity;
        if (unit !== undefined) updateData.unit = unit;
        if (price_per_unit !== undefined) updateData.price_per_unit = price_per_unit;
        if (batch_no !== undefined) updateData.batch_no = batch_no;
        if (manu_date !== undefined) updateData.manu_date = manu_date || null;
        if (exp_date !== undefined) updateData.exp_date = exp_date || null;
        if (purchase_date !== undefined) updateData.purchase_date = purchase_date || null;
        if (status !== undefined) updateData.status = status;
        if (supplier_id !== undefined) updateData.supplier_id = supplier_id || null;
        
        // Check if any data to update
        if (Object.keys(updateData).length === 0) {
          return res.status(400).json({ message: 'No fields to update provided' });
        }
        
        console.log('Updating inventory with data:', updateData);
        
        // Update item in database
        db.query('UPDATE inventory SET ? WHERE inventory_id = ?', [updateData, itemId], (err, result) => {
          if (err) {
            console.error('Error updating inventory item:', err);
            return res.status(500).json({ 
              message: 'Error updating inventory item', 
              error: err.message 
            });
          }
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Inventory item not found' });
          }
          
          // Get updated item to return with supplier info
          db.query(`
            SELECT i.*, s.name as supplier_name
            FROM inventory i
            LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id
            WHERE i.inventory_id = ?
          `, [itemId], (err, item) => {
            if (err) {
              console.error('Error fetching updated item:', err);
              return res.json({
                message: 'Inventory item updated successfully',
                inventory_id: itemId
              });
            }
            
            if (item.length === 0) {
              return res.json({
                message: 'Inventory item updated successfully, but could not retrieve the updated item',
                inventory_id: itemId
              });
            }
            
            res.json(item[0]);
          });
        });
      }
    });
  } catch (error) {
    console.error('Server error in updateInventoryItem:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update inventory item quantity (partial update)
 */
exports.updateInventoryQuantity = (req, res) => {
  try {
    const itemId = req.params.id;
    const { quantity } = req.body;
    
    console.log('Update quantity request:', { itemId, quantity });
    
    if (quantity === undefined) {
      return res.status(400).json({ message: 'Quantity is required' });
    }
    
    // Update only the quantity field
    db.query(
      'UPDATE inventory SET quantity = ? WHERE inventory_id = ?', 
      [quantity, itemId], 
      (err, result) => {
        if (err) {
          console.error('Error updating inventory quantity:', err);
          return res.status(500).json({ 
            message: 'Error updating inventory quantity', 
            error: err.message 
          });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Inventory item not found' });
        }
        
        // Check if quantity is 0, update status if needed
        if (quantity === 0) {
          db.query(
            'UPDATE inventory SET status = "not_available" WHERE inventory_id = ?',
            [itemId],
            (err) => {
              if (err) {
                console.error('Error updating status for zero quantity:', err);
              }
            }
          );
        }
        
        // Get updated item to return with supplier info
        db.query(`
          SELECT i.*, s.name as supplier_name
          FROM inventory i
          LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id
          WHERE i.inventory_id = ?
        `, [itemId], (err, item) => {
          if (err) {
            console.error('Error fetching updated item:', err);
            return res.json({
              message: 'Inventory quantity updated successfully',
              inventory_id: itemId,
              quantity
            });
          }
          
          if (item.length === 0) {
            return res.json({
              message: 'Inventory quantity updated successfully, but could not retrieve the updated item',
              inventory_id: itemId,
              quantity
            });
          }
          
          res.json(item[0]);
        });
      }
    );
  } catch (error) {
    console.error('Server error in updateInventoryQuantity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete an inventory item
 */
exports.deleteInventoryItem = (req, res) => {
  try {
    const itemId = req.params.id;
    
    db.query('DELETE FROM inventory WHERE inventory_id = ?', [itemId], (err, result) => {
      if (err) {
        console.error('Error deleting inventory item:', err);
        return res.status(500).json({ 
          message: 'Error deleting inventory item', 
          error: err.message 
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }
      
      res.json({
        message: 'Inventory item deleted successfully',
        inventory_id: itemId
      });
    });
  } catch (error) {
    console.error('Server error in deleteInventoryItem:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get inventory statistics
 */
exports.getInventoryStats = (req, res) => {
  try {
    const query = `
      SELECT
        COUNT(*) as total_items,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'not_available' THEN 1 ELSE 0 END) as not_available,
        SUM(CASE WHEN exp_date < CURDATE() THEN 1 ELSE 0 END) as expired
      FROM
        inventory
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching inventory statistics:', err);
        return res.status(500).json({ 
          message: 'Error fetching inventory statistics', 
          error: err.message 
        });
      }
      
      // Return the statistics
      res.json(results[0]);
    });
  } catch (error) {
    console.error('Server error in getInventoryStats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get all inventory categories
 */
exports.getInventoryCategories = (req, res) => {
  try {
    const query = `
      SELECT DISTINCT unit as name
      FROM inventory
      ORDER BY unit
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching inventory categories:', err);
        return res.status(500).json({ 
          message: 'Error fetching inventory categories', 
          error: err.message 
        });
      }
      
      // Map results to expected format
      const categories = results.map((item, index) => ({
        id: index + 1,
        name: item.name
      }));
      
      res.json(categories);
    });
  } catch (error) {
    console.error('Server error in getInventoryCategories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a debugging endpoint to check item status
exports.getItemStatus = (req, res) => {
  const itemId = req.params.id;
  
  db.query('SELECT status FROM inventory WHERE inventory_id = ?', [itemId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error checking status', error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ 
      status: results[0].status,
      valid_status_values: ['available', 'expired', 'used']
    });
  });
};