import React from 'react';
import { formatMarkdown, removeCitationMarkers, parseNumberedListItem } from '../utils/messageFormatting';

/**
 * Custom hook for message formatting and rendering
 * @returns {Object} Methods for formatting and rendering messages
 */
const useMessageFormatting = () => {
  /**
   * Format message content into React components
   * @param {string} content - Raw message content
   * @returns {Array<JSX.Element>} Formatted content as React components
   */
  const formatMessage = (content) => {
    // Remove citation markers
    const cleanContent = removeCitationMarkers(content);
    
    return cleanContent.split('\n').map((paragraph, idx) => {
      if (!paragraph.trim()) return <div key={idx} className="h-2" />;

      // Check for numbered lists
      const listItem = parseNumberedListItem(paragraph);
      if (listItem) {
        return (
          <div key={idx} className="flex items-start space-x-2 mb-2">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-lilac bg-opacity-20 flex items-center justify-center">
              <span className="text-sm text-accent-lilac">{listItem.number}</span>
            </div>
            <p className="text-sm mt-0.5 text-gray-200 flex-1">
              <span dangerouslySetInnerHTML={{ __html: formatMarkdown(listItem.text) }} />
            </p>
          </div>
        );
      }

      return (
        <p key={idx} className="text-sm mb-2 text-gray-200" 
           dangerouslySetInnerHTML={{ __html: formatMarkdown(paragraph) }} />
      );
    });
  };

  /**
   * Render message content with typing animation if needed
   * @param {Object} message - The message object
   * @param {boolean} isLastMessage - Whether this is the last message
   * @param {boolean} isTyping - Whether typing animation is active
   * @param {string} displayedContent - Current content to display during typing animation
   * @param {Function} renderTypingCursor - Function to render the typing cursor
   * @returns {JSX.Element} Rendered message content
   */
  const renderMessageContent = (message, isLastMessage, isTyping, displayedContent, renderTypingCursor) => {
    if (message.type === 'assistant' && isLastMessage && isTyping) {
      // Remove citation markers from displayed content
      const cleanContent = removeCitationMarkers(displayedContent);
      
      return cleanContent.split('\n').map((paragraph, idx) => {
        if (!paragraph.trim()) return <div key={idx} className="h-2" />;

        // Check for numbered lists in typing animation
        const listItem = parseNumberedListItem(paragraph);
        if (listItem) {
          return (
            <div key={idx} className="flex items-start space-x-2 mb-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-lilac bg-opacity-20 flex items-center justify-center">
                <span className="text-sm text-accent-lilac">{listItem.number}</span>
              </div>
              <p className="text-sm mt-0.5 text-gray-200 flex-1">
                <span dangerouslySetInnerHTML={{ __html: formatMarkdown(listItem.text) }} />
                {idx === cleanContent.split('\n').length - 1 && renderTypingCursor()}
              </p>
            </div>
          );
        }
        
        // For the last paragraph, add the cursor
        if (idx === cleanContent.split('\n').length - 1) {
          return (
            <p key={idx} className="text-sm mb-2 text-gray-200">
              <span dangerouslySetInnerHTML={{ __html: formatMarkdown(paragraph) }} />
              {renderTypingCursor()}
            </p>
          );
        }
        
        return (
          <p key={idx} className="text-sm mb-2 text-gray-200"
             dangerouslySetInnerHTML={{ __html: formatMarkdown(paragraph) }} />
        );
      });
    }
    
    return formatMessage(message.content);
  };

  return {
    formatMessage,
    renderMessageContent
  };
};

export default useMessageFormatting;
