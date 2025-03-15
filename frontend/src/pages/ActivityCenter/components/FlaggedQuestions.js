import React, { useState, useEffect } from 'react';
import { flagService } from '../../../services/flags/flagService';
import { questionService } from '../../../services/questions/questionService';
import FlaggedQuestionCard from './cards/FlaggedQuestionCard';
import { useAuth } from '../../../contexts/AuthContext';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const FlaggedQuestions = () => {
    const [flags, setFlags] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser?.user?.uid) {
            fetchFlags();
        } else {
            setIsLoading(false);
            setError('Please sign in to view flagged questions');
        }
    }, [currentUser]);

    const fetchFlags = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const flaggedQuestions = await flagService.getFlaggedQuestions(currentUser.user.uid);
            
            // Fetch question data for each flag
            const flagsWithQuestions = await Promise.all(
                flaggedQuestions.map(async (flag) => {
                    try {
                        const questionData = await questionService.getQuestionById(flag.questionId);
                        return { ...flag, question: questionData };
                    } catch (error) {
                        console.error(`Error fetching question ${flag.questionId}:`, error);
                        return flag;
                    }
                })
            );
            
            setFlags(flagsWithQuestions);
        } catch (error) {
            console.error('Error fetching flags:', error);
            setError('Failed to load flagged questions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateFlag = async (flagId, newFlag) => {
        if (!currentUser?.user?.uid) {
            setError('Please sign in to update flags');
            return;
        }

        try {
            const updatedFlag = await flagService.updateFlag(flagId, newFlag);
            setFlags(flags.map(flag => 
                flag.id === flagId 
                    ? { ...flag, flag: updatedFlag.flag, relativeTime: updatedFlag.relativeTime }
                    : flag
            ));
        } catch (error) {
            console.error('Error updating flag:', error);
        }
    };

    const handleRemoveFlag = async (flagId) => {
        if (!currentUser?.user?.uid) {
            setError('Please sign in to remove flags');
            return;
        }

        try {
            await flagService.removeFlag(flagId);
            setFlags(flags.filter(flag => flag.id !== flagId));
        } catch (error) {
            console.error('Error removing flag:', error);
        }
    };

    const filteredFlags = flags
        .filter(flag => {
            // First apply the tab filter
            if (activeTab !== 'all' && flag.flag.toLowerCase() !== activeTab) {
                return false;
            }
            
            // Then apply the search filter if there's a search query
            if (!searchQuery) return true;

            const query = searchQuery.toLowerCase().replace('#', '');
            const searchableFields = [
                flag.questionId?.toString(),
                flag.flag?.toLowerCase(),
                flag.question?.text?.toLowerCase(),
                flag.question?.category?.name?.toLowerCase(),
                flag.question?.category?.code?.toLowerCase(),
                ...(flag.question?.subcategories?.map(sub => sub.name.toLowerCase()) || []),
                ...(flag.question?.subcategories?.map(sub => sub.code.toLowerCase()) || [])
            ];

            // Create a single searchable string and normalize it
            const searchableText = searchableFields
                .filter(Boolean)
                .join(' ');

            return searchableText.includes(query);
        });

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'green', label: 'Green' },
        { id: 'yellow', label: 'Yellow' },
        { id: 'red', label: 'Red' }
    ];

    // getTabClass function removed as it's no longer needed

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-red-400">
                {error}
            </div>
        );
    }

    if (!currentUser?.user?.uid) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <p className="text-lg mb-2">Please sign in</p>
                <p className="text-sm">Sign in to view and manage your flagged questions</p>
            </div>
        );
    }

    if (flags.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <p className="text-lg mb-2">No flagged questions</p>
                <p className="text-sm">Flag questions during practice to see them here</p>
            </div>
        );
    }

    return (
        <div className="w-full p-4">
            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search flagged questions, categories, or IDs..."
                        className="w-full bg-surface-light rounded-lg px-4 py-2 pl-10 text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
            </div>

            {/* Tabs - Updated to match AIChatHistoryTabs style */}
            <div className="border-b border-surface-DEFAULT mb-6">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                py-2 px-1 border-b-2 font-medium text-sm
                                ${activeTab === tab.id
                                    ? 'border-accent-lilac text-accent-lilac'
                                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'}
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content Section */}
            {filteredFlags.length > 0 ? (
                <div className="space-y-4">
                    {filteredFlags.map(flag => (
                        <FlaggedQuestionCard
                            key={flag.id}
                            flag={flag}
                            onRemoveFlag={() => handleRemoveFlag(flag.id)}
                            onUpdateFlag={(newFlag) => handleUpdateFlag(flag.id, newFlag)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-400 mt-8">
                    {searchQuery ? 'No questions match your search.' : 'No flagged questions found.'}
                </div>
            )}
        </div>
    );
};

export default FlaggedQuestions;
