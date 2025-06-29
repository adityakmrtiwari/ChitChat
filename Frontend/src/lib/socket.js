import { io } from 'socket.io-client';

// Environment detection and Socket Configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Socket Configuration - environment-based
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

if (!SOCKET_URL) {
  console.error('VITE_SOCKET_URL environment variable is not set!');
}

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(userId) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Store userId for disconnect handling
      if (userId) {
        this.socket.emit('storeUserId', { userId });
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      
      // Re-store userId after reconnection
      if (userId) {
        this.socket.emit('storeUserId', { userId });
      }
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinRoom(roomId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinRoom', { roomId, userId });
    }
  }

  leaveRoom(roomId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leaveRoom', { roomId, userId });
    }
  }

  sendMessage(roomId, userId, content) {
    if (this.socket && this.isConnected) {
      this.socket.emit('sendMessage', { roomId, userId, content });
    }
  }

  startTyping(roomId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { roomId, userId });
    }
  }

  stopTyping(roomId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stopTyping', { roomId, userId });
    }
  }

  removeUser(roomId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('removeUser', { roomId, userId });
    }
  }

  // Event listeners
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('newMessage', callback);
    }
  }

  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('userJoined', callback);
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('userLeft', callback);
    }
  }

  onUserRemoved(callback) {
    if (this.socket) {
      this.socket.on('userRemoved', callback);
    }
  }

  onTyping(callback) {
    if (this.socket) {
      this.socket.on('typing', callback);
    }
  }

  onStopTyping(callback) {
    if (this.socket) {
      this.socket.on('stopTyping', callback);
    }
  }

  onUserList(callback) {
    if (this.socket) {
      this.socket.on('userList', callback);
    }
  }

  onRoomUsers(callback) {
    if (this.socket) {
      this.socket.on('roomUsers', callback);
    }
  }

  onReaction(callback) {
    if (this.socket) {
      this.socket.on('reaction', callback);
    }
  }

  // Remove event listeners
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create singleton instance
const socketManager = new SocketManager();

export default socketManager; 