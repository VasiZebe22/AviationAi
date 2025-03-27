import { useCallback, useRef } from 'react';
import { getAssistantResponse } from '../../../api/assistant';
import * as actions from './useChatReducer';

/**
 * Custom hook for message handling operations
 * 
 * @param {Object} params - Hook parameters
 * @param {Object} params.state - Current state
 * @param {Function} params.dispatch - Dispatch function
 * @param {Object} params.currentUser - Current user
 * @param {Object} params.firestoreChats - Firestore chats service
 * @param {Function} params.loadSavedChats - Function to reload saved chats
 * @returns {Object} Message handling functions
 */
const useMessageHandling = ({ 
  state, 
  dispatch, 
  currentUser, 
  firestoreChats,
  loadSavedChats
}) => {
  // Use refs to track animation state
  const typingTimersRef = useRef([]);
  const currentIndexRef = useRef(0);
  
  // Clear typing timers on unmount
  const clearTypingTimers = () => {
    typingTimersRef.current.forEach(timer => clearTimeout(timer));
    typingTimersRef.current = [];
  };

  /**
   * Type message animation
   * 
   * @param {string} message - Message to type
   */
  const typeMessage = useCallback((message) => {
    // Clear any existing timers
    clearTypingTimers();
    
    dispatch({ type: actions.SET_IS_TYPING, payload: true });
    currentIndexRef.current = 0;
    dispatch({ type: actions.SET_DISPLAYED_CONTENT, payload: '' });
    
    const typeChar = () => {
      if (currentIndexRef.current < message.length) {
        dispatch({ 
          type: actions.SET_DISPLAYED_CONTENT, 
          payload: message.substring(0, currentIndexRef.current + 1)
        });
        currentIndexRef.current++;
        // Further reduced timing to 3.75ms-8.75ms for quadruple speed
        const timer = setTimeout(typeChar, Math.random() * 5 + 3.75);
        typingTimersRef.current.push(timer);
      } else {
        dispatch({ type: actions.SET_IS_TYPING, payload: false });
        dispatch({ type: actions.SET_LOADING, payload: false });
      }
    };
    
    typeChar();
    
    // Return cleanup function
    return clearTypingTimers;
  }, [dispatch]);

  /**
   * Handle message submission
   * 
   * @param {Event} e - Form submit event
   */
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!state.messageInput.trim() || state.isLoading) return;

    dispatch({ type: actions.SET_LOADING, payload: true });
    dispatch({ type: actions.SET_ERROR, payload: null });
    let newChatId = state.chatId;
    let localHistory = [];

    try {
      const currentTimestamp = new Date();
      const userMessage = {
        type: 'user',
        content: state.messageInput,
        timestamp: new Date().toISOString() // Use ISO string for consistent display
      };
      localHistory = [...state.history, userMessage];
      
      dispatch({ type: actions.SET_HISTORY, payload: localHistory });
      dispatch({ type: actions.SET_MESSAGE_INPUT, payload: '' });

      // Create new chat if we don't have one
      if (!state.currentChat) {
        console.log('Creating new chat...');
        const chatData = {
          userId: currentUser.user.uid,
          title: state.messageInput.substring(0, 50),
          messages: localHistory,
          clientCreatedAt: currentTimestamp.toISOString(), // Store as ISO string
          starred: false
        };

        const newChat = await firestoreChats.createChat(chatData);
        newChatId = newChat.id;
        
        dispatch({ type: actions.SET_CURRENT_CHAT, payload: newChat });
        dispatch({ 
          type: actions.SET_CHATS, 
          payload: [newChat, ...state.savedChats]
        });
      } else {
        // Update existing chat
        if (!state.currentChat?.id) {
          throw new Error('No chat ID available for updating messages');
        }
        
        // First update the state to ensure consistency
        dispatch({ type: actions.SET_HISTORY, payload: localHistory });
        
        // Then update Firestore
        await firestoreChats.updateChatMessages(state.currentChat.id, localHistory);
      }

      // Get AI response
      let responseData;
      try {
        responseData = await getAssistantResponse(state.messageInput, currentUser.token);
        console.log('AI response received');
      } catch (err) {
        console.error('Error getting AI response:', err);
        throw new Error(`Failed to get AI response: ${err.message}`);
      }

      const assistantMessage = {
        type: 'assistant',
        content: responseData.response,
        timestamp: new Date().toISOString() // Use ISO string for consistent display
      };
      const finalHistory = [...localHistory, assistantMessage];

      // Save AI response
      try {
        const chatId = newChatId || state.currentChat?.id;
        if (!chatId) {
          throw new Error('No chat ID available for saving messages');
        }
        
        console.log('Saving AI response to chat:', chatId);
        
        // First update the state to ensure consistency
        dispatch({ type: actions.SET_HISTORY, payload: finalHistory });
        
        // Then update Firestore
        await firestoreChats.updateChatMessages(chatId, finalHistory);
        
        // Update chat in savedChats
        dispatch({
          type: actions.SET_CHATS,
          payload: state.savedChats.map(chat => 
            chat.id === (newChatId || state.currentChat.id)
              ? { ...chat, messages: finalHistory, lastUpdated: new Date().toISOString() }
              : chat
          )
        });
        
        console.log('AI response saved successfully');
      } catch (err) {
        console.error('Error saving AI response:', err);
        throw new Error(`Failed to save AI response: ${err.message}`);
      }

      // Start typing animation
      typeMessage(responseData.response);

    } catch (err) {
      console.error('Error in handleSubmit:', err);
      dispatch({ 
        type: actions.SET_ERROR, 
        payload: err.message || 'An error occurred. Please try again.'
      });
      
      if (state.chatId) {
        loadSavedChats();
      }
    } finally {
      // Loading state is now managed by the typing animation
    }
  }, [
    state.messageInput, 
    state.isLoading, 
    state.chatId, 
    state.history, 
    state.currentChat, 
    state.savedChats,
    currentUser, 
    firestoreChats,
    loadSavedChats, 
    typeMessage,
    dispatch
  ]);

  /**
   * Toggle bookmark status for a message
   *
   * @param {Object|number} messageOrIndex - Message object or index of message to toggle
   * @param {Event} e - Click event
   */
  const toggleBookmark = useCallback(async (messageOrIndex, e) => {
    if (e) e.stopPropagation();
    if (!state.currentChat) return;
  
    try {
      // Determine if we received a message object or an index
      let messageIndex;
      let message;
      
      if (typeof messageOrIndex === 'object') {
        // We received a message object
        message = messageOrIndex;
        // Find the index of this message in the history array
        messageIndex = state.history.findIndex(msg =>
          // Use timestamp and content to identify the message
          msg.timestamp === message.timestamp &&
          msg.content === message.content &&
          msg.type === message.type
        );
        
        // If message not found, log error and return
        if (messageIndex === -1) {
          console.error('Message not found in history:', message);
          return;
        }
      } else {
        // We received an index
        messageIndex = messageOrIndex;
        message = state.history[messageIndex];
        
        // If no message found at this index, log error and return
        if (!message) {
          console.error('No message found at index:', messageIndex);
          return;
        }
      }
  
      // First update local state
      dispatch({ type: actions.TOGGLE_BOOKMARK, payload: messageIndex });
      
      // Then update Firestore
      try {
        if (!state.currentChat?.id) {
          console.error('No chat ID available for toggling bookmark');
          return;
        }
        
        // The state is already updated by the reducer, so we can use the current history
        await firestoreChats.updateChatMessages(state.currentChat.id, state.history);
      } catch (error) {
        console.error('Error updating bookmark in Firestore:', error);
        // Toggle back in case of error
        dispatch({ type: actions.TOGGLE_BOOKMARK, payload: messageIndex });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // We can't access messageIndex here as it's defined in the try block
      // Instead, use messageOrIndex which is a parameter and accessible throughout the function
      if (typeof messageOrIndex === 'number') {
        // If we received an index, we can use it directly to revert
        dispatch({ type: actions.TOGGLE_BOOKMARK, payload: messageOrIndex });
      } else if (typeof messageOrIndex === 'object') {
        // If we received a message object, we can't reliably find its index here
        // Just log the error and don't attempt to revert the state
        console.log('Unable to revert bookmark state for message:', messageOrIndex);
      }
    }
  }, [state.currentChat, state.history, firestoreChats, dispatch]);

  return {
    typeMessage,
    handleSubmit,
    toggleBookmark
  };
};

export default useMessageHandling;