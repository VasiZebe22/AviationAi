/**
 * Utility functions for formatting dates and timestamps
 */

/**
 * Format a timestamp to a localized string
 * @param {string|object} timestamp - The timestamp to format (ISO string or Firestore timestamp)
 * @param {object} fallbackSource - Optional object containing a fallback timestamp
 * @returns {string} The formatted date string
 */
export const formatTimestamp = (timestamp, fallbackSource = null) => {
  try {
    // Handle ISO string timestamps (from message.timestamp)
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString();
      }
    }
    
    // Handle Firestore timestamps (from createdAt/updatedAt)
    if (typeof timestamp === 'object' && timestamp?.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    
    // Fallback to source time if provided
    if (fallbackSource) {
      if (fallbackSource.createdAt) {
        if (typeof fallbackSource.createdAt === 'string') {
          return new Date(fallbackSource.createdAt).toLocaleString();
        }
        if (fallbackSource.createdAt?.toDate) {
          return fallbackSource.createdAt.toDate().toLocaleString();
        }
      }
    }
    
    return 'Date not available';
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Date not available';
  }
};
