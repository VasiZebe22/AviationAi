import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import questionService from '../../services/questionService';
import { categories } from '../../pages/Categories/Categories';

/**
 * RecentSavedTests Component
 * Displays the 3 most recent saved tests with options to continue them
 * Features:
 * - Shows test category and progress
 * - Displays last saved timestamp
 * - Provides direct "Continue" button for each test
 * - Groups duplicate tests by categoryId
 */
const RecentSavedTests = () => {
    const [recentTests, setRecentTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecentTests = async () => {
            try {
                setLoading(true);
                const tests = await questionService.getSavedTests();
                
                // Group tests by categoryId and keep only the most recent one
                const groupedTests = tests.reduce((acc, test) => {
                    if (!acc[test.categoryId] || 
                        acc[test.categoryId].savedAt.toDate() < test.savedAt.toDate()) {
                        acc[test.categoryId] = test;
                    }
                    return acc;
                }, {});

                // Convert back to array, sort by date, and take top 3
                const sortedTests = Object.values(groupedTests)
                    .sort((a, b) => b.savedAt.toDate() - a.savedAt.toDate())
                    .slice(0, 3);
                
                setRecentTests(sortedTests);
            } catch (err) {
                console.error('Error fetching recent saved tests:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentTests();
    }, []);

    // Get category name from categoryId
    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.title : 'Test';
    };

    // Calculate progress percentage
    const getProgress = (test) => {
        if (!test.answeredQuestions || typeof test.answeredQuestions !== 'object') {
            return '0%';
        }
        // answeredQuestions is an object where keys are question indices
        const answeredCount = Object.keys(test.answeredQuestions).length;
        const total = test.totalQuestions || Object.keys(test.answeredQuestions).length;
        return `${Math.round((answeredCount / total) * 100)}%`;
    };

    // Get answered questions count
    const getAnsweredCount = (test) => {
        if (!test.answeredQuestions || typeof test.answeredQuestions !== 'object') {
            return 0;
        }
        return Object.keys(test.answeredQuestions).length;
    };

    // Format the relative time (e.g., "2 hours ago")
    const getRelativeTime = (timestamp) => {
        const now = new Date();
        const savedDate = timestamp.toDate();
        const diffInHours = Math.floor((now - savedDate) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours === 1) return '1 hour ago';
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return '1 day ago';
        return `${diffInDays} days ago`;
    };

    // Handle continuing a saved test
    const handleContinueTest = (test) => {
        navigate(`/questions/${test.categoryId}`, {
            state: {
                mode: test.mode,
                filters: test.filters,
                selectedSubcategories: test.selectedSubcategories,
                savedTestId: test.id,
                savedTestData: {
                    currentQuestion: test.currentQuestion,
                    timer: test.timer,
                    answeredQuestions: test.answeredQuestions
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-surface-dark rounded-md"></div>
                ))}
            </div>
        );
    }

    if (recentTests.length === 0) {
        return (
            <div className="text-gray-400 text-sm text-center py-2">
                No saved tests yet
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {recentTests.map((test) => (
                <div 
                    key={test.id}
                    className="flex items-center justify-between p-2 rounded-md bg-surface-dark hover:bg-dark-lighter transition-colors duration-200"
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300 truncate">
                                {getCategoryName(test.categoryId)}
                            </span>
                            <span className="text-xs text-accent-lilac ml-2">
                                {getProgress(test)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-400">
                                {getAnsweredCount(test)} questions completed
                            </span>
                            <span className="text-xs text-gray-500">
                                {getRelativeTime(test.savedAt)}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => handleContinueTest(test)}
                        className="ml-2 px-3 py-1 text-xs text-white bg-accent-lilac hover:bg-accent-lilac-light rounded-md transition-colors duration-200"
                    >
                        Continue
                    </button>
                </div>
            ))}
        </div>
    );
};

export default RecentSavedTests;
