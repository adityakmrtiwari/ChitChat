const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Register route
router.post('/register', validateRegistration, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ 
      msg: 'Validation failed', 
      errors: errors.array() 
    });
  }

  const { username, email, password } = req.body;
  console.log('Registration attempt:', { username, email, password: password ? '***' : 'missing' });
  
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    
    // Check if username is already taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ msg: 'Username is already taken' });
    }
    
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ 
      msg: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      msg: 'Server error', 
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
    });
  }
});

// Login route
router.post('/login', validateLogin, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      msg: 'Validation failed', 
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    const payload = { 
      userId: user._id, 
      username: user.username,
      email: user.email,
      role: user.role
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    });
    res.json({ token, user: payload });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      msg: 'Server error', 
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
    });
  }
});

// Debug endpoint to check current user (protected)
router.get('/me', require('../middleware/auth').auth, async (req, res) => {
  try {
    res.json({
      user: req.user,
      userId: req.user.userId,
      role: req.user.role,
      message: 'Authentication successful'
    });
  } catch (err) {
    console.error('Debug auth error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
