import React from 'react';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';

/**
 * Message component that delegates to specific message type components
 * 
 * This component acts as a factory that renders the appropriate message
 * component based on the message type (user or assistant)
 * 
 * @param {Object} props - Component props
 * @param {Object} props.message - The message object to render
 * @param {boolean} props.isLastMessage - Whether this is the last message in the list
 * @param {boolean} props.isTyping - Whether typing animation is active
 * @param {string} props.displayedContent - Current content for typing animation
 * @param {Function} props.renderTypingCursor - Function to render typing cursor
 * @param {Function} props.renderMessageContent - Function to render message content
 * @param {Function} props.formatTimestamp - Function to format timestamps
 * @param {boolean} props.isBookmarked - Whether message is bookmarked
 * @param {Function} props.onToggleBookmark - Function to toggle bookmark
 * @param {string} props.chatId - Current chat ID
 */
const Message = ({
  message,
  isLastMessage,
  isTyping,
  displayedContent,
  renderTypingCursor,
  renderMessageContent,
  formatTimestamp,
  isBookmarked,
  onToggleBookmark,
  chatId
}) => {
  // Common props for both message types
  const commonProps = {
    message,
    isLastMessage,
    isTyping,
    displayedContent,
    renderTypingCursor,
    renderMessageContent,
    formatTimestamp,
    isBookmarked,
    onToggleBookmark,
    chatId
  };

  // Render the appropriate message component based on type
  if (message.type === 'user') {
    return <UserMessage {...commonProps} />;
  } else if (message.type === 'assistant') {
    return <AssistantMessage {...commonProps} />;
  }
  
  // Fallback for unknown message types
  return null;
};

export default Message;
