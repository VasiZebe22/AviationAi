import React from 'react';
import PropTypes from 'prop-types';

/**
 * LoadingIndicator component for displaying various loading states
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Type of loading indicator to display
 * @param {string} props.message - Optional message to display with the loading indicator
 */
const LoadingIndicator = ({ type = 'default', message }) => {
  // Full-screen initializing spinner
  if (type === 'initializing') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">{message || 'Initializing application...'}</p>
        </div>
      </div>
    );
  }

  // Message typing dots
  if (type === 'typing') {
    return (
      <div className="flex items-start">
        <div className="max-w-[80%] bg-surface-DEFAULT rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-accent-lilac rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-accent-lilac rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
            <div className="w-2 h-2 bg-accent-lilac rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Inline loading spinner
  if (type === 'inline') {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-accent-lilac"></div>
        {message && <span className="text-sm text-gray-400">{message}</span>}
      </div>
    );
  }

  // Button loading spinner
  if (type === 'button') {
    return (
      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
    );
  }

  // Default loading dots
  return (
    <div className="flex items-center justify-center py-4">
      <div className="w-2 h-2 bg-accent-lilac rounded-full animate-pulse"></div>
      <div className="w-2 h-2 bg-accent-lilac rounded-full animate-pulse mx-1" style={{ animationDelay: '300ms' }}></div>
      <div className="w-2 h-2 bg-accent-lilac rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
    </div>
  );
};

LoadingIndicator.propTypes = {
  type: PropTypes.oneOf(['initializing', 'typing', 'inline', 'button', 'default']),
  message: PropTypes.string
};

export default LoadingIndicator;