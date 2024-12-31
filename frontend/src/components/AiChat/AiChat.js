import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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

const BookmarkButton = ({ message, isBookmarked, onToggle, messageType, chatId }) => {
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked);
  const [isInitialRender, setIsInitialRender] = useState(true);

  // Reset state when chat or message changes
  useEffect(() => {
    setLocalBookmarked(isBookmarked);
    setIsInitialRender(true);
  }, [isBookmarked, chatId, message.messageId]);

  useEffect(() => {
    if (isInitialRender) {
      const timer = setTimeout(() => setIsInitialRender(false), 0);
      return () => clearTimeout(timer);
    }
  }, [isInitialRender]);

  const handleClick = async (e) => {
    e.stopPropagation();
    setLocalBookmarked(!localBookmarked);
    await onToggle(e);
  };

  return (
    <button
      onClick={handleClick}
      className={`absolute ${
        messageType === 'user' ? 'left-0 -translate-x-[110%]' : 'right-0 translate-x-[110%]'
      } top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-dark-lightest ${
        isInitialRender ? '' : 'transition-all duration-200'
      } ${
        localBookmarked 
          ? 'opacity-100 text-accent-lilac' 
          : `opacity-0 ${!isInitialRender ? 'group-hover:opacity-100' : ''} text-gray-400`
      }`}
      title={localBookmarked ? "Remove bookmark" : "Bookmark message"}
    >
      <svg 
        className="w-5 h-5" 
        fill={localBookmarked ? "currentColor" : "none"} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
        />
      </svg>
    </button>
  );
};

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
  const [forceUpdate, setForceUpdate] = useState(0);
  const historyRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [showStarredChatsOnly, setShowStarredChatsOnly] = useState(false);
  const [showBookmarkedMessagesOnly, setShowBookmarkedMessagesOnly] = useState(false);

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
          updatedAt: serverTimestamp(),
          starred: false
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
        
        setSavedChats(prevChats =>
          prevChats.map(chat =>
            chat.id === currentChat.id 
              ? { ...chat, messages: history, lastUpdated: new Date().toISOString() }
              : chat
          )
        );
        
        if (currentChat?.id === chatId) {
          setCurrentChat(prev => ({ ...prev, messages: history, lastUpdated: new Date().toISOString() }));
        }
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
    setShowBookmarkedMessagesOnly(false); // Reset filter when changing chats
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

  const toggleStar = async () => {
    if (!currentChat) return;

    try {
      const chatRef = doc(db, 'chats', currentChat.id);
      const newStarredState = !currentChat.starred;

      // Update local state immediately
      setCurrentChat(prev => ({
        ...prev,
        starred: newStarredState
      }));

      // Also update the chat in the savedChats list
      setSavedChats(prev => prev.map(chat => 
        chat.id === currentChat.id 
          ? { ...chat, starred: newStarredState }
          : chat
      ));

      // Update Firestore
      await updateDoc(chatRef, {
        starred: newStarredState
      });
    } catch (error) {
      console.error('Error toggling star:', error);
      // Revert local state if Firestore update fails
      setCurrentChat(prev => ({
        ...prev,
        starred: !prev.starred
      }));
      setSavedChats(prev => prev.map(chat => 
        chat.id === currentChat.id 
          ? { ...chat, starred: !chat.starred }
          : chat
      ));
    }
  };

  // Add bookmark function
  const toggleBookmark = async (messageIndex, e) => {
    e.stopPropagation();
    if (!currentChat) return;

    try {
      const chatRef = doc(db, 'chats', currentChat.id);
      const updatedMessages = [...currentChat.messages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        bookmarked: !updatedMessages[messageIndex].bookmarked
      };

      // Update local states immediately
      setCurrentChat(prev => ({
        ...prev,
        messages: updatedMessages
      }));

      // Update history state to reflect in the filtered view
      setHistory(updatedMessages);

      // Update savedChats to maintain consistency
      setSavedChats(prev => prev.map(chat => 
        chat.id === currentChat.id 
          ? { ...chat, messages: updatedMessages }
          : chat
      ));

      // Update Firestore
      await updateDoc(chatRef, {
        messages: updatedMessages
      });

    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert local states if Firestore update fails
      const revertedMessages = [...currentChat.messages];
      setCurrentChat(prev => ({
        ...prev,
        messages: revertedMessages
      }));
      setHistory(revertedMessages);
      setSavedChats(prev => prev.map(chat => 
        chat.id === currentChat.id 
          ? { ...chat, messages: revertedMessages }
          : chat
      ));
    }
  };

  // Update message rendering
  const renderMessage = (message, index) => {
    if (!currentChat) return null;
    
    return (
      <div
        key={`${currentChat.id}-message-${index}-${message.bookmarked}`}
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
            {renderMessageContent(message, index === history.length - 1)}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {formatTimestamp(message.timestamp)}
          </div>
          <BookmarkButton 
            key={`bookmark-${currentChat.id}-${index}-${message.bookmarked}`}
            message={message}
            isBookmarked={message.bookmarked}
            onToggle={(e) => toggleBookmark(index, e)}
            messageType={message.type}
            chatId={currentChat.id}
          />
        </div>
      </div>
    );
  };

  const renderChatListItem = (chat) => {
    // If chat has no timestamp and it's the current chat (new chat), use current time
    const chatDate = chat?.createdAt?.toDate?.() || (currentChat === null ? new Date() : null);
    const formattedDate = chatDate ? formatTimestamp(chatDate) : 'Date not available';
    
    return (
      <div
        key={chat?.id || 'new-chat'}
        className={`p-3 cursor-pointer hover:bg-dark-lighter transition-colors duration-200 relative group flex items-center justify-between ${
          currentChat?.id === chat?.id ? 'bg-accent-lilac bg-opacity-20 border-l-4 border-accent-lilac' : ''
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
            <div className="flex items-center space-x-2">
              {chat.starred && (
                <svg
                  className="w-4 h-4 text-accent-lilac flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.363-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h4.461a1 1 0 001 1.81z"
                  />
                </svg>
              )}
              <span className="truncate text-sm font-medium text-gray-100">
                {chat.title || 'New Chat'}
              </span>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {formattedDate}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const groupChatsByDate = (chats) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const groups = {
      today: [],
      yesterday: [],
      previous30Days: [],
      byMonth: {}
    };

    chats.forEach(chat => {
      let chatDate;
      
      // For new chats without any dates, put them in today's group
      if (!chat.createdAt && !chat.updatedAt) {
        groups.today.push(chat);
        return;
      }

      if (chat.createdAt?.toDate) {
        chatDate = chat.createdAt.toDate();
      } else if (chat.createdAt instanceof Date) {
        chatDate = chat.createdAt;
      } else if (chat.createdAt) {
        chatDate = new Date(chat.createdAt);
      } else if (chat.updatedAt?.toDate) {
        chatDate = chat.updatedAt.toDate();
      } else if (chat.updatedAt instanceof Date) {
        chatDate = chat.updatedAt;
      } else if (chat.updatedAt) {
        chatDate = new Date(chat.updatedAt);
      } else {
        groups.today.push(chat);
        return;
      }

      // Handle invalid dates
      if (isNaN(chatDate.getTime())) {
        groups.today.push(chat);
        return;
      }

      chatDate.setHours(0, 0, 0, 0);

      if (chatDate.getTime() === today.getTime()) {
        groups.today.push(chat);
      } else if (chatDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(chat);
      } else if (chatDate >= thirtyDaysAgo && chatDate < yesterday) {
        groups.previous30Days.push(chat);
      } else {
        const monthYear = chatDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!groups.byMonth[monthYear]) {
          groups.byMonth[monthYear] = [];
        }
        groups.byMonth[monthYear].push(chat);
      }
    });

    return groups;
  };

  const renderDateHeader = (title) => (
    <div className="px-4 pt-8 pb-2 first:pt-3">
      <h3 className="text-base font-semibold text-gray-400">{title}</h3>
    </div>
  );

  const renderChatList = () => {
    const filteredChats = savedChats.filter(chat => 
      !showStarredChatsOnly || chat.starred
    );

    const groupedChats = groupChatsByDate(filteredChats);
    
    return (
      <div className="space-y-6">
        {groupedChats.today.length > 0 && (
          <div>
            {renderDateHeader('Today')}
            <div className="space-y-1">
              {groupedChats.today.map(chat => renderChatListItem(chat))}
            </div>
          </div>
        )}
        
        {groupedChats.yesterday.length > 0 && (
          <div>
            {renderDateHeader('Yesterday')}
            <div className="space-y-1">
              {groupedChats.yesterday.map(chat => renderChatListItem(chat))}
            </div>
          </div>
        )}
        
        {groupedChats.previous30Days.length > 0 && (
          <div>
            {renderDateHeader('Previous 30 Days')}
            <div className="space-y-1">
              {groupedChats.previous30Days.map(chat => renderChatListItem(chat))}
            </div>
          </div>
        )}
        
        {Object.entries(groupedChats.byMonth).map(([monthYear, monthChats]) => (
          <div key={monthYear}>
            {renderDateHeader(monthYear)}
            <div className="space-y-1">
              {monthChats.map(chat => renderChatListItem(chat))}
            </div>
          </div>
        ))}

        {filteredChats.length === 0 && (
          <div className="px-4 py-2 text-sm text-gray-400">
            No chats found
          </div>
        )}
      </div>
    );
  };

  // Add this helper function to convert any date format to timestamp
  const getTimestamp = (date) => {
    if (date instanceof Date) {
      return date.getTime();
    }
    if (typeof date === 'string') {
      return new Date(date).getTime();
    }
    if (date?.toDate) {
      return date.toDate().getTime();
    }
    return 0; // fallback for invalid dates
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
      const sortedChats = chats.sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt));
      
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

  const displayedMessages = useMemo(() => {
    if (!currentChat?.messages) return [];
    return currentChat.messages.filter(msg => !showBookmarkedMessagesOnly || msg.bookmarked);
  }, [currentChat?.messages, showBookmarkedMessagesOnly]);

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
          <div className="flex items-center space-x-2">
            <button
              onClick={handleNewChat}
              className="flex-1 bg-accent-lilac text-white rounded-lg px-3 py-2 flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Chat
            </button>
            <button
              onClick={() => setShowStarredChatsOnly(prev => !prev)}
              className={`p-2 rounded hover:bg-accent-lilac hover:bg-opacity-20 transition-all duration-200 ${
                showStarredChatsOnly ? 'text-accent-lilac bg-accent-lilac bg-opacity-20' : 'text-gray-400'
              }`}
              title={showStarredChatsOnly ? "Show all chats" : "Show starred chats only"}
            >
              <svg 
                className="w-5 h-5" 
                fill={showStarredChatsOnly ? "currentColor" : "none"} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            {renderChatList()}
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

      <div className="flex-1 flex flex-col">
        {isInitializing ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Initializing application...</p>
            </div>
          </div>
        ) : (
          <>
            <div 
              ref={historyRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
            >
              {currentChat && displayedMessages.map((message, index) => renderMessage(message, index))}
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
              {!currentChat && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <h1 className="text-4xl font-bold text-gray-100 mb-4">Welcome to AviationAI</h1>
                  <p className="text-xl text-gray-300">Start a new chat to begin!</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-dark-lightest">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full bg-dark-lightest text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-lilac resize-none"
                    rows={1}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={toggleStar}
                    className={`p-2 rounded-lg ${
                      currentChat?.starred
                        ? 'bg-accent-lilac text-white'
                        : 'bg-dark-lighter text-gray-400 hover:text-accent-lilac hover:bg-dark-lightest'
                    }`}
                    title={currentChat?.starred ? "Unstar chat" : "Star chat"}
                  >
                    <svg className="w-5 h-5" fill={currentChat?.starred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowBookmarkedMessagesOnly(!showBookmarkedMessagesOnly)}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      showBookmarkedMessagesOnly 
                        ? 'bg-accent-lilac bg-opacity-20 text-accent-lilac'
                        : 'bg-dark-lighter text-gray-400 hover:text-accent-lilac hover:bg-dark-lightest'
                    }`}
                    title={showBookmarkedMessagesOnly ? "Show all messages" : "Show bookmarked messages only"}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={showBookmarkedMessagesOnly ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!messageInput.trim() || isLoading}
                    className={`p-2 rounded-lg ${
                      messageInput.trim() && !isLoading
                        ? 'bg-accent-lilac text-white'
                        : 'bg-dark-lighter text-gray-400 cursor-not-allowed'
                    }`}
                    title="Send message"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="absolute bottom-20 left-0 right-0 px-4">
                <div className="bg-red-500 text-white p-3 rounded-md shadow-lg">
                  {error}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AiChat;