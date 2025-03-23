import React, { useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import '../AiChat.css'; // Import CSS from the correct location

// Import custom hooks
import useChatState from '../hooks/useChatState';
import useMessageFormatting from '../hooks/useMessageFormatting';

// Import components
import ChatSidebar from './ChatSidebar/ChatSidebar';
import MessageList from './MessageArea/MessageList';
import MessageInput from './InputArea/MessageInput';
import InputActions from './InputArea/InputActions';
import ErrorDisplay from './shared/ErrorDisplay';

// Import utilities
import { formatTimestamp } from '../utils/dateFormatting';

/**
 * Main AiChat component that serves as the container for the chat application
 * 
 * This component is responsible for:
 * 1. Composing all the subcomponents
 * 2. Loading user state and handling authentication
 * 3. Handling routing parameters
 * 
 * The actual business logic is delegated to custom hooks for better separation of concerns
 */
const AiChat = () => {
  // Get authentication and routing context
  const { currentUser } = useAuth();
  const location = useLocation();
  
  // Initialize custom hooks
  const {
    messageInput,
    setMessageInput,
    history,
    currentChat,
    savedChats,
    isLoading,
    error,
    setError,
    isTyping,
    displayedContent,
    isFirestoreConnected,
    isInitializing,
    bookmarkedMessageIds,
    showBookmarkedMessagesOnly,
    setShowBookmarkedMessagesOnly,
    sidebarOpen,
    handleNewChat,
    handleSubmit,
    handleChatSelect,
    handleToggleBookmark,
    handleToggleStar,
    handleDeleteChat,
    handleUpdateChatTitle,
    toggleSidebar,
    renderTypingCursor,
    loadSavedChats
  } = useChatState(currentUser?.user);
  
  const {
    renderMessageContent
  } = useMessageFormatting();
  
  // Handle initial route with chat ID parameter
  useEffect(() => {
    if (location.state?.selectedChatId && location.state?.action === 'loadChat') {
      const chatRef = doc(db, 'chats', location.state.selectedChatId);
      getDoc(chatRef).then((docSnap) => {
        if (docSnap.exists()) {
          const chatData = docSnap.data();
          const fullChat = {
            id: location.state.selectedChatId,
            ...chatData
          };
          handleChatSelect(fullChat);
        }
      });
    }
  }, [location.state, handleChatSelect]);
  
  return (
    <div className="ai-chat">
      {/* Sidebar Toggle Button */}
      <button
        className="toggle-sidebar"
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* Chat Sidebar */}
      <ChatSidebar
        chats={savedChats}
        currentChatId={currentChat?.id}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onToggleStar={handleToggleStar}
        onEditTitle={handleUpdateChatTitle}
        isOpen={sidebarOpen}
        error={error}
        setError={setError}
      />
      
      {/* Main Chat Area */}
      <main className={`chat-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Connection status and errors */}
        {!isFirestoreConnected && (
          <div className="connection-status-banner">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>You are currently offline. Reconnecting...</span>
          </div>
        )}
        
        {error && (
          <div className="error-container">
            <ErrorDisplay 
              error={error} 
              onDismiss={() => setError(null)} 
            />
          </div>
        )}
        
        {/* Loading indicator */}
        {isInitializing && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Initializing chat...</p>
          </div>
        )}
        
        {/* Chat messages */}
        <div className="messages-container">
          <MessageList
            messages={history}
            isTyping={isTyping}
            displayedContent={displayedContent}
            renderTypingCursor={renderTypingCursor}
            renderMessageContent={renderMessageContent}
            formatTimestamp={formatTimestamp}
            bookmarkedMessageIds={bookmarkedMessageIds}
            onToggleBookmark={handleToggleBookmark}
            chatId={currentChat?.id}
            showBookmarkedOnly={showBookmarkedMessagesOnly}
          />
        </div>
        
        {/* Message input and actions */}
        <div className="input-container">
          <InputActions
            showBookmarkedMessagesOnly={showBookmarkedMessagesOnly}
            setShowBookmarkedMessagesOnly={setShowBookmarkedMessagesOnly}
          />
          
          <MessageInput
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            isTyping={isTyping}
          />
        </div>
      </main>
    </div>
  );
};

export default AiChat;
