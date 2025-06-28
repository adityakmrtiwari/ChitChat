import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Smile, Send, Paperclip } from 'lucide-react';
import EmojiPicker from './EmojiPicker';

const MessageInput = ({ onSend, disabled = false, placeholder = "Type your message..." }) => {
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus input on mobile
  useEffect(() => {
    if (inputRef.current && window.innerWidth <= 768) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
      setShowEmojiPicker(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setInput(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="p-3 sm:p-4 bg-black/95 backdrop-blur-xl border-t border-blue-900/50 fixed bottom-0 left-0 right-0 z-40 shadow-2xl"
    >
      <div className="max-w-4xl mx-auto w-full relative">
        <form onSubmit={handleSend} className="flex gap-2 sm:gap-3 items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-200 hover:text-white hover:bg-blue-500/20 transition-all duration-200 flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12"
            >
              <Smile className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </motion.div>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="h-10 sm:h-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/50 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-sm sm:text-base rounded-xl backdrop-blur-sm"
              disabled={disabled}
            />
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="submit"
              disabled={!input.trim() || disabled}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 h-10 sm:h-12 disabled:opacity-50 disabled:hover:scale-100 hover:scale-105 transition-all duration-200 flex-shrink-0 rounded-xl font-medium shadow-lg"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </motion.div>
        </form>

        {/* Emoji Picker */}
        <EmojiPicker
          isOpen={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onEmojiSelect={handleEmojiSelect}
          position="top"
        />
      </div>
    </motion.div>
  );
};

export default MessageInput; 