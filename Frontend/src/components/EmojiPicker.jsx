import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactDOM from 'react-dom';

const EmojiPicker = ({ isOpen, onClose, onEmojiSelect, anchorRef }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const pickerRef = useRef(null);
  const emojiList = ['😀','😂','😍','😎','😊','😢','😡','👍','🙏','👏','💯','🔥','🎉','🥳','😴','🤔','😇','😱','😅','😆','😉','😋','😜','😝','🤪','🤩','🥰','😘','😗','😙','😚','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕'];
  const filtered = searchTerm ? emojiList.filter(e => e.includes(searchTerm)) : emojiList;
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) onClose();
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen, anchorRef]);

  if (!isOpen) return null;

  const picker = (
    <AnimatePresence>
      <motion.div
        ref={pickerRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="z-50 w-72 max-w-[95vw] bg-gradient-to-br from-black via-gray-900 to-gray-800 border border-white/10 rounded-2xl shadow-2xl p-3 absolute"
        style={anchorRef?.current ? {
          top: coords.top - 220 - 16, // picker height + 16px margin
          left: coords.left + coords.width / 2,
          transform: 'translate(-50%, 0)',
          maxHeight: '40vh',
          overflowY: 'auto'
        } : {
          left: '50%',
          bottom: '80px',
          transform: 'translateX(-50%)',
          maxHeight: '40vh',
          overflowY: 'auto',
          position: 'fixed'
        }}
      >
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search emojis..."
          className="w-full mb-2 px-3 py-2 rounded bg-black/40 text-white border border-white/10 focus:outline-none"
        />
        <div className="grid grid-cols-8 gap-1">
          {filtered.length > 0 ? filtered.map((emoji, i) => (
            <button
              key={i}
              onClick={() => onEmojiSelect(emoji)}
              className="h-8 w-8 text-lg rounded hover:bg-white/10 focus:bg-white/10 transition-all"
            >
              {emoji}
            </button>
          )) : (
            <div className="col-span-8 text-center text-gray-400 py-4">No emojis</div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );

  // Use portal to body for z-index
  return anchorRef?.current ? ReactDOM.createPortal(picker, document.body) : picker;
};

export default EmojiPicker; 