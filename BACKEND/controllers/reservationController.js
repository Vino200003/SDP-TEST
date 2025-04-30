const db = require('../config/db');
const { isDateTimeAvailable, getAvailableTables } = require('../utils/reservationUtils');

/**
 * Get all reservations (admin only)
 */
exports.getAllReservations = (req, res) => {
  const query = `
    SELECT r.*, u.first_name, u.last_name, u.email, u.phone_number, t.capacity
    FROM reservations r
    LEFT JOIN users u ON r.user_id = u.user_id
    LEFT JOIN tables t ON r.table_no = t.table_no
    ORDER BY r.date_time DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching reservations:', err);
      return res.status(500).json({ 
        message: 'Error fetching reservations', 
        error: err.message 
      });
    }
    
    res.json(results);
  });
};

/**
 * Get reservations for a specific user
 */
exports.getUserReservations = (req, res) => {
  const userId = req.params.userId;
  
  const query = `
    SELECT r.*, t.capacity
    FROM reservations r
    LEFT JOIN tables t ON r.table_no = t.table_no
    WHERE r.user_id = ?
    ORDER BY r.date_time DESC
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user reservations:', err);
      return res.status(500).json({ 
        message: 'Error fetching reservations', 
        error: err.message 
      });
    }
    
    res.json(results);
  });
};

/**
 * Get a specific reservation by ID
 */
exports.getReservationById = (req, res) => {
  const reserveId = req.params.id;
  
  const query = `
    SELECT r.*, u.first_name, u.last_name, u.email, u.phone_number, t.capacity
    FROM reservations r
    LEFT JOIN users u ON r.user_id = u.user_id
    LEFT JOIN tables t ON r.table_no = t.table_no
    WHERE r.reserve_id = ?
  `;
  
  db.query(query, [reserveId], (err, results) => {
    if (err) {
      console.error('Error fetching reservation:', err);
      return res.status(500).json({ 
        message: 'Error fetching reservation', 
        error: err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    res.json(results[0]);
  });
};

/**
 * Create a new reservation
 */
exports.createReservation = async (req, res) => {
  try {
    const { user_id, table_no, special_requests, date_time } = req.body;
    
    // Basic validation
    if (!table_no || !date_time) {
      return res.status(400).json({ message: 'Table and date/time are required' });
    }
    
    // Format date_time to ensure it's in the correct format
    const reservationDateTime = new Date(date_time);
    
    // Check if the date is in the future
    if (reservationDateTime < new Date()) {
      return res.status(400).json({ message: 'Reservation date must be in the future' });
    }
    
    // Check if the table exists
    const tableExists = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM tables WHERE table_no = ?', [table_no], (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(results.length > 0);
      });
    });
    
    if (!tableExists) {
      return res.status(400).json({ message: 'Invalid table number' });
    }
    
    // Check if the table is available at the requested time
    const isAvailable = await isDateTimeAvailable(table_no, reservationDateTime);
    
    if (!isAvailable) {
      return res.status(400).json({ 
        message: 'This table is not available at the requested time' 
      });
    }
    
    // Create the reservation
    const newReservation = {
      user_id: user_id || null, // Allow anonymous reservations
      table_no,
      special_requests: special_requests || null,
      date_time: reservationDateTime
    };
    
    db.query('INSERT INTO reservations SET ?', newReservation, (err, result) => {
      if (err) {
        console.error('Error creating reservation:', err);
        return res.status(500).json({ 
          message: 'Error creating reservation', 
          error: err.message 
        });
      }
      
      res.status(201).json({
        message: 'Reservation created successfully',
        reserve_id: result.insertId,
        reservation: {
          ...newReservation,
          reserve_id: result.insertId
        }
      });
    });
  } catch (error) {
    console.error('Server error in createReservation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update an existing reservation
 */
exports.updateReservation = async (req, res) => {
  try {
    const reserveId = req.params.id;
    const { table_no, special_requests, date_time } = req.body;
    
    // Fetch the current reservation
    const currentReservation = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM reservations WHERE reserve_id = ?', [reserveId], (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (results.length === 0) {
          resolve(null);
          return;
        }
        
        resolve(results[0]);
      });
    });
    
    if (!currentReservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    // Format date_time if provided
    let reservationDateTime = currentReservation.date_time;
    if (date_time) {
      reservationDateTime = new Date(date_time);
      
      // Check if the date is in the future
      if (reservationDateTime < new Date()) {
        return res.status(400).json({ message: 'Reservation date must be in the future' });
      }
    }
    
    // Check if table is being changed
    let tableNumber = currentReservation.table_no;
    if (table_no && table_no !== currentReservation.table_no) {
      tableNumber = table_no;
      
      // Check if the new table exists
      const tableExists = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM tables WHERE table_no = ?', [tableNumber], (err, results) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(results.length > 0);
        });
      });
      
      if (!tableExists) {
        return res.status(400).json({ message: 'Invalid table number' });
      }
    }
    
    // If table or date/time is being changed, check availability
    if (tableNumber !== currentReservation.table_no || 
        date_time && reservationDateTime.getTime() !== new Date(currentReservation.date_time).getTime()) {
      
      // Check if the table is available at the requested time
      const isAvailable = await isDateTimeAvailable(tableNumber, reservationDateTime, reserveId);
      
      if (!isAvailable) {
        return res.status(400).json({ 
          message: 'This table is not available at the requested time' 
        });
      }
    }
    
    // Update the reservation
    const updatedReservation = {
      table_no: tableNumber,
      special_requests: special_requests !== undefined ? special_requests : currentReservation.special_requests,
      date_time: reservationDateTime
    };
    
    db.query('UPDATE reservations SET ? WHERE reserve_id = ?', [updatedReservation, reserveId], (err, result) => {
      if (err) {
        console.error('Error updating reservation:', err);
        return res.status(500).json({ 
          message: 'Error updating reservation', 
          error: err.message 
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
      
      res.json({
        message: 'Reservation updated successfully',
        reservation: {
          ...updatedReservation,
          reserve_id: parseInt(reserveId)
        }
      });
    });
  } catch (error) {
    console.error('Server error in updateReservation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete a reservation
 */
exports.deleteReservation = (req, res) => {
  const reserveId = req.params.id;
  
  db.query('DELETE FROM reservations WHERE reserve_id = ?', [reserveId], (err, result) => {
    if (err) {
      console.error('Error deleting reservation:', err);
      return res.status(500).json({ 
        message: 'Error deleting reservation', 
        error: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    res.json({
      message: 'Reservation deleted successfully',
      affectedRows: result.affectedRows
    });
  });
};

/**
 * Get all tables
 */
exports.getAllTables = (req, res) => {
  try {
    db.query('SELECT * FROM tables ORDER BY table_no', (err, results) => {
      if (err) {
        console.error('Error fetching tables:', err);
        return res.status(500).json({ 
          message: 'Error fetching tables', 
          error: err.message 
        });
      }
      
      // Send all tables to the client
      res.json(results);
    });
  } catch (error) {
    console.error('Server error in getAllTables:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Check available tables for a given date/time
 */
exports.getAvailableTablesForDateTime = async (req, res) => {
  try {
    const { dateTime } = req.query;
    
    if (!dateTime) {
      return res.status(400).json({ message: 'Date and time are required' });
    }
    
    const requestedDateTime = new Date(dateTime);
    
    // Get available tables - no authentication required
    const availableTables = await getAvailableTables(requestedDateTime);
    
    res.json(availableTables);
  } catch (error) {
    console.error('Server error in getAvailableTablesForDateTime:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
