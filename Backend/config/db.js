const mongoose = require('mongoose');

const connectDB = async () => {
  const connect = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // fail fast if cannot connect
        socketTimeoutMS: 45000 // close sockets after 45s idle
      });
      console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
      setTimeout(connect, 5000); // retry after 5 seconds
    }
  };

  // Connection event listeners
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected! Attempting to reconnect...');
    connect();
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
  });

  await connect();
};

module.exports = connectDB;
