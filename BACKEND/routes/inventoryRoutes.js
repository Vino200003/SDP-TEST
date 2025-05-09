const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Public routes (if any)

// Protected routes - require authentication
// Use middleware to protect routes if needed
// router.use(verifyToken);

// Get all inventory items with optional filters
router.get('/', inventoryController.getAllInventoryItems);

// Get inventory statistics
router.get('/stats', inventoryController.getInventoryStats);

// Get inventory categories
router.get('/categories', inventoryController.getInventoryCategories);

// Get inventory item by ID
router.get('/:id', inventoryController.getInventoryItemById);

// Create new inventory item
router.post('/', inventoryController.createInventoryItem);

// Update inventory item
router.put('/:id', inventoryController.updateInventoryItem);

// Update only the quantity of an inventory item (partial update)
router.patch('/:id/quantity', inventoryController.updateInventoryQuantity);

// Delete inventory item
router.delete('/:id', inventoryController.deleteInventoryItem);

module.exports = router;