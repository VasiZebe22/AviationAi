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

    const activityCategories = [
        {
            name: 'Tests & Quizzes',
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
                                                className="bg-surface-DEFAULT p-4 rounded-lg hover:bg-surface-lighter transition-colors duration-200 cursor-pointer"
                                            >
                                                {item.type === 'Saved Tests' ? (
                                                    // Original Saved Tests Layout
                                                    <div className="flex justify-between items-start">
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
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleContinueTest(item.originalTest);
                                                            }}
                                                            className="ml-4 px-3 py-1 text-xs text-white bg-accent-lilac hover:bg-accent-lilac-light rounded-md transition-colors duration-200"
                                                        >
                                                            Continue
                                                        </button>
                                                    </div>
                                                ) : (
                                                    // Finished Tests Layout
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <h3 className="font-medium text-white">
                                                                    {item.name}
                                                                </h3>
                                                                <span className={item.status === 'PASS' ? 'text-green-400' : 'text-red-400'}>
                                                                    {item.successRate} - {item.status}
                                                                </span>
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
