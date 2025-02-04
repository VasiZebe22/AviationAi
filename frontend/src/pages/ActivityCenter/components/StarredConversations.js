import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../../services/firebase';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import AIChatHistoryTabs from './AIChatHistoryTabs';

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

const StarredConversationCard = ({ chat, onAddTag }) => {
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(chat.tags || []);
  const navigate = useNavigate();

  const handleNavigateToChat = () => {
    navigate(`/ai-chat/${chat.id}`);
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const trimmedTag = tagInput.trim();
    if (trimmedTag) {
      // Remove # if user typed it, we'll add it in display
      const cleanTag = trimmedTag.startsWith('#') ? trimmedTag.slice(1) : trimmedTag;
      const newTags = [...tags, cleanTag];
      setTags(newTags);
      onAddTag(chat.id, newTags);
      setTagInput('');
      setShowTagInput(false);
    }
  };

  return (
    <div className="bg-surface-DEFAULT p-4 rounded-lg mb-4 hover:bg-surface-lighter transition-colors duration-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="space-y-2">
            <h3 className="font-medium text-white">
              {chat.title}
            </h3>
            <div className="flex items-center flex-wrap gap-2 text-xs">
              {tags.length > 0 && tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 rounded-full bg-gray-600/40 border border-gray-500/40 text-gray-200 font-light group relative inline-flex items-center"
                >
                  <span className="text-gray-300 font-normal">#</span>{tag}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newTags = tags.filter((_, i) => i !== index);
                      setTags(newTags);
                      onAddTag(chat.id, newTags);
                    }}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              ))}
              {showTagInput ? (
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onBlur={() => {
                    if (tagInput.trim()) {
                      handleAddTag({ preventDefault: () => {} });
                    }
                    setShowTagInput(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (tagInput.trim()) {
                        handleAddTag({ preventDefault: () => {} });
                      }
                      setShowTagInput(false);
                    }
                  }}
                  placeholder="Type tag name..."
                  className="bg-transparent border-b border-gray-600 focus:border-accent-lilac focus:outline-none px-1 w-24"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setShowTagInput(true)}
                  className="text-gray-400 hover:text-gray-300 flex items-center gap-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Tag
                </button>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {formatTimestamp(chat.messages?.[0]?.timestamp)}
              </span>
              <div className="flex items-center gap-4">
                <span>{chat.messages.length} messages</span>
                <span>{chat.messages.filter(m => m.bookmarked).length} bookmarks</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <button
            onClick={handleNavigateToChat}
            className="text-xs bg-blue-600/20 text-blue-300 px-3 py-1 rounded hover:bg-blue-600/30 transition-colors mb-auto"
          >
            Open Chat
          </button>
        </div>
      </div>
      {/* Tag input is now integrated in the main content area */}
    </div>
  );
};

const StarredConversations = () => {
  const [starredChats, setStarredChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState('Starred Conversations');

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(user === null);
    });

    return () => unsubscribe();
  }, []);

  // Fetch chats when user is available
  useEffect(() => {
    const fetchStarredChats = async () => {
      if (!currentUser) {
        return;
      }

      try {
        console.log('Fetching chats for user:', currentUser.uid);
        const chatsRef = collection(db, 'chats');
        const q = query(
          chatsRef,
          where('userId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        console.log('Found chats:', querySnapshot.size);
        
        if (querySnapshot.empty) {
          console.log('No chats found for user');
          setStarredChats([]);
          return;
        }
        
        const chats = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Processing chat:', doc.id, data);
          
          // Get the last message that isn't a system message
          const messages = data.messages || [];
          const firstMessage = messages[0];
          const lastMessage = messages.filter(m => m.type === 'user' || m.type === 'ai').pop();

          // Get timestamp from first message
          const timestamp = firstMessage?.timestamp;
          const date = timestamp ? new Date(timestamp) : null;
          const formattedDate = date ? date.toLocaleString() : null;

          return {
            id: doc.id,
            title: data.title || firstMessage?.content?.slice(0, 50) || 'Untitled Chat',
            createdAt: formattedDate,
            lastMessage: lastMessage?.content || 'No messages',
            messages: messages,
            tags: data.tags || []
          };
        }).filter(chat => chat.messages.length > 0); // Only show chats with messages
        
        console.log('Processed chats:', chats.length);
        setStarredChats(chats);
      } catch (error) {
        console.error('Error fetching starred chats:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
      }
    };

    if (currentUser) {
      setLoading(true);
      fetchStarredChats().finally(() => setLoading(false));
    }
  }, [currentUser]);

  const handleAddTag = async (chatId, newTags) => {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        tags: newTags
      });
      
      setStarredChats(prevChats =>
        prevChats.map(chat =>
          chat.id === chatId ? { ...chat, tags: newTags } : chat
        )
      );
    } catch (error) {
      console.error('Error updating tags:', error);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="col-span-2 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      );
    }

    if (!currentUser) {
      return (
        <div className="col-span-2 text-center text-gray-400 py-8">
          Please log in to view your starred conversations
        </div>
      );
    }

    if (starredChats.length === 0) {
      return (
        <div className="col-span-2 flex flex-col items-center justify-center py-12">
          <div className="text-gray-400 text-center">
            <p className="mb-2">No starred conversations found</p>
            <p className="text-sm text-gray-500">
              Star your favorite conversations in the AI Chat to see them here
            </p>
          </div>
        </div>
      );
    }

    return starredChats.map(chat => (
      <StarredConversationCard
        key={chat.id}
        chat={chat}
        onAddTag={handleAddTag}
      />
    ));
  };

  const renderTabContent = () => {
    if (selectedTab === 'Starred Conversations') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderContent()}
        </div>
      );
    } else {
      // Bookmarked Messages content will be implemented later
      return (
        <div className="col-span-2 text-center text-gray-400 py-8">
          Bookmarked Messages feature coming soon
        </div>
      );
    }
  };

  return (
    <div className="flex-1 bg-surface-light rounded-lg p-6">
      <div className="space-y-6">
        <AIChatHistoryTabs
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        />
        {renderTabContent()}
      </div>
    </div>
  );
};

export default StarredConversations;