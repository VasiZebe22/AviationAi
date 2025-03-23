import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  getDoc,
  limit 
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { processFirestoreError, logError } from '../utils/errorHandling';

/**
 * Custom hook for managing chat data in Firestore
 * @param {Object} user - The current user object
 * @returns {Object} Firestore chat operations and state
 */
const useFirestoreChats = (user) => {
  const [savedChats, setSavedChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(true);
  const [firestoreError, setFirestoreError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check Firestore connection
  useEffect(() => {
    const initializeFirestore = async () => {
      setIsInitializing(true);
      try {
        // Simple query just to test connection
        if (user?.uid) {
          const testQuery = query(
            collection(db, 'chats'),
            where('userId', '==', user.uid),
            limit(1)
          );
          await getDocs(testQuery);
          
          setIsFirestoreConnected(true);
          setFirestoreError(null);
        }
      } catch (err) {
        logError('Firestore initialization', err);
        setIsFirestoreConnected(false);
        setFirestoreError(processFirestoreError(err));
      } finally {
        setIsInitializing(false);
      }
    };

    if (user?.uid) {
      initializeFirestore();
    } else {
      setIsInitializing(false);
    }
  }, [user?.uid]);

  // Load user's saved chats
  const loadSavedChats = useCallback(async () => {
    if (!user?.uid) return [];

    setIsLoading(true);
    setError(null);
    
    try {
      const q = query(
        collection(db, 'chats'),
        where('userId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const chats = [];
      querySnapshot.forEach((doc) => {
        chats.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setSavedChats(chats);
      return chats;
    } catch (err) {
      logError('Loading chats', err);
      
      if (err.message.includes('requires an index')) {
        // Fall back to a simpler query without ordering
        try {
          const simpleQ = query(
            collection(db, 'chats'),
            where('userId', '==', user.uid)
          );
          const snapshot = await getDocs(simpleQ);
          const chats = [];
          snapshot.forEach((doc) => {
            chats.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          // Sort in memory as fallback
          chats.sort((a, b) => {
            const dateA = a.updatedAt?.toDate() || new Date(0);
            const dateB = b.updatedAt?.toDate() || new Date(0);
            return dateB - dateA;
          });
          setSavedChats(chats);
          return chats;
        } catch (fallbackErr) {
          logError('Fallback query', fallbackErr);
          const errorMsg = processFirestoreError(fallbackErr);
          setError(errorMsg);
          return [];
        }
      } else {
        const errorMsg = processFirestoreError(err);
        setError(errorMsg);
        return [];
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Load a specific chat by ID
  const loadChat = useCallback(async (chatId) => {
    if (!chatId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const chatRef = doc(db, 'chats', chatId);
      const docSnap = await getDoc(chatRef);
      
      if (docSnap.exists()) {
        const chatData = docSnap.data();
        return {
          id: chatId,
          ...chatData
        };
      }
      return null;
    } catch (err) {
      logError(`Loading chat ${chatId}`, err);
      const errorMsg = processFirestoreError(err);
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new chat
  const createChat = useCallback(async (messages, title) => {
    if (!user?.uid) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const currentTimestamp = new Date();
      const chatData = {
        userId: user.uid,
        title: title || messages[0]?.content?.substring(0, 50) || 'New Chat',
        messages,
        createdAt: serverTimestamp(),
        clientCreatedAt: currentTimestamp.toISOString(),
        updatedAt: serverTimestamp(),
        starred: false
      };

      const docRef = await addDoc(collection(db, 'chats'), chatData);
      
      const newChat = {
        id: docRef.id,
        ...chatData,
        createdAt: currentTimestamp.toISOString(),
        lastUpdated: currentTimestamp.toISOString()
      };
      
      setSavedChats(prev => [newChat, ...prev]);
      return newChat;
    } catch (err) {
      logError('Creating chat', err);
      const errorMsg = processFirestoreError(err);
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Update an existing chat
  const updateChatMessages = useCallback(async (chatId, messages) => {
    if (!chatId) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        messages,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setSavedChats(prev => 
        prev.map(chat => 
          chat.id === chatId 
            ? { 
                ...chat, 
                messages, 
                lastUpdated: new Date().toISOString() 
              } 
            : chat
        )
      );
      
      return true;
    } catch (err) {
      logError(`Updating chat ${chatId}`, err);
      const errorMsg = processFirestoreError(err);
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update chat title
  const updateChatTitle = useCallback(async (chatId, newTitle) => {
    if (!chatId || !newTitle) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        title: newTitle,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setSavedChats(prev => 
        prev.map(chat => 
          chat.id === chatId 
            ? { 
                ...chat, 
                title: newTitle, 
                lastUpdated: new Date().toISOString() 
              } 
            : chat
        )
      );
      
      return true;
    } catch (err) {
      logError(`Updating chat title ${chatId}`, err);
      const errorMsg = processFirestoreError(err);
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Toggle starred status
  const toggleChatStarred = useCallback(async (chatId, isStarred) => {
    if (!chatId) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        starred: isStarred,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setSavedChats(prev => 
        prev.map(chat => 
          chat.id === chatId 
            ? { 
                ...chat, 
                starred: isStarred, 
                lastUpdated: new Date().toISOString() 
              } 
            : chat
        )
      );
      
      return true;
    } catch (err) {
      logError(`Toggling star for chat ${chatId}`, err);
      const errorMsg = processFirestoreError(err);
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a chat
  const deleteChat = useCallback(async (chatId) => {
    if (!chatId) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const chatRef = doc(db, 'chats', chatId);
      await deleteDoc(chatRef);
      
      // Update local state
      setSavedChats(prev => prev.filter(chat => chat.id !== chatId));
      
      return true;
    } catch (err) {
      logError(`Deleting chat ${chatId}`, err);
      const errorMsg = processFirestoreError(err);
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load chats when user changes
  useEffect(() => {
    if (user?.uid) {
      loadSavedChats();
    } else {
      setSavedChats([]);
    }
  }, [user?.uid, loadSavedChats]);

  // Handle network status changes
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network status: online');
      setIsFirestoreConnected(true);
      setFirestoreError(null);
    };

    const handleOffline = () => {
      console.log('Network status: offline');
      setIsFirestoreConnected(false);
      setFirestoreError('You are currently offline. Please check your internet connection.');
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

  return {
    savedChats,
    isLoading,
    error,
    setError,
    isFirestoreConnected,
    firestoreError,
    isInitializing,
    loadSavedChats,
    loadChat,
    createChat,
    updateChatMessages,
    updateChatTitle,
    toggleChatStarred,
    deleteChat
  };
};

export default useFirestoreChats;
