import React from 'react';
import PropTypes from 'prop-types';

/**
 * ErrorDisplay component for displaying error messages
 * 
 * @param {Object} props - Component props
 * @param {string|Object} props.error - Error message or object
 * @param {Function} props.onDismiss - Function to call when error is dismissed
 */
const ErrorDisplay = ({ error, onDismiss }) => {
  if (!error) return null;

  // Handle error object with type and message
  const isSuccess = error.type === 'success';
  const message = typeof error === 'string' ? error : error.message;
  
  return (
    <div className="absolute bottom-20 left-0 right-0 px-4">
      <div 
        className={`${isSuccess ? 'bg-green-500' : 'bg-red-500'} text-white p-3 rounded-md shadow-lg flex justify-between items-center`}
      >
        <span>{message}</span>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="ml-4 text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

ErrorDisplay.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      type: PropTypes.string,
      message: PropTypes.string
    })
  ]),
  onDismiss: PropTypes.func
};

export default ErrorDisplay;