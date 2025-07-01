import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Users, Copy, Crown, Wifi, WifiOff, Settings, Edit3, Menu, Search, Trash2, Check } from 'lucide-react';

const ChatSidebar = ({
  isOpen,
  onClose,
  roomName,
  roomCode,
  users,
  onlineUsers,
  currentUserId,
  roomOwner,
  isAdmin,
  onRemoveUser,
  onEditRoom,
  onCopyRoomCode
}) => {
  const [searchUsers, setSearchUsers] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editRoomName, setEditRoomName] = useState(roomName);

  // Update editRoomName when roomName prop changes (for real-time updates)
  useEffect(() => {
    setEditRoomName(roomName);
  }, [roomName]);

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const canRemoveUser = (targetUserId) => {
    return isAdmin || currentUserId === roomOwner;
  };

  const handleRemoveUser = async (userId) => {
    if (canRemoveUser(userId)) {
      const confirm = window.confirm('Are you sure you want to remove this user from the room?');
      if (!confirm) return;
      try {
        await onRemoveUser(userId);
        window.alert('User has been removed from the room.');
      } catch (err) {
        // Error handling is done in the parent component
      }
    }
  };

  const handleEditRoom = () => {
    setIsEditing(true);
    setEditRoomName(roomName);
  };

  const handleSaveEdit = async () => {
    if (editRoomName.trim() && editRoomName !== roomName) {
      try {
        await onEditRoom({ name: editRoomName.trim() });
        setIsEditing(false);
      } catch (err) {
        // Error handling is done in the parent component
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditRoomName(roomName);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      // Call the parent function to show success message
      onCopyRoomCode();
    } catch (err) {
      // Silent fail for copying - parent component handles error display
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="bg-black/95 backdrop-blur-xl border-l border-blue-900/50 w-full sm:w-80 md:w-96 p-0"
      >
        <SheetHeader className="border-b border-blue-900/50 p-4 sm:p-6">
          <SheetTitle className="text-white text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Room Info
          </SheetTitle>
        </SheetHeader>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Room Information */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Room Name</h3>
                {(isAdmin || currentUserId === roomOwner) && !isEditing && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEditRoom}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-all duration-200"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editRoomName}
                    onChange={(e) => setEditRoomName(e.target.value)}
                    className="bg-blue-900/20 border-blue-700/50 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/50 text-sm transition-all duration-200"
                    placeholder="Room name"
                    onKeyDown={handleKeyPress}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="border-white/20 text-white hover:bg-white/10 transition-all duration-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-3 sm:p-4 rounded-xl border border-blue-700/30 backdrop-blur-sm">
                  <p className="text-gray-200 text-sm font-medium">{roomName}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Room Code</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyRoomCode}
                  className={`transition-all duration-200 ${
                    copySuccess 
                      ? 'text-green-400 hover:text-green-300 hover:bg-green-500/20' 
                      : 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/20'
                  }`}
                >
                  {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-3 sm:p-4 rounded-xl border border-blue-700/30 backdrop-blur-sm">
                <p className="text-gray-200 text-sm font-mono font-medium">{roomCode}</p>
              </div>
            </div>
          </motion.div>

          {/* User Search */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users ({users.length})
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className="pl-10 bg-blue-900/20 border-blue-700/50 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/50 text-sm transition-all duration-200"
              />
            </div>
          </motion.div>

          {/* User List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2 max-h-80 sm:max-h-96 overflow-y-auto scrollbar-hide"
          >
            <AnimatePresence>
              {filteredUsers.map((user, index) => {
                const isOnline = onlineUsers.includes(user._id);
                const isOwner = user._id === roomOwner;
                const isCurrentUser = user._id === currentUserId;
                
                return (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-900/10 to-purple-900/10 rounded-xl border border-blue-700/20 hover:bg-gradient-to-r hover:from-blue-900/20 hover:to-purple-900/20 transition-all duration-300 hover:border-blue-600/40"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-blue-500/30 group-hover:ring-blue-400/50 transition-all duration-300 flex-shrink-0">
                        <AvatarFallback className="text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-white text-sm font-medium truncate">
                          {user.username}
                          {isCurrentUser && ' (You)'}
                        </span>
                        {isOwner && <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                        {isOnline ? (
                          <Wifi className="w-4 h-4 text-green-400 flex-shrink-0" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isOnline && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                          Online
                        </Badge>
                      )}
                      
                      {canRemoveUser(user._id) && !isCurrentUser && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:text-red-400 hover:bg-red-500/20 transition-all duration-200"
                          onClick={() => {
                            handleRemoveUser(user._id);
                          }}
                          aria-label="Remove User"
                        >
                          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', lineHeight: 1 }}>&times;</span>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {filteredUsers.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400 py-8"
            >
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-sm">No users found</p>
            </motion.div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChatSidebar; 