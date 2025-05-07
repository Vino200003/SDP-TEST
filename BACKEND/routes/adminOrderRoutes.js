const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/adminOrderController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// Add route logging for debugging
router.use((req, res, next) => {
  console.log(`Admin order route accessed: ${req.method} ${req.url}`);
  next();
});

// Protect all routes with admin authentication
router.use(adminAuthMiddleware.protectAdmin);

// Order routes
router.get('/', adminOrderController.getAllOrders);
router.get('/stats', adminOrderController.getOrderStats);
router.get('/:id', adminOrderController.getOrderById);
router.patch('/:id/status', adminOrderController.updateOrderStatus);
router.put('/:id', adminOrderController.updateOrder);
router.patch('/:id', adminOrderController.updateOrder);

module.exports = router;
