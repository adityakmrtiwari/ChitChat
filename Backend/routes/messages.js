const express = require('express');
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get messages for a room with pagination
// Query params: ?limit=15&skip=0 (skip is how many messages to skip from the end)
router.get('/:roomId', auth, async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 15));
    const skip = Math.max(0, parseInt(req.query.skip) || 0);
    // Get the last N messages, skipping older ones if needed
    const total = await Message.countDocuments({ room: req.params.roomId });
    const messages = await Message.find({ room: req.params.roomId })
      .populate('sender', 'username role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    // Reverse to show oldest first in UI
    res.json({
      messages: messages.reverse(),
      total
    });
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

// DELETE a message (soft delete)
// Only sender, room owner (except admin's messages), or admin can delete
router.delete('/:roomId/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId).populate('sender', 'role');
    if (!message) return res.status(404).json({ msg: 'Message not found' });
    if (message.room.toString() !== req.params.roomId) return res.status(400).json({ msg: 'Message does not belong to this room' });

    // Get room to check owner
    const Room = require('../models/Room');
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ msg: 'Room not found' });

    // Authorization logic
    const isSender = message.sender._id.toString() === req.user._id.toString();
    const isRoomOwner = room.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isMessageAdmin = message.sender.role === 'admin';

    if (
      isSender ||
      isAdmin ||
      (isRoomOwner && !isMessageAdmin)
    ) {
      message.deleted = true;
      message.deletedBy = req.user._id;
      await message.save();
      return res.json({ msg: 'Message deleted', message });
    } else {
      return res.status(403).json({ msg: 'You are not authorized to delete this message' });
    }
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
