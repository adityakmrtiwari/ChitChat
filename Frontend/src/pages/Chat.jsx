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
import LoadingSkeleton from '../components/LoadingSkeleton';

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
  const [showEmoji, setShowEmoji] = useState(false);
  
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

    socket.on('removeUser', ({ userId }) => {
      setUsers(prev => prev.filter(u => u._id !== userId));
    });

    socket.on('roomUpdated', ({ roomData }) => {
      setRoomName(roomData.name);
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

  // Copy message
  const handleCopyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setToast('Message copied!');
      setTimeout(() => setToast(''), 1500);
    } catch (err) {
      setToast('Failed to copy message');
      setTimeout(() => setToast(''), 1500);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden"
      >
        <div className="text-white text-xl mb-4">Loading chat...</div>
        <LoadingSkeleton count={8} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden"
    >
      <div className="sticky top-0 z-30">
        <ChatHeader
          roomName={roomName}
          roomCode={roomCode}
          users={users}
          onlineUsers={onlineUsers}
          currentUserId={user?.userId}
          roomOwner={roomOwner}
          isAdmin={isAdmin}
          isConnected={isConnected}
          onRemoveUser={removeUser}
          onEditRoom={handleEditRoom}
          onCopyRoomCode={handleCopyRoomCode}
          onSidebarToggle={() => setSidebarOpen(true)}
        />
      </div>
      {/* Full width chat area */}
      <div className="pt-16 pb-24 px-0 h-full w-full flex flex-col">
        {isLoading ? (
          <div className="text-white text-center py-8">Loading...</div>
        ) : (
          <div ref={messagesContainerRef} className="flex-1 flex flex-col justify-end space-y-2 min-h-[60vh] w-full px-2 md:px-8 lg:px-16">
            {skip < total && (
              <div className="flex justify-center mb-2 mt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-6 py-2 rounded-full shadow-lg hover:bg-gray-700 transition-all border border-white/10 font-semibold text-base"
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
            <AnimatePresence>
              {messages.map((msg, index) => {
                const prevMsg = messages[index - 1];
                // Group if previous message is from the same sender and within 5 minutes
                let isGrouped = false;
                if (
                  prevMsg &&
                  prevMsg.sender &&
                  msg.sender &&
                  prevMsg.sender._id === msg.sender._id &&
                  Math.abs(new Date(msg.createdAt) - new Date(prevMsg.createdAt)) < 5 * 60 * 1000
                ) {
                  isGrouped = true;
                }
                return (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    currentUserId={user?.userId}
                    roomOwner={roomOwner}
                    onAddReaction={handleAddReaction}
                    isOwnMessage={msg.sender?._id === user?.userId}
                    onDelete={handleDeleteMessage}
                    onCopy={handleCopyMessage}
                    isGrouped={isGrouped}
                  />
                );
              })}
            </AnimatePresence>
            <TypingIndicator typingUsers={typingUsers} />
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <MessageInput onSend={handleSend} onEmoji={() => setShowEmoji(v => !v)} />
      <EmojiPicker isOpen={showEmoji} onClose={() => setShowEmoji(false)} onEmojiSelect={() => {}} />
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        roomName={roomName}
        roomCode={roomCode}
        users={users}
        onlineUsers={onlineUsers}
        currentUserId={user?.userId}
        roomOwner={roomOwner}
        isAdmin={isAdmin}
        onRemoveUser={removeUser}
        onEditRoom={handleEditRoom}
        onCopyRoomCode={handleCopyRoomCode}
      />
      {error && (
        <motion.div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-red-500/20 backdrop-blur-xl text-red-400 px-4 py-2 rounded-xl border border-red-500/30 text-sm max-w-xs mx-2 shadow-2xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            {error}
          </div>
        </motion.div>
      )}
      {toast && (
        <motion.div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black/95 backdrop-blur-xl text-white px-4 py-2 rounded-xl shadow-2xl border border-blue-900/50 z-50 max-w-xs mx-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            {toast}
          </div>
        </motion.div>
      )}
      {!isConnected && (
        <motion.div className="fixed top-16 right-4 z-50 bg-yellow-500/20 backdrop-blur-xl text-yellow-400 px-3 py-2 rounded-lg border border-yellow-500/30 text-xs shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            Reconnecting...
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Chat; 