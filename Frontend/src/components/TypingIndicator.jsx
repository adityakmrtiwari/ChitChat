import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const TypingIndicator = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex justify-start mb-3 sm:mb-4"
      >
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-xl border border-blue-700/30 shadow-lg max-w-xs sm:max-w-sm">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="flex space-x-1">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                className="w-2 h-2 bg-blue-400 rounded-full shadow-sm"
              />
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
                className="w-2 h-2 bg-blue-400 rounded-full shadow-sm"
              />
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4, ease: "easeInOut" }}
                className="w-2 h-2 bg-blue-400 rounded-full shadow-sm"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-200 font-medium">
                {typingUsers.map(u => u.username).join(', ')}
              </span>
              <span className="text-xs text-gray-400">
                {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default TypingIndicator; 