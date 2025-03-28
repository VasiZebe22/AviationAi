import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { BookmarkButton } from './';
import { useMessageFormatting } from '../hooks';

/**
 * Component for rendering a typing cursor animation
 * 
 * @returns {JSX.Element} Typing cursor element
 */
const TypingCursor = () => (
  <span className="inline-block w-2 h-2 ml-0.5 -mb-0.5 bg-accent-lilac rounded-full animate-pulse" />
);

/**
 * MessageList component for displaying chat messages
 * 
 * @param {Object} props - Component props
 * @param {Array} props.messages - Array of message objects to display
 * @param {boolean} props.isTyping - Whether the last message is being typed
 * @param {string} props.displayedContent - Content being typed for the last message
 * @param {string} props.chatId - ID of the current chat
 * @param {Function} props.onToggleBookmark - Function to toggle bookmark status
 */
const MessageList = ({
  messages = [],
  isTyping = false,
  displayedContent = '',
  chatId,
  onToggleBookmark
}) => {
  const { formatTimestamp, formatMarkdown, formatMessage } = useMessageFormatting();
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isTyping, displayedContent]);

  /**
   * Render message content with typing animation if applicable
   * 
   * @param {Object} message - Message object to render
   * @param {boolean} isLastMessage - Whether this is the last message
   * @returns {JSX.Element} Rendered message content
   */
  const renderMessageContent = (message, isLastMessage) => {
    if (message.type === 'assistant' && isLastMessage && isTyping) {
      // Remove citation markers from displayed content
      const cleanContent = displayedContent.replace(/【\d+:\d+†source】/g, '');
      
      return cleanContent.split('\n').map((paragraph, idx) => {
        if (!paragraph.trim()) return <div key={idx} className="h-2" />;

        // Check for numbered lists in typing animation
        const numberedListMatch = paragraph.match(/^(\d+)\.\s(.+)/);
        if (numberedListMatch) {
          const [_, number, text] = numberedListMatch;
          return (
            <div key={idx} className="flex items-start space-x-2 mb-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-lilac bg-opacity-20 flex items-center justify-center">
                <span className="text-sm text-accent-lilac">{number}</span>
              </div>
              <p className="text-sm mt-0.5 text-gray-200 flex-1">
                <span dangerouslySetInnerHTML={{ __html: formatMarkdown(text) }} />
                {idx === cleanContent.split('\n').length - 1 && <TypingCursor />}
              </p>
            </div>
          );
        }
        
        // For the last paragraph, add the cursor
        if (idx === cleanContent.split('\n').length - 1) {
          return (
            <p key={idx} className="text-sm mb-2 text-gray-200">
              <span dangerouslySetInnerHTML={{ __html: formatMarkdown(paragraph) }} />
              <TypingCursor />
            </p>
          );
        }
        
        return (
          <p key={idx} className="text-sm mb-2 text-gray-200"
             dangerouslySetInnerHTML={{ __html: formatMarkdown(paragraph) }} />
        );
      });
    }
    
    // For non-typing messages, use the standard formatter
    const formattedParts = formatMessage(message.content);
    
    return formattedParts.map(part => {
      if (part.type === 'spacer') {
        return <div key={part.key} className="h-2" />;
      }
      
      if (part.type === 'numberedList') {
        return (
          <div key={part.key} className="flex items-start space-x-2 mb-2">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-lilac bg-opacity-20 flex items-center justify-center">
              <span className="text-sm text-accent-lilac">{part.number}</span>
            </div>
            <p className="text-sm mt-0.5 text-gray-200 flex-1">
              <span dangerouslySetInnerHTML={{ __html: part.content }} />
            </p>
          </div>
        );
      }
      
      return (
        <p key={part.key} className="text-sm mb-2 text-gray-200" 
           dangerouslySetInnerHTML={{ __html: part.content }} />
      );
    });
  };

  /**
   * Render a single message
   * 
   * @param {Object} message - Message object to render
   * @param {number} index - Index of the message in the array
   * @returns {JSX.Element} Rendered message
   */
  const renderMessage = (message, index) => {
    const isLastMessage = index === messages.length - 1;
    
    return (
      <div
        key={`${chatId}-message-${index}-${message.bookmarked}`}
        className={`flex ${
          message.type === 'user' ? 'justify-end' : 'justify-start'
        } relative group mx-4`}
      >
        <div
          className={`max-w-[80%] rounded-lg p-4 relative ${
            message.type === 'user'
              ? 'bg-accent-lilac text-white'
              : 'bg-surface-DEFAULT text-gray-100'
          }`}
        >
          <div className="prose prose-invert max-w-none">
            {renderMessageContent(message, isLastMessage)}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {formatTimestamp(message.timestamp)}
          </div>
          <BookmarkButton
            key={`bookmark-${chatId}-${index}-${message.bookmarked}`}
            message={message}
            isBookmarked={message.bookmarked}
            onToggle={(e) => onToggleBookmark(message, e)}
            messageType={message.type}
            chatId={chatId}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
      {messages.map((message, index) => renderMessage(message, index))}
      <div ref={messagesEndRef} />
    </div>
  );
};

MessageList.propTypes = {
  messages: PropTypes.array.isRequired,
  isTyping: PropTypes.bool,
  displayedContent: PropTypes.string,
  chatId: PropTypes.string,
  onToggleBookmark: PropTypes.func.isRequired
};

export default MessageList;