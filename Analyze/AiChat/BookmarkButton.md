# BookmarkButton Component Documentation

## Overview
The BookmarkButton component is a reusable UI element that provides bookmark functionality for chat messages. It features smooth animations, hover effects, and proper state management for optimistic updates.

## Component Interface

### Props
```typescript
interface BookmarkButtonProps {
  message: {
    type: 'user' | 'assistant';
    content: string;
    timestamp: string;
    bookmarked?: boolean;
    messageId?: string;
  };
  isBookmarked: boolean;
  onToggle: (e: React.MouseEvent) => Promise<void>;
  messageType: 'user' | 'assistant';
  chatId: string;
}
```

### State Management
```javascript
// Local state for optimistic updates
const [localBookmarked, setLocalBookmarked] = useState(isBookmarked);
// State to control initial render animation
const [isInitialRender, setIsInitialRender] = useState(true);
```

## Implementation Details

### State Reset Logic
```javascript
useEffect(() => {
  // Reset state when chat or message changes
  setLocalBookmarked(isBookmarked);
  setIsInitialRender(true);
}, [isBookmarked, chatId, message.messageId]);
```

### Animation Timing
```javascript
useEffect(() => {
  if (isInitialRender) {
    // Delay animation start to next tick
    const timer = setTimeout(() => setIsInitialRender(false), 0);
    return () => clearTimeout(timer);
  }
}, [isInitialRender]);
```

### Event Handling
```javascript
const handleClick = async (e: React.MouseEvent) => {
  e.stopPropagation();  // Prevent event bubbling
  setLocalBookmarked(!localBookmarked);  // Optimistic update
  await onToggle(e);  // Trigger parent handler
};
```

## Styling

### Position Logic
```javascript
const positionClasses = messageType === 'user' 
  ? 'left-0 -translate-x-[110%]' 
  : 'right-0 translate-x-[110%]';
```

### Animation Classes
```javascript
const animationClasses = isInitialRender 
  ? '' 
  : 'transition-all duration-200';
```

### Visibility Classes
```javascript
const visibilityClasses = localBookmarked 
  ? 'opacity-100 text-accent-lilac' 
  : `opacity-0 ${!isInitialRender ? 'group-hover:opacity-100' : ''} text-gray-400`;
```

## SVG Icon
```jsx
<svg 
  className="w-5 h-5" 
  fill={localBookmarked ? "currentColor" : "none"} 
  stroke="currentColor" 
  viewBox="0 0 24 24"
>
  <path 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    strokeWidth={2} 
    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
  />
</svg>
```

## Complete Component
```jsx
const BookmarkButton = ({ message, isBookmarked, onToggle, messageType, chatId }) => {
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked);
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    setLocalBookmarked(isBookmarked);
    setIsInitialRender(true);
  }, [isBookmarked, chatId, message.messageId]);

  useEffect(() => {
    if (isInitialRender) {
      const timer = setTimeout(() => setIsInitialRender(false), 0);
      return () => clearTimeout(timer);
    }
  }, [isInitialRender]);

  const handleClick = async (e) => {
    e.stopPropagation();
    setLocalBookmarked(!localBookmarked);
    await onToggle(e);
  };

  return (
    <button
      onClick={handleClick}
      className={`absolute ${
        messageType === 'user' ? 'left-0 -translate-x-[110%]' : 'right-0 translate-x-[110%]'
      } top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-dark-lightest ${
        isInitialRender ? '' : 'transition-all duration-200'
      } ${
        localBookmarked 
          ? 'opacity-100 text-accent-lilac' 
          : `opacity-0 ${!isInitialRender ? 'group-hover:opacity-100' : ''} text-gray-400`
      }`}
      title={localBookmarked ? "Remove bookmark" : "Bookmark message"}
    >
      <svg 
        className="w-5 h-5" 
        fill={localBookmarked ? "currentColor" : "none"} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
        />
      </svg>
    </button>
  );
};
```

## Usage Example
```jsx
// In parent component
const handleBookmarkToggle = async (messageIndex, e) => {
  await toggleBookmark(messageIndex, e);
};

// In render method
<BookmarkButton 
  message={message}
  isBookmarked={message.bookmarked}
  onToggle={(e) => handleBookmarkToggle(messageIndex, e)}
  messageType={message.type}
  chatId={currentChat.id}
/>
