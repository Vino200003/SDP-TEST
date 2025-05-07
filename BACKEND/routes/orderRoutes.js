const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Add route logging for debugging
router.use((req, res, next) => {
  console.log(`Order route accessed: ${req.method} ${req.url}`);
  next();
});

// Get all orders (with pagination and filtering)
router.get('/', orderController.getAllOrders);

// Get order by ID
router.get('/:id', orderController.getOrderById);

// Create a new order
router.post('/', orderController.createOrder);

// Update order
router.put('/:id', orderController.updateOrder);
router.patch('/:id', orderController.updateOrder);

// Update order status
router.patch('/:id/status', orderController.updateOrderStatus);
router.put('/:id/status', orderController.updateOrderStatus); // Add PUT method support

// Cancel order (new endpoint)
router.post('/:id/cancel', orderController.cancelOrder);

// Delete order
router.delete('/:id', orderController.deleteOrder);

// Get order statistics
router.get('/stats/overview', orderController.getOrderStats);

console.log('Order routes initialized');

module.exports = router;
