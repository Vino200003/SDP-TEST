/**
 * Utility functions for reservation operations
 */

const db = require('../config/db');

/**
 * Check if a table is available at a specific date and time
 * @param {number} tableNo - Table number to check
 * @param {Date} dateTime - Date and time for the reservation
 * @param {number} excludeReservationId - Optional reservation ID to exclude (for updates)
 * @returns {Promise<boolean>} - True if the table is available, false otherwise
 */
exports.isDateTimeAvailable = (tableNo, dateTime, excludeReservationId = null) => {
  return new Promise((resolve, reject) => {
    // Convert date to string for comparison
    const requestedDate = dateTime.toISOString().slice(0, 19).replace('T', ' ');
    
    // We'll consider a 2-hour window for each reservation
    // So a table is unavailable if there's an existing reservation within 2 hours before or after
    let query = `
      SELECT COUNT(*) AS count 
      FROM reservations 
      WHERE table_no = ? 
      AND ABS(TIMESTAMPDIFF(MINUTE, date_time, ?)) < 120
    `;
    
    const params = [tableNo, requestedDate];
    
    // If we're updating an existing reservation, exclude it from the check
    if (excludeReservationId) {
      query += ' AND reserve_id <> ?';
      params.push(excludeReservationId);
    }
    
    db.query(query, params, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      
      // If count is 0, the table is available
      resolve(results[0].count === 0);
    });
  });
};

/**
 * Get all tables with availability status for a specific date and time
 * @param {Date} dateTime - Date and time to check availability for
 * @returns {Promise<Array>} - Array of tables with availability status
 */
exports.getAvailableTables = (dateTime) => {
  return new Promise((resolve, reject) => {
    // Get all tables
    db.query('SELECT * FROM tables ORDER BY table_no', async (err, tables) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        // Check availability for each table
        const tablesWithAvailability = await Promise.all(tables.map(async (table) => {
          const isAvailable = await exports.isDateTimeAvailable(table.table_no, dateTime);
          return {
            ...table,
            available: isAvailable
          };
        }));
        
        resolve(tablesWithAvailability);
      } catch (error) {
        reject(error);
      }
    });
  });
};

/**
 * Get reservations for a specific date
 * @param {Date} date - Date to fetch reservations for
 * @returns {Promise<Array>} - Array of reservations for the specified date
 */
exports.getReservationsByDate = (date) => {
  return new Promise((resolve, reject) => {
    // Format date for SQL query (YYYY-MM-DD)
    const dateString = date.toISOString().split('T')[0];
    
    const query = `
      SELECT r.*, u.first_name, u.last_name, u.email, u.phone_number, t.capacity
      FROM reservations r
      LEFT JOIN users u ON r.user_id = u.user_id
      LEFT JOIN tables t ON r.table_no = t.table_no
      WHERE DATE(r.date_time) = ?
      ORDER BY r.date_time
    `;
    
    db.query(query, [dateString], (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(results);
    });
  });
};

/**
 * Check if a table exists
 * @param {number} tableNo - Table number to check
 * @returns {Promise<boolean>} - True if the table exists, false otherwise
 */
exports.tableExists = (tableNo) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT 1 FROM tables WHERE table_no = ?', [tableNo], (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(results.length > 0);
    });
  });
};
