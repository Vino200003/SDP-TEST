const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Add route logging for debugging
router.use((req, res, next) => {
  console.log(`Order route accessed: ${req.method} ${req.url}`);
  next();
});

// Order statistics
router.get('/stats', orderController.getOrderStats);

// Get all orders with filtering
router.get('/', orderController.getAllOrders);

// Get order by ID
router.get('/:id', orderController.getOrderById);

// Create new order
router.post('/', orderController.createOrder);

// Update order status - support both PATCH and PUT methods
router.patch('/:id/status', orderController.updateOrderStatus);
router.put('/:id/status', orderController.updateOrderStatus); // Add PUT method support

// Update order
router.put('/:id', orderController.updateOrder);
router.patch('/:id', orderController.updateOrder);

// Delete order
router.delete('/:id', orderController.deleteOrder);

console.log('Order routes initialized');

module.exports = router;
