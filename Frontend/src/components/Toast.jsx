import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const toastConfig = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/40',
      textColor: 'text-green-300',
      iconColor: 'text-green-400'
    },
    error: {
      icon: <AlertCircle className="w-5 h-5" />,
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/40',
      textColor: 'text-red-300',
      iconColor: 'text-red-400'
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5" />,
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/40',
      textColor: 'text-yellow-300',
      iconColor: 'text-yellow-400'
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/40',
      textColor: 'text-blue-300',
      iconColor: 'text-blue-400'
    }
  };

  const config = toastConfig[type];

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed ${positionClasses[position]} z-50 max-w-sm w-full`}
        >
          <div className={`${config.bgColor} ${config.borderColor} border backdrop-blur-xl rounded-lg p-4 shadow-2xl`}>
            <div className="flex items-start gap-3">
              <div className={`${config.iconColor} flex-shrink-0 mt-0.5`}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`${config.textColor} text-sm font-medium`}>
                  {message}
                </p>
              </div>
              <button
                onClick={handleClose}
                className={`${config.textColor} hover:text-white transition-colors flex-shrink-0`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast; 