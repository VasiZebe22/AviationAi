// Main entry point for the AiChat component
// This ensures backward compatibility with existing imports while
// providing a cleaner, more modular structure internally

// Import the main component
import AiChat from './components/AiChat';

// Export the main component as the default export
export default AiChat;

// Named exports for individual components and hooks when direct access is needed
export { default as ChatSidebar } from './components/ChatSidebar/ChatSidebar';
export { default as ChatHistoryItem } from './components/ChatSidebar/ChatHistoryItem';
export { default as NewChatButton } from './components/ChatSidebar/NewChatButton';
export { default as ChatFilter } from './components/ChatSidebar/ChatFilter';

export { default as MessageList } from './components/MessageArea/MessageList';
export { default as Message } from './components/MessageArea/Message';
export { default as UserMessage } from './components/MessageArea/UserMessage';
export { default as AssistantMessage } from './components/MessageArea/AssistantMessage';

export { default as MessageInput } from './components/InputArea/MessageInput';
export { default as InputActions } from './components/InputArea/InputActions';

export { default as BookmarkButton } from './components/shared/BookmarkButton';
export { default as ErrorDisplay } from './components/shared/ErrorDisplay';

// Export hooks
export { default as useFirestoreChats } from './hooks/useFirestoreChats';
export { default as useMessageTyping } from './hooks/useMessageTyping';
export { default as useMessageFormatting } from './hooks/useMessageFormatting';
export { default as useChatState } from './hooks/useChatState';

// Export utilities
export { formatMarkdown, removeCitations } from './utils/messageFormatting';
export { formatTimestamp } from './utils/dateFormatting';
export { processFirestoreError, logError } from './utils/errorHandling';
