import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * BookmarkButton component for toggling bookmark status of messages
 * 
 * @param {Object} props - Component props
 * @param {Object} props.message - The message object
 * @param {boolean} props.isBookmarked - Whether the message is bookmarked
 * @param {Function} props.onToggle - Function to call when toggling bookmark status
 * @param {string} props.messageType - Type of message ('user' or 'assistant')
 * @param {string} props.chatId - ID of the current chat
 */
const BookmarkButton = ({ message, isBookmarked, onToggle, messageType, chatId }) => {
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked);
  const [isInitialRender, setIsInitialRender] = useState(true);

  // Reset state when chat or message changes
  useEffect(() => {
    setLocalBookmarked(isBookmarked);
    setIsInitialRender(true);
  }, [isBookmarked, chatId, message.messageId]);

  useEffect(() => {
    if (isInitialRender) {
      const timer = setTimeout(() => setIsInitialRender(false), 0);
      return () => clearTimeout(timer);
    }
  }, [isInitialRender]);

  const handleClick = async (e) => {
    e.stopPropagation();
    setLocalBookmarked(!localBookmarked);
    await onToggle(e);
  };

  return (
    <button
      onClick={handleClick}
      className={`absolute ${
        messageType === 'user' ? 'left-0 -translate-x-[110%]' : 'right-0 translate-x-[110%]'
      } top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-dark-lightest ${
        isInitialRender ? '' : 'transition-all duration-200'
      } ${
        localBookmarked 
          ? 'opacity-100 text-accent-lilac' 
          : `opacity-0 ${!isInitialRender ? 'group-hover:opacity-100' : ''} text-gray-400`
      }`}
      title={localBookmarked ? "Remove bookmark" : "Bookmark message"}
    >
      <svg 
        className="w-5 h-5" 
        fill={localBookmarked ? "currentColor" : "none"} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
        />
      </svg>
    </button>
  );
};

BookmarkButton.propTypes = {
  message: PropTypes.object.isRequired,
  isBookmarked: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  messageType: PropTypes.oneOf(['user', 'assistant']).isRequired,
  chatId: PropTypes.string
};

BookmarkButton.defaultProps = {
  isBookmarked: false
};

export default BookmarkButton;