import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => (
  <motion.footer 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="w-full bg-black/20 backdrop-blur-xl border-t border-white/20 text-white py-3 sm:py-4 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center mt-auto relative z-10"
  >
    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-300 text-center sm:text-left">
      <img src="/logo.jpeg" alt="ChitChat Logo" className="h-4 w-4 sm:h-5 sm:w-5 rounded-full object-cover" />
      &copy; {new Date().getFullYear()} ChitChat. All rights reserved.
    </div>
    <div className="flex gap-4 sm:gap-6 mt-2 sm:mt-0">
      <a 
        href="https://github.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-gray-300 hover:text-white font-medium transition-colors duration-200 text-xs sm:text-sm"
      >
        GitHub
      </a>
    </div>
  </motion.footer>
);

export default Footer; 