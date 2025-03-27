import { useCallback, useRef } from 'react';
import * as actions from './useChatReducer';

/**
 * Custom hook for chat management operations
 * 
 * @param {Object} params - Hook parameters
 * @param {Object} params.state - Current state
 * @param {Function} params.dispatch - Dispatch function
 * @param {Object} params.firestoreChats - Firestore chats service
 * @returns {Object} Chat management functions
 */
const useChatManagement = ({ 
  state, 
  dispatch, 
  firestoreChats 
}) => {
  // Use refs to track current state
  const currentChatRef = useRef(null);
  
  // Update refs when state changes
  if (state.currentChat?.id !== currentChatRef.current?.id) {
    currentChatRef.current = state.currentChat;
  }

  /**
   * Handle new chat creation
   */
  const handleNewChat = useCallback(() => {
    dispatch({ type: actions.NEW_CHAT });
  }, [dispatch]);

  /**
   * Handle chat selection
   * 
   * @param {Object} chat - Chat to select
   */
  const handleChatSelect = useCallback(async (chat) => {
    // Skip if already selected
    if (chat.id === state.currentChat?.id) {
      return;
    }
    
    dispatch({ type: actions.SET_SHOW_BOOKMARKED_MESSAGES_ONLY, payload: false });
    dispatch({ type: actions.SET_IS_TYPING, payload: false });
    dispatch({ type: actions.SET_ERROR, payload: null });
    
    try {
      const fullChat = await firestoreChats.loadChat(chat.id);
      if (fullChat) {
        dispatch({ type: actions.SET_CURRENT_CHAT, payload: fullChat });
        dispatch({ type: actions.SET_HISTORY, payload: fullChat.messages || [] });
      }
    } catch (err) {
      console.error('Error loading chat:', err);
      dispatch({ type: actions.SET_ERROR, payload: 'Failed to load chat' });
    }
  }, [state.currentChat?.id, firestoreChats, dispatch]);

  /**
   * Toggle star status for current chat
   */
  const toggleStar = useCallback(async () => {
    const currentChat = currentChatRef.current;
    if (!currentChat) return;

    try {
      dispatch({ type: actions.TOGGLE_STAR });
      
      const newStarredState = !currentChat.starred;

      // Update Firestore
      await firestoreChats.toggleChatStar(currentChat.id, newStarredState);
    } catch (error) {
      console.error('Error toggling star:', error);
      // Revert local state if Firestore update fails
      dispatch({ type: actions.TOGGLE_STAR });
    }
  }, [firestoreChats, dispatch]);

  /**
   * Start editing chat title
   * 
   * @param {string} chatId - ID of chat to edit
   * @param {string} existingTitle - Current title
   */
  const handleStartEdit = useCallback((chatId, existingTitle) => {
    dispatch({ type: actions.SET_EDITING_CHAT_ID, payload: chatId });
    dispatch({ type: actions.SET_NEW_TITLE, payload: existingTitle || 'New Chat' });
  }, [dispatch]);

  /**
   * Save edited chat title
   * 
   * @param {string} chatId - ID of chat to update
   */
  const handleSaveTitle = useCallback(async (chatId) => {
    if (!state.newTitle.trim()) return;
    
    try {
      await firestoreChats.updateChatTitle(chatId, state.newTitle.trim());
      
      dispatch({ 
        type: actions.UPDATE_CHAT_TITLE, 
        payload: { 
          chatId, 
          title: state.newTitle.trim() 
        } 
      });
    } catch (error) {
      console.error('Error updating chat title:', error);
      dispatch({ 
        type: actions.SET_ERROR, 
        payload: 'Failed to update chat title'
      });
    }
  }, [state.newTitle, firestoreChats, dispatch]);

  /**
   * Delete a chat
   * 
   * @param {string} chatId - ID of chat to delete
   */
  const handleDeleteChat = useCallback(async (chatId) => {
    try {
      await firestoreChats.deleteChat(chatId);
      dispatch({ type: actions.DELETE_CHAT, payload: chatId });
    } catch (error) {
      console.error('Error deleting chat:', error);
      dispatch({ 
        type: actions.SET_ERROR, 
        payload: 'Failed to delete chat'
      });
    }
  }, [firestoreChats, dispatch]);

  return {
    handleNewChat,
    handleChatSelect,
    toggleStar,
    handleStartEdit,
    handleSaveTitle,
    handleDeleteChat
  };
};

export default useChatManagement;