const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// Add route logging for debugging
router.use((req, res, next) => {
  console.log(`Inventory route accessed: ${req.method} ${req.url}`);
  next();
});

// Apply admin authentication middleware to all inventory routes
router.use(adminAuthMiddleware.protectAdmin);

// Inventory statistics
router.get('/stats', inventoryController.getInventoryStats);

// Categories endpoint
router.get('/categories', inventoryController.getInventoryCategories);

// CRUD operations on inventory items
router.get('/', inventoryController.getAllInventoryItems);
router.get('/:id', inventoryController.getInventoryItemById);
router.post('/', inventoryController.createInventoryItem);
router.put('/:id', inventoryController.updateInventoryItem);
router.delete('/:id', inventoryController.deleteInventoryItem);

// Special route for quick quantity updates
router.patch('/:id/quantity', inventoryController.updateInventoryQuantity);

module.exports = router;