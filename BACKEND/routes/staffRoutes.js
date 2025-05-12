const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// Add route logging for debugging
router.use((req, res, next) => {
  console.log(`Staff route accessed: ${req.method} ${req.url}`);
  next();
});

// Public routes
router.get('/test', (req, res) => {
  res.json({ message: 'Staff API is working' });
});

// Staff login route - needs to be public for the login page to work
router.post('/login', staffController.loginStaff);

// For development purposes, we'll make these routes public temporarily
// Later you should restore the adminAuthMiddleware.protectAdmin middleware
router.get('/', staffController.getAllStaff);
router.get('/delivery', staffController.getDeliveryStaff);
router.get('/:id', staffController.getStaffById);
router.post('/', staffController.createStaff);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
