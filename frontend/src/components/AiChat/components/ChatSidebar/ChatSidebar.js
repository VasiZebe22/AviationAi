import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatHistoryItem from './ChatHistoryItem';
import NewChatButton from './NewChatButton';
import ChatFilter from './ChatFilter';
import ErrorDisplay from '../shared/ErrorDisplay';

/**
 * Main sidebar component containing chat history and controls
 * @param {Object} props - Component props
 * @param {Array} props.chats - List of chat objects
 * @param {string} props.currentChatId - ID of the current active chat
 * @param {Function} props.onChatSelect - Function to call when a chat is selected
 * @param {Function} props.onNewChat - Function to call when new chat button is clicked
 * @param {Function} props.onDeleteChat - Function to call when a chat is deleted
 * @param {Function} props.onToggleStar - Function to toggle starred status
 * @param {Function} props.onEditTitle - Function to call when a chat title is edited
 * @param {boolean} props.isOpen - Whether the sidebar is open
 * @param {boolean} props.error - Error message to display
 * @param {Function} props.setError - Function to set error state
 */
const ChatSidebar = ({ 
  chats = [], 
  currentChatId, 
  onChatSelect, 
  onNewChat, 
  onDeleteChat, 
  onToggleStar,
  onEditTitle,
  isOpen,
  error,
  setError
}) => {
  const navigate = useNavigate();
  const [editingChatId, setEditingChatId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [showStarredChatsOnly, setShowStarredChatsOnly] = useState(false);

  // Filter chats based on star status if filter is active
  const filteredChats = showStarredChatsOnly
    ? chats.filter(chat => chat.starred)
    : chats;

  const handleChatSelect = (chat) => {
    onChatSelect(chat);
  };

  const handleEditClick = (chatId, currentTitle) => {
    setEditingChatId(chatId);
    setNewTitle(currentTitle);
  };

  const handleTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const handleTitleSubmit = (e, chatId) => {
    e.preventDefault();
    if (newTitle.trim()) {
      setEditingChatId(null);
      
      // Call the onEditTitle prop from parent component
      onEditTitle(chatId, newTitle);
    }
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setNewTitle('');
  };

  const handleToggleStarredFilter = () => {
    setShowStarredChatsOnly(!showStarredChatsOnly);
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <aside className={`chat-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Chat History</h2>
      </div>
      
      <NewChatButton onClick={onNewChat} />
      
      <ChatFilter 
        showStarredOnly={showStarredChatsOnly}
        onToggleStarredFilter={handleToggleStarredFilter}
      />
      
      {error && (
        <div className="px-4 mt-2">
          <ErrorDisplay 
            error={error} 
            onDismiss={() => setError(null)} 
          />
        </div>
      )}
      
      <div className="chat-history-list">
        {filteredChats.length > 0 ? (
          filteredChats.map(chat => (
            <div key={chat.id}>
              {editingChatId === chat.id ? (
                <form onSubmit={(e) => handleTitleSubmit(e, chat.id)} className="p-2 bg-gray-800 rounded-lg mb-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={handleTitleChange}
                    className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded text-white"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-sm bg-accent-lilac hover:bg-accent-lilac-dark text-white rounded"
                    >
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <ChatHistoryItem
                  chat={chat}
                  activeId={currentChatId}
                  onSelect={handleChatSelect}
                  onDelete={onDeleteChat}
                  onToggleStar={onToggleStar}
                  onEdit={handleEditClick}
                />
              )}
            </div>
          ))
        ) : (
          <div className="no-chats-message">
            {showStarredChatsOnly 
              ? "No starred chats found." 
              : "No chat history yet. Start a new chat!"}
          </div>
        )}
      </div>
      
      <button
        onClick={handleDashboardClick}
        className="dashboard-button"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span>Dashboard</span>
      </button>
    </aside>
  );
};

export default ChatSidebar;
