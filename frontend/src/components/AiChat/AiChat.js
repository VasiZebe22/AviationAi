import React, { useState, useRef, useEffect } from 'react';
import './AiChat.css';
import { useAuth } from '../../contexts/AuthContext';
import { getAssistantResponse } from '../../api/assistant';
import { useNavigate } from 'react-router-dom';

const AiChat = () => {
  const { currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedChats, setSavedChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const historyRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const formatTimestamp = () => {
    return new Date().toLocaleTimeString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const newQuery = { 
      user: query, 
      ai: '', 
      timestamp: formatTimestamp() 
    };
    setHistory([...history, newQuery]);
    setQuery('');
    setIsLoading(true);
    setError(null);

    try {
      if (!currentUser?.token) {
        throw new Error('Not authenticated');
      }

      const responseData = await getAssistantResponse(query, currentUser.token);
      setHistory((prevHistory) => {
        const updatedHistory = [...prevHistory];
        updatedHistory[updatedHistory.length - 1].ai = responseData.response;
        updatedHistory[updatedHistory.length - 1].aiTimestamp = formatTimestamp();
        return updatedHistory;
      });
    } catch (err) {
      console.error('Chat Error:', err);
      setError('Failed to get response from AI');
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
  };

  const handleSaveChat = () => {
    if (history.length > 0) {
      const newChat = {
        id: Date.now(),
        title: history[0].user.substring(0, 30) + '...',
        messages: [...history]
      };
      setSavedChats([newChat, ...savedChats]);
    }
  };

  const handleLoadChat = (chat) => {
    setCurrentChat(chat);
    setHistory(chat.messages);
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="ai-chat">
      <button 
        className="sidebar-toggle" 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>
      
      <aside className={`chat-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          Aviation AI
        </div>
        <button 
          className="dashboard-button"
          onClick={handleDashboardClick}
        >
          Dashboard
        </button>
        <button className="new-chat-button" onClick={handleNewChat}>
          New Chat
        </button>
        <div className="chat-history-list">
          {savedChats.map(chat => (
            <div
              key={chat.id}
              className={`chat-history-item ${currentChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => handleLoadChat(chat)}
            >
              {chat.title}
            </div>
          ))}
        </div>
      </aside>

      <main className="chat-container">
        <div className="history" ref={historyRef}>
          {history.map((item, index) => (
            <div key={index} className="message-group">
              <div className="message-bubble user-message">
                {item.user}
                <div className="timestamp">{item.timestamp}</div>
              </div>
              {item.ai && (
                <div className="message-bubble ai-message">
                  {item.ai}
                  <div className="timestamp">{item.aiTimestamp}</div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>

        <form className="query-form" onSubmit={handleSubmit}>
          <textarea
            className="query-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about aviation..."
            rows={1}
            style={{
              minHeight: '50px',
              maxHeight: '200px',
              overflow: 'auto'
            }}
          />
          <div className="button-group">
            <button 
              type="submit" 
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
            <button 
              type="button" 
              onClick={handleSaveChat}
              className="save-button"
            >
              Save Chat
            </button>
          </div>
        </form>
        {error && <div className="error-message">{error}</div>}
      </main>
    </div>
  );
};

export default AiChat;