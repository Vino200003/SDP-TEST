const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// Add route logging for debugging
router.use((req, res, next) => {
  console.log(`Admin route accessed: ${req.method} ${req.url}`);
  next();
});

// Admin auth routes
router.post('/login', adminController.loginAdmin);

// Protected admin routes
router.get('/profile', adminAuthMiddleware.protectAdmin, adminController.getAdminProfile);

// Create admin route (should be secured in production)
router.post('/create', adminController.createAdmin);

// Test route to verify if admin routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Admin API is working' });
});

module.exports = router;
