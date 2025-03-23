/**
 * Utility functions for error handling and reporting
 */

/**
 * Process Firebase/Firestore errors and return user-friendly messages
 * @param {Error} error - The error object to process
 * @param {string} defaultMessage - Default message to show if error can't be processed
 * @returns {string} User-friendly error message
 */
export const processFirestoreError = (error, defaultMessage = 'An error occurred. Please try again later.') => {
  if (!error) return defaultMessage;
  
  const errorMessage = error.message || '';
  
  // Handle common Firebase/Firestore errors
  if (errorMessage.includes('requires an index')) {
    return 'Database initialization required. Please contact the administrator to set up the required indexes.';
  }
  
  if (errorMessage.includes('permission-denied')) {
    return 'You do not have permission to access this data. Please sign in again or contact support.';
  }
  
  if (errorMessage.includes('network-request-failed')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  
  // Return the error message or a default message
  return errorMessage || defaultMessage;
};

/**
 * Log errors to console with contextual information
 * @param {string} context - The context where the error occurred
 * @param {Error} error - The error that occurred
 */
export const logError = (context, error) => {
  console.error(`Error in ${context}:`, error);
  
  // Could be extended to send errors to a monitoring service
};
