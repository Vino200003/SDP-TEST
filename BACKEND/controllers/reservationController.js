const db = require('../config/db');
const { isDateTimeAvailable, getAvailableTables } = require('../utils/reservationUtils');
const jwt = require('jsonwebtoken');


 //Get all reservations (admin only)
 
exports.getAllReservations = (req, res) => {
  try {
    // Extract query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Build conditions for filtering
    let conditions = [];
    let params = [];
    
    // Status filter
    if (req.query.status) {
      conditions.push('r.status = ?');
      params.push(req.query.status);
    }
    
    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      conditions.push('DATE(r.date_time) BETWEEN ? AND ?');
      params.push(req.query.startDate, req.query.endDate);
    } else if (req.query.startDate) {
      conditions.push('DATE(r.date_time) >= ?');
      params.push(req.query.startDate);
    } else if (req.query.endDate) {
      conditions.push('DATE(r.date_time) <= ?');
      params.push(req.query.endDate);
    }
    
    // Combine conditions
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Log the request details for debugging
    console.log(`Getting reservations with filters: page=${page}, limit=${limit}, conditions=`, conditions);
    
    // First get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM reservations r 
      ${whereClause}
    `;
    
    db.query(countQuery, params, (countErr, countResult) => {
      if (countErr) {
        console.error('Error counting reservations:', countErr);
        return res.status(500).json({ 
          message: 'Error fetching reservations count', 
          error: countErr.message 
        });
      }
      
      const total = countResult[0].total;
      const pages = Math.ceil(total / limit);
      
      // If there are no results, return empty array
      if (total === 0) {
        return res.json({
          reservations: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          }
        });
      }
      
      // Then get the actual data with pagination
      const query = `
        SELECT r.*, u.first_name, u.last_name, u.email, u.phone_number, t.capacity
        FROM reservations r
        LEFT JOIN users u ON r.user_id = u.user_id
        LEFT JOIN tables t ON r.table_no = t.table_no
        ${whereClause}
        ORDER BY r.date_time DESC
        LIMIT ? OFFSET ?
      `;
      
      // Add pagination params
      const queryParams = [...params, limit, offset];
      
      db.query(query, queryParams, (err, results) => {
        if (err) {
          console.error('Error fetching reservations:', err);
          return res.status(500).json({ 
            message: 'Error fetching reservations', 
            error: err.message 
          });
        }
        
        // Add customer_name field for frontend consistency
        const reservations = results.map(reservation => {
          if (reservation.first_name || reservation.last_name) {
            reservation.customer_name = `${reservation.first_name || ''} ${reservation.last_name || ''}`.trim();
          }
          // Ensure status is defined
          if (!reservation.status) {
            reservation.status = 'Pending'; // Change default status to Pending
          }
          return reservation;
        });
        
        // Return the data with pagination info
        res.json({
          reservations: reservations,
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
    console.error('Server error in getAllReservations:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};



/**
 * Get reservations for a specific user
 */
exports.getUserReservations = (req, res) => {
  try {
    // Get user ID from different possible sources
    let userId = null;
    
    // From authentication token
    if (req.user && (req.user.id || req.user.user_id)) {
      userId = req.user.id || req.user.user_id;
    }
    
    // Or from query parameter as fallback
    if (!userId && req.query.userId) {
      userId = req.query.userId;
    }
    
    console.log('Fetching reservations for user ID:', userId);
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // First, check the structure of the tables table
    db.query('DESCRIBE tables', (descErr, columns) => {
      if (descErr) {
        console.error('Error checking table structure:', descErr);
        return res.status(500).json({ 
          message: 'Error checking table structure', 
          error: descErr.message 
        });
      }
      
      // Build the query dynamically based on existing columns
      const columnNames = columns.map(col => col.Field);
      console.log('Available columns in tables:', columnNames);
      
      // Include only existing columns in the query
      const selectFields = ['r.*', 't.capacity'];
      
      if (columnNames.includes('location')) {
        selectFields.push('t.location');
      }
      
      if (columnNames.includes('description')) {
        selectFields.push('t.description');
      }
      
      // If none of the table columns are in the tables table, we'll just select from reservations
      const query = `
        SELECT ${selectFields.join(', ')}
        FROM reservations r
        LEFT JOIN tables t ON r.table_no = t.table_no
        WHERE r.user_id = ?
        ORDER BY r.date_time DESC
      `;
      
      db.query(query, [userId], (err, results) => {
        if (err) {
          console.error('Database error fetching user reservations:', err);
          return res.status(500).json({ 
            message: 'Error fetching reservations', 
            error: err.message 
          });
        }
        
        console.log(`Found ${results.length} reservations for user ${userId}`);
        
        // Return empty array if no reservations found
        res.json(results || []);
      });
    });
  } catch (error) {
    console.error('Server error in getUserReservations:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
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
      date_time: reservationDateTime,
      status: 'Pending' // Set status as Pending by default
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



/**
 * Get all reservations for admin (with pagination and filters)
 */
exports.getAdminReservations = async (req, res) => {
  try {
    // Extract query parameters
    const { page, limit, status, startDate, endDate } = req.query;
    
    // Prepare options object
    const options = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10
    };
    
    // Add filters if provided
    if (status) options.status = status;
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);
    
    // Import the function from utils
    const { getReservationsWithFilters } = require('../utils/reservationUtils');
    
    // Get reservations with filters
    const result = await getReservationsWithFilters(options);
    
    res.json(result);
  } catch (error) {
    console.error('Error in getAdminReservations:', error);
    res.status(500).json({ 
      message: 'Failed to fetch reservations', 
      error: error.message 
    });
  }
};



/**
 * Get reservation statistics for admin
 */
exports.getReservationStats = async (req, res) => {
  try {
    // Extract query parameters
    const { startDate, endDate } = req.query;
    
    // Default counts in case of query errors
    const defaultStats = {
      total_reservations: 0,
      upcoming_reservations: 0,
      completed_reservations: 0,
      cancelled_reservations: 0
    };
    
    // Build date conditions
    let dateCondition = '';
    let params = [];
    
    if (startDate && endDate) {
      dateCondition = 'WHERE DATE(date_time) BETWEEN ? AND ?';
      params = [startDate, endDate];
    } else if (startDate) {
      dateCondition = 'WHERE DATE(date_time) >= ?';
      params = [startDate];
    } else if (endDate) {
      dateCondition = 'WHERE DATE(date_time) <= ?';
      params = [endDate];
    }
    
    // Get total count
    const totalQuery = `SELECT COUNT(*) as count FROM reservations ${dateCondition}`;
    
    // Make upcoming query more robust by checking that status column exists
    const upcomingQuery = `
      SELECT COUNT(*) as count 
      FROM reservations 
      WHERE (status = 'Confirmed' OR status IS NULL)
      AND DATE(date_time) >= CURDATE()
      ${dateCondition ? `AND ${dateCondition.substring(6)}` : ''}
    `;
    
    // Make completed query more robust
    const completedQuery = `
      SELECT COUNT(*) as count 
      FROM reservations 
      WHERE status = 'Completed'
      ${dateCondition ? `AND ${dateCondition.substring(6)}` : ''}
    `;
    
    // Make cancelled query more robust
    const cancelledQuery = `
      SELECT COUNT(*) as count 
      FROM reservations 
      WHERE status IN ('Cancelled', 'No-Show')
      ${dateCondition ? `AND ${dateCondition.substring(6)}` : ''}
    `;
    
    // Execute queries with better error handling
    try {
      const totalResult = await new Promise((resolve, reject) => {
        db.query(totalQuery, params, (err, results) => {
          if (err) {
            console.error('Error in total count query:', err);
            resolve(0); // Use 0 as fallback
          } else {
            resolve(results[0].count);
          }
        });
      });
      
      const upcomingResult = await new Promise((resolve, reject) => {
        db.query(upcomingQuery, params, (err, results) => {
          if (err) {
            console.error('Error in upcoming count query:', err);
            resolve(0); // Use 0 as fallback
          } else {
            resolve(results[0].count);
          }
        });
      });
      
      const completedResult = await new Promise((resolve, reject) => {
        db.query(completedQuery, params, (err, results) => {
          if (err) {
            console.error('Error in completed count query:', err);
            resolve(0); // Use 0 as fallback
          } else {
            resolve(results[0].count);
          }
        });
      });
      
      const cancelledResult = await new Promise((resolve, reject) => {
        db.query(cancelledQuery, params, (err, results) => {
          if (err) {
            console.error('Error in cancelled count query:', err);
            resolve(0); // Use 0 as fallback
          } else {
            resolve(results[0].count);
          }
        });
      });
      
      res.json({
        total_reservations: totalResult,
        upcoming_reservations: upcomingResult,
        completed_reservations: completedResult,
        cancelled_reservations: cancelledResult
      });
    } catch (queryError) {
      console.error('Error executing reservation stats queries:', queryError);
      res.json(defaultStats);
    }
  } catch (error) {
    console.error('Error in getReservationStats:', error);
    // Return default stats instead of error to prevent frontend issues
    res.json({
      total_reservations: 0,
      upcoming_reservations: 0,
      completed_reservations: 0,
      cancelled_reservations: 0,
      error: "Could not retrieve stats"
    });
  }
};





/**
 * Update reservation status (admin only)
 */
exports.updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Log the received data for debugging
    console.log('Updating reservation status:', {
      reservationId: id,
      newStatus: status,
      requestBody: req.body
    });
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Validate status
    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-Show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      });
    }
    
    // First check if the status column exists in the reservations table
    db.query('SHOW COLUMNS FROM reservations', (err, columns) => {
      if (err) {
        console.error('Error checking reservation table schema:', err);
        return res.status(500).json({
          message: 'Error checking database schema',
          error: err.message
        });
      }
      
      // Find the status column (it might be named differently)
      const statusColumn = columns.find(col => 
        col.Field === 'status' || 
        col.Field === 'reservation_status' || 
        col.Field === 'reserve_status'
      );
      
      if (!statusColumn) {
        console.log('Status column not found. Available columns:', columns.map(c => c.Field));
        
        // Try to add the status column to the table
        db.query('ALTER TABLE reservations ADD COLUMN status VARCHAR(20) DEFAULT "Pending"', (alterErr) => {
          if (alterErr) {
            console.error('Error adding status column:', alterErr);
            return res.status(500).json({
              message: 'Status column not found in database schema and could not be added',
              availableColumns: columns.map(c => c.Field),
              error: alterErr.message
            });
          }
          
          console.log('Status column added successfully. Now updating reservation status.');
          
          // Now update the reservation with the newly added column
          updateReservationWithStatus('status');
        });
      } else {
        // Status column exists, proceed with the update
        const statusFieldName = statusColumn.Field;
        console.log(`Using status field name: ${statusFieldName}`);
        updateReservationWithStatus(statusFieldName);
      }
      
      // Function to update the reservation with the given status field name
      function updateReservationWithStatus(fieldName) {
        // Update reservation status using the correct column name
        db.query(
          `UPDATE reservations SET ${fieldName} = ? WHERE reserve_id = ?`,
          [status, id],
          (updateErr, result) => {
            if (updateErr) {
              console.error('Error updating reservation status:', updateErr);
              return res.status(500).json({ 
                message: 'Error updating reservation status', 
                error: updateErr.message 
              });
            }
            
            if (result.affectedRows === 0) {
              return res.status(404).json({ message: 'Reservation not found' });
            }
            
            res.json({
              message: 'Reservation status updated successfully',
              reservation_id: id,
              status
            });
          }
        );
      }
    });
  } catch (error) {
    console.error('Error in updateReservationStatus:', error);
    res.status(500).json({ 
      message: 'Failed to update reservation status', 
      error: error.message 
    });
  }
};
