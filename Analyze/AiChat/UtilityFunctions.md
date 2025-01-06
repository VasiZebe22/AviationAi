# Utility Functions Documentation

## Time and Date Functions

### Format Timestamp
```javascript
const formatTimestamp = (timestamp) => {
  try {
    if (!timestamp) {
      return new Date().toLocaleString();
    }
    // Handle both Date objects, ISO strings, and Firestore timestamps
    const date = typeof timestamp === 'object' && timestamp?.toDate 
      ? timestamp.toDate() 
      : new Date(timestamp);
    
    return date.toLocaleString();
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return new Date().toLocaleString();
  }
};
```

### Message Timestamp Creation
```javascript
const createMessageTimestamp = () => {
  return new Date().toISOString();
};
```

### Chat Date Handling
```javascript
const getChatDate = (chat) => {
  return (
    (chat?.createdAt?.toDate?.()) || // Server timestamp
    (chat?.createdAt instanceof Date ? chat.createdAt : null) || // Client timestamp
    (chat?.clientCreatedAt instanceof Date ? chat.clientCreatedAt : null) || // Fallback
    (currentChat === null ? new Date() : null) // New chat
  );
};
```

## Text Formatting

### Markdown Processing
```javascript
const formatMarkdown = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
};
```

### Message Content Formatting
```javascript
const formatMessage = (content) => {
  // Remove citation markers
  const cleanContent = content.replace(/【\d+:\d+†source】/g, '');
  
  return cleanContent.split('\n').map((paragraph, idx) => {
    // Handle empty paragraphs
    if (!paragraph.trim()) return <div key={idx} className="h-2" />;

    // Handle numbered lists
    const numberedListMatch = paragraph.match(/^(\d+)\.\s(.+)/);
    if (numberedListMatch) {
      const [_, number, text] = numberedListMatch;
      return (
        <div key={idx} className="flex items-start space-x-2 mb-2">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-lilac bg-opacity-20 flex items-center justify-center">
            <span className="text-sm text-accent-lilac">{number}</span>
          </div>
          <p className="text-sm mt-0.5 text-gray-200 flex-1">
            <span dangerouslySetInnerHTML={{ __html: formatMarkdown(text) }} />
          </p>
        </div>
      );
    }

    return (
      <p key={idx} className="text-sm mb-2 text-gray-200" 
         dangerouslySetInnerHTML={{ __html: formatMarkdown(paragraph) }} />
    );
  });
};
```

### Citation Cleaning
```javascript
const cleanContent = (content) => {
  return content.replace(/【\d+:\d+†source】/g, '');
};
```

## Animation Functions

### Typing Animation
```javascript
const typeMessage = (message) => {
  setIsTyping(true);
  let currentIndex = 0;
  setDisplayedContent('');
  
  const typeChar = () => {
    if (currentIndex < message.length) {
      setDisplayedContent(prev => message.substring(0, currentIndex + 1));
      currentIndex++;
      setTimeout(typeChar, Math.random() * 5 + 3.75);
    } else {
      setIsTyping(false);
    }
  };
  
  typeChar();
};
```

### Typing Cursor
```javascript
const renderTypingCursor = () => (
  <span className="inline-block w-2 h-2 ml-0.5 -mb-0.5 bg-accent-lilac rounded-full animate-pulse" />
);
```

## Network Status Management

### Online Status Handler
```javascript
const handleOnline = () => {
  console.log('Network status: online');
  setIsFirestoreConnected(true);
  setFirestoreError(null);
};
```

### Offline Status Handler
```javascript
const handleOffline = () => {
  console.log('Network status: offline');
  setIsFirestoreConnected(false);
  setFirestoreError('You are currently offline. Please check your internet connection.');
};
```

## Event Handlers

### Key Press Handler
```javascript
const handleKeyPress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSubmit(e);
  }
};
```

### Scroll Management
```javascript
const scrollToBottom = () => {
  if (historyRef.current) {
    historyRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }
};
```

## State Management Helpers

### Chat Filtering
```javascript
const filterChats = (chats) => {
  if (showStarredChatsOnly) {
    return chats.filter(chat => chat.starred);
  }
  return chats;
};
```

### Message Filtering
```javascript
const filterMessages = (messages) => {
  if (showBookmarkedMessagesOnly) {
    return messages.filter(message => message.bookmarked);
  }
  return messages;
};
```

## Error Handling

### Error Formatting
```javascript
const formatError = (error) => {
  return {
    type: 'error',
    message: error.message || 'An unknown error occurred'
  };
};
```

### State Recovery
```javascript
const recoverState = async () => {
  try {
    await loadSavedChats();
    setError(null);
  } catch (err) {
    setError('Failed to recover state');
  }
};
```

## Message Processing
```javascript
const processMessage = (content, type = 'user') => {
  return {
    type,
    content,
    timestamp: formatTimestamp(),
    isTyping: type === 'assistant'
  };
};
