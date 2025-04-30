const db = require('../config/db');

// Get all menu items
exports.getAllMenuItems = (req, res) => {
  const query = `
    SELECT m.*, c.category_name, s.subcategory_name 
    FROM menu m
    LEFT JOIN categories c ON m.category_code = c.category_code
    LEFT JOIN subcategories s ON m.subcategory_code = s.subcategory_code
    ORDER BY c.category_name, s.subcategory_name, m.menu_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching menu items:', err);
      return res.status(500).json({ 
        message: 'Error fetching menu items', 
        error: err.message 
      });
    }
    
    res.json(results);
  });
};

// Get menu item by ID
exports.getMenuItemById = (req, res) => {
  const menuId = req.params.id;
  
  const query = `
    SELECT m.*, c.category_name, s.subcategory_name 
    FROM menu m
    LEFT JOIN categories c ON m.category_code = c.category_code
    LEFT JOIN subcategories s ON m.subcategory_code = s.subcategory_code
    WHERE m.menu_id = ?
  `;
  
  db.query(query, [menuId], (err, results) => {
    if (err) {
      console.error('Error fetching menu item:', err);
      return res.status(500).json({ 
        message: 'Error fetching menu item', 
        error: err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json(results[0]);
  });
};

// Get all categories
exports.getAllCategories = (req, res) => {
  db.query('SELECT * FROM categories ORDER BY category_name', (err, results) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ 
        message: 'Error fetching categories', 
        error: err.message 
      });
    }
    
    res.json(results);
  });
};

// Get all subcategories
exports.getAllSubcategories = (req, res) => {
  const query = `
    SELECT s.*, c.category_name
    FROM subcategories s
    JOIN categories c ON s.category_code = c.category_code
    ORDER BY c.category_name, s.subcategory_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching subcategories:', err);
      return res.status(500).json({ 
        message: 'Error fetching subcategories', 
        error: err.message 
      });
    }
    
    res.json(results);
  });
};

// Get subcategories by category
exports.getSubcategoriesByCategory = (req, res) => {
  const categoryCode = req.params.categoryCode;
  
  db.query(
    'SELECT * FROM subcategories WHERE category_code = ? ORDER BY subcategory_name',
    [categoryCode],
    (err, results) => {
      if (err) {
        console.error('Error fetching subcategories:', err);
        return res.status(500).json({ 
          message: 'Error fetching subcategories', 
          error: err.message 
        });
      }
      
      res.json(results);
    }
  );
};

// Get menu items by category
exports.getMenuItemsByCategory = (req, res) => {
  const categoryCode = req.params.categoryCode;
  
  const query = `
    SELECT m.*, c.category_name, s.subcategory_name 
    FROM menu m
    LEFT JOIN categories c ON m.category_code = c.category_code
    LEFT JOIN subcategories s ON m.subcategory_code = s.subcategory_code
    WHERE m.category_code = ?
    ORDER BY s.subcategory_name, m.menu_name
  `;
  
  db.query(query, [categoryCode], (err, results) => {
    if (err) {
      console.error('Error fetching menu items by category:', err);
      return res.status(500).json({ 
        message: 'Error fetching menu items', 
        error: err.message 
      });
    }
    
    res.json(results);
  });
};

// Get menu items by subcategory
exports.getMenuItemsBySubcategory = (req, res) => {
  const subcategoryCode = req.params.subcategoryCode;
  
  const query = `
    SELECT m.*, c.category_name, s.subcategory_name 
    FROM menu m
    LEFT JOIN categories c ON m.category_code = c.category_code
    LEFT JOIN subcategories s ON m.subcategory_code = s.subcategory_code
    WHERE m.subcategory_code = ?
    ORDER BY m.menu_name
  `;
  
  db.query(query, [subcategoryCode], (err, results) => {
    if (err) {
      console.error('Error fetching menu items by subcategory:', err);
      return res.status(500).json({ 
        message: 'Error fetching menu items', 
        error: err.message 
      });
    }
    
    res.json(results);
  });
};

// Search menu items
exports.searchMenuItems = (req, res) => {
  const searchTerm = req.query.term;
  
  if (!searchTerm) {
    return res.status(400).json({ message: 'Search term is required' });
  }
  
  const query = `
    SELECT m.*, c.category_name, s.subcategory_name 
    FROM menu m
    LEFT JOIN categories c ON m.category_code = c.category_code
    LEFT JOIN subcategories s ON m.subcategory_code = s.subcategory_code
    WHERE m.menu_name LIKE ? 
    OR c.category_name LIKE ? 
    OR s.subcategory_name LIKE ?
    ORDER BY c.category_name, s.subcategory_name, m.menu_name
  `;
  
  const searchPattern = `%${searchTerm}%`;
  
  db.query(query, [searchPattern, searchPattern, searchPattern], (err, results) => {
    if (err) {
      console.error('Error searching menu items:', err);
      return res.status(500).json({ 
        message: 'Error searching menu items', 
        error: err.message 
      });
    }
    
    res.json(results);
  });
};

// Create a new menu item (admin only)
exports.createMenuItem = (req, res) => {
  const { menu_name, price, status, category_code, subcategory_code, image_url } = req.body;
  
  const newMenuItem = {
    menu_name,
    price,
    status: status || 'available',
    category_code,
    subcategory_code,
    image_url
  };
  
  db.query('INSERT INTO menu SET ?', newMenuItem, (err, result) => {
    if (err) {
      console.error('Error creating menu item:', err);
      return res.status(500).json({ 
        message: 'Error creating menu item', 
        error: err.message 
      });
    }
    
    res.status(201).json({
      message: 'Menu item created successfully',
      menu_id: result.insertId
    });
  });
};

// Update a menu item (admin only)
exports.updateMenuItem = (req, res) => {
  const menuId = req.params.id;
  const { menu_name, price, status, category_code, subcategory_code, image_url } = req.body;
  
  const updatedMenuItem = {
    menu_name,
    price,
    status,
    category_code,
    subcategory_code,
    image_url
  };
  
  db.query('UPDATE menu SET ? WHERE menu_id = ?', [updatedMenuItem, menuId], (err, result) => {
    if (err) {
      console.error('Error updating menu item:', err);
      return res.status(500).json({ 
        message: 'Error updating menu item', 
        error: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json({
      message: 'Menu item updated successfully',
      affectedRows: result.affectedRows
    });
  });
};

// Update menu item status (available/out_of_stock) (admin only)
exports.updateMenuItemStatus = (req, res) => {
  const menuId = req.params.id;
  const { status } = req.body;
  
  if (!status || !['available', 'out_of_stock'].includes(status)) {
    return res.status(400).json({ 
      message: 'Invalid status. Status must be either "available" or "out_of_stock"' 
    });
  }
  
  db.query('UPDATE menu SET status = ? WHERE menu_id = ?', [status, menuId], (err, result) => {
    if (err) {
      console.error('Error updating menu item status:', err);
      return res.status(500).json({ 
        message: 'Error updating menu item status', 
        error: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json({
      message: 'Menu item status updated successfully',
      affectedRows: result.affectedRows
    });
  });
};

// Delete a menu item (admin only)
exports.deleteMenuItem = (req, res) => {
  const menuId = req.params.id;
  
  db.query('DELETE FROM menu WHERE menu_id = ?', [menuId], (err, result) => {
    if (err) {
      console.error('Error deleting menu item:', err);
      return res.status(500).json({ 
        message: 'Error deleting menu item', 
        error: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json({
      message: 'Menu item deleted successfully',
      affectedRows: result.affectedRows
    });
  });
};

// Create a new category (admin only)
exports.createCategory = (req, res) => {
  const { category_name } = req.body;
  
  if (!category_name) {
    return res.status(400).json({ message: 'Category name is required' });
  }
  
  db.query('INSERT INTO categories SET ?', { category_name }, (err, result) => {
    if (err) {
      console.error('Error creating category:', err);
      return res.status(500).json({ 
        message: 'Error creating category', 
        error: err.message 
      });
    }
    
    res.status(201).json({
      message: 'Category created successfully',
      category_code: result.insertId
    });
  });
};

// Create a new subcategory (admin only)
exports.createSubcategory = (req, res) => {
  const { subcategory_name, category_code } = req.body;
  
  if (!subcategory_name || !category_code) {
    return res.status(400).json({ 
      message: 'Subcategory name and category code are required' 
    });
  }
  
  // Check if the category exists
  db.query('SELECT * FROM categories WHERE category_code = ?', [category_code], (err, results) => {
    if (err) {
      console.error('Error checking category existence:', err);
      return res.status(500).json({ 
        message: 'Server error', 
        error: err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Category exists, proceed with creating the subcategory
    db.query(
      'INSERT INTO subcategories SET ?', 
      { subcategory_name, category_code }, 
      (err, result) => {
        if (err) {
          console.error('Error creating subcategory:', err);
          return res.status(500).json({ 
            message: 'Error creating subcategory', 
            error: err.message 
          });
        }
        
        res.status(201).json({
          message: 'Subcategory created successfully',
          subcategory_code: result.insertId
        });
      }
    );
  });
};
