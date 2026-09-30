// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Grab the token from the request header coming from React
  const authHeader = req.header('Authorization');

  // 2. Check if the token is completely missing
  if (!authHeader) {
    return res.status(401).json({ msg: 'No token found, authorization denied' });
  }

  try {
    // 3. Format the token string (extracts it if it comes with the "Bearer " prefix)
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    // 4. Verify that the token matches our secret key in the .env file
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Attach the verified admin data to the request object
    req.admin = decoded.admin;
    
    // 6. Let the request proceed to the route logic
    next();
  } catch (err) {
    // If the token is fake or expired, block access
    res.status(401).json({ msg: 'Token is invalid or expired' });
  }
};
