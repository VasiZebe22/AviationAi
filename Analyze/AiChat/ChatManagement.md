# Chat Management Documentation

## Chat Operations

### Creating New Chat
```javascript
const handleNewChat = () => {
  setCurrentChat(null);
  setHistory([]);
  setMessageInput('');
  setError(null);
  setIsTyping(false);
  setDisplayedContent('');
};
```

### Saving Chat
```javascript
const handleSaveChat = async () => {
  if (history.length === 0 || !currentUser?.user) return;
  
  try {
    const chatData = {
      userId: currentUser.user.uid,
      title: generateTitle(),
      messages: history,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Save to Firestore
    // Update local state
  } catch (error) {
    setError({ type: 'error', message: error.message });
  }
};
```

### Loading Chat
```javascript
const handleLoadChat = async (chat) => {
  setIsTyping(false);
  setError(null);
  
  try {
    const chatRef = doc(db, 'chats', chat.id);
    const chatDoc = await getDoc(chatRef);
    
    if (chatDoc.exists()) {
      const chatData = chatDoc.data();
      setCurrentChat({ ...chat, ...chatData, id: chat.id });
      setHistory(chatData.messages || []);
      setChatId(chat.id);
    }
  } catch (err) {
    setError('Failed to load chat');
  }
};
```

## Chat Organization

### Starring Chats
```javascript
const toggleStar = async () => {
  if (!currentChat) return;

  try {
    const chatRef = doc(db, 'chats', currentChat.id);
    const newStarredState = !currentChat.starred;
    
    // Optimistic update
    // Firebase update
    // Error handling and rollback
  } catch (error) {
    // Revert local state
  }
};
```

### Chat Grouping
```javascript
const groupChatsByDate = (chats) => {
  // Groups:
  // - Today
  // - Yesterday
  // - Previous 30 Days
  // - By Month
  return groups;
};
```

## Title Management

### Edit Title
```javascript
const handleStartEdit = (chatId, existingTitle) => {
  setEditingChatId(chatId);
  setNewTitle(existingTitle || 'New Chat');
};
```

### Save Title
```javascript
const handleSaveTitle = async (chatId) => {
  if (!newTitle.trim()) return;
  
  try {
    // Update Firestore
    // Update local state
  } catch (error) {
    console.error('Error updating chat title:', error);
  } finally {
    setEditingChatId(null);
    setNewTitle('');
  }
};
```

## Delete Operations

### Delete Chat
```javascript
const handleDeleteChat = async (chatId) => {
  try {
    // Delete from Firestore
    // Update local state
    // Clear current chat if needed
  } catch (error) {
    setError('Failed to delete chat');
  }
};
```
