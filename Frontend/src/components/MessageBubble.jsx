import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, ThumbsUp, Smile, Crown, Copy, Check } from 'lucide-react';
import dayjs from '@/lib/dayjs';

const MessageBubble = ({ 
  message, 
  currentUserId, 
  roomOwner, 
  onAddReaction,
  isOwnMessage = false 
}) => {
  const reactions = [
    { icon: <Heart className="w-4 h-4" />, value: 'heart', emoji: '❤️' },
    { icon: <ThumbsUp className="w-4 h-4" />, value: 'thumbsup', emoji: '👍' },
    { icon: <Smile className="w-4 h-4" />, value: 'smile', emoji: '😊' }
  ];

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      // You can add a toast notification here
    } catch (err) {
      console.error('Failed to copy message');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4 group`}
    >
      <div className={`max-w-[95%] sm:max-w-[90%] md:max-w-[70%] lg:max-w-[50%] relative ${
        isOwnMessage ? 'message-bubble-own' : 'message-bubble-other'
      }`}>
        <Card className={`backdrop-blur-xl shadow-2xl border-0 overflow-hidden ${
          isOwnMessage 
            ? 'bg-gradient-to-br from-blue-600/90 to-purple-600/90' 
            : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50'
        } hover:shadow-blue-500/20 transition-all duration-300`}>
          <CardContent className="p-3 sm:p-4">
            {/* Message Header */}
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8 ring-2 ring-blue-500/30 hover:ring-blue-400/50 transition-all duration-300 flex-shrink-0">
                <AvatarFallback className={`text-xs sm:text-sm font-semibold ${
                  isOwnMessage 
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white' 
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                }`}>
                  {message.sender?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                <span className="text-white text-sm font-medium truncate">
                  {message.sender?.username || 'Unknown'}
                  {isOwnMessage && ' (You)'}
                </span>
                {message.sender?._id === roomOwner && <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 flex-shrink-0" />}
              </div>
              
              {/* Copy Message Button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyMessage}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 h-6 w-6 sm:h-8 sm:w-8 p-0"
              >
                <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
            
            {/* Message Content */}
            <div className="relative">
              <p className="text-white text-sm sm:text-base leading-relaxed break-words">
                {message.content}
              </p>
              
              {/* Message Timestamp */}
              <div className="flex justify-between items-center mt-2 sm:mt-3">
                <div className="flex gap-1">
                  {reactions.map((reaction) => (
                    <motion.button
                      key={reaction.value}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onAddReaction(message._id, reaction.value)}
                      className={`h-6 w-6 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        message.reactions?.[currentUserId] === reaction.value 
                          ? 'bg-blue-500/30 text-blue-300 shadow-lg' 
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {reaction.icon}
                    </motion.button>
                  ))}
                </div>
                <p className="text-xs text-gray-300 font-mono">
                  {dayjs(message.createdAt).fromNow()}
                </p>
              </div>
            </div>
            
            {/* Reactions Display */}
            {message.reactions && Object.values(message.reactions).length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-1 sm:gap-2 mt-2 sm:mt-3 flex-wrap"
              >
                {Object.entries(message.reactions).map(([userId, reaction]) => (
                  <span 
                    key={userId} 
                    className="text-xs bg-black/30 backdrop-blur-sm text-gray-300 px-2 py-1 rounded-full border border-gray-600/50"
                  >
                    {reactions.find(r => r.value === reaction)?.emoji || reaction}
                  </span>
                ))}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default MessageBubble; 