# Firebase Integration Documentation

## Firebase Setup

### Imports
```javascript
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  arrayUnion, 
  getDoc,
  limit 
} from 'firebase/firestore';
import { db } from '../../services/firebase';
```

## Data Operations

### Loading Chats
```javascript
const loadSavedChats = useCallback(async () => {
  if (!currentUser?.user?.uid) return;

  try {
    const q = query(
      collection(db, 'chats'),
      where('userId', '==', currentUser.user.uid),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const chats = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setSavedChats(chats);
  } catch (err) {
    // Fallback to simpler query if index missing
    // Error handling
  }
}, [currentUser?.user?.uid]);
```

### Creating New Chat
```javascript
const createNewChat = async (chatData) => {
  const docRef = await addDoc(collection(db, 'chats'), {
    ...chatData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};
```

### Updating Chat
```javascript
const updateChat = async (chatId, updates) => {
  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};
```

## Error Handling

### Connection Status
```javascript
const initializeFirestore = async () => {
  setIsInitializing(true);
  try {
    const testQuery = query(
      collection(db, 'chats'),
      where('userId', '==', currentUser?.user?.uid),
      limit(1)
    );
    await getDocs(testQuery);
    setIsFirestoreConnected(true);
  } catch (err) {
    setIsFirestoreConnected(false);
    setFirestoreError(err.message);
  } finally {
    setIsInitializing(false);
  }
};
```

### Error Recovery
```javascript
// Fallback query when index is missing
const handleIndexError = async () => {
  const simpleQ = query(
    collection(db, 'chats'),
    where('userId', '==', currentUser.user.uid)
  );
  const snapshot = await getDocs(simpleQ);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

## Data Structure

### Chat Document
```javascript
{
  userId: string,
  title: string,
  messages: array[{
    type: 'user' | 'assistant',
    content: string,
    timestamp: timestamp,
    bookmarked: boolean
  }],
  createdAt: timestamp,
  updatedAt: timestamp,
  starred: boolean
}
```

## Optimization Strategies

### Query Optimization
- Use of compound queries
- Pagination with limit()
- Efficient indexing
- Batch operations

### Offline Support
- Enable offline persistence
- Handle reconnection
- Cache frequently accessed data
- Optimistic updates
