const express = require('express');
const router = express.Router();
const deliveryZoneController = require('../controllers/deliveryZoneController');

// Get all delivery zones
router.get('/', deliveryZoneController.getAllDeliveryZones);

// Get delivery zone by ID
router.get('/:id', deliveryZoneController.getDeliveryZoneById);

// Get delivery fee by zone ID
router.get('/fee/:id', deliveryZoneController.getDeliveryFeeByZoneId);

module.exports = router;
