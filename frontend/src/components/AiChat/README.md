# AiChat Component

## Overview

The AiChat component is a feature-rich chat interface that enables users to interact with an AI assistant. This component handles message rendering, user input, chat history, and Firebase integration. It supports features like message bookmarking, chat history management, and markdown rendering.

## Directory Structure

```
AiChat/
├── components/               # UI components
│   ├── AiChat.js            # Main component
│   ├── ChatSidebar/         # Sidebar components
│   │   ├── ChatFilter.js    # Filter for starred chats
│   │   ├── ChatHistoryItem.js # Individual chat history item
│   │   ├── ChatSidebar.js   # Main sidebar container
│   │   └── NewChatButton.js # Button to create new chat
│   ├── InputArea/           # Input components
│   │   ├── InputActions.js  # Additional input controls
│   │   └── MessageInput.js  # Text input with autosize
│   ├── MessageArea/         # Message display components
│   │   ├── AssistantMessage.js # AI message component
│   │   ├── Message.js       # Base message component
│   │   ├── MessageList.js   # Container for all messages
│   │   └── UserMessage.js   # User message component
│   └── shared/              # Shared components
│       ├── BookmarkButton.js # Toggle bookmark button
│       └── ErrorDisplay.js  # Error message component
├── hooks/                   # Custom React hooks
│   ├── useFirestoreChats.js # Firebase interactions
│   ├── useMessageFormatting.js # Message formatting
│   ├── useMessageTyping.js  # Typing animation logic
│   └── useChatState.js      # Central state management
├── utils/                   # Utility functions
│   ├── dateFormatting.js    # Date formatting utilities
│   ├── errorHandling.js     # Error handling utilities
│   └── messageFormatting.js # Message formatting utilities
└── index.js                 # Main entry point
```

## Component Architecture

The AiChat component follows a modular architecture that adheres to SOLID, KISS, YAGNI, and DRY principles:

1. **Single Responsibility**: Each component and hook has a specific role
2. **Component Composition**: Complex UI built from smaller, focused components
3. **State Management**: Centralized in hooks and passed to components
4. **Separation of Concerns**: UI, state, and business logic are separated

### Key Components

#### AiChat
The main container component that composes all subcomponents and provides the overall layout.

#### ChatSidebar
Displays chat history and provides controls for creating new chats, filtering, and navigating between existing conversations.

#### MessageList
Renders the list of messages with appropriate styling for user and assistant messages, handles scrolling behavior, and supports bookmarked message filtering.

#### MessageInput
Handles text input with auto-resizing, submission logic, and keyboard shortcuts (Enter to send, Shift+Enter for new line).

### Component Flow

1. User enters text in `MessageInput`
2. On submit, `AiChat` (via `useChatState`) adds the message to history
3. The user message is displayed in `MessageList` via `UserMessage`
4. The AI response is fetched and displayed with typing animation via `AssistantMessage`
5. Chat history is saved to Firestore for persistence

## Hooks

### useChatState
Central state management hook that handles:
- Message input state
- Chat history
- Firebase interaction (via useFirestoreChats)
- Error handling
- Message bookmarking
- Chat selection
- New chat creation

### useFirestoreChats
Manages all Firestore database interactions:
- Loading saved chats
- Creating new chats
- Updating messages
- Deleting chats
- Toggling starred status
- Error handling for database operations

### useMessageTyping
Manages the typing animation effect for AI responses:
- Controls typing speed and timing
- Manages the display of text as it's "typed"
- Provides the typing cursor animation

### useMessageFormatting
Handles message formatting for display:
- Markdown rendering
- Code block highlighting
- Citation handling
- Special content formatting

## Utilities

### messageFormatting.js
Provides functions for formatting message content:
- Markdown parsing and rendering
- Citation removal and processing
- Content sanitization

### dateFormatting.js
Utilities for formatting dates and timestamps in a user-friendly way.

### errorHandling.js
Error processing functions that standardize error handling and logging.

## Usage

To use the AiChat component in another part of the application:

```jsx
import AiChat from '../components/AiChat';

// In your component
return (
  <div className="container">
    <AiChat />
  </div>
);
```

To reuse individual components or hooks:

```jsx
import { MessageInput, useMessageFormatting } from '../components/AiChat';

// Use specific components
const { renderMessageContent } = useMessageFormatting();

return <MessageInput ... />;
```

## Firebase Integration

AiChat integrates with Firebase Firestore to:
- Persist chat history
- Enable multi-device access to the same conversations
- Store bookmarks and starred chats
- Manage chat metadata (titles, timestamps)

The database schema uses:
- A `chats` collection with documents for each chat
- Each chat document contains message history and metadata
- User-specific access control based on authentication

## Implementation Details

### Message Flow

1. User sends a message
2. Message is added to local state
3. If it's a new chat, a new document is created in Firestore
4. The AI response is requested from the backend API
5. When received, the AI response is added to state with a typing animation
6. Both messages are saved to Firestore
7. The UI updates to display the complete conversation

### Authentication

The component uses the application's AuthContext to:
- Ensure only authenticated users can access chats
- Associate chats with specific users
- Provide user info to the AI for personalized responses

### Error Handling

- Firebase connection errors are displayed with retry options
- API errors during message exchange are shown with clear messages
- Network connectivity issues are handled with appropriate user feedback

## Troubleshooting

### Common Issues

1. **Messages not loading**: Check Firebase connectivity and authentication status
2. **Typing animation not working**: Verify that the response format is correct
3. **Chat history not appearing**: Ensure user is authenticated and has permission

## Future Enhancements

- Voice input capabilities
- Image and file attachments
- More advanced filtering and search
- Chat categorization
- User preference settings

---

## Contributing

When extending or modifying this component, please adhere to these principles:

1. **Maintain separation of concerns**
2. **Write clear, concise comments**
3. **Follow YAGNI, SOLID, KISS, and DRY principles**
4. **Ensure existing functions are preserved**
5. **Write tests for new functionality**
