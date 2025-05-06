/**
 * Utility functions for menu operations
 */

const db = require('../config/db');

/**
 * Check if a menu item exists by ID
 * @param {number} menuId - Menu item ID to check
 * @returns {Promise<boolean>} - True if the menu item exists, false otherwise
 */
exports.menuItemExists = (menuId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT 1 FROM menu WHERE menu_id = ?', [menuId], (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(results.length > 0);
    });
  });
};

/**
 * Check if a category exists by ID
 * @param {number} categoryCode - Category code to check
 * @returns {Promise<boolean>} - True if the category exists, false otherwise
 */
exports.categoryExists = (categoryCode) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT 1 FROM categories WHERE category_code = ?', [categoryCode], (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(results.length > 0);
    });
  });
};

/**
 * Check if a subcategory exists by ID and belongs to a category
 * @param {number} subcategoryCode - Subcategory code to check
 * @param {number} categoryCode - Category code the subcategory should belong to
 * @returns {Promise<boolean>} - True if the subcategory exists and belongs to the category, false otherwise
 */
exports.subcategoryExistsInCategory = (subcategoryCode, categoryCode) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT 1 FROM subcategories WHERE subcategory_code = ? AND category_code = ?', 
      [subcategoryCode, categoryCode], 
      (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        
        resolve(results.length > 0);
      }
    );
  });
};

/**
 * Get menu items count by category
 * @param {number} categoryCode - Category code
 * @returns {Promise<number>} - Number of menu items in the category
 */
exports.getMenuItemsCountByCategory = (categoryCode) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT COUNT(*) AS count FROM menu WHERE category_code = ?', 
      [categoryCode], 
      (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        
        resolve(results[0].count);
      }
    );
  });
};

/**
 * Get menu items by status
 * @param {string} status - Status to filter by ('available' or 'out_of_stock')
 * @returns {Promise<Array>} - Array of menu items with the specified status
 */
exports.getMenuItemsByStatus = (status) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT m.*, c.category_name, s.subcategory_name 
      FROM menu m
      LEFT JOIN categories c ON m.category_code = c.category_code
      LEFT JOIN subcategories s ON m.subcategory_code = s.subcategory_code
      WHERE m.status = ?
      ORDER BY c.category_name, m.menu_name
    `;
    
    db.query(query, [status], (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(results);
    });
  });
};

/**
 * Update menu item status
 * @param {number} menuId - Menu item ID
 * @param {string} status - New status ('available' or 'out_of_stock')
 * @returns {Promise<Object>} - Result of the update operation
 */
exports.updateMenuItemStatus = (menuId, status) => {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE menu SET status = ? WHERE menu_id = ?',
      [status, menuId],
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        
        resolve(result);
      }
    );
  });
};

/**
 * Format price to 2 decimal places
 * @param {number|string} price - Price to format
 * @returns {string} - Formatted price with 2 decimal places
 */
exports.formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};
