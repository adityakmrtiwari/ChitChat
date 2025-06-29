import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, Share2, Users, Crown, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import dayjs from 'dayjs';
import api, { API_ENDPOINTS } from '../lib/api';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [joinRoomTarget, setJoinRoomTarget] = useState(null);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [copiedRoomId, setCopiedRoomId] = useState(null);

  const features = [
    {
      title: "Real-time Messaging",
      description: "Instant message delivery with live typing indicators",
      icon: "💬",
      color: "from-blue-500/20 to-purple-500/20"
    },
    {
      title: "Chat Rooms",
      description: "Join public rooms or create private conversations",
      icon: "🏠",
      color: "from-green-500/20 to-blue-500/20"
    },
    {
      title: "User Presence",
      description: "See who's online and active in real-time",
      icon: "👥",
      color: "from-purple-500/20 to-pink-500/20"
    },
    {
      title: "Secure Authentication",
      description: "JWT-based secure login and registration",
      icon: "🔒",
      color: "from-orange-500/20 to-red-500/20"
    }
  ];

  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  const fetchRooms = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.ROOMS.LIST);
      setRooms(response.data);
    } catch (err) {
      setError('Failed to fetch rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const createRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      await api.post(API_ENDPOINTS.ROOMS.CREATE, { name: newRoomName });
      setNewRoomName('');
      fetchRooms();
    } catch (err) {
      setError('Failed to create room');
    }
  };

  const myRooms = rooms.filter(room => room.createdBy?._id === user?.userId);
  const joinedRooms = rooms.filter(room => 
    room.users && 
    room.users.includes(user?.userId) && 
    room.createdBy?._id !== user?.userId
  );
  const availableRooms = rooms.filter(room => 
    (!room.users || !room.users.includes(user?.userId)) && 
    room.createdBy?._id !== user?.userId
  );

  const handleJoinRoomClick = (room) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (room.users && room.users.includes(user.userId)) {
      navigate(`/chat/${room._id}`);
    } else {
      setJoinRoomTarget(room);
      setShowCodeDialog(true);
    }
  };

  const handleMyRoomClick = (room) => {
    navigate(`/chat/${room._id}`);
  };

  const handleJoinedRoomClick = (room) => {
    navigate(`/chat/${room._id}`);
  };

  const handleAvailableRoomClick = (room) => {
    setJoinRoomTarget(room);
    setShowCodeDialog(true);
  };

  const handleJoinRoomByCode = async () => {
    if (!joinRoomCode.trim() || !joinRoomTarget) return;
    try {
      const response = await api.post(API_ENDPOINTS.ROOMS.JOIN_BY_CODE, {
        roomCode: joinRoomCode
      });
      setShowCodeDialog(false);
      setJoinRoomCode('');
      setJoinRoomTarget(null);
      fetchRooms();
      navigate(`/chat/${response.data._id}`);
    } catch (err) {
      setError('Invalid room code');
    }
  };

  const handleCopyRoomCode = async (code, roomId) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedRoomId(roomId);
      setTimeout(() => setCopiedRoomId(null), 2000);
    } catch {
      setError('Failed to copy');
      setTimeout(() => setError(''), 2000);
    }
  };

  const handleShareRoom = async (room) => {
    const shareUrl = `${window.location.origin}/join/${room.roomCode}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Join ${room.name} on ChitChat`,
          text: `Join me in ${room.name} on ChitChat! Use room code: ${room.roomCode}`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch (err) {
      // Silent fail for sharing
    }
  };

  const renderMyRoomCard = (room) => (
    <motion.div
      key={room._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="cursor-pointer"
    >
      <Card className="glass-card h-full hover:bg-black/50 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-white text-lg">{room.name}</CardTitle>
              <Crown className="w-4 h-4 text-yellow-400" />
            </div>
            <Badge className="badge-cyber-blue">
              <Users className="w-3 h-3 mr-1" />
              {room.users?.length || 0}
            </Badge>
          </div>
          <CardDescription className="text-gray-300">
            Room Code: <span className="font-mono text-white bg-gray-800 px-2 py-1 rounded">{room.roomCode}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                  {room.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-300">
                You (Owner)
              </span>
            </div>
            <div className="text-xs text-gray-400">
              Created: {dayjs(room.createdAt).format('MMM D, YYYY')}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyRoomCode(room.roomCode, room._id);
                }}
                className={`flex-1 ${copiedRoomId === room._id ? 'bg-green-500 hover:bg-green-600' : 'gradient-btn-primary'}`}
              >
                {copiedRoomId === room._id ? (
                  <Check className="w-3 h-3 mr-1" />
                ) : (
                  <Copy className="w-3 h-3 mr-1" />
                )}
                {copiedRoomId === room._id ? 'Copied!' : 'Copy Code'}
              </Button>
              <Button 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShareRoom(room);
                }}
                className="flex-1 gradient-btn-secondary"
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </Button>
            </div>
            <Button 
              onClick={() => handleMyRoomClick(room)}
              className="w-full gradient-btn-primary"
            >
              Open Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderJoinedRoomCard = (room) => (
    <motion.div
      key={room._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="cursor-pointer"
    >
      <Card className="glass-card h-full hover:bg-black/50 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-white text-lg">{room.name}</CardTitle>
            </div>
            <Badge className="badge-cyber-blue">
              <Users className="w-3 h-3 mr-1" />
              {room.users?.length || 0}
            </Badge>
          </div>
          <CardDescription className="text-gray-300">
            Room Code: <span className="font-mono text-white bg-gray-800 px-2 py-1 rounded">{room.roomCode}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                  {room.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-300">
                Created by {room.createdBy?.username || 'Unknown'}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              Created: {dayjs(room.createdAt).format('MMM D, YYYY')}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyRoomCode(room.roomCode, room._id);
                }}
                className={`flex-1 ${copiedRoomId === room._id ? 'bg-green-500 hover:bg-green-600' : 'gradient-btn-secondary'}`}
              >
                {copiedRoomId === room._id ? (
                  <Check className="w-3 h-3 mr-1" />
                ) : (
                  <Copy className="w-3 h-3 mr-1" />
                )}
                {copiedRoomId === room._id ? 'Copied!' : 'Copy Code'}
              </Button>
              <Button 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShareRoom(room);
                }}
                className="flex-1 gradient-btn-secondary"
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </Button>
            </div>
            <Button 
              onClick={() => handleJoinedRoomClick(room)}
              className="w-full gradient-btn-primary"
            >
              Open Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderAvailableRoomCard = (room) => (
    <motion.div
      key={room._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="cursor-pointer"
    >
      <Card className="glass-card h-full hover:bg-black/50 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-white text-lg">{room.name}</CardTitle>
            </div>
            <Badge className="badge-cyber-blue">
              <Users className="w-3 h-3 mr-1" />
              {room.users?.length || 0}
            </Badge>
          </div>
          <CardDescription className="text-gray-300">
            Ask the room owner or a member for the room code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                  {room.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-300">
                Created by {room.createdBy?.username || 'Unknown'}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              Created: {dayjs(room.createdAt).format('MMM D, YYYY')}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShareRoom(room);
                }}
                className="w-full gradient-btn-secondary"
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </Button>
            </div>
            <Button 
              onClick={() => handleAvailableRoomClick(room)}
              className="w-full gradient-btn-primary"
            >
              Join Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-16 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent"
          >
            Welcome to ChitChat
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto"
          >
            Connect with friends in real-time chat rooms. Create, join, and share conversations instantly.
          </motion.p>
          
          {!user && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/register">
                <Button className="gradient-btn-primary text-base px-6 py-3">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="glass-btn text-base px-6 py-3">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-12"
          >
            Features
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`bg-gradient-to-br ${feature.color} p-4 sm:p-6 rounded-xl border border-blue-500/30 h-full`}>
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{feature.icon}</div>
                  <h3 className="text-white font-semibold text-base sm:text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-300 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chat Rooms Section */}
      {user && (
        <section className="py-8 sm:py-12 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Create Room Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 sm:mb-12"
            >
              <div className="max-w-md mx-auto">
                <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-4 sm:mb-6">
                  Create New Room
                </h3>
                <form onSubmit={createRoom} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Room name..."
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="flex-1 glass-input focus:ring-2 focus:ring-blue-500/50"
                  />
                  <Button type="submit" className="gradient-btn-primary">
                    Create
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* My Rooms */}
            {myRooms.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 sm:mb-12"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                  My Rooms
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {myRooms.map(renderMyRoomCard)}
                </div>
              </motion.div>
            )}

            {/* Joined Rooms */}
            {joinedRooms.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 sm:mb-12"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                  Joined Rooms
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {joinedRooms.map(renderJoinedRoomCard)}
                </div>
              </motion.div>
            )}

            {/* Available Rooms */}
            {availableRooms.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 sm:mb-12"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                  Available Rooms
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {availableRooms.map(renderAvailableRoomCard)}
                </div>
              </motion.div>
            )}

            {/* No Rooms Message */}
            {rooms.length === 0 && !isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <p className="text-gray-400 text-lg">No rooms available. Create your first room to get started!</p>
              </motion.div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading rooms...</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg border border-red-500/30 text-sm max-w-sm mx-4"
        >
          {error}
        </motion.div>
      )}

      {/* Join Room Dialog */}
      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-blue-900/50 shadow-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Join Room
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              Enter the room code to join <strong>{joinRoomTarget?.name}</strong>
            </p>
            <Input
              type="text"
              placeholder="Room code..."
              value={joinRoomCode}
              onChange={(e) => setJoinRoomCode(e.target.value)}
              className="glass-input focus:ring-2 focus:ring-blue-500/50"
            />
            <div className="flex gap-2">
              <Button onClick={handleJoinRoomByCode} className="gradient-btn-primary flex-1">
                Join Room
              </Button>
              <Button 
                variant="outline" 
                className="glass-btn flex-1" 
                onClick={() => setShowCodeDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Home;
