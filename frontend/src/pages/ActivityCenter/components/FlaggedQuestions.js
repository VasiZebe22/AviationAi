import React, { useState, useEffect } from 'react';
import { flagService } from '../../../services/flags/flagService';
import FlaggedQuestionCard from './cards/FlaggedQuestionCard';
import { useAuth } from '../../../contexts/AuthContext';

const FlaggedQuestions = () => {
    const [flags, setFlags] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
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
            setFlags(flaggedQuestions);
        } catch (error) {
            console.error('Error fetching flags:', error);
            setError('Failed to load flagged questions');
        } finally {
            setIsLoading(false);
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

    const filteredFlags = activeTab === 'all' 
        ? flags 
        : flags.filter(flag => flag.flag.toLowerCase() === activeTab);

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'green', label: 'Green' },
        { id: 'yellow', label: 'Yellow' },
        { id: 'red', label: 'Red' }
    ];

    const getTabClass = (tabId) => {
        const baseClass = "px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200";
        if (activeTab === tabId) {
            switch (tabId) {
                case 'green':
                    return `${baseClass} bg-green-500/20 text-green-500`;
                case 'yellow':
                    return `${baseClass} bg-yellow-500/20 text-yellow-500`;
                case 'red':
                    return `${baseClass} bg-red-500/20 text-red-500`;
                default:
                    return `${baseClass} bg-primary/20 text-primary`;
            }
        }
        return `${baseClass} text-gray-400 hover:text-white`;
    };

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
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={getTabClass(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Flagged Questions List */}
            <div className="space-y-4">
                {filteredFlags.map(flag => (
                    <FlaggedQuestionCard
                        key={flag.id}
                        flag={flag}
                        onRemoveFlag={() => handleRemoveFlag(flag.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default FlaggedQuestions;