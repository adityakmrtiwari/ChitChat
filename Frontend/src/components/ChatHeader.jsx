import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Users, Wifi, WifiOff, Settings, Edit3, Menu, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const [editRoomDialogOpen, setEditRoomDialogOpen] = useState(false);
  const [editRoomData, setEditRoomData] = useState({ _id: '', name: '', isPrivate: false });
  const [copySuccess, setCopySuccess] = useState('');
  const navigate = useNavigate();

  const handleEditRoom = () => {
    setEditRoomData({ _id: roomCode, name: roomName, isPrivate: false });
    setEditRoomDialogOpen(true);
  };

  const handleEditRoomSubmit = async () => {
    try {
      await onEditRoom(editRoomData);
      setEditRoomDialogOpen(false);
    } catch (error) {
      console.error('Error editing room:', error);
    }
  };

  const handleCopyRoomCode = async () => {
    try {
      await onCopyRoomCode();
      setCopySuccess('Room code copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (error) {
      console.error('Error copying room code:', error);
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
                  onClick={handleEditRoom}
                  className="text-gray-200 hover:text-white hover:bg-blue-500/20 transition-all duration-200 h-9 w-9 sm:h-10 sm:w-10"
                >
                  <Edit3 className="w-4 h-4" />
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

      {/* Edit Room Dialog */}
      <Dialog open={editRoomDialogOpen} onOpenChange={setEditRoomDialogOpen}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-blue-900/50 shadow-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Edit Room
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={editRoomData.name}
              onChange={e => setEditRoomData({ ...editRoomData, name: e.target.value })}
              className="bg-blue-900/20 border-blue-700/50 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
              placeholder="Room name"
            />
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={editRoomData.isPrivate}
                onChange={e => setEditRoomData({ ...editRoomData, isPrivate: e.target.checked })}
              />
              Private Room
            </label>
            <div className="flex gap-2">
              <Button onClick={handleEditRoomSubmit} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                Save
              </Button>
              <Button 
                variant="outline" 
                className="bg-black/40 border-blue-700/50 text-white hover:bg-blue-500/20 transition-all duration-200" 
                onClick={() => setEditRoomDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatHeader; 