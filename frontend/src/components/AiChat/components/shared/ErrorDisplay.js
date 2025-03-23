import React from 'react';

/**
 * Reusable component for displaying error messages
 * @param {Object} props - Component props
 * @param {string|null} props.error - The error message to display
 * @param {Function} props.onDismiss - Optional function to call when dismissing the error
 * @param {string} props.className - Optional additional classes
 */
const ErrorDisplay = ({ error, onDismiss, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`bg-red-900 bg-opacity-70 text-white p-4 rounded-lg mb-4 flex items-center justify-between ${className}`}>
      <div className="flex items-center">
        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{error}</span>
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss} 
          className="ml-4 text-white hover:text-red-200 transition-colors"
          aria-label="Dismiss error"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
