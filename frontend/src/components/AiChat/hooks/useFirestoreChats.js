import { useCallback, useRef, useEffect } from 'react';
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

/**
 * Custom hook for Firestore chat operations
 * 
 * @param {Object} currentUser - Current user object
 * @returns {Object} Firestore operations
 */
const useFirestoreChats = (currentUser) => {
  // Use a ref to track the current user ID
  const userIdRef = useRef(null);
  
  // Update the user ID ref when the user changes
  useEffect(() => {
    userIdRef.current = currentUser?.user?.uid;
  }, [currentUser?.user?.uid]);

  /**
   * Test Firestore connection
   * 
   * @returns {Promise<boolean>} Whether connection was successful
   */
  const testConnection = useCallback(async () => {
    const userId = userIdRef.current;
    if (!userId) return false;
    
    try {
      // Simpler query just to test connection
      const testQuery = query(
        collection(db, 'chats'),
        where('userId', '==', userId),
        limit(1)
      );
      await getDocs(testQuery);
      return true;
    } catch (err) {
      console.error('Firestore connection error:', err);
      throw err;
    }
  }, []);

  /**
   * Load chats for current user
   * 
   * @returns {Promise<Array>} Array of chat objects
   */
  const loadChats = useCallback(async () => {
    const userId = userIdRef.current;
    if (!userId) return [];

    try {
      const q = query(
        collection(db, 'chats'),
        where('userId', '==', userId),
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
      return chats;
    } catch (err) {
      console.error('Error loading chats:', err);
      if (err.message.includes('requires an index')) {
        // Fall back to a simpler query without ordering
        try {
          const simpleQ = query(
            collection(db, 'chats'),
            where('userId', '==', userId)
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
          return chats;
        } catch (fallbackErr) {
          console.error('Error in fallback query:', fallbackErr);
          throw fallbackErr;
        }
      } else {
        throw err;
      }
    }
  }, []);

  /**
   * Load a single chat by ID
   * 
   * @param {string} chatId - ID of chat to load
   * @returns {Promise<Object>} Chat object
   */
  const loadChat = useCallback(async (chatId) => {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (chatDoc.exists()) {
        return {
          id: chatId,
          ...chatDoc.data()
        };
      }
      return null;
    } catch (err) {
      console.error('Error loading chat:', err);
      throw err;
    }
  }, []);

  /**
   * Create a new chat
   * 
   * @param {Object} chatData - Chat data to save
   * @returns {Promise<Object>} Created chat object
   */
  const createChat = useCallback(async (chatData) => {
    try {
      const docRef = await addDoc(collection(db, 'chats'), {
        ...chatData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        id: docRef.id,
        ...chatData
      };
    } catch (err) {
      console.error('Error creating chat:', err);
      throw err;
    }
  }, []);

  /**
   * Update an existing chat
   * 
   * @param {string} chatId - ID of chat to update
   * @param {Object} updates - Updates to apply
   * @returns {Promise<void>}
   */
  const updateChat = useCallback(async (chatId, updates) => {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error updating chat:', err);
      throw err;
    }
  }, []);

  /**
   * Delete a chat
   * 
   * @param {string} chatId - ID of chat to delete
   * @returns {Promise<void>}
   */
  const deleteChat = useCallback(async (chatId) => {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await deleteDoc(chatRef);
    } catch (err) {
      console.error('Error deleting chat:', err);
      throw err;
    }
  }, []);

  /**
   * Update chat title
   * 
   * @param {string} chatId - ID of chat to update
   * @param {string} title - New title
   * @returns {Promise<void>}
   */
  const updateChatTitle = useCallback(async (chatId, title) => {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        title,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error updating chat title:', err);
      throw err;
    }
  }, []);

  /**
   * Toggle chat star status
   * 
   * @param {string} chatId - ID of chat to update
   * @param {boolean} starred - New starred status
   * @returns {Promise<void>}
   */
  const toggleChatStar = useCallback(async (chatId, starred) => {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        starred,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error toggling chat star:', err);
      throw err;
    }
  }, []);

  /**
   * Update chat messages
   * 
   * @param {string} chatId - ID of chat to update
   * @param {Array} messages - New messages array
   * @returns {Promise<void>}
   */
  const updateChatMessages = useCallback(async (chatId, messages) => {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        messages,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error updating chat messages:', err);
      throw err;
    }
  }, []);

  return {
    testConnection,
    loadChats,
    loadChat,
    createChat,
    updateChat,
    deleteChat,
    updateChatTitle,
    toggleChatStar,
    updateChatMessages
  };
};

export default useFirestoreChats;