import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-accent-lilac-light border-t-accent-lilac animate-spin"></div>
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-accent-lilac opacity-30"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
