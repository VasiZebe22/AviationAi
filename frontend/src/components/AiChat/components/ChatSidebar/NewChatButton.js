import React from 'react';

/**
 * Button to create a new chat
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Function to call when button is clicked
 */
const NewChatButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="new-chat-button"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      <span>New Chat</span>
    </button>
  );
};

export default NewChatButton;
