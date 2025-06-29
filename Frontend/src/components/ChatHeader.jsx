import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Users, Wifi, WifiOff, Settings, Edit3, Menu, Crown, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '@/lib/api';
import api from '@/lib/api';

const ChatHeader = ({
  roomName,
  roomCode,
  users,
  onlineUsers,
  currentUserId,
  roomOwner,
  isAdmin,
  isConnected,
  onRemoveUser,
  onEditRoom,
  onCopyRoomCode,
  onSidebarToggle
}) => {
  const [copySuccess, setCopySuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopySuccess('Room code copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setError('Failed to copy room code');
    }
  };

  const handleDeleteRoom = async () => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) return;
    
    try {
      await api.delete(API_ENDPOINTS.ROOMS.DELETE(roomCode));
      navigate('/');
    } catch (err) {
      setError('Failed to delete room');
    }
  };

  return (
    <>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-black/95 backdrop-blur-xl border-b border-blue-900/50 p-3 sm:p-4 fixed top-0 left-0 right-0 z-30 shadow-2xl"
      >
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="text-gray-200 hover:text-white hover:bg-blue-500/20 transition-all duration-200 flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </motion.div>
            
            <div className="flex flex-col min-w-0 flex-1">
              <h1 className="text-white font-bold text-base sm:text-xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent truncate">
                {roomName}
              </h1>
              <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-400">
                <span>{users.length} users</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{onlineUsers.length} online</span>
                <span className="hidden sm:inline">•</span>
                {isConnected ? (
                  <div className="flex items-center gap-1 text-green-400">
                    <Wifi className="w-3 h-3" />
                    <span className="hidden sm:inline">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-400">
                    <WifiOff className="w-3 h-3" />
                    <span className="hidden sm:inline">Disconnected</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Room Code Badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge 
                variant="outline" 
                className="bg-blue-500/20 text-blue-400 border-blue-500/30 cursor-pointer hover:bg-blue-500/30 transition-all duration-200 text-xs px-2 py-1 hidden sm:flex"
                onClick={handleCopyRoomCode}
              >
                {roomCode}
              </Badge>
            </motion.div>

            {/* Sidebar Toggle */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onSidebarToggle}
                className="text-gray-200 hover:text-white hover:bg-blue-500/20 transition-all duration-200 h-9 w-9 sm:h-10 sm:w-10"
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </motion.div>

            {/* Edit Room Button (Admin/Owner only) */}
            {(isAdmin || currentUserId === roomOwner) && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteRoom}
                  className="text-gray-200 hover:text-white hover:bg-blue-500/20 transition-all duration-200 h-9 w-9 sm:h-10 sm:w-10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Copy Success Toast */}
        {copySuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-green-500/20 backdrop-blur-xl text-green-400 px-3 py-2 rounded-lg border border-green-500/30 text-sm shadow-lg"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              {copySuccess}
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default ChatHeader; 