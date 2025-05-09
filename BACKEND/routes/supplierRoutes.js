const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// Add route logging for debugging
router.use((req, res, next) => {
  console.log(`Supplier route accessed: ${req.method} ${req.url}`);
  next();
});

// Apply admin authentication middleware to all supplier routes
router.use(adminAuthMiddleware.protectAdmin);

// CRUD operations on suppliers
router.get('/', supplierController.getAllSuppliers);
router.get('/:id', supplierController.getSupplierById);
router.post('/', supplierController.createSupplier);
router.put('/:id', supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;