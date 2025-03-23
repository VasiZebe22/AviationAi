import { useState, useCallback, useEffect } from 'react';
import { getAssistantResponse } from '../../../api/assistant';
import useFirestoreChats from './useFirestoreChats';
import useMessageTyping from './useMessageTyping';
import { logError } from '../utils/errorHandling';

/**
 * Main hook for managing chat state and operations
 * 
 * This hook centralizes chat state management and operations to keep
 * the main component lean and focused on composition rather than logic.
 * 
 * @param {Object} user - The current authenticated user
 * @returns {Object} Chat state and functions
 */
const useChatState = (user) => {
  // Local state
  const [messageInput, setMessageInput] = useState('');
  const [history, setHistory] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [error, setError] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [bookmarkedMessageIds, setBookmarkedMessageIds] = useState([]);
  const [showBookmarkedMessagesOnly, setShowBookmarkedMessagesOnly] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Initialize custom hooks
  const {
    isTyping,
    displayedContent,
    typeMessage,
    renderTypingCursor,
    clearTyping
  } = useMessageTyping();
  
  const {
    savedChats,
    isLoading,
    firestoreError,
    isFirestoreConnected,
    isInitializing,
    loadSavedChats,
    loadChat,
    createChat,
    updateChatMessages,
    updateChatTitle,
    toggleChatStarred,
    deleteChat
  } = useFirestoreChats(user);
  
  // Set error from Firestore if needed
  useEffect(() => {
    if (firestoreError) {
      setError(firestoreError);
    }
  }, [firestoreError]);
  
  /**
   * Add a new message to the chat history
   * @param {string} content - Message content
   * @param {string} type - Message type ('user' or 'assistant')
   * @returns {Object} The newly created message
   */
  const addMessage = useCallback((content, type = 'user') => {
    const timestamp = new Date().toISOString();
    const messageId = `${type}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newMessage = {
      type,
      content,
      timestamp,
      messageId,
      isTyping: type === 'assistant'
    };
    
    setHistory(prev => [...prev, newMessage]);
    
    if (type === 'assistant') {
      // Remove typing indicator after a brief delay
      setTimeout(() => {
        setHistory(prev => 
          prev.map(msg => 
            msg.messageId === messageId
              ? { ...msg, isTyping: false }
              : msg
          )
        );
      }, 500); // Match animation duration
    }
    
    return newMessage;
  }, []);
  
  /**
   * Start a new chat
   * Clears current history and resets state
   */
  const handleNewChat = useCallback(() => {
    setCurrentChat(null);
    setHistory([]);
    setMessageInput('');
    setError(null);
    clearTyping();
    setChatId(null);
    // Close sidebar on mobile when starting a new chat
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [clearTyping]);
  
  /**
   * Handle sending a message and getting AI response
   * @param {Event} e - The submission event
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || isLoading || isTyping) return;
    
    let newChatId = chatId;
    let localHistory = [];
    
    try {
      // Add user message to history
      const userMessage = addMessage(messageInput, 'user');
      localHistory = [...history, userMessage];
      
      setMessageInput('');
      
      // Create new chat if needed
      if (!currentChat) {
        const newChat = await createChat(localHistory, messageInput.substring(0, 50));
        if (newChat) {
          setCurrentChat(newChat);
          newChatId = newChat.id;
          setChatId(newChat.id);
        } else {
          throw new Error('Failed to create new chat');
        }
      } else {
        // Update existing chat
        await updateChatMessages(currentChat.id, localHistory);
      }
      
      // Get AI response
      let responseData;
      try {
        responseData = await getAssistantResponse(messageInput, user?.token);
        console.log('AI response received');
      } catch (err) {
        logError('Getting AI response', err);
        throw new Error(`Failed to get AI response: ${err.message}`);
      }
      
      // Add AI response to history
      const assistantMessage = addMessage(responseData.response, 'assistant');
      const finalHistory = [...localHistory, assistantMessage];
      
      // Save AI response to chat
      try {
        await updateChatMessages(newChatId || currentChat.id, finalHistory);
        
        // Start typing animation
        typeMessage(responseData.response);
      } catch (err) {
        logError('Saving AI response', err);
        throw new Error(`Failed to save AI response: ${err.message}`);
      }
    } catch (err) {
      logError('Message submission', err);
      setError(err.message || 'An error occurred. Please try again.');
      
      // Reload chats if there was an error
      if (chatId) {
        loadSavedChats();
      }
    }
  }, [
    messageInput, 
    isLoading, 
    isTyping, 
    chatId, 
    history, 
    currentChat, 
    createChat, 
    updateChatMessages, 
    user, 
    addMessage, 
    typeMessage, 
    loadSavedChats
  ]);
  
  /**
   * Handle selecting a chat from history
   * @param {Object} chat - The selected chat
   */
  const handleChatSelect = useCallback(async (chat) => {
    if (isLoading) return;
    
    try {
      // If already selected, do nothing
      if (currentChat?.id === chat.id) return;
      
      clearTyping();
      setError(null);
      setCurrentChat(chat);
      setChatId(chat.id);
      
      // Get latest chat data in case it's been updated
      const latestChat = await loadChat(chat.id);
      if (latestChat) {
        setHistory(latestChat.messages || []);
      } else {
        setHistory(chat.messages || []);
      }
      
      // Close sidebar on mobile when selecting a chat
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    } catch (err) {
      logError('Selecting chat', err);
      setError(`Failed to load chat: ${err.message}`);
    }
  }, [isLoading, currentChat, clearTyping, loadChat]);
  
  /**
   * Toggle bookmark status for a message
   * @param {Object} message - The message to bookmark/unbookmark
   */
  const handleToggleBookmark = useCallback((message) => {
    const messageId = message.messageId || `${message.timestamp}-${message.type}`;
    
    setBookmarkedMessageIds(prev => {
      const isCurrentlyBookmarked = prev.includes(messageId);
      
      if (isCurrentlyBookmarked) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
    
    // Could also persist bookmarks to Firestore here if needed
  }, []);
  
  /**
   * Toggle star status for a chat
   * @param {string} id - Chat ID
   * @param {boolean} isStarred - New star status
   */
  const handleToggleStar = useCallback(async (id, isStarred) => {
    try {
      await toggleChatStarred(id, isStarred);
      
      // Update current chat if it's the one being starred/unstarred
      if (currentChat?.id === id) {
        setCurrentChat(prev => ({
          ...prev,
          starred: isStarred
        }));
      }
    } catch (err) {
      logError('Toggling star', err);
      setError(`Failed to update star status: ${err.message}`);
    }
  }, [toggleChatStarred, currentChat]);
  
  /**
   * Handle deleting a chat
   * @param {string} id - Chat ID to delete
   */
  const handleDeleteChat = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this chat?')) return;
    
    try {
      await deleteChat(id);
      
      // If deleted the current chat, clear current state
      if (currentChat?.id === id) {
        handleNewChat();
      }
    } catch (err) {
      logError('Deleting chat', err);
      setError(`Failed to delete chat: ${err.message}`);
    }
  }, [deleteChat, currentChat, handleNewChat]);
  
  /**
   * Update a chat's title
   * @param {string} id - Chat ID
   * @param {string} title - New title
   */
  const handleUpdateChatTitle = useCallback(async (id, title) => {
    try {
      await updateChatTitle(id, title);
      
      // Update current chat if it's the one being renamed
      if (currentChat?.id === id) {
        setCurrentChat(prev => ({
          ...prev,
          title
        }));
      }
    } catch (err) {
      logError('Updating chat title', err);
      setError(`Failed to update chat title: ${err.message}`);
    }
  }, [updateChatTitle, currentChat]);
  
  /**
   * Toggle sidebar open/closed state
   */
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);
  
  return {
    // State
    messageInput,
    setMessageInput,
    history,
    currentChat,
    savedChats,
    isLoading,
    error,
    setError,
    isTyping,
    displayedContent,
    isFirestoreConnected,
    isInitializing,
    bookmarkedMessageIds,
    showBookmarkedMessagesOnly,
    setShowBookmarkedMessagesOnly,
    sidebarOpen,
    
    // Functions
    handleNewChat,
    handleSubmit,
    handleChatSelect,
    handleToggleBookmark,
    handleToggleStar,
    handleDeleteChat,
    handleUpdateChatTitle,
    toggleSidebar,
    renderTypingCursor,
    loadSavedChats
  };
};

export default useChatState;
