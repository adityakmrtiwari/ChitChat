const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  reactions: {
    type: Map,
    of: String,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
