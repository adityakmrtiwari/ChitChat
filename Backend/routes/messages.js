const express = require('express');
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all messages for a room
router.get('/:roomId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .populate('sender', 'username')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Post a new message to a room
router.post('/:roomId', auth, async (req, res) => {
  try {
    const message = new Message({
      sender: req.user._id,
      content: req.body.content,
      room: req.params.roomId
    });
    await message.save();
    
    // Populate sender details before sending response
    await message.populate('sender', 'username');
    
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
