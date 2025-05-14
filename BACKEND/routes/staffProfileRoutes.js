const express = require('express');
const router = express.Router();
const staffProfileController = require('../controllers/staffProfileController');

// Add route logging for debugging
router.use((req, res, next) => {
  console.log(`Staff Profile route accessed: ${req.method} ${req.url}`);
  next();
});

// Get staff profile by ID
router.get('/:id', staffProfileController.getStaffProfile);

// Update staff profile
router.put('/:id', staffProfileController.updateStaffProfile);

// Update staff password
router.put('/:id/password', staffProfileController.updateStaffPassword);

module.exports = router;
