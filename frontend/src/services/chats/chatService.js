import { db } from '../firebase';
import { 
    collection, 
    query, 
    orderBy, 
    getDocs,
    doc,
    updateDoc,
    where,
    deleteDoc,
    getDoc
} from 'firebase/firestore';

export const chatService = {
    async getBookmarkedMessages(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const chatsRef = collection(db, 'chats');
        const q = query(
            chatsRef,
            where('userId', '==', userId)
        );
        
        const snapshot = await getDocs(q);
        
        // Filter chats to only include those with bookmarked messages
        const chatsWithBookmarks = snapshot.docs
            .map(doc => {
                const chatData = doc.data();
                // Filter to only include bookmarked messages
                const bookmarkedMessages = (chatData.messages || []).filter(msg => msg.bookmarked);
                
                if (bookmarkedMessages.length === 0) {
                    return null; // Skip chats with no bookmarked messages
                }
                
                return {
                    id: doc.id,
                    title: chatData.title || 'Untitled Chat',
                    messages: bookmarkedMessages,
                    isPinned: chatData.isPinned || false,
                    createdAt: chatData.createdAt?.toDate() || new Date(),
                    updatedAt: chatData.updatedAt?.toDate() || new Date(),
                    tags: chatData.tags || []
                };
            })
            .filter(Boolean); // Remove null entries
        
        return chatsWithBookmarks;
    },

    async toggleMessageBookmark(chatId, messageIndex, isBookmarked) {
        const chatRef = doc(db, 'chats', chatId);
        const chatDoc = await getDoc(chatRef);
        
        if (!chatDoc.exists()) {
            throw new Error('Chat not found');
        }
        
        const chatData = chatDoc.data();
        const messages = [...chatData.messages];
        
        if (messageIndex >= 0 && messageIndex < messages.length) {
            messages[messageIndex] = {
                ...messages[messageIndex],
                bookmarked: isBookmarked
            };
            
            await updateDoc(chatRef, { messages });
        }
    },

    async toggleChatPin(chatId, isPinned) {
        const chatRef = doc(db, 'chats', chatId);
        await updateDoc(chatRef, { 
            isPinned,
            updatedAt: new Date()
        });
    },

    async deleteChat(chatId) {
        const chatRef = doc(db, 'chats', chatId);
        await deleteDoc(chatRef);
    }
};