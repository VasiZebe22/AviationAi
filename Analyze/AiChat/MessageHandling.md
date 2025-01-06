# Message Handling Documentation

## Message Processing Functions

### Adding Messages
```javascript
const addMessage = (content, type = 'user') => {
  const newMessage = {
    type,
    content,
    timestamp: formatTimestamp(),
    isTyping: type === 'assistant'
  };
  setHistory(prev => [...prev, newMessage]);
}
```

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

### Message Formatting
```javascript
const formatMessage = (content) => {
  // Removes citation markers
  const cleanContent = content.replace(/【\d+:\d+†source】/g, '');
  
  // Processes paragraphs and numbered lists
  return cleanContent.split('\n').map((paragraph, idx) => {
    // Handle numbered lists and regular paragraphs
    const numberedListMatch = paragraph.match(/^(\d+)\.\s(.+)/);
    if (numberedListMatch) {
      // Numbered list rendering
    } else {
      // Regular paragraph rendering
    }
  });
};
```

## Message Submission

### Handle Submit
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!messageInput.trim() || isLoading) return;

  setIsLoading(true);
  setError(null);

  try {
    // Add user message
    // Get AI response
    // Save to Firebase
    // Start typing animation
  } catch (err) {
    setError(err.message || 'An error occurred');
  } finally {
    setIsLoading(false);
  }
};
```

## Message Rendering

### Content Rendering
- Supports markdown formatting
- Handles numbered lists
- Displays typing animation
- Shows timestamps
- Includes bookmark functionality

### Styling
- Different styles for user and assistant messages
- Responsive layout
- Smooth animations
- Proper spacing and alignment

## Error Handling

### Network Errors
- Graceful degradation
- Retry mechanisms
- User feedback
- State recovery

### Input Validation
- Message content validation
- Empty message prevention
- Rate limiting
- Size restrictions
