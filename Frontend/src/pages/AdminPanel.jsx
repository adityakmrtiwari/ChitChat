import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';
import { Copy, Users, Crown, Trash2, MessageSquare, Edit, UserCheck, UserX, Shield, ShieldCheck } from 'lucide-react';
import api, { API_ENDPOINTS } from '../lib/api';

const AdminPanel = () => {
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('rooms');
  const [copySuccess, setCopySuccess] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [roomsResponse, usersResponse] = await Promise.all([
        api.get(API_ENDPOINTS.ROOMS.LIST),
        api.get(API_ENDPOINTS.USERS.LIST)
      ]);
      setRooms(roomsResponse.data);
      setUsers(usersResponse.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    
    try {
      await api.delete(API_ENDPOINTS.ROOMS.DELETE(roomId));
      setRooms(prev => prev.filter(room => room._id !== roomId));
    } catch (err) {
      setError('Failed to delete room');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await api.delete(API_ENDPOINTS.USERS.DELETE(userId));
      setUsers(prev => prev.filter(user => user._id !== userId));
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete user');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const response = await api.patch(API_ENDPOINTS.USERS.UPDATE_ROLE(userId), { role: newRole });
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      
      setSuccess('User role updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update user role');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleCopyRoomCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess('Room code copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch {
      setCopySuccess('Failed to copy room code');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  const getUserById = (userId) => {
    return users.find(user => user._id === userId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-cyber-night scrollbar-cyber relative overflow-hidden">
        <Navbar />
        <main className="flex-1 pt-16 pb-6 px-4 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cyber-night scrollbar-cyber relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="cyber-bg-element-1"></div>
        <div className="cyber-bg-element-2"></div>
        <div className="cyber-bg-element-3"></div>
      </div>

      <Navbar />
      
      <main className="flex-1 pt-16 pb-6 px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6 sm:mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
              className="mb-4"
            >
              <img src="/logo.jpeg" alt="ChitChat Logo" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover mx-auto shadow-lg" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">Admin Panel</h1>
            <p className="text-gray-300 text-sm sm:text-base">Manage rooms and users</p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-center badge-cyber border border-red-500/20 rounded-lg p-3 mb-6"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-400 text-center badge-cyber border border-green-500/20 rounded-lg p-3 mb-6"
            >
              {success}
            </motion.div>
          )}

          {copySuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-400 text-center badge-cyber border border-green-500/20 rounded-lg p-3 mb-6"
            >
              {copySuccess}
            </motion.div>
          )}

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-2 mb-6 justify-center"
          >
            <Button
              variant={activeTab === 'rooms' ? 'default' : 'outline'}
              onClick={() => setActiveTab('rooms')}
              className={`${activeTab === 'rooms' ? 'gradient-btn-primary' : 'bg-black/40 border-white/10 text-white'} text-sm sm:text-base`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Room Management</span>
              <span className="sm:hidden">Rooms</span>
              <span className="ml-1 sm:ml-2">({rooms.length})</span>
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              onClick={() => setActiveTab('users')}
              className={`${activeTab === 'users' ? 'gradient-btn-primary' : 'bg-black/40 border-white/10 text-white'} text-sm sm:text-base`}
            >
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">User Management</span>
              <span className="sm:hidden">Users</span>
              <span className="ml-1 sm:ml-2">({users.length})</span>
            </Button>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'rooms' && (
              <motion.div
                key="rooms"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-white">Room Management</CardTitle>
                    <p className="text-gray-300">View and manage all chat rooms</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {rooms.map((room, index) => (
                        <motion.div
                          key={room._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.5 }}
                          className="bg-black/20 rounded-lg border border-white/10 p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white">{room.name}</h3>
                              {room.createdBy === user.userId && <Crown className="w-4 h-4 text-yellow-400" />}
                            </div>
                            <Badge className="badge-cyber-blue">
                              <Users className="w-3 h-3 mr-1" />
                              {room.users?.length || 0}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="text-sm text-gray-300">
                              <strong>Room Code:</strong>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-white bg-gray-800 px-2 py-1 rounded text-xs">
                                  {room.roomCode}
                                </span>
                                <Button
                                  size="sm"
                                  onClick={() => handleCopyRoomCode(room.roomCode)}
                                  className="gradient-btn-secondary"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="text-xs text-gray-400">
                              <div><strong>Created by:</strong> {getUserById(room.createdBy)?.username || 'Unknown'}</div>
                              <div><strong>Created:</strong> {dayjs(room.createdAt).format('MMM D, YYYY')}</div>
                              <div><strong>Private:</strong> {room.isPrivate ? 'Yes' : 'No'}</div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => navigate(`/chat/${room._id}`)}
                                className="flex-1 gradient-btn-primary"
                              >
                                Join Room
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDeleteRoom(room._id)}
                                className="gradient-btn-danger"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {rooms.length === 0 && (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🏠</div>
                        <h3 className="text-xl font-bold text-white mb-2">No rooms found</h3>
                        <p className="text-gray-300">No rooms have been created yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-white">User Management</CardTitle>
                    <p className="text-gray-300">Manage all registered users</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {users.map((userItem, index) => (
                        <motion.div
                          key={userItem._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.5 }}
                          className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                {userItem.username?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-white">{userItem.username}</h3>
                              <p className="text-sm text-gray-300">{userItem.email}</p>
                              <p className="text-xs text-gray-400">
                                Joined: {dayjs(userItem.createdAt).format('MMM D, YYYY')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={userItem.role === 'admin' ? 'badge-cyber-red' : 'badge-cyber-blue'}>
                              {userItem.role}
                            </Badge>
                            {userItem._id !== user.userId && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateUserRole(userItem._id, userItem.role === 'admin' ? 'user' : 'admin')}
                                  className="gradient-btn-secondary"
                                >
                                  {userItem.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleDeleteUser(userItem._id)}
                                  className="gradient-btn-danger"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* System Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8"
          >
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{rooms.length}</div>
                  <div className="text-gray-300">Total Rooms</div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{users.length}</div>
                  <div className="text-gray-300">Total Users</div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {users.filter(u => u.role === 'admin').length}
                  </div>
                  <div className="text-gray-300">Admins</div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {users.filter(u => u.role === 'user').length}
                  </div>
                  <div className="text-gray-300">Regular Users</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminPanel; 