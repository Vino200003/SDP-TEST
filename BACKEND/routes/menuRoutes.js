const express = require('express');
const router = express.Router();
const db = require('../config/db');
const menuController = require('../controllers/menuController');

// Add route logging for debugging
router.use((req, res, next) => {
  console.log(`Menu route accessed: ${req.method} ${req.url}`);
  next();
});

// Category Routes - must be before /:id route to avoid being interpreted as an ID parameter
router.get('/categories', menuController.getAllCategories);
router.post('/categories', menuController.createCategory);
router.put('/categories/:id', (req, res) => {
  const categoryId = req.params.id;
  const { category_name } = req.body;
  
  if (!category_name) {
    return res.status(400).json({ message: 'Category name is required' });
  }
  
  db.query('UPDATE categories SET ? WHERE category_code = ?', 
    [{ category_name }, categoryId], 
    (err, result) => {
      if (err) {
        console.error('Error updating category:', err);
        return res.status(500).json({ 
          message: 'Error updating category', 
          error: err.message 
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.json({
        message: 'Category updated successfully',
        affectedRows: result.affectedRows
      });
    }
  );
});
router.delete('/categories/:id', (req, res) => {
  const categoryId = req.params.id;
  
  // First check if the category has menu items
  db.query('SELECT COUNT(*) AS count FROM menu WHERE category_code = ?', 
    [categoryId], 
    (err, results) => {
      if (err) {
        console.error('Error checking menu items:', err);
        return res.status(500).json({ 
          message: 'Error checking menu items', 
          error: err.message 
        });
      }
      
      if (results[0].count > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete category with assigned menu items' 
        });
      }
      
      // Check if the category has subcategories
      db.query('SELECT COUNT(*) AS count FROM subcategories WHERE category_code = ?', 
        [categoryId], 
        (err, results) => {
          if (err) {
            console.error('Error checking subcategories:', err);
            return res.status(500).json({ 
              message: 'Error checking subcategories', 
              error: err.message 
            });
          }
          
          if (results[0].count > 0) {
            return res.status(400).json({ 
              message: 'Cannot delete category with assigned subcategories' 
            });
          }
          
          // No menu items or subcategories, proceed with deletion
          db.query('DELETE FROM categories WHERE category_code = ?', 
            [categoryId], 
            (err, result) => {
              if (err) {
                console.error('Error deleting category:', err);
                return res.status(500).json({ 
                  message: 'Error deleting category', 
                  error: err.message 
                });
              }
              
              if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Category not found' });
              }
              
              res.json({
                message: 'Category deleted successfully',
                affectedRows: result.affectedRows
              });
            }
          );
        }
      );
    }
  );
});

// Subcategory Routes - must be before /:id route
router.get('/subcategories', (req, res) => {
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
});
router.get('/subcategories/:categoryCode', menuController.getSubcategoriesByCategory);
router.post('/subcategories', menuController.createSubcategory);
router.put('/subcategories/:id', (req, res) => {
  const subcategoryId = req.params.id;
  const { subcategory_name, category_code } = req.body;
  
  if (!subcategory_name || !category_code) {
    return res.status(400).json({ 
      message: 'Subcategory name and category code are required' 
    });
  }
  
  // Check if the category exists
  db.query('SELECT * FROM categories WHERE category_code = ?', 
    [category_code], 
    (err, results) => {
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
      
      // Category exists, proceed with updating the subcategory
      db.query(
        'UPDATE subcategories SET ? WHERE subcategory_code = ?', 
        [{ subcategory_name, category_code }, subcategoryId], 
        (err, result) => {
          if (err) {
            console.error('Error updating subcategory:', err);
            return res.status(500).json({ 
              message: 'Error updating subcategory', 
              error: err.message 
            });
          }
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Subcategory not found' });
          }
          
          res.json({
            message: 'Subcategory updated successfully',
            affectedRows: result.affectedRows
          });
        }
      );
    }
  );
});
router.delete('/subcategories/:id', (req, res) => {
  const subcategoryId = req.params.id;
  
  // First check if the subcategory has menu items
  db.query('SELECT COUNT(*) AS count FROM menu WHERE subcategory_code = ?', 
    [subcategoryId], 
    (err, results) => {
      if (err) {
        console.error('Error checking menu items:', err);
        return res.status(500).json({ 
          message: 'Error checking menu items', 
          error: err.message 
        });
      }
      
      if (results[0].count > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete subcategory with assigned menu items' 
        });
      }
      
      // No menu items, proceed with deletion
      db.query('DELETE FROM subcategories WHERE subcategory_code = ?', 
        [subcategoryId], 
        (err, result) => {
          if (err) {
            console.error('Error deleting subcategory:', err);
            return res.status(500).json({ 
              message: 'Error deleting subcategory', 
              error: err.message 
            });
          }
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Subcategory not found' });
          }
          
          res.json({
            message: 'Subcategory deleted successfully',
            affectedRows: result.affectedRows
          });
        }
      );
    }
  );
});

// Get menu items by category route - add this before the generic routes
router.get('/category/:categoryCode', menuController.getMenuItemsByCategory);

// Menu Items Routes - put specific routes with parameters after specific paths but before generic /:id
router.patch('/:id/status', menuController.updateMenuItemStatus);

// Generic Menu Items Routes with ID parameter - these should come last
router.get('/', menuController.getAllMenuItems);
router.get('/:id', menuController.getMenuItemById);
router.post('/', menuController.createMenuItem);
router.put('/:id', menuController.updateMenuItem);
router.delete('/:id', menuController.deleteMenuItem);

console.log('Menu routes initialized');

module.exports = router;
