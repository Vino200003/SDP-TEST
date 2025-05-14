const bcrypt = require('bcryptjs');
const db = require('../config/db');

/**
 * Get staff profile by ID
 */
exports.getStaffProfile = (req, res) => {
  try {
    const staffId = req.params.id;
    
    // Validate staff ID
    if (!staffId) {
      return res.status(400).json({ message: 'Staff ID is required' });
    }

    // Query to get staff profile without password
    const query = `
      SELECT 
        staff_id,
        first_name,
        last_name,
        nic,
        email,
        phone_number,
        role,
        active,
        DATE_FORMAT(created_at, '%Y-%m-%d') as join_date
      FROM staff 
      WHERE staff_id = ?
    `;
    
    db.query(query, [staffId], (err, results) => {
      if (err) {
        console.error('Error fetching staff profile:', err);
        return res.status(500).json({ 
          message: 'Error fetching staff profile', 
          error: err.message 
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Staff not found' });
      }
      
      // Format the result to match the expected format in the frontend
      const staffProfile = {
        ...results[0],
        joinDate: results[0].join_date,
      };
      
      res.json(staffProfile);
    });
  } catch (error) {
    console.error('Server error in getStaffProfile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update staff profile
 */
exports.updateStaffProfile = (req, res) => {
  try {
    const staffId = req.params.id;
    const { first_name, last_name, email, phone_number, nic } = req.body;
    
    // Validate required fields
    if (!first_name || !last_name || !email || !phone_number || !nic) {
      return res.status(400).json({ 
        message: 'First name, last name, email, phone number, and NIC are required'
      });
    }
    
    // Check if email already exists for a different staff member
    db.query('SELECT * FROM staff WHERE email = ? AND staff_id != ?', [email, staffId], (err, results) => {
      if (err) {
        console.error('Error checking email uniqueness:', err);
        return res.status(500).json({ 
          message: 'Error updating staff profile', 
          error: err.message 
        });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ message: 'Email already in use by another staff member' });
      }
      
      // Check if NIC already exists for a different staff member
      db.query('SELECT * FROM staff WHERE nic = ? AND staff_id != ?', [nic, staffId], (err, results) => {
        if (err) {
          console.error('Error checking NIC uniqueness:', err);
          return res.status(500).json({ 
            message: 'Error updating staff profile', 
            error: err.message 
          });
        }
        
        if (results.length > 0) {
          return res.status(400).json({ message: 'NIC already in use by another staff member' });
        }
        
        // Update profile
        const updateData = {
          first_name,
          last_name,
          email,
          phone_number,
          nic,
          updated_at: new Date()
        };
        
        db.query('UPDATE staff SET ? WHERE staff_id = ?', [updateData, staffId], (err, result) => {
          if (err) {
            console.error('Error updating staff profile:', err);
            return res.status(500).json({ 
              message: 'Error updating staff profile', 
              error: err.message 
            });
          }
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Staff not found' });
          }
          
          // Get updated profile
          exports.getStaffProfile(req, res);
        });
      });
    });
  } catch (error) {
    console.error('Server error in updateStaffProfile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update staff password
 */
exports.updateStaffPassword = async (req, res) => {
  try {
    const staffId = req.params.id;
    const { currentPassword, newPassword } = req.body;
    
    // Validate fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current password and new password are required'
      });
    }
    
    // Check if staff exists and validate current password
    db.query('SELECT * FROM staff WHERE staff_id = ?', [staffId], async (err, results) => {
      if (err) {
        console.error('Error fetching staff for password update:', err);
        return res.status(500).json({ 
          message: 'Error updating password', 
          error: err.message 
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Staff not found' });
      }
      
      const staff = results[0];
      
      // Verify current password
      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(currentPassword, staff.password);
      } catch (compareErr) {
        console.error('Password comparison error:', compareErr);
        
        // For testing purposes, also check if the password is stored as plaintext
        isMatch = (currentPassword === staff.password);
      }
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Hash the new password
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update the password
        db.query(
          'UPDATE staff SET password = ?, updated_at = NOW() WHERE staff_id = ?',
          [hashedPassword, staffId],
          (updateErr, updateResult) => {
            if (updateErr) {
              console.error('Error updating password:', updateErr);
              return res.status(500).json({ 
                message: 'Error updating password', 
                error: updateErr.message 
              });
            }
            
            res.json({ message: 'Password updated successfully' });
          }
        );
      } catch (hashErr) {
        console.error('Error hashing new password:', hashErr);
        return res.status(500).json({ 
          message: 'Error updating password', 
          error: hashErr.message 
        });
      }
    });
  } catch (error) {
    console.error('Server error in updateStaffPassword:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
