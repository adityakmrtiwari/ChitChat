const express = require('express');
const Room = require('../models/Room');
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

const router = express.Router();

function generateRoomCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get all rooms
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find().populate('createdBy', 'username');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Create a new room
router.post('/', auth, async (req, res) => {
  try {
    const { name, isPrivate = false } = req.body;
    let room = await Room.findOne({ name });
    if (room) {
      return res.status(400).json({ msg: 'Room already exists' });
    }
    let roomCode;
    let exists = true;
    while (exists) {
      roomCode = generateRoomCode(8);
      exists = await Room.findOne({ roomCode });
    }
    room = new Room({ 
      name, 
      users: [req.user._id],
      createdBy: req.user._id,
      isPrivate,
      roomCode
    });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Join a room by roomCode (must come before parameterized routes)
router.post('/join-by-code', auth, async (req, res) => {
  try {
    const { roomCode } = req.body;
    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }
    if (!room.users.includes(req.user._id)) {
      room.users.push(req.user._id);
      await room.save();
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Join a room by roomId
router.post('/:roomId/join', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }
    if (!room.users.includes(req.user._id)) {
      room.users.push(req.user._id);
      await room.save();
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get room details
router.get('/:roomId', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)
      .populate('users', 'username email')
      .populate('createdBy', 'username');
    
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Edit room details (admin or room owner only)
router.put('/:roomId', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }
    // Check if user is admin or room owner
    if (req.user.role !== 'admin' && room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized to edit this room' });
    }
    const { name, isPrivate } = req.body;
    if (name) room.name = name;
    if (typeof isPrivate === 'boolean') room.isPrivate = isPrivate;
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Delete a room (admin or room owner only)
router.delete('/:roomId', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }

    // Check if user is admin or room owner
    if (req.user.role !== 'admin' && room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized to delete this room' });
    }

    // Delete all messages in the room
    await Message.deleteMany({ room: req.params.roomId });
    
    // Delete the room
    await Room.findByIdAndDelete(req.params.roomId);
    
    res.json({ msg: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Remove user from room (admin or room owner only)
router.delete('/:roomId/users/:userId', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }

    // Check if user is admin or room owner
    if (req.user.role !== 'admin' && room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized to remove users from this room' });
    }

    // Remove user from room
    room.users = room.users.filter(userId => userId.toString() !== req.params.userId);
    await room.save();
    
    res.json({ msg: 'User removed from room successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
