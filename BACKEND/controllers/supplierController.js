const db = require('../config/db');

/**
 * Get all suppliers
 */
exports.getAllSuppliers = (req, res) => {
  try {
    const query = 'SELECT * FROM suppliers ORDER BY name';
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching suppliers:', err);
        return res.status(500).json({ 
          message: 'Error fetching suppliers', 
          error: err.message 
        });
      }
      
      res.json(results);
    });
  } catch (error) {
    console.error('Server error in getAllSuppliers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get supplier by ID
 */
exports.getSupplierById = (req, res) => {
  try {
    const supplierId = req.params.id;
    
    db.query('SELECT * FROM suppliers WHERE supplier_id = ?', [supplierId], (err, results) => {
      if (err) {
        console.error('Error fetching supplier:', err);
        return res.status(500).json({ 
          message: 'Error fetching supplier', 
          error: err.message 
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Supplier not found' });
      }
      
      res.json(results[0]);
    });
  } catch (error) {
    console.error('Server error in getSupplierById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a new supplier
 */
exports.createSupplier = (req, res) => {
  try {
    const { name, contact_number, email, address, status } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Supplier name is required' });
    }
    
    // Create new supplier
    const newSupplier = { name };
    
    // Add optional fields if provided
    if (contact_number) newSupplier.contact_number = contact_number;
    if (email) newSupplier.email = email;
    if (address) newSupplier.address = address;
    if (status) newSupplier.status = status;
    
    // Insert into database
    db.query('INSERT INTO suppliers SET ?', newSupplier, (err, result) => {
      if (err) {
        console.error('Error creating supplier:', err);
        return res.status(500).json({ 
          message: 'Error creating supplier', 
          error: err.message 
        });
      }
      
      // Return the created supplier
      res.status(201).json({
        message: 'Supplier created successfully',
        supplier_id: result.insertId,
        ...newSupplier
      });
    });
  } catch (error) {
    console.error('Server error in createSupplier:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update a supplier
 */
exports.updateSupplier = (req, res) => {
  try {
    const supplierId = req.params.id;
    const { name, contact_number, email, address, status } = req.body;
    
    // Build update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (contact_number !== undefined) updateData.contact_number = contact_number;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;
    if (status !== undefined) updateData.status = status;
    
    // Check if any data to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields to update provided' });
    }
    
    // Update supplier in database
    db.query('UPDATE suppliers SET ? WHERE supplier_id = ?', [updateData, supplierId], (err, result) => {
      if (err) {
        console.error('Error updating supplier:', err);
        return res.status(500).json({ 
          message: 'Error updating supplier', 
          error: err.message 
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Supplier not found' });
      }
      
      // Return success message
      res.json({
        message: 'Supplier updated successfully',
        supplier_id: supplierId,
        ...updateData
      });
    });
  } catch (error) {
    console.error('Server error in updateSupplier:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete a supplier
 */
exports.deleteSupplier = (req, res) => {
  try {
    const supplierId = req.params.id;
    
    // First check if the supplier has inventory items (foreign key constraint)
    db.query('SELECT COUNT(*) as count FROM inventory WHERE supplier_id = ?', [supplierId], (err, results) => {
      if (err) {
        console.error('Error checking supplier references:', err);
        return res.status(500).json({ 
          message: 'Error checking supplier references', 
          error: err.message 
        });
      }
      
      if (results[0].count > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete supplier with inventory items. Reassign or delete the items first.' 
        });
      }
      
      // Delete the supplier
      db.query('DELETE FROM suppliers WHERE supplier_id = ?', [supplierId], (err, result) => {
        if (err) {
          console.error('Error deleting supplier:', err);
          return res.status(500).json({ 
            message: 'Error deleting supplier', 
            error: err.message 
          });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Supplier not found' });
        }
        
        res.json({
          message: 'Supplier deleted successfully',
          supplier_id: supplierId
        });
      });
    });
  } catch (error) {
    console.error('Server error in deleteSupplier:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};