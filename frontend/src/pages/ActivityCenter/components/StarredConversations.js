import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { MapPinIcon, TrashIcon } from '@heroicons/react/24/outline';
import { db, auth } from '../../../services/firebase';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import AIChatHistoryTabs from './AIChatHistoryTabs';
import BookmarkedMessages from './BookmarkedMessages';

const formatTimestamp = (timestamp) => {
  try {
    if (!timestamp) return '';
    
    // Handle Firestore timestamps
    if (typeof timestamp === 'object' && timestamp?.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    
    // Handle Date objects
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    
    // Handle string timestamps
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      console.error('Invalid timestamp:', timestamp);
      return '';
    }
    
    return date.toLocaleString();
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return '';
  }
};

const StarredConversationCard = ({ chat, onAddTag, onDelete, onTogglePin }) => {
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(chat.tags || []);
  const navigate = useNavigate();

  const handleNavigateToChat = () => {
    navigate('/chat', {
      state: {
        selectedChatId: chat.id,
        action: 'loadChat'
      }
    });
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
    <div className="w-full bg-surface-light rounded-lg mb-4 relative group">
      <div className="flex flex-col space-y-3 p-4">
        {/* Header with title, actions, and open button */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white text-base truncate">
              {chat.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Pin button */}
            <button
              onClick={() => onTogglePin(chat.id)}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                chat.isPinned
                  ? 'opacity-100 bg-purple-500/30 text-purple-400 hover:bg-purple-500/40'
                  : 'opacity-0 group-hover:opacity-100 bg-surface/70 text-gray-400 hover:bg-surface hover:text-white'
              }`}
              title={chat.isPinned ? "Unpin chat" : "Pin chat"}
            >
              <MapPinIcon className={`h-4 w-4 ${chat.isPinned ? 'rotate-45' : ''}`} />
            </button>
            {/* Delete button */}
            <button
              onClick={() => onDelete(chat.id)}
              className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-500/20 text-red-500"
              title="Delete chat"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
            {/* Open Chat button */}
            <button
              onClick={handleNavigateToChat}
              className="text-xs bg-blue-600/20 text-blue-300 px-3 py-1 rounded hover:bg-blue-600/30 transition-colors flex-shrink-0"
            >
              Open Chat
            </button>
          </div>
        </div>

        {/* Tags section */}
        <div className="flex items-center flex-wrap gap-1 min-h-[14px] opacity-75 -mt-1">
          {tags.length > 0 && tags.map((tag, index) => (
            <span
              key={index}
              className="px-1.5 py-[2px] rounded-full bg-gray-600/40 border border-gray-500/40 text-gray-200 text-[11px] font-light group relative inline-flex items-center"
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
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
              className="bg-transparent border-b border-gray-600 focus:border-accent-lilac focus:outline-none px-1 w-20 text-[11px]"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setShowTagInput(true)}
              className="text-gray-400 hover:text-gray-300 flex items-center gap-0.5 transition-colors text-[11px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Tag
            </button>
          )}
        </div>

        {/* Metadata footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-700/50">
          <span className="text-gray-400">
            {formatTimestamp(chat.messages?.[0]?.timestamp || chat.clientCreatedAt || chat.createdAt)}
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z" />
              </svg>
              {chat.messages.length}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {chat.messages.filter(m => m.bookmarked).length}
            </span>
          </div>
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
  const [searchQuery, setSearchQuery] = useState('');

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return starredChats;
    const searchLower = searchQuery.toLowerCase();
    
    // Handle tag search with '#' prefix
    if (searchLower.startsWith('#')) {
      const tagSearch = searchLower.slice(1); // Remove the '#'
      return starredChats.filter(chat =>
        chat.tags.some(tag => tag.toLowerCase().includes(tagSearch))
      );
    }
    
    // Regular search across all fields
    return starredChats.filter(chat => (
      chat.title.toLowerCase().includes(searchLower) ||
      chat.messages.some(msg => msg.content?.toLowerCase().includes(searchLower)) ||
      chat.tags.some(tag => tag.toLowerCase().includes(searchLower))
    ));
  }, [starredChats, searchQuery]);

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

          // Get timestamp from first message or fallback to chat creation time
          const messageTimestamp = firstMessage?.timestamp;
          const chatTimestamp = data.clientCreatedAt || data.createdAt;
          
          // Convert timestamp to Date object
          let date;
          if (messageTimestamp) {
            date = typeof messageTimestamp === 'object' && messageTimestamp.toDate
              ? messageTimestamp.toDate()
              : new Date(messageTimestamp);
          } else if (chatTimestamp) {
            date = typeof chatTimestamp === 'object' && chatTimestamp.toDate
              ? chatTimestamp.toDate()
              : new Date(chatTimestamp);
          }
          
          const formattedDate = date ? date.toLocaleString() : null;
          console.log('Chat timestamp details:', {
            chatId: doc.id,
            messageTimestamp,
            chatTimestamp,
            finalDate: formattedDate
          });

          return {
            id: doc.id,
            title: data.title || firstMessage?.content?.slice(0, 50) || 'Untitled Chat',
            createdAt: formattedDate,
            lastMessage: lastMessage?.content || 'No messages',
            messages: messages,
            tags: data.tags || [],
            isPinned: data.isPinned || false,
            rawTimestamp: messageTimestamp || chatTimestamp // Store raw timestamp for sorting
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

  const handleDelete = async (chatId) => {
    if (!window.confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      const chatRef = doc(db, 'chats', chatId);
      await deleteDoc(chatRef);
      setStarredChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleTogglePin = async (chatId) => {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chat = starredChats.find(c => c.id === chatId);
      const newPinnedState = !chat.isPinned;
      
      await updateDoc(chatRef, {
        isPinned: newPinnedState
      });

      setStarredChats(prevChats =>
        prevChats.map(chat =>
          chat.id === chatId ? { ...chat, isPinned: newPinnedState } : chat
        )
      );
    } catch (error) {
      console.error('Error updating pin status:', error);
    }
  };

  // Sort chats with pinned ones first, then by date
  const sortedChats = useMemo(() => {
    return [...filteredChats].sort((a, b) => {
      // First sort by pin status
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1; // Pinned chats come first
      }
      
      // Then sort by timestamp within each group (pinned and unpinned)
      const getDateFromTimestamp = (timestamp) => {
        if (!timestamp) return new Date(0);
        if (typeof timestamp === 'object' && timestamp.toDate) {
          return timestamp.toDate();
        }
        if (timestamp instanceof Date) {
          return timestamp;
        }
        return new Date(timestamp);
      };

      const aDate = getDateFromTimestamp(a.rawTimestamp);
      const bDate = getDateFromTimestamp(b.rawTimestamp);
      
      return bDate.getTime() - aDate.getTime(); // Newer dates first
    });
  }, [filteredChats]);

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
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      );
    }

    if (!currentUser) {
      return (
        <div className="text-center text-gray-400 py-8">
          Please log in to view your starred conversations
        </div>
      );
    }

    if (starredChats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-400 text-center">
            <p className="mb-2">No starred conversations found</p>
            <p className="text-sm text-gray-500">
              Star your favorite conversations in the AI Chat to see them here
            </p>
          </div>
        </div>
      );
    }

    if (filteredChats.length === 0 && searchQuery.trim()) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-400 text-center">
            <p className="mb-2">No chats found matching your search</p>
            <p className="text-sm text-gray-500">
              Try different keywords or clear the search
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {sortedChats.map(chat => (
          <StarredConversationCard
            key={chat.id}
            chat={chat}
            onAddTag={handleAddTag}
            onDelete={handleDelete}
            onTogglePin={handleTogglePin}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full p-4">
      {/* Search bar - moved above tabs */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats, messages, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-light rounded-lg px-4 py-2 pl-10 text-white"
          />
          <svg
            className="absolute left-3.5 top-3 h-5 w-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <AIChatHistoryTabs
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />
      
      {/* Content based on selected tab */}
      <div className="mt-6">
        {selectedTab === 'Starred Conversations' ? (
          /* Starred Conversations content */
          renderContent()
        ) : (
          /* Bookmarked Messages content - pass searchQuery */
          <BookmarkedMessages searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
};

export default StarredConversations;