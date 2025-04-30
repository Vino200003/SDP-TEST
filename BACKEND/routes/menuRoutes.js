const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Add route logging for debugging
router.use((req, res, next) => {
  console.log(`Menu route accessed: ${req.method} ${req.url}`);
  next();
});

// Get all menu items with their categories and subcategories
router.get('/', (req, res) => {
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
      return res.status(500).json({ message: 'Error fetching menu items', error: err.message });
    }
    
    res.json(results);
  });
});

// Get all categories
router.get('/categories', (req, res) => {
  db.query('SELECT * FROM categories ORDER BY category_name', (err, results) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ message: 'Error fetching categories', error: err.message });
    }
    
    res.json(results);
  });
});

// Get all subcategories for a specific category
router.get('/subcategories/:categoryCode', (req, res) => {
  db.query(
    'SELECT * FROM subcategories WHERE category_code = ? ORDER BY subcategory_name',
    [req.params.categoryCode],
    (err, results) => {
      if (err) {
        console.error('Error fetching subcategories:', err);
        return res.status(500).json({ message: 'Error fetching subcategories', error: err.message });
      }
      
      res.json(results);
    }
  );
});

// Get menu items by category
router.get('/category/:categoryCode', (req, res) => {
  const query = `
    SELECT m.*, c.category_name, s.subcategory_name 
    FROM menu m
    LEFT JOIN categories c ON m.category_code = c.category_code
    LEFT JOIN subcategories s ON m.subcategory_code = s.subcategory_code
    WHERE m.category_code = ?
    ORDER BY s.subcategory_name, m.menu_name
  `;
  
  db.query(query, [req.params.categoryCode], (err, results) => {
    if (err) {
      console.error('Error fetching menu items by category:', err);
      return res.status(500).json({ message: 'Error fetching menu items', error: err.message });
    }
    
    res.json(results);
  });
});

console.log('Menu routes initialized');

module.exports = router;
