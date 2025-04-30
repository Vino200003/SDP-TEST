const db = require('../config/db');

// Validate menu item input
exports.validateMenuItem = (req, res, next) => {
  const { menu_name, price, category_code } = req.body;
  
  // Check required fields
  if (!menu_name || !price || !category_code) {
    return res.status(400).json({ 
      message: 'Menu name, price, and category code are required fields' 
    });
  }
  
  // Validate price format (positive number with up to 2 decimal places)
  const priceRegex = /^\d+(\.\d{1,2})?$/;
  if (!priceRegex.test(price) || parseFloat(price) <= 0) {
    return res.status(400).json({ 
      message: 'Price must be a positive number with up to 2 decimal places' 
    });
  }
  
  // Check if category exists
  db.query('SELECT * FROM categories WHERE category_code = ?', [category_code], (err, results) => {
    if (err) {
      console.error('Error validating category:', err);
      return res.status(500).json({ 
        message: 'Server error', 
        error: err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid category code' });
    }
    
    // If subcategory_code is provided, check if it exists and belongs to the category
    const { subcategory_code } = req.body;
    if (subcategory_code) {
      db.query(
        'SELECT * FROM subcategories WHERE subcategory_code = ? AND category_code = ?', 
        [subcategory_code, category_code], 
        (err, results) => {
          if (err) {
            console.error('Error validating subcategory:', err);
            return res.status(500).json({ 
              message: 'Server error', 
              error: err.message 
            });
          }
          
          if (results.length === 0) {
            return res.status(400).json({ 
              message: 'Invalid subcategory code or subcategory does not belong to the specified category' 
            });
          }
          
          // All validations passed
          next();
        }
      );
    } else {
      // No subcategory provided, all validations passed
      next();
    }
  });
};

// Validate category input
exports.validateCategory = (req, res, next) => {
  const { category_name } = req.body;
  
  if (!category_name || category_name.trim() === '') {
    return res.status(400).json({ message: 'Category name is required' });
  }
  
  // Check if category already exists
  db.query('SELECT * FROM categories WHERE category_name = ?', [category_name], (err, results) => {
    if (err) {
      console.error('Error checking category existence:', err);
      return res.status(500).json({ 
        message: 'Server error', 
        error: err.message 
      });
    }
    
    if (results.length > 0) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    next();
  });
};

// Validate subcategory input
exports.validateSubcategory = (req, res, next) => {
  const { subcategory_name, category_code } = req.body;
  
  if (!subcategory_name || subcategory_name.trim() === '') {
    return res.status(400).json({ message: 'Subcategory name is required' });
  }
  
  if (!category_code) {
    return res.status(400).json({ message: 'Category code is required' });
  }
  
  // Check if category exists
  db.query('SELECT * FROM categories WHERE category_code = ?', [category_code], (err, results) => {
    if (err) {
      console.error('Error checking category existence:', err);
      return res.status(500).json({ 
        message: 'Server error', 
        error: err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(400).json({ message: 'Category does not exist' });
    }
    
    // Check if subcategory already exists in this category
    db.query(
      'SELECT * FROM subcategories WHERE subcategory_name = ? AND category_code = ?', 
      [subcategory_name, category_code], 
      (err, results) => {
        if (err) {
          console.error('Error checking subcategory existence:', err);
          return res.status(500).json({ 
            message: 'Server error', 
            error: err.message 
          });
        }
        
        if (results.length > 0) {
          return res.status(400).json({ 
            message: 'Subcategory already exists in this category' 
          });
        }
        
        next();
      }
    );
  });
};
