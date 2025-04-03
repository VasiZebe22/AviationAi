import React, { useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ChatListItem } from './';

/**
 * ChatList component for displaying the list of chats
 * 
 * @param {Object} props - Component props
 * @param {Array} props.chats - Array of chat objects to display
 * @param {string} props.currentChatId - ID of the currently selected chat
 * @param {boolean} props.showStarredOnly - Whether to show only starred chats
 * @param {Function} props.onChatSelect - Function to call when a chat is selected
 * @param {Function} props.onNewChat - Function to call when the new chat button is clicked
 * @param {Function} props.onEditChat - Function to call when a chat title is edited
 * @param {Function} props.onDeleteChat - Function to call when a chat is deleted
 * @param {Function} props.onToggleStarredFilter - Function to toggle starred filter
 * @param {React.ReactNode} props.children - Optional children to render at the bottom of the sidebar
 */
const ChatList = ({
  chats = [],
  currentChatId,
  showStarredOnly = false,
  onChatSelect,
  onNewChat,
  onEditChat,
  onDeleteChat,
  onToggleStarredFilter,
  children
}) => {
  const chatListContainerRef = useRef(null);

  /**
   * Group chats by date
   * 
   * @param {Array} chatList - List of chats to group
   * @returns {Object} Object with chats grouped by date
   */
  const groupChatsByDate = (chatList) => {
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

    chatList.forEach(chat => {
      // Determine the most relevant date for grouping, prioritizing newer timestamps
      const dateSource = chat.lastUpdated || chat.updatedAt || chat.createdAt || chat.clientCreatedAt;
      let chatDate;

      if (!dateSource) {
        // If no date source exists, treat as today
        groups.today.push(chat);
        return;
      }

      // Convert the source to a Date object
      if (dateSource.toDate) { // Firestore Timestamp
        chatDate = dateSource.toDate();
      } else if (dateSource instanceof Date) { // Already a Date object
        chatDate = dateSource;
      } else { // Assume ISO string
        chatDate = new Date(dateSource);
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

  /**
   * Render a date header
   * 
   * @param {string} title - Title of the header
   * @returns {JSX.Element} Rendered date header
   */
  const renderDateHeader = (title) => (
    <div className="px-4 pt-8 pb-2 first:pt-3">
      <h3 className="text-base font-semibold text-gray-400">{title}</h3>
    </div>
  );

  // Filter chats based on showStarredOnly
  const filteredChats = chats.filter(chat => 
    !showStarredOnly || chat.starred
  );

  // Group chats by date
  // Memoize the grouped chats calculation
  const groupedChats = useMemo(() => groupChatsByDate(filteredChats), [filteredChats]);

  return (
    <div className="w-64 bg-dark-lighter flex flex-col">
      <div className="p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={onNewChat}
            className="flex-1 bg-accent-lilac text-white rounded-lg px-3 py-2 flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Chat
          </button>
          <button
            onClick={onToggleStarredFilter}
            className={`p-2 rounded hover:bg-accent-lilac hover:bg-opacity-20 transition-all duration-200 ${
              showStarredOnly ? 'text-accent-lilac bg-accent-lilac bg-opacity-20' : 'text-gray-400'
            }`}
            title={showStarredOnly ? "Show all chats" : "Show starred chats only"}
          >
            <svg 
              className="w-5 h-5" 
              fill={showStarredOnly ? "currentColor" : "none"} 
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
      
      <div className="flex-1 overflow-y-auto scrollbar-hide" ref={chatListContainerRef}>
        <div className="space-y-1">
          {groupedChats.today.length > 0 && (
            <div>
              {renderDateHeader('Today')}
              <div className="space-y-1">
                {groupedChats.today.map(chat => (
                  <ChatListItem
                    key={chat.id}
                    chat={chat}
                    currentChatId={currentChatId}
                    onSelect={onChatSelect}
                    onEdit={onEditChat}
                    onDelete={onDeleteChat}
                  />
                ))}
              </div>
            </div>
          )}
          
          {groupedChats.yesterday.length > 0 && (
            <div>
              {renderDateHeader('Yesterday')}
              <div className="space-y-1">
                {groupedChats.yesterday.map(chat => (
                  <ChatListItem
                    key={chat.id}
                    chat={chat}
                    currentChatId={currentChatId}
                    onSelect={onChatSelect}
                    onEdit={onEditChat}
                    onDelete={onDeleteChat}
                  />
                ))}
              </div>
            </div>
          )}
          
          {groupedChats.previous30Days.length > 0 && (
            <div>
              {renderDateHeader('Previous 30 Days')}
              <div className="space-y-1">
                {groupedChats.previous30Days.map(chat => (
                  <ChatListItem
                    key={chat.id}
                    chat={chat}
                    currentChatId={currentChatId}
                    onSelect={onChatSelect}
                    onEdit={onEditChat}
                    onDelete={onDeleteChat}
                  />
                ))}
              </div>
            </div>
          )}
          
          {Object.entries(groupedChats.byMonth).map(([monthYear, monthChats]) => (
            <div key={monthYear}>
              {renderDateHeader(monthYear)}
              <div className="space-y-1">
                {monthChats.map(chat => (
                  <ChatListItem
                    key={chat.id}
                    chat={chat}
                    currentChatId={currentChatId}
                    onSelect={onChatSelect}
                    onEdit={onEditChat}
                    onDelete={onDeleteChat}
                  />
                ))}
              </div>
            </div>
          ))}

          {filteredChats.length === 0 && (
            <div className="px-4 py-2 text-sm text-gray-400">
              No chats found
            </div>
          )}
        </div>
      </div>
      
      {/* Render children if provided */}
      {children}
    </div>
  );
};

ChatList.propTypes = {
  chats: PropTypes.array.isRequired,
  currentChatId: PropTypes.string,
  showStarredOnly: PropTypes.bool,
  onChatSelect: PropTypes.func.isRequired,
  onNewChat: PropTypes.func.isRequired,
  onEditChat: PropTypes.func.isRequired,
  onDeleteChat: PropTypes.func.isRequired,
  onToggleStarredFilter: PropTypes.func.isRequired,
  children: PropTypes.node
};

export default ChatList;