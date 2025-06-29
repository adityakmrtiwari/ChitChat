const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

// Get all users (admin only) - must come before parameterized routes
router.get('/', adminAuth, async (req, res) => {
  try {
    console.log('Admin accessing users list:', { userId: req.user.userId, role: req.user.role });
    
    const users = await User.find().select('username email role createdAt lastLogin');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username email role createdAt lastLogin');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Delete user (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    console.log('Admin deleting user:', { 
      adminId: req.user.userId, 
      adminRole: req.user.role, 
      targetUserId: req.params.id 
    });

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({ msg: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Update user role (admin only)
router.patch('/:id/role', adminAuth, async (req, res) => {
  try {
    console.log('Admin updating user role:', { 
      adminId: req.user.userId, 
      adminRole: req.user.role, 
      targetUserId: req.params.id,
      newRole: req.body.role 
    });

    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({ msg: 'Cannot change your own role' });
    }

    user.role = role;
    await user.save();
    
    console.log('User role updated successfully:', { userId: user._id, newRole: user.role });
    res.json({ msg: 'User role updated successfully', user });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router; 