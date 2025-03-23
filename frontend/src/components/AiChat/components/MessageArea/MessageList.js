import React, { useRef, useEffect } from 'react';
import Message from './Message';

/**
 * Component for displaying and organizing the list of chat messages
 * 
 * Handles scrolling to the bottom when new messages arrive and
 * manages the message display container
 * 
 * @param {Object} props - Component props
 * @param {Array} props.messages - Array of message objects to display
 * @param {boolean} props.isTyping - Whether typing animation is active
 * @param {string} props.displayedContent - Content for typing animation
 * @param {Function} props.renderTypingCursor - Function to render typing cursor
 * @param {Function} props.renderMessageContent - Function to render message content
 * @param {Function} props.formatTimestamp - Function to format timestamps
 * @param {Array} props.bookmarkedMessageIds - Array of IDs of bookmarked messages
 * @param {Function} props.onToggleBookmark - Function to toggle bookmark status
 * @param {string} props.chatId - Current chat ID
 * @param {boolean} props.showBookmarkedOnly - Whether to show only bookmarked messages
 */
const MessageList = ({
  messages,
  isTyping,
  displayedContent,
  renderTypingCursor,
  renderMessageContent,
  formatTimestamp,
  bookmarkedMessageIds = [],
  onToggleBookmark,
  chatId,
  showBookmarkedOnly = false
}) => {
  // Create a ref for scrolling to the bottom of the message list
  const messagesEndRef = useRef(null);

  // Filter messages if bookmarked-only mode is enabled
  const filteredMessages = showBookmarkedOnly
    ? messages.filter(msg => 
        bookmarkedMessageIds.includes(msg.messageId || 
        (msg.timestamp && msg.type))) // Fallback identifier if messageId not available
    : messages;

  // Scroll to bottom when messages change or when typing status changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, displayedContent]);

  // Function to scroll to the bottom of the messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  return (
    <div className="chat-messages">
      {filteredMessages.length === 0 ? (
        <div className="empty-chat-message">
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        filteredMessages.map((message, index) => {
          // Determine if this is the last message (for typing animation)
          const isLastMessage = index === filteredMessages.length - 1;
          
          // Check if message is bookmarked
          const isBookmarked = bookmarkedMessageIds.includes(
            message.messageId || (message.timestamp && message.type)
          );
          
          return (
            <Message
              key={message.messageId || `${message.timestamp}-${message.type}-${index}`}
              message={message}
              isLastMessage={isLastMessage}
              isTyping={isTyping}
              displayedContent={displayedContent}
              renderTypingCursor={renderTypingCursor}
              renderMessageContent={renderMessageContent}
              formatTimestamp={formatTimestamp}
              isBookmarked={isBookmarked}
              onToggleBookmark={onToggleBookmark}
              chatId={chatId}
            />
          );
        })
      )}
      {/* This empty div is used as a target for scrolling to the bottom */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
