const jwt = require('jsonwebtoken');

// Instead of using the config module, we'll define a secret key directly
// Usually this would be in an environment variable or config file
const JWT_SECRET = process.env.JWT_SECRET || 'restaurant-sdp-secret-key';

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token (remove "Bearer " if present)
    const jwtToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    // Decode the token
    const decoded = jwt.verify(jwtToken, JWT_SECRET);
    
    // Set the user in the request
    req.user = decoded.user || decoded.admin || decoded;
    
    // Check if admin
    if (decoded.admin) {
      req.isAdmin = true;
    }
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
