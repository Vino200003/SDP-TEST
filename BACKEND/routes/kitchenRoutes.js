const express = require('express');
const router = express.Router();
const kitchenController = require('../controllers/kitchenController');

// Get all kitchen orders
router.get('/orders', kitchenController.getKitchenOrders);

// Update kitchen status of an order
router.put('/orders/:id/status', kitchenController.updateKitchenStatus);

module.exports = router;
