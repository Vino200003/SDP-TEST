const bcrypt = require('bcryptjs');
const db = require('../config/db');

/**
 * Get admin profile
 */
exports.getAdminProfile = (req, res) => {
  try {
    // Get admin ID from middleware
    const adminId = req.admin.id;
    console.log('Getting profile for admin ID:', adminId);
    
    // Query to get admin profile
    const query = `
      SELECT 
        admin_id, 
        first_name, 
        last_name, 
        email, 
        phone_number, 
        created_at, 
        updated_at 
      FROM admin 
      WHERE admin_id = ?
    `;
    
    db.query(query, [adminId], (err, results) => {
      if (err) {
        console.error('Error fetching admin profile:', err);
        return res.status(500).json({ 
          message: 'Error fetching admin profile', 
          error: err.message 
        });
      }
      
      if (results.length === 0) {
        console.log('Admin not found with ID:', adminId);
        return res.status(404).json({ message: 'Admin not found' });
      }
      
      console.log('Admin profile found:', results[0]);
      res.json(results[0]);
    });
  } catch (error) {
    console.error('Server error in getAdminProfile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update admin profile
 */
exports.updateAdminProfile = (req, res) => {
  try {
    const adminId = req.admin.id;
    const { first_name, last_name, email, phone_number } = req.body;
    
    console.log('Update request for admin ID:', adminId, 'with data:', req.body);
    
    // Validate required fields
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ 
        message: 'First name, last name, and email are required' 
      });
    }
    
    // Check if email already exists for a different admin
    db.query('SELECT * FROM admin WHERE email = ? AND admin_id != ?', [email, adminId], (err, results) => {
      if (err) {
        console.error('Error checking email uniqueness:', err);
        return res.status(500).json({ 
          message: 'Error updating admin profile', 
          error: err.message 
        });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ message: 'Email already in use by another admin' });
      }
      
      // Update profile
      const updateData = {
        first_name,
        last_name,
        email,
        phone_number: phone_number || null,
        updated_at: new Date()
      };
      
      db.query('UPDATE admin SET ? WHERE admin_id = ?', [updateData, adminId], (err, result) => {
        if (err) {
          console.error('Error updating admin profile:', err);
          return res.status(500).json({ 
            message: 'Error updating admin profile', 
            error: err.message 
          });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Admin not found' });
        }
        
        // Get updated admin profile
        db.query(
          'SELECT admin_id, first_name, last_name, email, phone_number, created_at, updated_at FROM admin WHERE admin_id = ?',
          [adminId],
          (err, results) => {
            if (err) {
              console.error('Error fetching updated admin profile:', err);
              return res.status(500).json({ 
                message: 'Profile updated but failed to fetch updated profile', 
                error: err.message 
              });
            }
            
            console.log('Profile updated successfully:', results[0]);
            res.json({ 
              message: 'Profile updated successfully',
              admin: results[0]
            });
          }
        );
      });
    });
  } catch (error) {
    console.error('Server error in updateAdminProfile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Change admin password
 */
exports.changeAdminPassword = (req, res) => {
  try {
    const adminId = req.admin.id;
    const { currentPassword, newPassword } = req.body;
    
    console.log('Password change request for admin ID:', adminId);
    
    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current password and new password are required' 
      });
    }
    
    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters long' 
      });
    }
    
    // Get current admin data to verify password
    db.query('SELECT * FROM admin WHERE admin_id = ?', [adminId], async (err, results) => {
      if (err) {
        console.error('Error fetching admin for password change:', err);
        return res.status(500).json({ 
          message: 'Error changing password', 
          error: err.message 
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      
      const admin = results[0];
      
      // Verify current password
      let isMatch = false;
      
      try {
        // Try bcrypt first
        isMatch = await bcrypt.compare(currentPassword, admin.password);
      } catch (compareErr) {
        console.log('bcrypt compare failed, trying direct comparison:', compareErr);
        // If bcrypt fails, try direct comparison (for backward compatibility)
        isMatch = (currentPassword === admin.password);
      }
      
      if (!isMatch) {
        console.log('Password mismatch for admin ID:', adminId);
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update password
      db.query('UPDATE admin SET password = ?, updated_at = NOW() WHERE admin_id = ?',
        [hashedPassword, adminId],
        (updateErr, updateResult) => {
          if (updateErr) {
            console.error('Error updating admin password:', updateErr);
            return res.status(500).json({ 
              message: 'Error changing password', 
              error: updateErr.message 
            });
          }
          
          console.log('Password updated successfully for admin ID:', adminId);
          res.json({ message: 'Password changed successfully' });
        }
      );
    });
  } catch (error) {
    console.error('Server error in changeAdminPassword:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to check if an admin is the super admin (first created)
const isSuperAdmin = async (adminId) => {
  return new Promise((resolve, reject) => {
    // Get the admin with the lowest admin_id (first created)
    db.query('SELECT MIN(admin_id) as first_admin_id FROM admin', (err, results) => {
      if (err) {
        console.error('Error checking for super admin:', err);
        reject(err);
        return;
      }
      
      const firstAdminId = results[0]?.first_admin_id;
      resolve(parseInt(adminId) === parseInt(firstAdminId));
    });
  });
};

/**
 * Check if current admin is the super admin
 */
exports.checkSuperAdminStatus = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const superAdmin = await isSuperAdmin(adminId);
    
    res.json({ isSuperAdmin: superAdmin });
  } catch (error) {
    console.error('Error checking super admin status:', error);
    res.status(500).json({ 
      message: 'Error checking admin privileges', 
      error: error.message 
    });
  }
};

/**
 * Create a new admin user
 */
exports.createAdmin = async (req, res) => {
  try {
    const adminId = req.admin.id;
    
    // Check if the current admin is the super admin
    const superAdmin = await isSuperAdmin(adminId);
    if (!superAdmin) {
      return res.status(403).json({ message: 'Only the super admin can create new administrators' });
    }
    
    const { first_name, last_name, email, phone_number, password } = req.body;
    
    console.log('Create admin request with data:', {
      first_name,
      last_name,
      email,
      phone_number
    });
    
    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ 
        message: 'First name, last name, email, and password are required'
      });
    }
    
    // Check if email already exists
    db.query('SELECT * FROM admin WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error('Error checking email uniqueness:', err);
        return res.status(500).json({ 
          message: 'Error creating admin', 
          error: err.message 
        });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create the new admin
      const newAdmin = {
        first_name,
        last_name,
        email,
        password: hashedPassword,
        phone_number: phone_number || null,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      db.query('INSERT INTO admin SET ?', newAdmin, (err, result) => {
        if (err) {
          console.error('Error creating admin:', err);
          return res.status(500).json({ 
            message: 'Error creating admin', 
            error: err.message 
          });
        }
        
        console.log('Admin created successfully with ID:', result.insertId);
        res.status(201).json({
          message: 'Admin created successfully',
          admin_id: result.insertId
        });
      });
    });
  } catch (error) {
    console.error('Server error in createAdmin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get all admin users
 */
exports.getAllAdmins = (req, res) => {
  try {
    // Query to get all admins without passwords
    const query = `
      SELECT 
        admin_id, 
        first_name, 
        last_name, 
        email, 
        phone_number, 
        created_at, 
        updated_at 
      FROM admin 
      ORDER BY created_at DESC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching all admins:', err);
        return res.status(500).json({ 
          message: 'Error fetching admin list', 
          error: err.message 
        });
      }
      
      console.log(`Retrieved ${results.length} admin users`);
      res.json(results);
    });
  } catch (error) {
    console.error('Server error in getAllAdmins:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete an admin user
 */
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;
    
    // Check if the current admin is the super admin
    const superAdmin = await isSuperAdmin(adminId);
    if (!superAdmin) {
      return res.status(403).json({ message: 'Only the super admin can remove administrators' });
    }
    
    // Prevent deleting your own account
    if (parseInt(id) === parseInt(adminId)) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }
    
    // Check if the admin exists
    db.query('SELECT * FROM admin WHERE admin_id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error checking admin existence:', err);
        return res.status(500).json({ 
          message: 'Error deleting admin', 
          error: err.message 
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      
      // Delete the admin
      db.query('DELETE FROM admin WHERE admin_id = ?', [id], (err, result) => {
        if (err) {
          console.error('Error deleting admin:', err);
          return res.status(500).json({ 
            message: 'Error deleting admin', 
            error: err.message 
          });
        }
        
        console.log(`Admin with ID ${id} deleted successfully`);
        res.json({ message: 'Admin deleted successfully' });
      });
    });
  } catch (error) {
    console.error('Server error in deleteAdmin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
