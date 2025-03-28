import React, { useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * MessageInput component for user input and action buttons
 * 
 * @param {Object} props - Component props
 * @param {string} props.messageInput - Current input value
 * @param {Function} props.setMessageInput - Function to update input value
 * @param {Function} props.handleSubmit - Function to handle message submission
 * @param {boolean} props.isLoading - Whether a message is currently being sent
 * @param {boolean} props.isStarred - Whether the current chat is starred
 * @param {Function} props.toggleStar - Function to toggle star status
 * @param {boolean} props.showBookmarkedMessagesOnly - Whether to show only bookmarked messages
 * @param {Function} props.toggleBookmarkedMessagesFilter - Function to toggle bookmarked messages filter
 */
const MessageInput = ({
  messageInput,
  setMessageInput,
  handleSubmit,
  isLoading = false,
  isStarred = false,
  toggleStar,
  showBookmarkedMessagesOnly = false,
  toggleBookmarkedMessagesFilter
}) => {
  const inputRef = useRef(null);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 border-t border-dark-lightest">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="w-full bg-dark-lightest text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-lilac resize-none"
            rows={1}
            disabled={isLoading}
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={toggleStar}
            className={`p-2 rounded-lg ${
              isStarred
                ? 'bg-accent-lilac text-white'
                : 'bg-dark-lighter text-gray-400 hover:text-accent-lilac hover:bg-dark-lightest'
            }`}
            title={isStarred ? "Unstar chat" : "Star chat"}
          >
            <svg className="w-5 h-5" fill={isStarred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
          <button
            onClick={toggleBookmarkedMessagesFilter}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              showBookmarkedMessagesOnly 
                ? 'bg-accent-lilac bg-opacity-20 text-accent-lilac'
                : 'bg-dark-lighter text-gray-400 hover:text-accent-lilac hover:bg-dark-lightest'
            }`}
            title={showBookmarkedMessagesOnly ? "Show all messages" : "Show bookmarked messages only"}
          >
            <svg
              className="w-5 h-5"
              fill={showBookmarkedMessagesOnly ? "currentColor" : "none"}
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
          <button
            onClick={handleSubmit}
            disabled={!messageInput.trim() || isLoading}
            className={`p-2 rounded-lg ${
              messageInput.trim() && !isLoading
                ? 'bg-accent-lilac text-white'
                : 'bg-dark-lighter text-gray-400 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

MessageInput.propTypes = {
  messageInput: PropTypes.string.isRequired,
  setMessageInput: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isStarred: PropTypes.bool,
  toggleStar: PropTypes.func.isRequired,
  showBookmarkedMessagesOnly: PropTypes.bool,
  toggleBookmarkedMessagesFilter: PropTypes.func.isRequired
};

export default MessageInput;