import { useState, useEffect } from 'react';
import { testService } from '../../../services/tests/testService';
import { mapSavedTestForDisplay, mapFinishedTestForDisplay } from '../utils/testUtils';
import { getCategoryName, getSubcategoryNames } from '../utils/categoryUtils';
import { getRelativeTime, getProgress, getAnsweredCount, formatSuccessRate, getTestStatus } from '../utils/formatters';
import { BookOpenIcon, BookmarkIcon, FlagIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export const useActivityData = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [selectedSubcategory, setSelectedSubcategory] = useState('Saved Tests');
    const [savedTests, setSavedTests] = useState([]);
    const [finishedTests, setFinishedTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const activityCategories = [
        {
            name: 'Practice Tests & Exams',
            icon: BookOpenIcon,
            subcategories: ['Saved Tests', 'Finished Tests'],
            items: selectedSubcategory === 'Finished Tests' ? 
                finishedTests.map(test => mapFinishedTestForDisplay(test, {
                    getCategoryName,
                    getRelativeTime,
                    formatSuccessRate,
                    getTestStatus,
                    getSubcategoryNames
                })) :
                savedTests.map(test => mapSavedTestForDisplay(test, {
                    getCategoryName,
                    getRelativeTime,
                    getProgress,
                    getAnsweredCount,
                    getSubcategoryNames
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

    return {
        selectedTab,
        setSelectedTab,
        selectedSubcategory,
        setSelectedSubcategory,
        savedTests,
        setSavedTests,
        finishedTests,
        loading,
        error,
        setError,
        activityCategories
    };
};