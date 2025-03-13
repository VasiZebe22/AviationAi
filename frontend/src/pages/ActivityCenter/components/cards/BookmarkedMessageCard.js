import React, { useState } from 'react';
import { ClockIcon, ChevronDownIcon, MapPinIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

// Custom components for markdown rendering
const MarkdownComponents = {
    // Override heading sizes
    h1: ({ children }) => <h1 className="text-lg font-medium mb-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-base font-medium mb-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
    // Add consistent paragraph spacing
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    // Style lists
    ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
};

const formatTimestamp = (timestamp) => {
    try {
        if (!timestamp) return '';
        
        // Handle Date objects
        if (timestamp instanceof Date) {
            return format(timestamp, 'MMM d, yyyy h:mm a');
        }
        
        // Handle string timestamps
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            console.error('Invalid timestamp:', timestamp);
            return '';
        }
        
        return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
        console.error('Error formatting timestamp:', error);
        return '';
    }
};

const BookmarkedMessageCard = ({ chat, onDelete, onTogglePin }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();

    const handleNavigateToChat = () => {
        navigate('/chat', {
            state: {
                selectedChatId: chat.id,
                action: 'loadChat'
            }
        });
    };

    // Get the first bookmarked message to display in the collapsed view
    const firstBookmarkedMessage = chat.messages[0];
    const truncatedContent = firstBookmarkedMessage?.content?.substring(0, 150) + (firstBookmarkedMessage?.content?.length > 150 ? '...' : '');

    return (
        <div className="w-full bg-gray-800/80 p-5 rounded-lg mb-4 hover:bg-gray-700/80 transition-all duration-200 border border-gray-600/20 shadow-lg ring-1 ring-gray-700/10 relative group">
            {/* Top Action Buttons */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
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
                <button
                    onClick={() => onDelete(chat.id)}
                    className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-500/20 text-red-500"
                    title="Delete chat"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-col space-y-3">
                {/* Header with title */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-base truncate">
                            {chat.title}
                        </h3>
                    </div>
                    <button
                        onClick={handleNavigateToChat}
                        className="text-xs bg-blue-600/20 text-blue-300 px-3 py-1 rounded hover:bg-blue-600/30 transition-colors flex-shrink-0"
                    >
                        Open Chat
                    </button>
                </div>

                {/* Tags section */}
                {chat.tags && chat.tags.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1 min-h-[14px] opacity-75 -mt-1">
                        {chat.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-1.5 py-[2px] rounded-full bg-gray-600/40 border border-gray-500/40 text-gray-200 text-[11px] font-light group relative inline-flex items-center"
                            >
                                <span className="text-gray-300 font-normal">#</span>{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* First bookmarked message preview */}
                <div className="text-sm text-gray-300 p-3 bg-surface/50 border border-surface/30 rounded-md">
                    <ReactMarkdown components={MarkdownComponents}>
                        {truncatedContent}
                    </ReactMarkdown>
                </div>

                {/* Metadata footer */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-700/50">
                    <span className="text-gray-400">
                        {formatTimestamp(firstBookmarkedMessage?.timestamp || chat.createdAt)}
                    </span>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            {chat.messages.length}
                        </span>
                    </div>
                </div>

                {/* Expand Button */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-center w-full mt-2 pt-2 border-t border-surface hover:bg-surface-hover transition-colors"
                >
                    <ChevronDownIcon 
                        className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                            isExpanded ? 'transform rotate-180' : ''
                        }`}
                    />
                </button>
            </div>

            {/* Expanded Content - All Bookmarked Messages */}
            {isExpanded && (
                <div className="mt-4 space-y-4 pt-4 border-t border-gray-700/30">
                    {chat.messages.map((message, index) => (
                        <div key={index} className="p-3 bg-surface/70 rounded-md border border-surface/50">
                            <div className="text-xs text-gray-500 mb-2 flex items-center">
                                <ClockIcon className="h-3.5 w-3.5 mr-1" />
                                {formatTimestamp(message.timestamp)}
                                <span className="ml-2 px-1.5 py-0.5 bg-gray-700/50 rounded text-gray-400 text-[10px]">
                                    {message.role === 'user' ? 'You' : 'AI'}
                                </span>
                            </div>
                            <div className="text-sm text-gray-300">
                                <ReactMarkdown components={MarkdownComponents}>
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookmarkedMessageCard;