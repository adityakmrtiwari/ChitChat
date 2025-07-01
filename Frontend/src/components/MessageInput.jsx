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
  const sendBtnRef = useRef(null);
  const emojiBtnRef = useRef(null);

  // Auto-focus input on mobile
  useEffect(() => {
    if (inputRef.current && window.innerWidth <= 768) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    // Auto-grow textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + 'px'; // max 160px
    }
  };

  useEffect(() => {
    // Initial auto-grow on mount
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
      setShowEmojiPicker(false);
      // Animate send button
      if (sendBtnRef.current) {
        sendBtnRef.current.classList.add('animate-bounce-once');
        setTimeout(() => sendBtnRef.current.classList.remove('animate-bounce-once'), 400);
      }
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
      className="p-2 sm:p-4 bg-black/90 backdrop-blur-xl border-t border-blue-900/50 fixed bottom-0 left-0 right-0 z-40 shadow-2xl"
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
              className="text-gray-200 hover:text-white hover:bg-blue-500/20 transition-all duration-200 flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 min-w-[44px] min-h-[44px]"
              style={{ minWidth: 44, minHeight: 44 }}
              ref={emojiBtnRef}
            >
              <Smile className="w-6 h-6 sm:w-7 sm:h-7" />
            </Button>
          </motion.div>
          
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              placeholder={placeholder}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              rows={1}
              disabled={disabled}
              className="resize-none w-full min-h-[48px] max-h-40 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/50 text-black placeholder:text-black focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-base sm:text-lg rounded-xl backdrop-blur-sm py-3 px-4"
              style={{overflowY: 'auto'}}
            />
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="submit"
              disabled={!input.trim() || disabled}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 sm:px-7 py-3 sm:py-4 h-12 sm:h-14 disabled:opacity-50 disabled:hover:scale-100 hover:scale-105 transition-all duration-200 flex-shrink-0 rounded-xl font-medium shadow-lg min-w-[44px] min-h-[44px] animate-none"
              ref={sendBtnRef}
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <Send className="w-5 h-5 sm:w-6 sm:h-6 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </motion.div>
        </form>

        {/* Emoji Picker */}
        <EmojiPicker
          isOpen={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onEmojiSelect={handleEmojiSelect}
          anchorRef={emojiBtnRef}
          position="top"
        />
      </div>
      <style>{`
        @keyframes bounce-once {
          0% { transform: scale(1); }
          30% { transform: scale(1.15); }
          60% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        .animate-bounce-once {
          animation: bounce-once 0.4s cubic-bezier(.68,-0.55,.27,1.55) 1;
        }
      `}</style>
    </motion.div>
  );
};

export default MessageInput; 