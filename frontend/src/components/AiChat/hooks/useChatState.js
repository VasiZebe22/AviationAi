import { useReducer, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { chatReducer, initialState } from './useChatReducer';
import useFirestoreChats from './useFirestoreChats';
import useMessageHandling from './useMessageHandling';
import useChatManagement from './useChatManagement';
import * as actions from './useChatReducer';

/**
 * Custom hook for managing chat state
 * 
 * @returns {Object} Chat state and actions
 */
const useChatState = () => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { currentUser } = useAuth();
  
  // Use a ref to track if we've already initialized
  const initializedRef = useRef(false);
  const userIdRef = useRef(null);
  
  // Get Firestore operations
  const firestoreChats = useFirestoreChats(currentUser);
  
  // Use a ref to store the latest firestoreChats instance
  const firestoreChatsRef = useRef(firestoreChats);
  
  // Update the ref whenever firestoreChats changes
  useEffect(() => {
    firestoreChatsRef.current = firestoreChats;
  }, [firestoreChats]);

  // Initialize Firestore connection
  const initializeFirestore = useCallback(async () => {
    // Skip if we've already initialized for this user
    if (initializedRef.current && userIdRef.current === currentUser?.user?.uid) {
      return;
    }
    
    dispatch({ type: actions.INITIALIZE_START });
    
    try {
      if (!currentUser?.user?.uid) {
        dispatch({ type: actions.INITIALIZE_SUCCESS });
        return;
      }
      
      await firestoreChatsRef.current.testConnection();
      dispatch({ type: actions.INITIALIZE_SUCCESS });
      
      // Mark as initialized for this user
      initializedRef.current = true;
      userIdRef.current = currentUser?.user?.uid;
    } catch (err) {
      console.error('Firestore initialization error:', err);
      if (err.message.includes('requires an index')) {
        dispatch({ 
          type: actions.INITIALIZE_ERROR, 
          payload: 'Database initialization required. Please contact the administrator to set up the required indexes.'
        });
      } else {
        dispatch({ 
          type: actions.INITIALIZE_ERROR, 
          payload: err.message
        });
      }
    }
  }, [currentUser?.user?.uid, dispatch]); // Removed firestoreChats dependency

  // Load saved chats
  const loadSavedChats = useCallback(async () => {
    if (!currentUser?.user?.uid) {
      dispatch({ type: actions.SET_CHATS, payload: [] });
      return;
    }

    try {
      const chats = await firestoreChatsRef.current.loadChats();
      dispatch({ type: actions.SET_CHATS, payload: chats });
    } catch (err) {
      console.error('Error loading chats:', err);
      dispatch({ 
        type: actions.SET_ERROR, 
        payload: 'Error loading chats. Please try again later.'
      });
    }
  }, [currentUser?.user?.uid, dispatch]); // Removed firestoreChats dependency

  // Initialize message handling hook
  const messageHandling = useMessageHandling({
    state,
    dispatch,
    currentUser,
    firestoreChats: firestoreChatsRef.current,
    loadSavedChats
  });

  // Initialize chat management hook
  const chatManagement = useChatManagement({
    state,
    dispatch,
    firestoreChats: firestoreChatsRef.current
  });

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network status: online');
      dispatch({ 
        type: actions.SET_NETWORK_STATUS, 
        payload: { isOnline: true }
      });
    };

    const handleOffline = () => {
      console.log('Network status: offline');
      dispatch({ 
        type: actions.SET_NETWORK_STATUS, 
        payload: { isOnline: false }
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial network status
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize Firestore and load chats when user changes
  useEffect(() => {
    const userId = currentUser?.user?.uid;
    
    if (userId) {
      // Only initialize if the user ID has changed
      if (userIdRef.current !== userId) {
        initializeFirestore();
        
        // Only load chats after initialization
        console.log('User changed, reloading chats for:', userId);
        loadSavedChats();
      }
    } else {
      // Reset state when user logs out
      dispatch({ type: actions.INITIALIZE_SUCCESS });
      dispatch({ type: actions.SET_CHATS, payload: [] });
      
      // Reset initialization state
      initializedRef.current = false;
      userIdRef.current = null;
    }
  }, [currentUser?.user?.uid, initializeFirestore, loadSavedChats]);

  return {
    ...state,
    // Simple state setters
    setMessageInput: (value) => dispatch({ type: actions.SET_MESSAGE_INPUT, payload: value }),
    setNewTitle: (value) => dispatch({ type: actions.SET_NEW_TITLE, payload: value }),
    toggleShowStarredChatsOnly: () => dispatch({ 
      type: actions.SET_SHOW_STARRED_CHATS_ONLY, 
      payload: !state.showStarredChatsOnly 
    }),
    toggleShowBookmarkedMessagesOnly: () => dispatch({ 
      type: actions.SET_SHOW_BOOKMARKED_MESSAGES_ONLY, 
      payload: !state.showBookmarkedMessagesOnly 
    }),
    clearError: () => dispatch({ type: actions.CLEAR_ERROR }),
    
    // Message handling functions
    handleSubmit: messageHandling.handleSubmit,
    toggleBookmark: messageHandling.toggleBookmark,
    
    // Chat management functions
    handleNewChat: chatManagement.handleNewChat,
    handleChatSelect: chatManagement.handleChatSelect,
    toggleStar: chatManagement.toggleStar,
    handleStartEdit: chatManagement.handleStartEdit,
    handleSaveTitle: chatManagement.handleSaveTitle,
    handleDeleteChat: chatManagement.handleDeleteChat,
    
    // Other functions
    loadSavedChats
  };
};

export default useChatState;