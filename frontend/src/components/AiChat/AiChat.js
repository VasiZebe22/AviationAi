import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChatList, 
  MessageList, 
  MessageInput, 
  ErrorDisplay,
  LoadingIndicator
} from './components';
import { useChatState } from './hooks';

/**
 * AiChat component - Main chat interface
 * 
 * @returns {JSX.Element} Rendered component
 */
const AiChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the custom hook for chat state management
  const {
    // State
    savedChats,
    currentChat,
    history,
    isLoading,
    error,
    messageInput,
    isTyping,
    displayedContent,
    showStarredChatsOnly,
    showBookmarkedMessagesOnly,
    isInitializing,
    isFirestoreConnected,
    
    // Actions
    setMessageInput,
    handleSubmit,
    handleNewChat,
    handleChatSelect,
    toggleBookmark,
    toggleStar,
    handleStartEdit,
    handleSaveTitle,
    handleDeleteChat,
    toggleShowStarredChatsOnly,
    toggleShowBookmarkedMessagesOnly,
    clearError
  } = useChatState();

  // Filter messages based on bookmarked status
  const displayedMessages = useMemo(() => {
    if (!currentChat?.messages) return [];
    return history.filter(msg => !showBookmarkedMessagesOnly || msg.bookmarked);
  }, [currentChat?.messages, history, showBookmarkedMessagesOnly]);

  // Navigate to dashboard
  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };

  // Dashboard button component
  const DashboardButton = (
    <div className="p-4 border-t border-dark-lightest mt-auto">
      <button
        onClick={handleNavigateToDashboard}
        className="w-full bg-accent-lilac text-white rounded-lg px-4 min-h-[46px] flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors duration-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Dashboard
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-dark text-gray-100">
      {/* Chat List Sidebar */}
      <ChatList
        chats={savedChats}
        currentChatId={currentChat?.id}
        showStarredOnly={showStarredChatsOnly}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onEditChat={handleSaveTitle}
        onDeleteChat={handleDeleteChat}
        onToggleStarredFilter={toggleShowStarredChatsOnly}
      >
        {DashboardButton}
      </ChatList>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {isInitializing ? (
          <LoadingIndicator type="initializing" />
        ) : (
          <>
            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {currentChat && displayedMessages.length > 0 ? (
                <>
                  <MessageList
                    messages={displayedMessages}
                    isTyping={isTyping}
                    displayedContent={displayedContent}
                    chatId={currentChat.id}
                    onToggleBookmark={toggleBookmark}
                  />
                  {isLoading && (
                    <div className="mt-4">
                      <LoadingIndicator type="typing" />
                    </div>
                  )}
                </>
              ) : isLoading ? (
                <LoadingIndicator type="typing" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <h1 className="text-4xl font-bold text-gray-100 mb-4">Welcome to AviationAI</h1>
                  <p className="text-xl text-gray-300">Start a new chat to begin!</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <MessageInput
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              isStarred={currentChat?.starred}
              toggleStar={toggleStar}
              showBookmarkedMessagesOnly={showBookmarkedMessagesOnly}
              toggleBookmarkedMessagesFilter={toggleShowBookmarkedMessagesOnly}
            />

            {/* Error Display */}
            {error && (
              <ErrorDisplay 
                error={error} 
                onDismiss={clearError} 
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AiChat;