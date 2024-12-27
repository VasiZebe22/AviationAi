import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const AiChat = () => {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedChats, setSavedChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const historyRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const formatTimestamp = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const scrollToBottom = () => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    // Add user message
    setHistory(prev => [...prev, {
      type: 'user',
      content: messageInput,
      timestamp: formatTimestamp()
    }]);

    // Add temporary AI message with "Thinking..." state
    setHistory(prev => [...prev, {
      type: 'ai',
      content: 'Thinking...',
      timestamp: formatTimestamp(),
      isThinking: true
    }]);

    setMessageInput('');
    setIsLoading(true);
    setError(null);

    try {
      if (!currentUser?.token) {
        throw new Error('No auth token found');
      }

      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ message: messageInput }),
      });

      const responseData = await response.json();

      // Replace the "Thinking..." message with the actual response
      setHistory(prev => prev.map((msg, index) => {
        if (index === prev.length - 1 && msg.isThinking) {
          return {
            type: 'ai',
            content: responseData.response,
            timestamp: formatTimestamp(),
            isTyping: true
          };
        }
        return msg;
      }));

      // After a delay, remove the typing animation
      setTimeout(() => {
        setHistory(prev => prev.map((msg, index) => {
          if (index === prev.length - 1) {
            return { ...msg, isTyping: false };
          }
          return msg;
        }));
        scrollToBottom();
      }, 500);

    } catch (err) {
      console.error('Chat Error:', err);
      setError('Failed to get response from AI');
      // Remove the "Thinking..." message on error
      setHistory(prev => prev.filter(msg => !msg.isThinking));
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

  return (
    <div className="flex h-screen bg-dark text-gray-100">
      <div className={`fixed inset-y-0 left-0 w-64 bg-surface-DEFAULT shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-dark-lightest">
            <h2 className="text-xl font-semibold text-gray-100">Conversations</h2>
          </div>
          
          <div className="flex flex-col flex-1">
            <button
              onClick={handleNewChat}
              className="m-4 px-4 py-2 bg-accent-lilac text-white rounded-lg hover:bg-accent-lilac-dark transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Chat</span>
            </button>
            
            <div className="flex-1 overflow-y-auto">
              {savedChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleLoadChat(chat)}
                  className={`p-3 cursor-pointer hover:bg-dark-lighter transition-colors duration-200 ${
                    currentChat?.id === chat.id ? 'bg-accent-lilac bg-opacity-20 border-l-4 border-accent-lilac' : ''
                  }`}
                >
                  <p className="text-sm font-medium text-gray-100 truncate">{chat.title || 'New Chat'}</p>
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
              ))}
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="m-4 px-4 py-2 bg-dark-lighter text-gray-300 rounded-lg hover:bg-dark-lightest transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full">
        <button 
          className="md:hidden fixed top-4 left-4 z-20 p-2 rounded-md bg-surface-DEFAULT shadow-md hover:bg-surface-light"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex-1 overflow-y-auto p-4 md:p-6" ref={historyRef}>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <h1 className="text-4xl font-bold text-gray-100 mb-4">Welcome to AviationAI</h1>
              <p className="text-xl text-gray-300">Ask me anything about aviation!</p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {history.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start mb-4 ${message.type === 'user' ? 'justify-end' : ''}`}
                >
                  {message.type === 'ai' && (
                    <div className="flex-shrink-0 w-8 h-8">
                      <img src="/ai-avatar.png" alt="AI" className="w-full h-full rounded-full" />
                    </div>
                  )}
                  <div className={`ml-3 ${message.type === 'user' ? 'order-first mr-3' : ''}`}>
                    {message.type === 'ai' ? (
                      message.isThinking ? (
                        <div className="text-sm text-gray-400">
                          Thinking...
                        </div>
                      ) : (
                        <div className={`prose prose-invert max-w-none ${message.isTyping ? 'typing-animation' : ''}`}>
                          {formatMessage(message.content)}
                        </div>
                      )
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              ))}
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