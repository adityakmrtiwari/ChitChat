import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import dayjs from '@/lib/dayjs';
import { Copy, Heart, ThumbsUp, Smile, Trash2 } from 'lucide-react';

const MessageBubble = ({ message, currentUserId, roomOwner, onAddReaction, isOwnMessage = false, onDelete = () => {}, onCopy = () => {}, isGrouped = false }) => {
  const [copySuccess, setCopySuccess] = useState('');
  const [selected, setSelected] = useState(false);
  const bubbleRef = useRef(null);
  if (!message) return null;
  const canDelete = (
    // User can delete their own message
    message.sender?._id === currentUserId ||
    // Room owner can delete any message except admin's
    (currentUserId === roomOwner && message.sender?.role !== 'admin')
  );
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopySuccess('Copied!');
      onCopy(message.content);
      setTimeout(() => setCopySuccess(''), 1200);
    } catch {
      setCopySuccess('Failed');
    }
  };
  // Deselect on click outside
  useEffect(() => {
    function handleClick(e) {
      if (bubbleRef.current && !bubbleRef.current.contains(e.target)) setSelected(false);
    }
    if (selected) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [selected]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mb-1' : 'mb-3 sm:mb-4'}`}
      ref={bubbleRef}
      tabIndex={0}
      onClick={() => setSelected(s => !s)}
      style={{ cursor: 'pointer' }}
    >
      <motion.div
        className={`relative rounded-2xl px-4 py-3 md:py-3.5 md:px-5 border border-white/10 shadow-md transition-all duration-200
          ${isOwnMessage
            ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white'
            : 'bg-white/90 text-gray-900'}
          ${selected ? 'ring-2 ring-blue-400/60 shadow-blue-400/20 scale-[1.03]' : ''}
          inline-flex flex-col min-w-[64px] max-w-[90vw] sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] w-fit'
        `}
        animate={selected ? { scale: 1.03, boxShadow: '0 0 0 4px #60a5fa44' } : { scale: 1 }}
      >
        {/* Only show avatar and username if not grouped */}
        {!isGrouped && (
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm">
              {message.sender?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="font-medium truncate text-xs md:text-sm">
              {message.sender?.username || 'Unknown'}{isOwnMessage && ' (You)'}
            </span>
            {message.sender?._id === roomOwner && <span className="ml-1 text-yellow-400 text-base">&#x1F451;</span>}
          </div>
        )}
        {/* Copy and Delete icons aligned top right, with hover effect only for icons */}
        {selected && !message.deleted && (
          <div className="absolute top-2 right-2 flex gap-2 z-10">
            <button
              onClick={e => { e.stopPropagation(); handleCopy(); }}
              className="text-gray-400 hover:text-green-700 transition-all text-xs p-1 rounded-full bg-white/0 hover:bg-white/20"
              title="Copy message"
            >
              <Copy className="w-4 h-4" />
            </button>
            {canDelete && (
              <button
                onClick={e => { e.stopPropagation(); if (window.confirm('Delete this message?')) onDelete(message._id); }}
                className="text-red-400 hover:text-red-600 text-xs p-1 rounded-full bg-white/0 hover:bg-red-100/40"
                aria-label="Delete Message"
                title="Delete message"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <div className="mb-2">
          {message.deleted ? (
            <p className="italic text-gray-400 text-sm">This message was deleted.</p>
          ) : (
            <p className="whitespace-pre-line break-words text-sm md:text-base">{message.content}</p>
          )}
        </div>
        <div className={`flex justify-between items-end mt-2 px-2${selected && !message.deleted ? ' pt-2' : ''}`}>
          <div className="flex gap-2">
            {selected && !message.deleted && (
              <>
                <button onClick={e => { e.stopPropagation(); onAddReaction(message._id, 'heart'); }} className="text-gray-400 hover:text-pink-400 transition-all p-1 rounded-full" title="React: Heart"><Heart className="w-4 h-4" /></button>
                <button onClick={e => { e.stopPropagation(); onAddReaction(message._id, 'thumbsup'); }} className="text-gray-400 hover:text-blue-400 transition-all p-1 rounded-full" title="React: Thumbs Up"><ThumbsUp className="w-4 h-4" /></button>
                <button onClick={e => { e.stopPropagation(); onAddReaction(message._id, 'smile'); }} className="text-gray-400 hover:text-yellow-400 transition-all p-1 rounded-full" title="React: Smile"><Smile className="w-4 h-4" /></button>
              </>
            )}
            {/* Show reactions summary if any */}
            {message.reactions && Object.values(message.reactions).length > 0 && (
              <span className="ml-2 text-xs text-gray-700 flex gap-1 items-center">
                {Object.values(message.reactions).map((r, i) => {
                  if (r === 'heart') return <Heart key={i} className="inline w-3 h-3 text-pink-400" />;
                  if (r === 'thumbsup') return <ThumbsUp key={i} className="inline w-3 h-3 text-blue-400" />;
                  if (r === 'smile') return <Smile key={i} className="inline w-3 h-3 text-yellow-400" />;
                  return null;
                })}
              </span>
            )}
          </div>
          {/* Timestamp inside bubble, bottom right */}
          <span className="text-xs text-gray-500 font-mono ml-2 self-end">{dayjs(message.createdAt).format('HH:mm')}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MessageBubble; 