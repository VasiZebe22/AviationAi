import React, { useState, useRef, useEffect, useCallback } from 'react';
import './AiChat.css';
import { useAuth } from '../../contexts/AuthContext';
import { getAssistantResponse } from '../../api/assistant';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const AiChat = () => {
  const { currentUser } = useAuth();
  const [messageInput, setMessageInput] = useState('');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedChats, setSavedChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const userMessage = { 
      type: 'user',
      content: messageInput, 
      timestamp: formatTimestamp() 
    };
    
    setHistory(prev => [...prev, userMessage]);
    setMessageInput('');
    setIsLoading(true);
    setError(null);

    try {
      if (!currentUser?.token) {
        throw new Error('Not authenticated');
      }

      // Add typing indicator
      setHistory(prev => [...prev, { type: 'typing' }]);

      const responseData = await getAssistantResponse(messageInput, currentUser.token);
      
      // Remove typing indicator and add AI response
      setHistory(prev => {
        const newHistory = prev.filter(msg => msg.type !== 'typing');
        return [...newHistory, {
          type: 'ai',
          content: responseData.response,
          timestamp: formatTimestamp()
        }];
      });

    } catch (err) {
      console.error('Chat Error:', err);
      setError('Failed to get response from AI');
      setHistory(prev => prev.filter(msg => msg.type !== 'typing'));
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

  const handleNewChat = () => {
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

  const handleLoadChat = (chat) => {
    setCurrentChat(chat);
    setHistory(chat.messages);
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="ai-chat">
      <div className={`chat-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Conversations</h2>
        </div>
        <button className="new-chat-button" onClick={handleNewChat}>
          <i className="fas fa-plus"></i> New Chat
        </button>
        <div className="chat-history-list">
          {savedChats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-history-item ${currentChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => handleLoadChat(chat)}
            >
              <span className="chat-title">{chat.title}</span>
              <div className="chat-meta">
                <span className="chat-date">
                  {new Date(chat.createdAt).toLocaleDateString()}
                </span>
                <span className="chat-messages-count">
                  {chat.messages.length} messages
                </span>
              </div>
            </div>
          ))}
          {savedChats.length === 0 && (
            <div className="no-chats-message">
              No saved conversations yet
            </div>
          )}
        </div>
        <button className="dashboard-button" onClick={() => navigate('/dashboard')}>
          <i className="fas fa-home"></i> Dashboard
        </button>
      </div>

      <div className={`chat-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <button 
          className="toggle-sidebar"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <i className="fas fa-chevron-right"></i>
        </button>

        <div className="chat-messages" ref={historyRef}>
          {history.length === 0 && (
            <div className="welcome-message">
              <h1>Welcome to AviationAI</h1>
              <p>Ask me anything about aviation!</p>
            </div>
          )}
          
          {history.map((message, index) => (
            message.type === 'typing' ? (
              <div key="typing" className="message ai typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            ) : (
              <div 
                key={index} 
                className={`message ${message.type} ${message.type === 'ai' ? 'with-avatar' : ''}`}
              >
                {message.type === 'ai' && (
                  <div className="avatar">
                    <i className="fas fa-robot"></i>
                  </div>
                )}
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  <div className="message-timestamp">{message.timestamp}</div>
                </div>
              </div>
            )
          ))}
        </div>

        <div className="chat-input-container">
          <form className="chat-form" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows="1"
              className="chat-input"
            />
            <button 
              type="button" 
              className="save-button" 
              onClick={handleSaveChat}
              disabled={history.length === 0}
            >
              <i className="fas fa-bookmark"></i>
            </button>
            <button type="submit" className="send-button" disabled={!messageInput.trim() || isLoading}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
          {error && (
            <div className={`error-message ${error.type}`}>
              {error.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiChat;