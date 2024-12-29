import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAssistantResponse } from '../../api/assistant';
import { useNavigate } from 'react-router-dom';
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
  arrayUnion, 
  getDoc,
  limit 
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const AiChat = () => {
  const { currentUser } = useAuth();
  const [messageInput, setMessageInput] = useState('');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedChats, setSavedChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');
  const [chatId, setChatId] = useState(null);
  const [firestoreError, setFirestoreError] = useState(null);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const historyRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Wrap loadSavedChats in useCallback to prevent infinite re-renders
  const loadSavedChats = useCallback(async () => {
    if (!currentUser?.user?.uid) return;

    try {
      const q = query(
        collection(db, 'chats'),
        where('userId', '==', currentUser.user.uid),
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
    } catch (err) {
      console.error('Error loading chats:', err);
      if (err.message.includes('requires an index')) {
        // Fall back to a simpler query without ordering
        try {
          const simpleQ = query(
            collection(db, 'chats'),
            where('userId', '==', currentUser.user.uid)
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
        } catch (fallbackErr) {
          console.error('Error in fallback query:', fallbackErr);
          setError('Error loading chats. Please try again later.');
        }
      } else {
        setError('Error loading chats. Please try again later.');
      }
    }
  }, [currentUser?.user?.uid]); // Only recreate when user changes

  // Load saved chats when user changes
  useEffect(() => {
    if (currentUser?.user?.uid) {
      console.log('User changed, reloading chats for:', currentUser.user.uid);
      loadSavedChats();
    } else {
      console.log('No user, clearing saved chats');
      setSavedChats([]);
    }
  }, [currentUser?.user?.uid, loadSavedChats]);

  useEffect(() => {
    const initializeFirestore = async () => {
      setIsInitializing(true);
      try {
        // Simpler query just to test connection
        const testQuery = query(
          collection(db, 'chats'),
          where('userId', '==', currentUser?.user?.uid),
          limit(1)
        );
        await getDocs(testQuery);
        
        setIsFirestoreConnected(true);
        setFirestoreError(null);
      } catch (err) {
        console.error('Firestore initialization error:', err);
        if (err.message.includes('requires an index')) {
          setError('Database initialization required. Please contact the administrator to set up the required indexes.');
        } else {
          setIsFirestoreConnected(false);
          setFirestoreError(err.message);
        }
      } finally {
        setIsInitializing(false);
      }
    };

    if (currentUser?.user?.uid) {
      initializeFirestore();
    } else {
      setIsInitializing(false);
    }
  }, [currentUser?.user?.uid]);

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

  const scrollToBottom = () => {
    if (historyRef.current) {
      historyRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const formatTimestamp = () => {
    return new Date().toLocaleString();
  };

  const addMessage = (content, type = 'user') => {
    const newMessage = {
      type,
      content,
      timestamp: formatTimestamp(),
      isTyping: type === 'assistant'
    };
    setHistory(prev => [...prev, newMessage]);
    
    if (type === 'assistant') {
      // Remove typing animation after a brief delay
      setTimeout(() => {
        setHistory(prev => 
          prev.map(msg => 
            msg.type === 'assistant' && msg.timestamp === newMessage.timestamp
              ? { ...msg, isTyping: false }
              : msg
          )
        );
      }, 500); // Match the animation duration
    }
  };

  const typeMessage = (message) => {
    setIsTyping(true);
    let currentIndex = 0;
    setDisplayedContent('');
    
    const typeChar = () => {
      if (currentIndex < message.length) {
        setDisplayedContent(prev => message.substring(0, currentIndex + 1));
        currentIndex++;
        // Further reduced timing to 3.75ms-8.75ms for quadruple speed
        setTimeout(typeChar, Math.random() * 5 + 3.75);
      } else {
        setIsTyping(false);
      }
    };
    
    typeChar();
  };

  const renderTypingCursor = () => (
    <span className="inline-block w-2 h-2 ml-0.5 -mb-0.5 bg-accent-lilac rounded-full animate-pulse" />
  );

  const formatMarkdown = (text) => {
    // Replace markdown patterns with HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  };

  const formatMessage = (content) => {
    // Remove citation markers
    const cleanContent = content.replace(/【\d+:\d+†source】/g, '');
    
    return cleanContent.split('\n').map((paragraph, idx) => {
      if (!paragraph.trim()) return <div key={idx} className="h-2" />;

      // Check for numbered lists
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
            </p>
          </div>
        );
      }

      return (
        <p key={idx} className="text-sm mb-2 text-gray-200" 
           dangerouslySetInnerHTML={{ __html: formatMarkdown(paragraph) }} />
      );
    });
  };

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
                {idx === cleanContent.split('\n').length - 1 && renderTypingCursor()}
              </p>
            </div>
          );
        }
        
        // For the last paragraph, add the cursor
        if (idx === cleanContent.split('\n').length - 1) {
          return (
            <p key={idx} className="text-sm mb-2 text-gray-200">
              <span dangerouslySetInnerHTML={{ __html: formatMarkdown(paragraph) }} />
              {renderTypingCursor()}
            </p>
          );
        }
        
        return (
          <p key={idx} className="text-sm mb-2 text-gray-200"
             dangerouslySetInnerHTML={{ __html: formatMarkdown(paragraph) }} />
        );
      });
    }
    
    return formatMessage(message.content);
  };

  const handleNewChat = () => {
    setCurrentChat(null);
    setHistory([]);
    setMessageInput('');
    setError(null);
    setIsTyping(false);
    setDisplayedContent('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    let newChatId = chatId;
    let localHistory = [];

    try {
      const userMessage = { type: 'user', content: messageInput };
      localHistory = [...history, userMessage];
      
      setHistory(localHistory);
      setMessageInput('');

      // Create new chat if we don't have one
      if (!currentChat) {
        console.log('Creating new chat...');
        const chatData = {
          userId: currentUser.user.uid,
          title: messageInput.substring(0, 50),
          messages: localHistory,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'chats'), chatData);
        newChatId = docRef.id;
        
        const newChat = {
          id: newChatId,
          ...chatData,
          lastUpdated: new Date().toISOString()
        };
        
        setCurrentChat(newChat);
        setSavedChats(prev => [newChat, ...prev]);
      } else {
        // Update existing chat
        const chatRef = doc(db, 'chats', currentChat.id);
        await updateDoc(chatRef, {
          messages: localHistory,
          updatedAt: serverTimestamp()
        });
        
        setSavedChats(prev => prev.map(chat => 
          chat.id === currentChat.id 
            ? { ...chat, messages: localHistory, lastUpdated: new Date().toISOString() }
            : chat
        ));
      }

      // Get AI response
      let responseData;
      try {
        responseData = await getAssistantResponse(messageInput, currentUser.token);
        console.log('AI response received');
      } catch (err) {
        console.error('Error getting AI response:', err);
        throw new Error(`Failed to get AI response: ${err.message}`);
      }

      const assistantMessage = { type: 'assistant', content: responseData.response };
      const finalHistory = [...localHistory, assistantMessage];

      // Save AI response
      try {
        console.log('Saving AI response to chat:', newChatId);
        const chatRef = doc(db, 'chats', newChatId || currentChat.id);
        await updateDoc(chatRef, {
          messages: finalHistory,
          updatedAt: serverTimestamp()
        });
        
        setHistory(finalHistory);
        setCurrentChat(prev => ({
          ...prev,
          messages: finalHistory
        }));
        setSavedChats(prev => prev.map(chat => 
          chat.id === (newChatId || currentChat.id)
            ? { ...chat, messages: finalHistory, lastUpdated: new Date().toISOString() }
            : chat
        ));
        console.log('AI response saved successfully');
      } catch (err) {
        console.error('Error saving AI response:', err);
        throw new Error(`Failed to save AI response: ${err.message}`);
      }

      // Start typing animation
      setIsTyping(true);
      typeMessage(responseData.response);

    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'An error occurred. Please try again.');
      
      if (chatId) {
        loadSavedChats();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSaveChat = async () => {
    if (history.length === 0 || !currentUser?.user) {
      console.log('No messages to save or user not logged in');
      return;
    }
    
    try {
      console.log('Attempting to save chat...');
      console.log('Current user:', currentUser);
      console.log('User ID:', currentUser.user.uid);
      console.log('History length:', history.length);
      
      // Get the first user message for the title, or use the first AI message if no user message exists
      const firstMessage = history.find(msg => msg.type === 'user') || history[0];
      const title = firstMessage.content.length > 30 
        ? firstMessage.content.substring(0, 30) + '...'
        : firstMessage.content;

      const chatData = {
        userId: currentUser.user.uid,
        title,
        messages: history,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      console.log('Chat data to save:', chatData);

      if (currentChat?.id) {
        console.log('Updating existing chat:', currentChat.id);
        const chatRef = doc(db, 'chats', currentChat.id);
        await updateDoc(chatRef, {
          messages: history,
          lastUpdated: new Date().toISOString()
        });
        
        setSavedChats(prev => prev.map(chat => 
          chat.id === currentChat.id 
            ? { ...chat, messages: history, lastUpdated: new Date().toISOString() }
            : chat
        ));
      } else {
        console.log('Creating new chat...');
        const docRef = await addDoc(collection(db, 'chats'), chatData);
        console.log('Chat saved with ID:', docRef.id);
        const newChat = { id: docRef.id, ...chatData };
        setSavedChats(prev => [newChat, ...prev]);
        setCurrentChat(newChat);
      }
      
      setError({ type: 'success', message: 'Chat saved successfully!' });
      setTimeout(() => setError(null), 3000);
      
    } catch (error) {
      console.error('Error saving chat:', error);
      setError({ type: 'error', message: `Failed to save chat: ${error.message}` });
    }
  };

  const handleLoadChat = async (chat) => {
    setIsTyping(false);
    setError(null);
    
    try {
      const chatRef = doc(db, 'chats', chat.id);
      const chatDoc = await getDoc(chatRef);
      
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        // Set both current chat and history
        const fullChat = {
          ...chat,
          ...chatData,
          id: chat.id
        };
        setCurrentChat(fullChat);
        setHistory(chatData.messages || []);
        setChatId(chat.id);
      }
    } catch (err) {
      console.error('Error loading chat:', err);
      setError('Failed to load chat');
    }
  };

  const handleChatSelect = async (chat) => {
    setIsTyping(false);
    setError(null);
    
    try {
      const chatRef = doc(db, 'chats', chat.id);
      const chatDoc = await getDoc(chatRef);
      
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        // Set both current chat and history
        const fullChat = {
          ...chat,
          ...chatData,
          id: chat.id
        };
        setCurrentChat(fullChat);
        setHistory(chatData.messages || []);
        setChatId(chat.id);
      }
    } catch (err) {
      console.error('Error loading chat:', err);
      setError('Failed to load chat');
    }
  };

  const handleStartEdit = (chatId, existingTitle) => {
    setEditingChatId(chatId);
    setNewTitle(existingTitle || 'New Chat');
  };

  const handleSaveTitle = async (chatId) => {
    if (!newTitle.trim()) return;
    
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        title: newTitle.trim()
      });
      
      setSavedChats(prevChats =>
        prevChats.map(chat =>
          chat.id === chatId
            ? { ...chat, title: newTitle.trim() }
            : chat
        )
      );
      
      if (currentChat?.id === chatId) {
        setCurrentChat(prev => ({ ...prev, title: newTitle.trim() }));
      }
    } catch (error) {
      console.error('Error updating chat title:', error);
    } finally {
      setEditingChatId(null);
      setNewTitle('');
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      // Delete from Firestore
      const chatRef = doc(db, 'chats', chatId);
      await deleteDoc(chatRef);
      
      // Update local state
      setSavedChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
      
      // If the deleted chat was the current chat, clear it
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setHistory([]);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      setError('Failed to delete chat');
    }
  };

  // Load saved chats when component mounts
  useEffect(() => {
    const loadSavedChats = async () => {
      if (!currentUser?.user?.uid) return;
      
      // Simplified query without orderBy to avoid requiring composite index
      const chatsQuery = query(
        collection(db, 'chats'),
        where('userId', '==', currentUser.user.uid)
      );

      const querySnapshot = await getDocs(chatsQuery);
      const chats = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort chats client-side instead
      const sortedChats = chats.sort((a, b) => {
        const timeA = a.updatedAt?.seconds || 0;
        const timeB = b.updatedAt?.seconds || 0;
        return timeB - timeA;
      });
      
      setSavedChats(sortedChats);
    };

    loadSavedChats();
  }, [currentUser?.user?.uid, chatId]);

  useEffect(() => {
    return () => {
      setIsTyping(false);
      setDisplayedContent('');
    };
  }, [chatId]); // Reset when changing chats

  const renderError = () => {
    if (!error) return null;
    return (
      <div className="absolute bottom-20 left-0 right-0 px-4">
        <div className="bg-red-500 text-white p-3 rounded-md shadow-lg">
          {error}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-dark text-gray-100">
      <div className="w-64 bg-dark-lighter flex flex-col">
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full bg-accent-lilac text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            {savedChats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 cursor-pointer hover:bg-dark-lighter transition-colors duration-200 relative group flex items-center justify-between ${
                  currentChat?.id === chat.id ? 'bg-accent-lilac bg-opacity-20 border-l-4 border-accent-lilac' : ''
                }`}
                onClick={() => handleChatSelect(chat)}
              >
                <div className="flex-1 min-w-0 mr-2">
                  {editingChatId === chat.id ? (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveTitle(chat.id);
                      }}
                      className="flex items-center"
                    >
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onBlur={() => handleSaveTitle(chat.id)}
                        className="w-full bg-dark-lightest text-gray-100 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-accent-lilac focus:outline-none"
                        autoFocus
                      />
                    </form>
                  ) : (
                    <div className="truncate text-sm font-medium text-gray-100">
                      {chat.title || 'New Chat'}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {chat.createdAt instanceof Date 
                      ? chat.createdAt.toLocaleDateString()
                      : typeof chat.createdAt === 'string' 
                        ? new Date(chat.createdAt).toLocaleDateString()
                        : chat.createdAt?.toDate?.()
                          ? chat.createdAt.toDate().toLocaleDateString()
                          : 'Date not available'}
                  </p>
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(chat.id, chat.title);
                    }}
                    className="p-1 rounded hover:bg-accent-lilac hover:bg-opacity-20 transition-all duration-200"
                    title="Rename chat"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent-lilac" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this chat?')) {
                        handleDeleteChat(chat.id);
                      }
                    }}
                    className="p-1 rounded hover:bg-red-500 hover:bg-opacity-20 transition-all duration-200 ml-1"
                    title="Delete chat"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 110-2h5V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-dark-lightest mt-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-accent-lilac text-white rounded-lg px-4 min-h-[44px] flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full relative">
        {isInitializing ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Initializing application...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <h1 className="text-4xl font-bold text-gray-100 mb-4">Welcome to AviationAI</h1>
                  <p className="text-xl text-gray-300">Ask me anything about aviation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.type === 'user'
                            ? 'bg-accent-lilac text-white'
                            : 'bg-surface-DEFAULT text-gray-100'
                        }`}
                      >
                        <div className="prose prose-invert max-w-none">
                          {renderMessageContent(message, index === history.length - 1)}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex items-start">
                      <div className="max-w-[80%] bg-surface-DEFAULT rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-accent-lilac rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-accent-lilac rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                          <div className="w-2 h-2 bg-accent-lilac rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {error && (
              <div className="absolute bottom-20 left-0 right-0 px-4">
                <div className="bg-red-500 text-white p-3 rounded-md shadow-lg">
                  {error}
                </div>
              </div>
            )}
            <div className="p-4 border-t border-gray-700">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 min-h-[44px] max-h-32 p-2 bg-dark-lighter text-gray-100 border border-dark-lightest rounded-lg focus:ring-2 focus:ring-accent-lilac focus:border-transparent resize-none placeholder-gray-500"
                  rows="1"
                />
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleSaveChat}
                    disabled={history.length === 0}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      history.length === 0
                        ? 'bg-dark-lighter text-gray-600 cursor-not-allowed'
                        : 'bg-dark-lighter text-gray-300 hover:bg-dark-lightest'
                    }`}
                    title="Save chat"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !messageInput.trim()}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      isLoading || !messageInput.trim()
                        ? 'bg-dark-lighter text-gray-600 cursor-not-allowed'
                        : 'bg-accent-lilac text-white hover:bg-accent-lilac-dark'
                    }`}
                  >
                    Send
                  </button>
                </div>
              </form>
              {error && (
                <div className="mt-2 p-2 text-sm text-red-300 bg-red-900 bg-opacity-50 rounded-md">
                  {error.message}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AiChat;