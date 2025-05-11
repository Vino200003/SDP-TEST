const db = require('../config/db');

/**
 * Get all active delivery zones
 */
exports.getAllDeliveryZones = (req, res) => {
  try {
    const query = `
      SELECT zone_id, gs_division, delivery_fee, estimated_delivery_time_min
      FROM delivery_zones
      WHERE is_active = TRUE
      ORDER BY gs_division ASC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching delivery zones:', err);
        return res.status(500).json({ 
          message: 'Error fetching delivery zones', 
          error: err.message 
        });
      }
      
      res.json(results);
    });
  } catch (error) {
    console.error('Server error in getAllDeliveryZones:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get delivery zone by ID
 */
exports.getDeliveryZoneById = (req, res) => {
  try {
    const zoneId = req.params.id;
    
    const query = `
      SELECT zone_id, gs_division, delivery_fee, estimated_delivery_time_min
      FROM delivery_zones
      WHERE zone_id = ? AND is_active = TRUE
    `;
    
    db.query(query, [zoneId], (err, results) => {
      if (err) {
        console.error('Error fetching delivery zone:', err);
        return res.status(500).json({ 
          message: 'Error fetching delivery zone', 
          error: err.message 
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Delivery zone not found' });
      }
      
      res.json(results[0]);
    });
  } catch (error) {
    console.error('Server error in getDeliveryZoneById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
