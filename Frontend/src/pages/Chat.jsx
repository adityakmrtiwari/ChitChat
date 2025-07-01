import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  Users, 
  Crown, 
  Copy, 
  Check, 
  Share2, 
  LogOut, 
  Settings,
  MessageCircle,
  Lock,
  Globe,
  Shield,
  ArrowLeft,
  Menu,
  X,
  Trash2,
  UserMinus
} from 'lucide-react';
import dayjs from 'dayjs';
import socketManager from '../lib/socket';
import api, { API_ENDPOINTS } from '../lib/api';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import ChatSidebar from '../components/ChatSidebar';
import TypingIndicator from '../components/TypingIndicator';
import ChatHeader from '../components/ChatHeader';
import EmojiPicker from '../components/EmojiPicker';
import Footer from '../components/Footer';

const Chat = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [roomName, setRoomName] = useState('');
  const [roomOwner, setRoomOwner] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [toast, setToast] = useState('');
  // Pagination state
  const [skip, setSkip] = useState(0);
  const [limit] = useState(15);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastMessageAction, setLastMessageAction] = useState('new');
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const token = localStorage.getItem('token');

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewMessageCount(0);
  };

  // Handle send message
  const handleSend = async (messageContent) => {
    if (!messageContent.trim()) return;

    try {
      const response = await api.post(API_ENDPOINTS.MESSAGES.CREATE(roomId), {
        content: messageContent
      });

      // Add the message to the local state immediately
      setMessages((prev) => [...prev, response.data]);
      setLastMessageAction('new');
      
      // Broadcast to other users via socket
      socketRef.current.emit('broadcastMessage', { 
        roomId, 
        message: response.data 
      });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socketRef.current.emit('stopTyping', { roomId, userId: user.userId });
      }
    } catch (err) {
      setError('Failed to send message');
    }
  };

  // Handle add reaction
  const handleAddReaction = (messageId, reaction) => {
    socketRef.current.emit('reaction', { messageId, userId: user.userId, reaction });
  };

  // Handle remove user
  const removeUser = async (userId) => {
    try {
      await api.delete(API_ENDPOINTS.ROOMS.REMOVE_USER(roomId, userId));
      socketRef.current.emit('removeUser', { roomId, userId });
    } catch (err) {
      setError('Failed to remove user');
    }
  };

  // Handle edit room
  const handleEditRoom = async (roomData) => {
    try {
      await api.put(API_ENDPOINTS.ROOMS.UPDATE(roomId), roomData);
      setRoomName(roomData.name);
      socketRef.current.emit('roomUpdated', { roomId, roomData });
    } catch (err) {
      setError('Failed to update room');
    }
  };

  // Handle copy room code
  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
    } catch (err) {
      setError('Failed to copy room code');
    }
  };

  // Fetch initial data
  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }
    setSkip(0);
    setMessages([]);
    setTotal(0);
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const roomRes = await api.get(API_ENDPOINTS.ROOMS.GET(roomId));
        const room = roomRes.data;
        setRoomName(room.name);
        setRoomOwner(room.createdBy._id || room.createdBy);
        setIsAdmin(user.role === 'admin');
        setUsers(room.users || []);
        setRoomCode(room.roomCode);
        // Fetch last 15 messages
        const messagesRes = await api.get(`${API_ENDPOINTS.MESSAGES.GET(roomId)}?limit=${limit}&skip=0`);
        setMessages(messagesRes.data.messages);
        setTotal(messagesRes.data.total);
        setSkip(messagesRes.data.messages.length);
      } catch (err) {
        setError('Failed to fetch room data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [roomId, token, user, navigate, limit]);

  // Socket connection and event handlers
  useEffect(() => {
    if (!user?.userId || !roomId) return;

    const socket = socketManager.connect(user.userId);
    socketRef.current = socket;
    
    // Connection status handling
    socket.on('connect', () => {
      setIsConnected(true);
      setError('');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setError('Connection lost. Trying to reconnect...');
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
      setError('Failed to connect to server');
    });
    
    socket.emit('joinRoom', { roomId, userId: user.userId });
    socket.emit('storeUserId', { userId: user.userId });

    // Message events
    socket.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;
        if (!isAtBottom) {
          setNewMessageCount(prev => prev + 1);
        }
      }
    });

    // Typing events
    socket.on('typing', ({ userId, username }) => {
      if (userId !== user.userId) {
        setTypingUsers((prev) => {
          if (!prev.some(u => u.id === userId)) {
            return [...prev, { id: userId, username }];
          }
          return prev;
        });
      }
    });

    socket.on('stopTyping', ({ userId }) => {
      setTypingUsers((prev) => prev.filter((u) => u.id !== userId));
    });

    // User events
    socket.on('userJoined', ({ userId, username }) => {
      setUsers(prev => {
        if (!prev.find(u => u._id === userId)) {
          return [...prev, { _id: userId, username }];
        }
        return prev;
      });
      setToast(`${username} joined the room`);
      setTimeout(() => setToast(''), 2000);
    });

    socket.on('userLeft', ({ userId, username }) => {
      setUsers(prev => prev.filter(u => u._id !== userId));
      setToast(`${username} left the room`);
      setTimeout(() => setToast(''), 2000);
    });

    socket.on('userList', (onlineUserIds) => {
      setOnlineUsers(onlineUserIds);
    });

    socket.on('roomUsers', (userList) => {
      setUsers(userList);
    });

    socket.on('userRemoved', ({ userId }) => {
      if (userId === user.userId) {
        navigate('/');
      } else {
        setUsers(prev => prev.filter(u => u._id !== userId));
      }
    });

    // Reaction events
    socket.on('reaction', ({ messageId, userId, reaction }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, reactions: { ...msg.reactions, [userId]: reaction } }
          : msg
      ));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [roomId, user, navigate]);

  // Auto-scroll to bottom on new messages (but not when loading more or deleting)
  useEffect(() => {
    if (lastMessageAction === 'new') {
      scrollToBottom();
    }
  }, [messages]);

  // Load more messages
  const handleLoadMore = async () => {
    setLoadingMore(true);
    setIsLoadingMore(true);
    setLastMessageAction('loadMore');
    try {
      const res = await api.get(`${API_ENDPOINTS.MESSAGES.GET(roomId)}?limit=${limit}&skip=${skip}`);
      setMessages((prev) => [...res.data.messages, ...prev]);
      setSkip(skip + res.data.messages.length);
    } catch (err) {
      setError('Failed to load more messages');
    } finally {
      setLoadingMore(false);
      setTimeout(() => setIsLoadingMore(false), 100);
    }
  };

  // Delete message handler
  const handleDeleteMessage = async (messageId) => {
    try {
      const res = await api.delete(`${API_ENDPOINTS.MESSAGES.GET(roomId)}/${messageId}`);
      setMessages((prev) => prev.map(m => m._id === messageId ? { ...m, deleted: true } : m));
      setLastMessageAction('delete');
    } catch (err) {
      setError('Failed to delete message');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-spin-slow"></div>
        </div>

        <div className="text-white text-xl">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      {/* Chat Header */}
      <ChatHeader
        roomName={roomName}
        roomCode={roomCode}
        users={users}
        onlineUsers={onlineUsers}
        currentUserId={user.userId}
        roomOwner={roomOwner}
        isAdmin={isAdmin}
        isConnected={isConnected}
        onRemoveUser={removeUser}
        onEditRoom={handleEditRoom}
        onCopyRoomCode={handleCopyRoomCode}
        onSidebarToggle={() => setSidebarOpen(true)}
      />

      {/* Messages Container */}
      <div className="pt-16 sm:pt-20 pb-20 sm:pb-24 px-2 sm:px-4 md:px-6 relative">
        <div className="max-w-4xl mx-auto w-full">
          <motion.div 
            ref={messagesContainerRef}
            className="space-y-3 sm:space-y-4 min-h-[calc(100vh-180px)] sm:min-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Load More Button */}
            {skip < total && (
              <div className="flex justify-center mb-2">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-full shadow-lg"
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                >
                  <MessageBubble
                    message={msg}
                    currentUserId={user.userId}
                    roomOwner={roomOwner}
                    onAddReaction={handleAddReaction}
                    isOwnMessage={msg.sender?._id === user.userId}
                    isAdmin={isAdmin}
                    isRoomOwner={roomOwner === user.userId}
                    onDelete={handleDeleteMessage}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <TypingIndicator typingUsers={typingUsers} />

            <div ref={messagesEndRef} />
          </motion.div>

          {/* New Message Indicator */}
          {newMessageCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-50"
            >
              <Button
                onClick={scrollToBottom}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 text-sm sm:text-base font-medium backdrop-blur-xl border border-blue-500/30"
              >
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="mr-2"
                >
                  ↓
                </motion.div>
                {newMessageCount} new message{newMessageCount > 1 ? 's' : ''}
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Message Input */}
      <MessageInput
        onSend={handleSend}
        disabled={!isConnected}
        placeholder="Type your message..."
      />

      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        roomName={roomName}
        roomCode={roomCode}
        users={users}
        onlineUsers={onlineUsers}
        currentUserId={user.userId}
        roomOwner={roomOwner}
        isAdmin={isAdmin}
        onRemoveUser={removeUser}
        onEditRoom={handleEditRoom}
        onCopyRoomCode={handleCopyRoomCode}
      />

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/20 backdrop-blur-xl text-red-400 px-4 sm:px-6 py-2 sm:py-3 rounded-xl border border-red-500/30 text-sm max-w-xs sm:max-w-sm mx-2 shadow-2xl"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            {error}
          </div>
        </motion.div>
      )}

      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 bg-black/95 backdrop-blur-xl text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-2xl border border-blue-900/50 z-50 max-w-xs sm:max-w-sm mx-2 text-sm sm:text-base"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            {toast}
          </div>
        </motion.div>
      )}

      {/* Connection Status Indicator */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-16 sm:top-20 right-4 z-50 bg-yellow-500/20 backdrop-blur-xl text-yellow-400 px-3 sm:px-4 py-2 rounded-lg border border-yellow-500/30 text-xs sm:text-sm shadow-lg"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            Reconnecting...
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Chat; 