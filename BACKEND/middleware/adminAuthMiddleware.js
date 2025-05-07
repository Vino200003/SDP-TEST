const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// Middleware to protect admin routes
exports.protectAdmin = (req, res, next) => {
  // Get token from header
  let token;
  
  // Check for token in Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Check for token in x-auth-token header
  else if (req.header('x-auth-token')) {
    token = req.header('x-auth-token');
  }
  
  console.log('Admin auth middleware: Token found =', !!token);

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided' });
  }

  try {
    // Check if JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    
    // Check if admin exists
    db.query(
      'SELECT * FROM admin WHERE admin_id = ?', 
      [decoded.id], 
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error', error: err.message });
        }

        if (results.length === 0) {
          return res.status(403).json({ message: 'Access denied. Admin not found' });
        }

        // Add admin details to request object
        req.admin = {
          id: decoded.id,
          email: decoded.email,
          first_name: results[0].first_name,
          last_name: results[0].last_name
        };
        
        console.log('Admin authenticated:', req.admin.email);
        
        next();
      }
    );
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};
