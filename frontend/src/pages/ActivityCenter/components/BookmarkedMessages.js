import React, { useState, useEffect, useMemo } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { auth } from '../../../services/firebase';
import { chatService } from '../../../services/chats/chatService';
import BookmarkedMessageCard from './cards/BookmarkedMessageCard';

const BookmarkedMessages = () => {
    const [bookmarkedChats, setBookmarkedChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter chats based on search query
    const filteredChats = useMemo(() => {
        if (!searchQuery.trim()) return bookmarkedChats;
        const searchLower = searchQuery.toLowerCase();
        
        return bookmarkedChats.filter(chat => (
            chat.title.toLowerCase().includes(searchLower) ||
            chat.messages.some(msg => msg.content?.toLowerCase().includes(searchLower)) ||
            chat.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        ));
    }, [bookmarkedChats, searchQuery]);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            setLoading(user === null);
        });

        return () => unsubscribe();
    }, []);

    // Fetch bookmarked messages when user is available
    useEffect(() => {
        const fetchBookmarkedMessages = async () => {
            if (!currentUser) {
                return;
            }

            try {
                setLoading(true);
                const chats = await chatService.getBookmarkedMessages(currentUser.uid);
                setBookmarkedChats(chats);
            } catch (error) {
                console.error('Error fetching bookmarked messages:', error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchBookmarkedMessages();
        }
    }, [currentUser]);

    const handleDelete = async (chatId) => {
        if (!window.confirm('Are you sure you want to delete this chat?')) {
            return;
        }

        try {
            await chatService.deleteChat(chatId);
            setBookmarkedChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    };

    const handleTogglePin = async (chatId) => {
        try {
            const chat = bookmarkedChats.find(c => c.id === chatId);
            const newPinnedState = !chat.isPinned;
            
            await chatService.toggleChatPin(chatId, newPinnedState);

            setBookmarkedChats(prevChats =>
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
            return b.createdAt.getTime() - a.createdAt.getTime(); // Newer dates first
        });
    }, [filteredChats]);

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
                    Please log in to view your bookmarked messages
                </div>
            );
        }

        if (bookmarkedChats.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-gray-400 text-center">
                        <p className="mb-2">No bookmarked messages found</p>
                        <p className="text-sm text-gray-500">
                            Bookmark messages in the AI Chat to see them here
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

        return sortedChats.map(chat => (
            <BookmarkedMessageCard
                key={chat.id}
                chat={chat}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
            />
        ));
    };

    return (
        <div className="flex-1 space-y-4">
            {/* Search bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search chats, messages, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-800/90 text-gray-200 placeholder-gray-500 px-4 py-2.5 pl-11 rounded-lg border border-gray-700/50 focus:outline-none focus:border-accent-lilac/50 focus:ring-1 focus:ring-accent-lilac/50"
                />
                <MagnifyingGlassIcon className="absolute left-3.5 top-3 h-5 w-5 text-gray-500" />
            </div>

            {/* Content area */}
            <div className="bg-surface-light rounded-lg p-6">
                <div className="space-y-6 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookmarkedMessages;