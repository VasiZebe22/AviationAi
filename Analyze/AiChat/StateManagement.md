# State Management Documentation

## State Variables

### User Interface State
```javascript
// Input and Loading States
const [messageInput, setMessageInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

// Animation States
const [isTyping, setIsTyping] = useState(false);
const [displayedContent, setDisplayedContent] = useState('');
const [forceUpdate, setForceUpdate] = useState(0);
```

### Chat Management State
```javascript
// Chat History and Selection
const [history, setHistory] = useState([]);
const [savedChats, setSavedChats] = useState([]);
const [currentChat, setCurrentChat] = useState(null);
const [chatId, setChatId] = useState(null);

// Chat Editing
const [editingChatId, setEditingChatId] = useState(null);
const [newTitle, setNewTitle] = useState('');

// Chat Filtering
const [showStarredChatsOnly, setShowStarredChatsOnly] = useState(false);
const [showBookmarkedMessagesOnly, setShowBookmarkedMessagesOnly] = useState(false);
```

### Connection State
```javascript
// Firebase Connection States
const [firestoreError, setFirestoreError] = useState(null);
const [isFirestoreConnected, setIsFirestoreConnected] = useState(true);
const [isInitializing, setIsInitializing] = useState(true);
```

## Refs
```javascript
// DOM References
const historyRef = useRef(null);  // For chat scroll management
const inputRef = useRef(null);    // For input focus management
```

## Context and Navigation
```javascript
// Authentication and Navigation
const { currentUser } = useAuth();
const navigate = useNavigate();
```

## State Management Patterns

### Optimistic Updates
The component implements optimistic updates for better user experience:

```javascript
// Example: Bookmark Toggle
const toggleBookmark = async (messageIndex) => {
  // Optimistic local update
  const updatedMessages = [...currentChat.messages];
  updatedMessages[messageIndex].bookmarked = !updatedMessages[messageIndex].bookmarked;
  setCurrentChat(prev => ({
    ...prev,
    messages: updatedMessages
  }));

  try {
    // Update Firestore
    await updateDoc(chatRef, {
      messages: updatedMessages
    });
  } catch (error) {
    // Revert on failure
    console.error('Error toggling bookmark:', error);
    setCurrentChat(prev => ({
      ...prev,
      messages: currentChat.messages
    }));
  }
};
```

### Error Handling
Comprehensive error handling with user feedback:

```javascript
try {
  // Operation
} catch (error) {
  console.error('Operation failed:', error);
  setError({
    type: 'error',
    message: `Failed: ${error.message}`
  });
  // Cleanup/rollback if needed
} finally {
  setIsLoading(false);
}
```

### State Synchronization
Maintains consistency between local and remote states:

```javascript
// Example: Chat Update
const updateChat = async (chatId, updates) => {
  // Update local state
  setSavedChats(prev => prev.map(chat =>
    chat.id === chatId ? { ...chat, ...updates } : chat
  ));
  
  // Update Firestore
  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, updates);
};
```

### Performance Optimizations

1. **Memoization**
```javascript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

2. **Debounced Updates**
```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    // Delayed state update
  }, 500);
  return () => clearTimeout(timer);
}, [dependency]);
```

3. **Batched Updates**
```javascript
const handleUpdate = () => {
  setCurrentChat(newChat);
  setHistory(newMessages);
  setSavedChats(newChats);
};
```

4. **Conditional Rendering**
```javascript
{isLoading ? <LoadingSpinner /> : renderContent()}
