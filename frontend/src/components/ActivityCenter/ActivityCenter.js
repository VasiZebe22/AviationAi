import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenIcon, ClockIcon, BookmarkIcon, ChatBubbleLeftRightIcon, FlagIcon } from '@heroicons/react/24/outline';
import Navbar from '../Navbar/Navbar';
import { testService } from '../../services/tests/testService';
import { categories } from '../../pages/Categories/Categories.js';

const ActivityCenter = () => {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState(0);
    const [selectedSubcategory, setSelectedSubcategory] = useState({});
    const [savedTests, setSavedTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSavedTests = async () => {
            try {
                setLoading(true);
                setError(null);
                const tests = await testService.getSavedTests();
                setSavedTests(tests);
            } catch (err) {
                console.error('Error fetching saved tests:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSavedTests();
    }, []);

    // Show error state if there's an error
    if (error) {
        return (
            <div className="text-red-400 text-sm text-center py-2">
                {error}
            </div>
        );
    }

    // Get category name from categoryId
    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.title : 'Test';
    };

    // Get subcategory names for a test
    const getSubcategoryNames = (test) => {
        if (!test.selectedSubcategories?.length) {
            return 'All subcategories';
        }

        const category = categories.find(cat => cat.id === test.categoryId);
        if (!category) return '';

        return test.selectedSubcategories
            .map(subCode => {
                const subcategory = category.subcategories.find(sub => sub.code === subCode);
                return subcategory ? subcategory.name : '';
            })
            .filter(Boolean)
            .join(', ');
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

    // Format the relative time
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

    const activityCategories = [
        {
            name: 'Tests & Quizzes',
            icon: BookOpenIcon,
            subcategories: ['Saved Tests', 'Finished Tests'],
            items: [
                ...savedTests.map(test => ({
                    name: getCategoryName(test.categoryId),
                    date: getRelativeTime(test.savedAt),
                    progress: getProgress(test),
                    questionsCompleted: getAnsweredCount(test),
                    type: 'Saved Tests',
                    originalTest: test
                }))
            ]
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
                                            setSelectedSubcategory({}); // Reset subcategory selection when changing main category
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
                                                    onClick={() => setSelectedSubcategory({
                                                        ...selectedSubcategory,
                                                        [activityCategories[selectedTab].name]: subcategory
                                                    })}
                                                    className={`
                                                        py-2 px-1 border-b-2 font-medium text-sm
                                                        ${selectedSubcategory[activityCategories[selectedTab].name] === subcategory || 
                                                          (!selectedSubcategory[activityCategories[selectedTab].name] && subcategory === (activityCategories[selectedTab].subcategories[0] || ''))
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
                                        .filter(item => {
                                            if (!activityCategories[selectedTab].subcategories) return true;
                                            const currentSubcategory = selectedSubcategory[activityCategories[selectedTab].name] || activityCategories[selectedTab].subcategories[0];
                                            if (currentSubcategory === 'All') return true;
                                            return item.type === currentSubcategory || item.flag === currentSubcategory;
                                        })
                                        .map((item, itemIdx) => (
                                            <div 
                                                key={itemIdx}
                                                className="bg-surface-DEFAULT p-4 rounded-lg hover:bg-surface-lighter transition-colors duration-200 cursor-pointer"
                                            >
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
                                                        {item.type === 'Saved Tests' && (
                                                            <div className="text-xs text-gray-400">
                                                                <span className="text-gray-500">Subcategories:</span>{' '}
                                                                {getSubcategoryNames(item.originalTest)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {item.type === 'Saved Tests' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleContinueTest(item.originalTest);
                                                        }}
                                                        className="ml-4 px-3 py-1 text-xs text-white bg-accent-lilac hover:bg-accent-lilac-light rounded-md transition-colors duration-200"
                                                    >
                                                        Continue
                                                    </button>
                                                )}
                                                    {item.score && (
                                                        <span className="text-green-400">
                                                            {item.score}
                                                        </span>
                                                    )}
                                                    {item.flag && (
                                                        <span className={`
                                                            px-2 py-1 rounded text-xs font-medium
                                                            ${item.flag === 'Green' ? 'bg-green-900 text-green-300' :
                                                              item.flag === 'Yellow' ? 'bg-yellow-900 text-yellow-300' :
                                                              'bg-red-900 text-red-300'}
                                                        `}>
                                                            {item.flag}
                                                        </span>
                                                    )}
                                                </div>
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
