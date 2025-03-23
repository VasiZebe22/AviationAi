import React from 'react';
import BookmarkButton from '../shared/BookmarkButton';

/**
 * Component for rendering user messages
 * 
 * User messages are styled differently from assistant messages and
 * appear on the right side of the chat window
 * 
 * @param {Object} props - Component props
 * @param {Object} props.message - The message object to render
 * @param {Function} props.formatTimestamp - Function to format timestamps
 * @param {boolean} props.isBookmarked - Whether message is bookmarked
 * @param {Function} props.onToggleBookmark - Function to toggle bookmark
 * @param {string} props.chatId - Current chat ID
 */
const UserMessage = ({
  message,
  formatTimestamp,
  isBookmarked,
  onToggleBookmark,
  chatId
}) => {
  return (
    <div className="message user-message opacity-100 group">
      <div className="message-container user-container ml-auto relative">
        <div className="message-content user-content">
          <p className="text-sm text-gray-200">{message.content}</p>
        </div>
        <div className="message-meta">
          <span className="message-time">{formatTimestamp(message.timestamp)}</span>
        </div>
        <BookmarkButton
          message={message}
          isBookmarked={isBookmarked}
          onToggle={() => onToggleBookmark(message)}
          messageType="user"
          chatId={chatId}
        />
      </div>
    </div>
  );
};

export default UserMessage;
