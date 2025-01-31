import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenIcon, ClockIcon, BookmarkIcon, ChatBubbleLeftRightIcon, FlagIcon } from '@heroicons/react/24/outline';
import Navbar from '../Navbar/Navbar';
import { testService } from '../../services/tests/testService';
import { categories } from '../../pages/Categories/Categories.js';

const ActivityCenter = () => {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState(0);
    const [selectedSubcategory, setSelectedSubcategory] = useState('Saved Tests'); // Default to Saved Tests
    const [savedTests, setSavedTests] = useState([]);
    const [finishedTests, setFinishedTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch both saved tests and test history when component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch both saved tests and completed test history in parallel
                const [tests, history] = await Promise.all([
                    testService.getSavedTests(),
                    testService.getTestHistory()
                ]);

                // Remove duplicates from history based on timestamp and categoryId
                const uniqueHistory = history.reduce((acc, current) => {
                    const isDuplicate = acc.some(item => 
                        item.categoryId === current.categoryId &&
                        Math.abs(item.completedAt.toDate() - current.completedAt.toDate()) < 1000 // Within 1 second
                    );
                    if (!isDuplicate) {
                        // Keep the original test data without any transformations
                        acc.push(current);
                    }
                    return acc;
                }, []);

                // Sort by completion date (newest first)
                const sortedHistory = uniqueHistory.sort((a, b) => 
                    b.completedAt.toDate() - a.completedAt.toDate()
                );
                
                setSavedTests(tests);
                setFinishedTests(sortedHistory);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Show error state if there's an error
    if (error) {
        return (
            <div className="text-red-400 text-sm text-center py-2">
                {error}
            </div>
        );
    }

    // Get category name from categoryId using the categories data
    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.title : 'Unknown Category';
    };

    // Get subcategory names for a test (both saved and finished)
    const getSubcategoryNames = (test) => {
        // Early return if no test data
        if (!test) return 'All subcategories';

        // Log the raw test data for debugging
        console.log('Processing test:', test);

        // Get subcategories from the test data
        const subcategories = test.selectedSubcategories;
        
        // If no subcategories found, return default text
        if (!subcategories?.length) {
            return 'All subcategories';
        }

        // Get the category object to find subcategory names
        const category = categories.find(cat => cat.id === test.categoryId);
        if (!category?.subcategories) {
            return 'All subcategories';
        }

        // Map subcategory codes to their names
        const subcategoryNames = subcategories
            .map(subCode => {
                const subcategory = category.subcategories.find(sub => sub.code === subCode);
                return subcategory ? subcategory.name : null;
            })
            .filter(Boolean)
            .join(', ');

        return subcategoryNames || 'All subcategories';
    };

    // Calculate progress percentage
    const getProgress = (test) => {
        if (!test.answeredQuestions || typeof test.answeredQuestions !== 'object') {
            return '0%';
        }
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

    // Calculate and format the success rate as a percentage
    const formatSuccessRate = (score, total) => {
        if (!total) return '0%';
        return Math.round((score / total) * 100) + '%';
    };

    // Determine if a test result is a pass or fail (75% is passing threshold)
    const getTestStatus = (score, total) => {
        if (!total) return 'FAIL';
        return (score / total) >= 0.75 ? 'PASS' : 'FAIL';
    };

    // Get relative time for both saved and finished tests
    const getRelativeTime = (timestamp) => {
        if (!timestamp) return '';
        
        const now = new Date();
        // Handle both Firestore Timestamp and regular Date objects
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
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

    // Delete saved test handler
    const handleDeleteTest = async (testId) => {
        try {
            const success = await testService.deleteSavedTest(testId);
            if (success) {
                // Update local state to remove the deleted test
                setSavedTests(prev => prev.filter(test => test.id !== testId));
                // Only refresh saved tests, not finished tests
                try {
                    const tests = await testService.getSavedTests();
                    setSavedTests(tests);
                } catch (err) {
                    console.error('Error refreshing saved tests:', err);
                }
            } else {
                setError('Failed to delete test. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting test:', error);
            setError('Failed to delete test. Please try again.');
        }
    };

    const handleTestClick = (test) => {
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

    const activityCategories = [
        {
            name: 'Practice Tests & Exams',
            icon: BookOpenIcon,
            subcategories: ['Saved Tests', 'Finished Tests'],
            // Return different items based on which tab is selected
            items: selectedSubcategory === 'Finished Tests' ? 
                // Map finished tests data for display
                finishedTests.map(test => ({
                    name: getCategoryName(test.categoryId),
                    subcategories: getSubcategoryNames(test),
                    questionsCompleted: test.totalQuestions,
                    successRate: formatSuccessRate(test.score, test.totalQuestions),
                    status: getTestStatus(test.score, test.totalQuestions),
                    date: getRelativeTime(test.completedAt),
                    type: 'Finished Tests'
                })) :
                // Map saved tests data for display
                savedTests.map(test => ({
                    name: getCategoryName(test.categoryId),
                    date: getRelativeTime(test.savedAt),
                    progress: getProgress(test),
                    questionsCompleted: getAnsweredCount(test),
                    type: 'Saved Tests',
                    originalTest: test
                }))
        },
        {
            name: 'Study Materials',
            icon: BookmarkIcon,
            items: [
                { name: 'VOR Navigation Tips', date: '2025-01-18' },
                { name: 'Weather Patterns', date: '2025-01-16' },
                { name: 'ILS Approach Procedures', date: '2025-01-17' },
                { name: 'METAR Interpretation', date: '2025-01-15' }
            ]
        },
        {
            name: 'Flagged Questions',
            icon: FlagIcon,
            subcategories: ['All', 'Green', 'Yellow', 'Red'],
            items: [
                { 
                    name: 'Question #156 - Radio Navigation', 
                    date: '2025-01-18',
                    flag: 'Green'
                },
                { 
                    name: 'Question #89 - Weather Minimums', 
                    date: '2025-01-17',
                    flag: 'Yellow'
                },
                { 
                    name: 'Question #234 - Aircraft Systems', 
                    date: '2025-01-16',
                    flag: 'Red'
                }
            ]
        },
        {
            name: 'AI Chat History',
            icon: ChatBubbleLeftRightIcon,
            subcategories: ['Starred Conversations', 'Bookmarked Messages'],
            items: [
                { 
                    name: 'Weather Radar Discussion', 
                    date: '2025-01-18',
                    type: 'Starred Conversations'
                },
                { 
                    name: 'Flight Planning Tips', 
                    date: '2025-01-16',
                    type: 'Starred Conversations'
                },
                { 
                    name: 'ILS Approach Question', 
                    date: '2025-01-15',
                    type: 'Bookmarked Messages'
                }
            ]
        }
    ];

    return (
        <>
            <Navbar />
            <div className="pt-24 min-h-screen bg-surface-DEFAULT text-white p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex space-x-6">
                        {/* Left Sidebar Navigation */}
                        <div className="w-64 shrink-0">
                            <nav className="space-y-1">
                                {activityCategories.map((category, index) => (
                                    <button
                                        key={category.name}
                                        onClick={() => {
                                            setSelectedTab(index);
                                            setSelectedSubcategory('Saved Tests'); // Reset subcategory selection when changing main category
                                        }}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                                            selectedTab === index 
                                                ? 'bg-accent-lilac text-white' 
                                                : 'text-gray-300 hover:bg-surface-light'
                                        }`}
                                    >
                                        <category.icon className="h-6 w-6" />
                                        <span>{category.name}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 bg-surface-light rounded-lg p-6">
                            {/* Current Category Content */}
                            <div className="space-y-6">
                                {/* Subcategory Tabs */}
                                {activityCategories[selectedTab].subcategories && (
                                    <div className="border-b border-surface-DEFAULT">
                                        <nav className="-mb-px flex space-x-8">
                                            {activityCategories[selectedTab].subcategories.map((subcategory) => (
                                                <button
                                                    key={subcategory}
                                                    onClick={() => setSelectedSubcategory(subcategory)}
                                                    className={`
                                                        py-2 px-1 border-b-2 font-medium text-sm
                                                        ${selectedSubcategory === subcategory
                                                            ? 'border-accent-lilac text-accent-lilac'
                                                            : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'}
                                                    `}
                                                >
                                                    {subcategory}
                                                </button>
                                            ))}
                                        </nav>
                                    </div>
                                )}

                                {/* Items Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {activityCategories[selectedTab].items
                                        .map((item, itemIdx) => (
                                            <div 
                                                key={itemIdx}
                                                className="bg-surface-DEFAULT p-4 rounded-lg relative group cursor-pointer hover:bg-surface-lighter transition-colors duration-200"
                                            >
                                                {item.type === 'Saved Tests' ? (
                                                    // Original Saved Tests Layout
                                                    <div className="flex justify-between items-start group">
                                                        {/* Left side - Test information */}
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <h3 className="font-medium text-white">
                                                                    {item.name}
                                                                </h3>
                                                                {item.progress && (
                                                                    <span className="text-accent-lilac ml-2">
                                                                        {item.progress}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-1 mt-1">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs text-gray-400">
                                                                        {item.questionsCompleted} questions completed
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {item.date}
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-gray-400">
                                                                    <span className="text-gray-500">Subcategories:</span>{' '}
                                                                    {getSubcategoryNames(item.originalTest)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Right side - Action buttons */}
                                                        <div className="flex flex-col items-center ml-4">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleContinueTest(item.originalTest);
                                                                }}
                                                                className="w-full px-3 py-1 text-xs text-white bg-accent-lilac hover:bg-accent-lilac-light rounded-md transition-colors duration-200"
                                                            >
                                                                Continue
                                                            </button>
                                                            {/* Delete button - appears on hover */}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (window.confirm('Are you sure you want to delete this saved test?')) {
                                                                        handleDeleteTest(item.originalTest.id);
                                                                    }
                                                                }}
                                                                className="mt-2 p-1.5 rounded-full hover:bg-red-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                                                title="Delete saved test"
                                                            >
                                                                <svg 
                                                                    xmlns="http://www.w3.org/2000/svg" 
                                                                    className="h-4 w-4 text-red-500" 
                                                                    fill="none" 
                                                                    viewBox="0 0 24 24" 
                                                                    stroke="currentColor"
                                                                >
                                                                    <path 
                                                                        strokeLinecap="round" 
                                                                        strokeLinejoin="round" 
                                                                        strokeWidth={2} 
                                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Finished Tests Layout
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <h3 className="font-medium text-white">
                                                                    {item.name}
                                                                </h3>
                                                                <div className="flex items-center space-x-3">
                                                                    <div className={`
                                                                        px-3 py-1 rounded-full font-medium text-sm
                                                                        ${item.successRate >= 75 
                                                                            ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-400' 
                                                                            : 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400'}
                                                                    `}>
                                                                        {item.successRate}
                                                                    </div>
                                                                    <div className={`
                                                                        px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider
                                                                        flex items-center space-x-1
                                                                        ${item.successRate >= 75
                                                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'}
                                                                    `}>
                                                                        <div className={`
                                                                            w-1.5 h-1.5 rounded-full
                                                                            ${item.successRate >= 75 ? 'bg-emerald-400' : 'bg-red-400'}
                                                                        `}></div>
                                                                        <span>{item.successRate >= 75 ? 'Pass' : 'Fail'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-1 mt-1">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs text-gray-400">
                                                                        {item.questionsCompleted} questions completed
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {item.date}
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-gray-400">
                                                                    <span className="text-gray-500">Subcategories:</span>{' '}
                                                                    {item.subcategories}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ActivityCenter;
