const express = require('express');
const router = express.Router();
const adminSettingsController = require('../controllers/adminSettingsController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware.verifyAdminToken);

// Get admin profile
router.get('/profile', adminSettingsController.getAdminProfile);

// Update admin profile
router.put('/profile', adminSettingsController.updateAdminProfile);

// Change admin password
router.post('/change-password', adminSettingsController.changeAdminPassword);

// Create a new admin
router.post('/create', adminSettingsController.createAdmin);

// Get all admins
router.get('/all-admins', adminSettingsController.getAllAdmins);

// Delete an admin
router.delete('/delete/:id', adminSettingsController.deleteAdmin);

// Check if current admin is super admin
router.get('/super-admin-check', adminSettingsController.checkSuperAdminStatus);

module.exports = router;
