import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Smile, Heart, ThumbsUp, Star, Zap, Coffee, Rocket, Flower, Gamepad2 } from 'lucide-react';

const EmojiPicker = ({ isOpen, onClose, onEmojiSelect, position = 'bottom' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('recent');
  const [recentEmojis, setRecentEmojis] = useState([]);
  const pickerRef = useRef(null);

  // Emoji categories with icons
  const categories = [
    { id: 'recent', name: 'Recent', icon: <Star className="w-4 h-4" /> },
    { id: 'smileys', name: 'Smileys', icon: <Smile className="w-4 h-4" /> },
    { id: 'hearts', name: 'Hearts', icon: <Heart className="w-4 h-4" /> },
    { id: 'gestures', name: 'Gestures', icon: <ThumbsUp className="w-4 h-4" /> },
    { id: 'nature', name: 'Nature', icon: <Flower className="w-4 h-4" /> },
    { id: 'food', name: 'Food', icon: <Coffee className="w-4 h-4" /> },
    { id: 'activities', name: 'Activities', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'objects', name: 'Objects', icon: <Zap className="w-4 h-4" /> },
    { id: 'symbols', name: 'Symbols', icon: <Rocket className="w-4 h-4" /> },
  ];

  // Emoji data organized by categories
  const emojiData = {
    recent: [],
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'],
    hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
    gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏'],
    nature: ['🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '☃️', '⛄', '❄️', '🌬️', '💨', '💧', '💦', '☔', '☂️', '🌊', '🌫️'],
    food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '🫖', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍷', '🥂', '🥃', '🍸', '🍹', '🧉', '🍾', '🥄', '🍴', '🍽️', '🥄', '🔪', '🏺'],
    activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏊', '🏊‍♂️', '🏊‍♀️', '🚣', '🚣‍♂️', '🚣‍♀️', '🏄', '🏄‍♂️', '🏄‍♀️', '🚴', '🚴‍♂️', '🚴‍♀️', '🚵', '🚵‍♂️', '🚵‍♀️', '🤹', '🤹‍♂️', '🤹‍♀️', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩', '🎨', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '🧮', '🎥', '📺', '📻', '📷', '📸', '📹', '📼', '🔍', '🔎', '🕯️', '💡', '🔦', '🏮', '🪔', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '📰', '🗞️', '📑', '🔖', '🏷️', '💰', '🪙', '💴', '💵', '💶', '💷', '🪙', '💳', '🧾', '💸', '🪙', '💴', '💵', '💶', '💷', '🪙', '💳', '🧾', '💸'],
    objects: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '🧮', '🎥', '📺', '📻', '📷', '📸', '📹', '📼', '🔍', '🔎', '🕯️', '💡', '🔦', '🏮', '🪔', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '📰', '🗞️', '📑', '🔖', '🏷️', '💰', '🪙', '💴', '💵', '💶', '💷', '🪙', '💳', '🧾', '💸', '🪙', '💴', '💵', '💶', '💷', '🪙', '💳', '🧾', '💸'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '♾️', '💲', '💱', '™️', '©️', '®️', '👁️‍🗨️', '🔚', '🔙', '🔛', '🔝', '🔜', '〰️', '➰', '➿', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧'],
  };

  // Load recent emojis from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentEmojis');
    if (saved) {
      setRecentEmojis(JSON.parse(saved));
      emojiData.recent = JSON.parse(saved);
    }
  }, []);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle emoji selection
  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
    
    // Add to recent emojis
    const newRecent = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 20);
    setRecentEmojis(newRecent);
    localStorage.setItem('recentEmojis', JSON.stringify(newRecent));
    
    onClose();
  };

  // Filter emojis based on search
  const getFilteredEmojis = () => {
    if (searchTerm) {
      const allEmojis = Object.values(emojiData).flat();
      return allEmojis.filter(emoji => 
        emoji.includes(searchTerm) || 
        categories.find(cat => cat.id === activeCategory)?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return emojiData[activeCategory] || [];
  };

  const filteredEmojis = getFilteredEmojis();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={pickerRef}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`emoji-picker fixed z-50 bg-black/95 backdrop-blur-xl border border-blue-500/30 rounded-xl shadow-2xl p-3 sm:p-4 ${
          position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
        } left-1/2 -translate-x-1/2`}
        style={{ 
          minWidth: 280, 
          maxWidth: 'calc(100vw - 2rem)',
          maxHeight: '60vh'
        }}
      >
        {/* Search Bar */}
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search emojis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-blue-900/20 border-blue-700/50 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/50 text-sm transition-all duration-200"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 mb-3 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              size="sm"
              variant={activeCategory === category.id ? "default" : "ghost"}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-shrink-0 h-8 px-2 transition-all duration-200 ${
                activeCategory === category.id 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-blue-500/20'
              }`}
            >
              {category.icon}
            </Button>
          ))}
        </div>

        {/* Emoji Grid */}
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 max-h-48 sm:max-h-64 overflow-y-auto scrollbar-hide">
          {filteredEmojis.length > 0 ? (
            filteredEmojis.map((emoji, index) => (
              <motion.button
                key={`${emoji}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => handleEmojiClick(emoji)}
                className="h-8 w-8 sm:h-10 sm:w-10 text-base sm:text-lg hover:bg-blue-500/20 hover:scale-110 transition-all duration-200 rounded-lg flex items-center justify-center"
              >
                {emoji}
              </motion.button>
            ))
          ) : (
            <div className="col-span-6 sm:col-span-8 text-center text-gray-400 py-8">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-sm">No emojis found</p>
            </div>
          )}
        </div>

        {/* Recent Emojis Preview */}
        {recentEmojis.length > 0 && !searchTerm && activeCategory === 'recent' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 pt-3 border-t border-blue-700/30"
          >
            <p className="text-xs text-gray-400 mb-2">Recently Used</p>
            <div className="flex gap-1 flex-wrap">
              {recentEmojis.slice(0, 8).map((emoji, index) => (
                <motion.button
                  key={`recent-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleEmojiClick(emoji)}
                  className="h-6 w-6 sm:h-8 sm:w-8 text-xs sm:text-sm hover:bg-blue-500/20 hover:scale-110 transition-all duration-200 rounded-lg flex items-center justify-center"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default EmojiPicker; 