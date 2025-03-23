import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for handling the typing animation effect for AI messages
 * @returns {Object} Typing state and functions
 */
const useMessageTyping = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');

  /**
   * Simulates typing animation for a message
   * @param {string} message - The full message to animate typing for
   */
  const typeMessage = useCallback((message) => {
    setIsTyping(true);
    let currentIndex = 0;
    setDisplayedContent('');
    
    const typeChar = () => {
      if (currentIndex < message.length) {
        setDisplayedContent(prev => message.substring(0, currentIndex + 1));
        currentIndex++;
        // Reduced timing for speed (3.75ms-8.75ms)
        setTimeout(typeChar, Math.random() * 5 + 3.75);
      } else {
        setIsTyping(false);
      }
    };
    
    typeChar();
  }, []);

  /**
   * Renders the typing cursor animation element
   * @returns {JSX.Element} Animated cursor element
   */
  const renderTypingCursor = useCallback(() => (
    <span className="inline-block w-2 h-2 ml-0.5 -mb-0.5 bg-accent-lilac rounded-full animate-pulse" />
  ), []);

  /**
   * Clears the typing animation
   */
  const clearTyping = useCallback(() => {
    setIsTyping(false);
    setDisplayedContent('');
  }, []);

  return {
    isTyping,
    displayedContent,
    typeMessage,
    renderTypingCursor,
    clearTyping
  };
};

export default useMessageTyping;
