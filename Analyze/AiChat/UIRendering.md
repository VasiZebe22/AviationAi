# UI Rendering Documentation

## Message Rendering

### Message Component
```javascript
const renderMessage = (message, index) => {
  if (!currentChat) return null;
  
  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} relative group mx-4`}>
      <div className={`max-w-[80%] rounded-lg p-4 relative ${
        message.type === 'user'
          ? 'bg-accent-lilac text-white'
          : 'bg-surface-DEFAULT text-gray-100'
      }`}>
        {/* Message content */}
        {/* Timestamp */}
        {/* Bookmark button */}
      </div>
    </div>
  );
};
```

### Message Content Rendering
```javascript
const renderMessageContent = (message, isLastMessage) => {
  if (message.type === 'assistant' && isLastMessage && isTyping) {
    // Render typing animation
  }
  return formatMessage(message.content);
};
```

## Chat List Rendering

### Chat List Item
```javascript
const renderChatListItem = (chat) => {
  const chatDate = getChatDate(chat);
  const formattedDate = formatTimestamp(chatDate);
  
  return (
    <div className="p-3 cursor-pointer hover:bg-dark-lighter transition-colors duration-200">
      {/* Chat title */}
      {/* Date */}
      {/* Action buttons */}
    </div>
  );
};
```

### Chat Groups
```javascript
const renderChatList = () => {
  const filteredChats = savedChats.filter(chat => 
    !showStarredChatsOnly || chat.starred
  );

  const groupedChats = groupChatsByDate(filteredChats);
  
  return (
    <div className="space-y-6">
      {/* Today's chats */}
      {/* Yesterday's chats */}
      {/* Previous 30 days */}
      {/* Monthly groups */}
    </div>
  );
};
```

## UI Components

### Typing Cursor
```javascript
const renderTypingCursor = () => (
  <span className="inline-block w-2 h-2 ml-0.5 -mb-0.5 bg-accent-lilac rounded-full animate-pulse" />
);
```

### Date Headers
```javascript
const renderDateHeader = (title) => (
  <div className="px-4 pt-8 pb-2 first:pt-3">
    <h3 className="text-base font-semibold text-gray-400">{title}</h3>
  </div>
);
```

## Styling Details

### Theme Colors
- Primary: accent-lilac
- Background: dark-lighter, dark-lightest
- Text: gray-100, gray-200, gray-400

### Animation Classes
- Transitions: transition-colors, transition-opacity
- Durations: duration-200
- Effects: animate-pulse

### Layout Classes
- Flexbox: flex, items-center, justify-between
- Spacing: space-y-6, p-3, mx-4
- Sizing: max-w-[80%], w-full
