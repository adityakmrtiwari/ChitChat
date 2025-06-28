const Message = require('../models/Message');
const Room = require('../models/Room');
const User = require('../models/User');

// Track online users per room
const onlineUsers = {};

module.exports = (io) => {
  io.on('connection', (socket) => {
    // Join a room
    socket.on('joinRoom', async ({ roomId, userId }) => {
      socket.join(roomId);
      
      // Add user to online list
      if (!onlineUsers[roomId]) onlineUsers[roomId] = new Set();
      onlineUsers[roomId].add(userId);
      
      // Get user details
      const user = await User.findById(userId).select('username');
      
      // Notify all users in the room
      io.to(roomId).emit('userList', Array.from(onlineUsers[roomId]));
      socket.to(roomId).emit('userJoined', { 
        userId, 
        username: user?.username || 'Unknown User' 
      });
      
      // Send current user list to the joining user
      const room = await Room.findById(roomId).populate('users', 'username');
      if (room) {
        const userList = room.users.map(u => ({
          _id: u._id.toString(),
          username: u.username
        }));
        socket.emit('roomUsers', userList);
      }
    });

    // Handle broadcasting a message to other users
    socket.on('broadcastMessage', ({ roomId, message }) => {
      // Broadcast to all users in the room except the sender
      socket.to(roomId).emit('newMessage', message);
    });

    // Handle message reactions
    socket.on('reaction', async ({ messageId, userId, reaction }) => {
      try {
        const message = await Message.findById(messageId);
        if (message) {
          if (!message.reactions) message.reactions = {};
          message.reactions[userId] = reaction;
          await message.save();
          io.to(message.room.toString()).emit('reaction', { messageId, userId, reaction });
        }
      } catch (error) {
        console.error('Error adding reaction:', error);
      }
    });

    // Typing indicator
    socket.on('typing', async ({ roomId, userId }) => {
      const user = await User.findById(userId).select('username');
      socket.to(roomId).emit('typing', { userId, username: user?.username || 'Unknown User' });
    });

    // Stop typing indicator
    socket.on('stopTyping', ({ roomId, userId }) => {
      socket.to(roomId).emit('stopTyping', { userId });
    });

    // Leave room
    socket.on('leaveRoom', async ({ roomId, userId }) => {
      socket.leave(roomId);
      if (onlineUsers[roomId]) {
        onlineUsers[roomId].delete(userId);
        io.to(roomId).emit('userList', Array.from(onlineUsers[roomId]));
      }
      const user = await User.findById(userId).select('username');
      socket.to(roomId).emit('userLeft', { userId, username: user?.username || 'Unknown User' });
    });

    // Remove user from room
    socket.on('removeUser', ({ roomId, userId }) => {
      // Remove from online users
      if (onlineUsers[roomId]) {
        onlineUsers[roomId].delete(userId);
        io.to(roomId).emit('userList', Array.from(onlineUsers[roomId]));
      }
      
      // Notify all users in the room
      io.to(roomId).emit('userRemoved', { userId });
      
      // Notify the removed user
      io.to(userId).emit('userRemoved', { userId, roomId });
    });

    // Handle disconnect
    socket.on('disconnecting', () => {
      for (const roomId of socket.rooms) {
        if (onlineUsers[roomId]) {
          onlineUsers[roomId].delete(socket.userId);
          io.to(roomId).emit('userList', Array.from(onlineUsers[roomId]));
        }
      }
    });

    // Store userId on socket for disconnect
    socket.on('storeUserId', ({ userId }) => {
      socket.userId = userId;
    });
  });
};
