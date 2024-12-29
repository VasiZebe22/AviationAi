import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAssistantResponse } from '../../api/assistant';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../../services/firebase';

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
  const historyRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Wrap loadSavedChats in useCallback to prevent infinite re-renders
  const loadSavedChats = useCallback(async () => {
    if (!currentUser?.user) {
      console.log('No user logged in, skipping chat load');
      return;
    }
    
    try {
      console.log('Loading chats for user:', currentUser.user.uid);
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('userId', '==', currentUser.user.uid),
        orderBy('createdAt', 'desc')
      );
      
      console.log('Executing Firestore query...');
      const querySnapshot = await getDocs(q);
      console.log('Query returned:', querySnapshot.size, 'chats');
      
      const chats = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Chat data:', { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data
        };
      });
      
      console.log('Setting saved chats:', chats.length, 'chats found');
      setSavedChats(chats);
    } catch (error) {
      console.error('Error loading chats:', error);
      setError({ type: 'error', message: `Failed to load chats: ${error.message}` });
    }
  }, [currentUser?.user]); // Only recreate when user changes

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
        setDisplayedContent(message.substring(0, currentIndex + 1)); // Use substring instead of concatenation
        currentIndex++;
        setTimeout(typeChar, Math.random() * 5 + 3);
      } else {
        setIsTyping(false);
      }
    };
    
    typeChar();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const userMessage = { type: 'user', content: messageInput };
      const newHistory = [...history, userMessage];
      setHistory(newHistory);
      setMessageInput('');

      // Auto-save chat if this is the first message
      if (history.length === 0) {
        const firstMessagePreview = messageInput.slice(0, 25) + (messageInput.length > 25 ? '...' : '');
        const chatRef = await addDoc(collection(db, 'chats'), {
          userId: currentUser.user.uid,
          title: firstMessagePreview,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          messages: [userMessage]
        });
        setChatId(chatRef.id);
      } else if (chatId) {
        // Update existing chat
        const chatRef = doc(db, 'chats', chatId);
        await updateDoc(chatRef, {
          updatedAt: serverTimestamp(),
          messages: newHistory // Update with full messages array
        });
      }

      const responseData = await getAssistantResponse(messageInput, currentUser.token);
      
      const assistantMessage = { type: 'assistant', content: responseData.response };
      const finalHistory = [...newHistory, assistantMessage];
      setHistory(finalHistory);

      // Update chat with assistant's response
      if (chatId) {
        const chatRef = doc(db, 'chats', chatId);
        await updateDoc(chatRef, {
          messages: finalHistory // Update with full messages array including assistant's response
        });
      }

    } catch (err) {
      setError(err);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleNewChat = async () => {
    // Save current chat if there are messages
    if (history.length > 0 && currentUser?.user) {
      try {
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

        if (currentChat?.id) {
          const chatRef = doc(db, 'chats', currentChat.id);
          await updateDoc(chatRef, {
            messages: history,
            lastUpdated: new Date().toISOString()
          });
        } else {
          const docRef = await addDoc(collection(db, 'chats'), chatData);
          setSavedChats(prev => [{ id: docRef.id, ...chatData }, ...prev]);
        }
      } catch (error) {
        console.error('Error saving chat:', error);
        setError({ type: 'error', message: 'Failed to save chat before creating new one' });
      }
    }

    // Start new chat
    setCurrentChat(null);
    setHistory([]);
    if (inputRef.current) {
      inputRef.current.focus();
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
    try {
      const chatRef = doc(db, 'chats', chat.id);
      const chatDoc = await getDoc(chatRef);
      
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        setHistory(chatData.messages || []);
        setChatId(chat.id);
      }
    } catch (err) {
      console.error('Error loading chat:', err);
      setError('Failed to load chat');
    }
  };

  const formatMarkdown = (text) => {
    // Process the text in order of precedence
    const parts = text.split(/(\*\*.*?\*\*|__.*?__|`.*?`|\*.*?\*|_.*?_|\[.*?\]\(.*?\))/g);
    
    return parts.map((part, i) => {
      // Code
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-dark-lighter text-gray-300 font-mono text-sm">
            {part.slice(1, -1)}
          </code>
        );
      }
      // Bold
      if ((part.startsWith('**') && part.endsWith('**')) || 
          (part.startsWith('__') && part.endsWith('__'))) {
        return (
          <strong key={i} className="font-bold text-gray-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Italic
      if ((part.startsWith('*') && part.endsWith('*')) || 
          (part.startsWith('_') && part.endsWith('_'))) {
        return (
          <em key={i} className="italic text-gray-100">
            {part.slice(1, -1)}
          </em>
        );
      }
      // Links
      if (part.match(/\[.*?\]\(.*?\)/)) {
        const [text, url] = part.match(/\[(.*?)\]\((.*?)\)/).slice(1);
        return (
          <a 
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-lilac hover:text-accent-lilac-dark underline"
          >
            {text}
          </a>
        );
      }
      // Regular text
      return part;
    });
  };

  const formatMessage = (content) => {
    // Remove citation markers like 【4:0†source】
    content = content.replace(/【\d+:\d+†source】/g, '');
    
    return content.split('\n').map((paragraph, idx) => {
      // Sub-bullet points and nested lists
      if (paragraph.match(/^\s+[•\-*]\s/)) {
        const level = Math.floor(paragraph.match(/^\s*/)[0].length / 2);
        return (
          <div key={idx} className={`flex items-start space-x-2 mb-2 ml-${level * 4}`}>
            <div className="flex-shrink-0 w-1 h-1 rounded-full bg-gray-400 mt-2.5"></div>
            <p className="text-sm text-gray-200">
              {formatMarkdown(paragraph.replace(/^\s+[•\-*]\s/, ''))}
            </p>
          </div>
        );
      }

      // Regular bullet points
      if (paragraph.match(/^[•\-*]\s/)) {
        return (
          <div key={idx} className="flex items-start space-x-2 mb-2">
            <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-400 mt-2"></div>
            <p className="text-sm text-gray-200">
              {formatMarkdown(paragraph.replace(/^[•\-*]\s/, ''))}
            </p>
          </div>
        );
      }

      // Headers
      if (paragraph.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-xl font-bold text-gray-100 mb-4">
            {formatMarkdown(paragraph.substring(2))}
          </h1>
        );
      }
      if (paragraph.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-lg font-bold text-gray-100 mb-3">
            {formatMarkdown(paragraph.substring(3))}
          </h2>
        );
      }
      if (paragraph.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base font-bold text-gray-100 mb-2">
            {formatMarkdown(paragraph.substring(4))}
          </h3>
        );
      }

      // Numbered lists
      if (paragraph.match(/^\d+\./)) {
        const [number, ...rest] = paragraph.split('.');
        return (
          <div key={idx} className="flex items-start space-x-2 mb-2">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-lilac bg-opacity-20 flex items-center justify-center">
              <span className="text-sm text-accent-lilac">{number.trim()}</span>
            </div>
            <p className="text-sm mt-0.5 text-gray-200">
              {formatMarkdown(rest.join('.').trim())}
            </p>
          </div>
        );
      }

      // Code blocks
      if (paragraph.startsWith('```')) {
        return (
          <pre key={idx} className="bg-dark-lighter rounded-lg p-4 mb-4 overflow-x-auto">
            <code className="text-sm text-gray-300 font-mono">
              {paragraph.replace(/```/g, '').trim()}
            </code>
          </pre>
        );
      }

      // Regular paragraphs
      if (paragraph.trim()) {
        return (
          <p key={idx} className="text-sm mb-2 text-gray-200">
            {formatMarkdown(paragraph)}
          </p>
        );
      }

      // Empty lines
      return <div key={idx} className="h-2" />;
    });
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

  const handleChatSelect = async (chat) => {
    try {
      const chatRef = doc(db, 'chats', chat.id);
      const chatDoc = await getDoc(chatRef);
      
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        setHistory(chatData.messages || []);
        setChatId(chat.id);
      }
    } catch (err) {
      console.error('Error loading chat:', err);
      setError('Failed to load chat');
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
                  <div className="truncate text-sm font-medium text-gray-100">
                    {chat.title || 'New Chat'}
                  </div>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

      <div className="flex-1 flex flex-col h-full">
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
                    {message.type === 'assistant' && index === history.length - 1 && isTyping ? (
                      <div className="prose prose-invert max-w-none">
                        <span>{displayedContent && formatMessage(displayedContent)}</span>
                        <span className="typing-cursor"></span>
                      </div>
                    ) : (
                      <div className={`prose prose-invert max-w-none ${message.isTyping ? 'typing-animation' : ''}`}>
                        {formatMessage(message.content)}
                      </div>
                    )}
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

        <div className="border-t border-dark-lightest p-4 bg-surface-DEFAULT">
          <form onSubmit={handleSubmit} className="flex space-x-4">
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
      </div>
    </div>
  );
};

export default AiChat;