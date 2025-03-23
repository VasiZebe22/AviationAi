import React from 'react';
import BookmarkButton from '../shared/BookmarkButton';

/**
 * Component for rendering assistant (AI) messages
 * 
 * Assistant messages display on the left side of the chat and can
 * include a typing animation effect for the latest message
 * 
 * @param {Object} props - Component props
 * @param {Object} props.message - The message object to render
 * @param {boolean} props.isLastMessage - Whether this is the last message
 * @param {boolean} props.isTyping - Whether typing animation is active
 * @param {string} props.displayedContent - Content to display during typing animation
 * @param {Function} props.renderTypingCursor - Function to render the typing cursor
 * @param {Function} props.renderMessageContent - Function to render formatted message content
 * @param {Function} props.formatTimestamp - Function to format timestamps
 * @param {boolean} props.isBookmarked - Whether the message is bookmarked
 * @param {Function} props.onToggleBookmark - Function to toggle bookmark status
 * @param {string} props.chatId - The ID of the current chat
 */
const AssistantMessage = ({
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
  // Determine if we should show typing animation based on whether:
  // 1. This is the last message in the conversation
  // 2. The typing animation is currently active
  const showTypingAnimation = isLastMessage && isTyping;
  
  // Determine opacity for animation effect
  // If typing or not the last message, show full opacity immediately
  const opacity = message.isTyping && !showTypingAnimation 
    ? '0' 
    : '100';

  return (
    <div className={`message assistant-message opacity-${opacity} group`}>
      <div className="message-container assistant-container mr-auto relative">
        <div className="message-content assistant-content">
          {showTypingAnimation
            ? renderMessageContent(message, isLastMessage, isTyping, displayedContent, renderTypingCursor)
            : renderMessageContent(message, false, false, "", null)
          }
        </div>
        <div className="message-meta">
          <span className="message-time">{formatTimestamp(message.timestamp)}</span>
        </div>
        <BookmarkButton
          message={message}
          isBookmarked={isBookmarked}
          onToggle={() => onToggleBookmark(message)}
          messageType="assistant"
          chatId={chatId}
        />
      </div>
    </div>
  );
};

export default AssistantMessage;
