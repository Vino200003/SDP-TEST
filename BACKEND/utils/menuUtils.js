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

/**
 * Validate menu item data for creation or update
 * @param {Object} itemData - Menu item data to validate
 * @returns {Object} - Object with isValid flag and error message if any
 */
exports.validateMenuItemData = (itemData) => {
  const { menu_name, price, category_code } = itemData;
  
  // Check required fields
  if (!menu_name || menu_name.trim() === '') {
    return { isValid: false, message: 'Menu name is required' };
  }
  
  // Validate price
  if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
    return { isValid: false, message: 'Valid price is required (must be a positive number)' };
  }
  
  // Validate category code
  if (!category_code) {
    return { isValid: false, message: 'Category is required' };
  }
  
  return { isValid: true };
};

/**
 * Clean menu item data by ensuring correct types and removing invalid values
 * @param {Object} itemData - Menu item data to clean
 * @returns {Object} - Cleaned menu item data
 */
exports.cleanMenuItemData = (itemData) => {
  const cleanedData = { ...itemData };
  
  // Format price to ensure it's a valid decimal
  if (cleanedData.price) {
    cleanedData.price = parseFloat(cleanedData.price).toFixed(2);
  }
  
  // Convert empty strings for foreign keys to null
  if (cleanedData.category_code === '') cleanedData.category_code = null;
  if (cleanedData.subcategory_code === '') cleanedData.subcategory_code = null;
  
  // Ensure status is valid
  if (!cleanedData.status || !['available', 'out_of_stock'].includes(cleanedData.status)) {
    cleanedData.status = 'available';
  }
  
  return cleanedData;
};

/**
 * Get menu items by category with error handling
 * @param {number} categoryCode - Category code
 * @returns {Promise<Array>} - Array of menu items in the category
 */
exports.getMenuItemsByCategory = (categoryCode) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT m.*, c.category_name, s.subcategory_name 
      FROM menu m
      LEFT JOIN categories c ON m.category_code = c.category_code
      LEFT JOIN subcategories s ON m.subcategory_code = s.subcategory_code
      WHERE m.category_code = ?
      ORDER BY m.menu_name
    `;
    
    db.query(query, [categoryCode], (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(results);
    });
  });
};
