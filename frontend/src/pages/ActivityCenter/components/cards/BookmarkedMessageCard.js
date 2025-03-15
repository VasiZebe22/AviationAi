import React, { useState } from 'react';
import { ClockIcon, ChevronDownIcon, MapPinIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

// Helper function to clean message content by removing source citations
const cleanMessageContent = (content) => {
    if (!content) return '';
    // Remove source citation markers like 【4:0†source】
    return content.replace(/【\d+:\d+†source】/g, '');
};

// Custom components for markdown rendering
const MarkdownComponents = {
    // Override heading sizes
    h1: ({ children }) => <h1 className="text-lg font-medium mb-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-base font-medium mb-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
    // Add consistent paragraph spacing
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    // Style lists with proper spacing
    ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
    // Style list items
    li: ({ children }) => <li className="pl-1">{children}</li>,
};

const formatTimestamp = (timestamp) => {
    try {
        if (!timestamp) return '';
        
        // Handle Date objects
        if (timestamp instanceof Date) {
            return format(timestamp, 'M/d/yyyy, h:mm:ss a');
        }
        
        // Handle string timestamps
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            console.error('Invalid timestamp:', timestamp);
            return '';
        }
        
        return format(date, 'M/d/yyyy, h:mm:ss a');
    } catch (error) {
        console.error('Error formatting timestamp:', error);
        return '';
    }
};

const BookmarkedMessageCard = ({ chat, onDelete, onTogglePin }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    const handleNavigateToChat = () => {
        navigate('/chat', {
            state: {
                selectedChatId: chat.id,
                action: 'loadChat'
            }
        });
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await onDelete(chat.id);
        } catch (error) {
            console.error('Error deleting chat:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Get the first bookmarked message to display in the collapsed view
    const firstBookmarkedMessage = chat.messages[0];

    // Helper function to determine if a message is from the user
    const isUserMessage = (message) => {
        // Check for explicit role field
        if (message.role) {
            return message.role === 'user';
        }
        
        // Check for type field as fallback
        if (message.type) {
            return message.type === 'user';
        }
        
        // If no role or type, check content for patterns that might indicate a user message
        // This is a heuristic and might need adjustment
        const userPhrases = [
            'just checking', 
            'hello', 
            'hi there', 
            'can you', 
            'please', 
            'thanks', 
            'thank you',
            'help me',
            'I need',
            'I want',
            'I would like',
            'could you',
            'would you',
            'nevermind',
            'never mind'
        ];
        
        if (message.content) {
            const lowerContent = message.content.toLowerCase();
            return userPhrases.some(phrase => lowerContent.includes(phrase));
        }
        
        // Default to AI if we can't determine
        return false;
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
                            onClick={handleDelete}
                            className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-500/20 text-red-500"
                            title="Delete chat"
                            disabled={isDeleting}
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
                <div className="text-sm text-gray-300 p-3 bg-surface/50 rounded-md group relative hover:bg-surface/70 transition-all duration-200">
                    <ReactMarkdown components={MarkdownComponents}>
                        {cleanMessageContent(firstBookmarkedMessage?.content)}
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
                    className="flex items-center justify-center w-full mt-4 pt-2 border-t border-surface hover:bg-surface-hover transition-colors"
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
                <div className="px-4 pt-6 pb-4 bg-surface space-y-4">
                    {chat.messages.map((message, index) => {
                        const userMsg = isUserMessage(message);
                        return (
                            <div key={index} className={`flex ${userMsg ? 'justify-end' : 'justify-start'} relative`}>
                                <div 
                                    className={`
                                        max-w-[80%] rounded-lg p-4 relative
                                        ${userMsg
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-700 text-white border border-gray-600/30'
                                        }
                                    `}
                                    
                                >
                                    {/* Message content */}
                                    <div className="text-sm">
                                        <ReactMarkdown
                                            components={MarkdownComponents}
                                            className="prose prose-invert prose-sm max-w-none"
                                        >
                                            {cleanMessageContent(message.content)}
                                        </ReactMarkdown>
                                    </div>
                                    
                                    {/* Timestamp */}
                                    <div className="text-xs text-gray-300 mt-2">
                                        {formatTimestamp(message.timestamp)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BookmarkedMessageCard;