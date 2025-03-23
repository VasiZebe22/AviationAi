import React, { useRef, useEffect } from 'react';

/**
 * Component for message input, submission and input controls
 * 
 * Handles text input, message submission, and keyboard shortcuts
 * 
 * @param {Object} props - Component props
 * @param {string} props.messageInput - Current input value
 * @param {Function} props.setMessageInput - Function to update input value
 * @param {Function} props.handleSubmit - Function to handle message submission
 * @param {boolean} props.isLoading - Whether a request is in progress
 * @param {boolean} props.isTyping - Whether typing animation is active
 */
const MessageInput = ({
  messageInput,
  setMessageInput,
  handleSubmit,
  isLoading,
  isTyping
}) => {
  // Reference to the textarea element for focusing
  const inputRef = useRef(null);
  
  // Auto-focus input when component mounts and adjust height
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      adjustTextareaHeight();
    }
  }, []);
  
  // Handle input changes
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    adjustTextareaHeight();
  };
  
  // Handle key presses (Enter to submit, Shift+Enter for new line)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Auto-resize textarea height based on content
  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (!textarea) return;
    
    // Reset height to calculate correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate new height (with limit)
    const maxHeight = 150; // Maximum height in pixels
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    
    // Apply new height
    textarea.style.height = `${newHeight}px`;
    
    // Add scrollbar if content exceeds max height
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  };
  
  // Determine button state and appearance
  const isButtonDisabled = !messageInput.trim() || isLoading || isTyping;
  const buttonClasses = `send-button ${isButtonDisabled ? 'disabled' : ''}`;
  
  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-form">
        <textarea
          ref={inputRef}
          value={messageInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="Type your message here..."
          disabled={isLoading || isTyping}
          className="message-input"
          rows={1}
        />
        <button
          type="submit"
          disabled={isButtonDisabled}
          className={buttonClasses}
          aria-label="Send message"
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
                fill="none"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
