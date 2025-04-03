import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useMessageFormatting } from '../hooks';

/**
 * ChatListItem component for rendering a single chat in the chat list
 * 
 * @param {Object} props - Component props
 * @param {Object} props.chat - Chat object to render
 * @param {string} props.currentChatId - ID of the currently selected chat
 * @param {Function} props.onSelect - Function to call when chat is selected
 * @param {Function} props.onEdit - Function to call when edit button is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 */
const ChatListItem = ({ 
  chat, 
  currentChatId, 
  onSelect, 
  onEdit, 
  onDelete 
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(chat.title || 'New Chat');
  const { formatTimestamp } = useMessageFormatting();

  // Memoize the formatted date for the chat
  const formattedDate = useMemo(() => {
    console.log('Calculating date for chat:', chat?.id);
    // Try to get the date in order of preference:
    // 1. Server timestamp (createdAt)
    // 2. Client timestamp (clientCreatedAt)
    // 3. Current time for brand new chats
    const chatDateSource =
      chat?.updatedAt || // Prioritize updatedAt
      chat?.createdAt || // Then createdAt
      chat?.clientCreatedAt; // Finally client timestamp

    // Use the identified source, falling back to current time for new chats
    const chatDate = chatDateSource || (currentChatId === null ? new Date() : null);
    
    return chatDate ? formatTimestamp(chatDate, chat) : 'Date not available';
  }, [chat?.updatedAt, chat?.createdAt, chat?.clientCreatedAt, currentChatId, chat?.id]);

  const handleEditStart = (e) => {
    e.stopPropagation();
    setEditingTitle(true);
    setNewTitle(chat.title || 'New Chat');
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    onEdit(chat.id, newTitle);
    setEditingTitle(false);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      onDelete(chat.id);
    }
  };

  return (
    <div
      key={chat?.id || 'new-chat'}
      data-chat-id={chat?.id}
      className={`p-3 cursor-pointer hover:bg-dark-lighter transition-colors duration-200 relative group flex items-center justify-between ${
        currentChatId === chat?.id ? 'bg-accent-lilac bg-opacity-20 border-l-4 border-accent-lilac' : ''
      }`}
      onClick={() => onSelect(chat)}
    >
      <div className="flex-1 min-w-0 mr-2">
        {editingTitle ? (
          <form 
            onSubmit={handleEditSave}
            className="flex items-center"
          >
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleEditSave}
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
          onClick={handleEditStart}
          className="p-1 rounded hover:bg-accent-lilac hover:bg-opacity-20 transition-all duration-200"
          title="Rename chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent-lilac" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={handleDeleteClick}
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

ChatListItem.propTypes = {
  chat: PropTypes.object.isRequired,
  currentChatId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default ChatListItem;