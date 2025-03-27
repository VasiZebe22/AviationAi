import { useMemo } from 'react';

/**
 * Custom hook for message formatting utilities
 * 
 * @returns {Object} Object containing formatting functions
 */
const useMessageFormatting = () => {
  /**
   * Format a timestamp into a localized string
   * 
   * @param {string|Object} timestamp - Timestamp to format (ISO string or Firestore timestamp)
   * @param {Object} currentChat - Current chat object (used as fallback for timestamp)
   * @returns {string} Formatted timestamp string
   */
  const formatTimestamp = (timestamp, currentChat = null) => {
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
      
      // Fallback to chat creation time
      if (currentChat?.createdAt) {
        if (typeof currentChat.createdAt === 'string') {
          return new Date(currentChat.createdAt).toLocaleString();
        }
        if (currentChat.createdAt?.toDate) {
          return currentChat.createdAt.toDate().toLocaleString();
        }
      }
      
      return 'Date not available';
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Date not available';
    }
  };

  /**
   * Format markdown text to HTML
   * 
   * @param {string} text - Text with markdown formatting
   * @returns {string} HTML formatted text
   */
  const formatMarkdown = (text) => {
    // Replace markdown patterns with HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  };

  /**
   * Format message content with markdown and special formatting
   * 
   * @param {string} content - Message content to format
   * @returns {Array} Array of React elements representing formatted message
   */
  const formatMessage = (content) => {
    // Remove citation markers
    const cleanContent = content.replace(/【\d+:\d+†source】/g, '');
    
    return cleanContent.split('\n').map((paragraph, idx) => {
      if (!paragraph.trim()) return { type: 'spacer', key: idx };

      // Check for numbered lists
      const numberedListMatch = paragraph.match(/^(\d+)\.\s(.+)/);
      if (numberedListMatch) {
        const [_, number, text] = numberedListMatch;
        return {
          type: 'numberedList',
          key: idx,
          number,
          content: formatMarkdown(text)
        };
      }

      return {
        type: 'paragraph',
        key: idx,
        content: formatMarkdown(paragraph)
      };
    });
  };

  /**
   * Convert timestamp to a standardized format for comparison
   * 
   * @param {Date|string|Object} date - Date to convert
   * @returns {number} Timestamp in milliseconds
   */
  const getTimestamp = (date) => {
    if (date instanceof Date) {
      return date.getTime();
    }
    if (typeof date === 'string') {
      return new Date(date).getTime();
    }
    if (date?.toDate) {
      return date.toDate().getTime();
    }
    return 0; // fallback for invalid dates
  };

  return {
    formatTimestamp,
    formatMarkdown,
    formatMessage,
    getTimestamp
  };
};

export default useMessageFormatting;