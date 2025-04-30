const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Add route logging for debugging
router.use((req, res, next) => {
  console.log(`User route accessed: ${req.method} ${req.url}`);
  next();
});

// User registration route
router.post('/register', userController.registerUser);

// User login route
router.post('/login', userController.loginUser);

// Get current user's profile (authenticated)
router.get('/profile', authMiddleware.protect, userController.getCurrentUserProfile);

// Get user profile by ID (mainly for admin use)
router.get('/profile/:id', authMiddleware.protect, userController.getUserProfile);

// Update user profile (authenticated)
router.put('/profile', authMiddleware.protect, userController.updateUserProfile);

// Add a test route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ message: 'User routes are working' });
});

console.log('User routes initialized');

module.exports = router;
