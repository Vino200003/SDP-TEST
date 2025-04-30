const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const auth = require('../middleware/auth');

// Public routes - no authentication required
router.get('/tables', reservationController.getAllTables);
router.get('/available-tables', reservationController.getAvailableTablesForDateTime);

// Create reservation - optional authentication
router.post('/', reservationController.createReservation);

// Protected routes - require authentication
router.get('/', auth, reservationController.getAllReservations);

// Make sure this route comes before any routes with parameters (like '/:id')
// to avoid parameter conflicts
router.get('/user', auth, reservationController.getUserReservations);

router.get('/:id', auth, reservationController.getReservationById);
router.put('/:id', auth, reservationController.updateReservation);
router.delete('/:id', auth, reservationController.deleteReservation);

module.exports = router;
