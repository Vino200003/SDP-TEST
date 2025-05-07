const express = require('express');
const router = express.Router();

// Health check endpoint - no authentication required
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
