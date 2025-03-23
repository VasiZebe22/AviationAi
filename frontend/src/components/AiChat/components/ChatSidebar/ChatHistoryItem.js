import React from 'react';
import { formatTimestamp } from '../../utils/dateFormatting';

/**
 * Individual chat history item in the sidebar
 * @param {Object} props - Component props
 * @param {Object} props.chat - Chat data object
 * @param {string} props.activeId - ID of the currently active chat
 * @param {Function} props.onSelect - Function to call when chat is selected
 * @param {Function} props.onDelete - Function to call when chat is deleted
 * @param {Function} props.onToggleStar - Function to call when star is toggled
 * @param {Function} props.onEdit - Function to call when edit is clicked
 */
const ChatHistoryItem = ({ 
  chat, 
  activeId, 
  onSelect, 
  onDelete, 
  onToggleStar,
  onEdit 
}) => {
  const isActive = chat.id === activeId;
  const messageCount = chat.messages?.length || 0;
  
  const handleClick = () => {
    onSelect(chat);
  };
  
  const handleStarClick = (e) => {
    e.stopPropagation();
    onToggleStar(chat.id, !chat.starred);
  };
  
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(chat.id, chat.title);
  };
  
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(chat.id);
  };
  
  return (
    <div 
      className={`chat-history-item ${isActive ? 'active' : ''}`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-center">
        <div className="chat-title flex-1 mr-2">{chat.title}</div>
        <button 
          onClick={handleStarClick}
          className={`p-1 rounded hover:bg-white hover:bg-opacity-10 transition-colors ${
            chat.starred ? 'text-yellow-400' : 'text-gray-400'
          }`}
          title={chat.starred ? "Unstar chat" : "Star chat"}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      </div>
      <div className="chat-meta">
        <span className="chat-date">{formatTimestamp(chat.updatedAt || chat.createdAt)}</span>
        <span className="chat-messages-count">{messageCount} messages</span>
      </div>
      <div className="flex mt-2 -ml-1">
        <button 
          onClick={handleEditClick}
          className="p-1 text-gray-400 hover:text-white transition-colors"
          title="Edit chat title"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button 
          onClick={handleDeleteClick}
          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
          title="Delete chat"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatHistoryItem;
