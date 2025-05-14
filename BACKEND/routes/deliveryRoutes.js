const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const deliveryZoneController = require('../controllers/deliveryZoneController');
// Add auth middleware if needed
// const { protect, admin } = require('../middleware/authMiddleware');

// Delivery zone routes - using existing controller
router.get('/zones', deliveryZoneController.getAllDeliveryZones);
router.get('/zones/:id', deliveryZoneController.getDeliveryZoneById);
router.get('/zones/:id/fee', deliveryZoneController.getDeliveryFeeByZoneId);

// Delivery order routes - using new controller
router.get('/orders', deliveryController.getDeliveryOrders);
router.get('/staff/:staffId/deliveries', deliveryController.getStaffDeliveries);
router.put('/orders/:orderId/assign/:deliveryPersonId', deliveryController.assignDeliveryPerson);
router.put('/orders/:orderId/status', deliveryController.updateDeliveryStatus);

module.exports = router;
