const passport = require('passport');

const auth = passport.authenticate('jwt', { session: false });

// Custom middleware to ensure user object is properly attached
const ensureAuth = (req, res, next) => {
  auth(req, res, (err) => {
    if (err) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }
    
    if (!req.user) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    
    // Ensure user object has the required properties
    if (!req.user._id || !req.user.role) {
      return res.status(401).json({ msg: 'Invalid user data in token' });
    }
    
    // Add userId for consistency
    req.user.userId = req.user._id;
    
    next();
  });
};

// Admin middleware
const adminAuth = (req, res, next) => {
  ensureAuth(req, res, (err) => {
    if (err) return next(err);
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    
    next();
  });
};

module.exports = { auth: ensureAuth, adminAuth };
