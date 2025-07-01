import React from 'react';

const LoadingSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto mt-8">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 animate-pulse"
        >
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-900/30 to-purple-900/30" />
          <div className="flex-1">
            <div className="h-4 sm:h-5 w-3/4 bg-gradient-to-r from-gray-700/40 to-gray-800/40 rounded mb-2" />
            <div className="h-3 sm:h-4 w-1/2 bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton; 