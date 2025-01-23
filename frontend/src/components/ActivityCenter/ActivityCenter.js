import React, { useState } from 'react';
import { BookOpenIcon, ClockIcon, BookmarkIcon, ChatBubbleLeftRightIcon, FlagIcon } from '@heroicons/react/24/outline';
import Navbar from '../Navbar/Navbar';

const ActivityCenter = () => {
    const [selectedTab, setSelectedTab] = useState(0);

    const [selectedSubcategory, setSelectedSubcategory] = useState({});

    const categories = [
        {
            name: 'Tests & Quizzes',
            icon: BookOpenIcon,
            subcategories: ['Saved Tests', 'Finished Tests'],
            items: [
                { 
                    name: 'Radio Navigation Test', 
                    date: '2025-01-18', 
                    progress: '60%',
                    type: 'Saved Tests'
                },
                { 
                    name: 'Meteorology Quiz', 
                    date: '2025-01-17', 
                    progress: '0%',
                    type: 'Saved Tests'
                },
                { 
                    name: 'Aircraft Systems', 
                    date: '2025-01-15', 
                    score: '85%',
                    type: 'Finished Tests'
                },
                { 
                    name: 'Flight Planning', 
                    date: '2025-01-14', 
                    score: '92%',
                    type: 'Finished Tests'
                }
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
                                {categories.map((category, index) => (
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
                                {categories[selectedTab].subcategories && (
                                    <div className="border-b border-surface-DEFAULT">
                                        <nav className="-mb-px flex space-x-8">
                                            {categories[selectedTab].subcategories.map((subcategory) => (
                                                <button
                                                    key={subcategory}
                                                    onClick={() => setSelectedSubcategory({
                                                        ...selectedSubcategory,
                                                        [categories[selectedTab].name]: subcategory
                                                    })}
                                                    className={`
                                                        py-2 px-1 border-b-2 font-medium text-sm
                                                        ${selectedSubcategory[categories[selectedTab].name] === subcategory || 
                                                          (!selectedSubcategory[categories[selectedTab].name] && subcategory === (categories[selectedTab].subcategories[0] || ''))
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
                                    {categories[selectedTab].items
                                        .filter(item => {
                                            if (!categories[selectedTab].subcategories) return true;
                                            const currentSubcategory = selectedSubcategory[categories[selectedTab].name] || categories[selectedTab].subcategories[0];
                                            if (currentSubcategory === 'All') return true;
                                            return item.type === currentSubcategory || item.flag === currentSubcategory;
                                        })
                                        .map((item, itemIdx) => (
                                            <div 
                                                key={itemIdx}
                                                className="bg-surface-DEFAULT p-4 rounded-lg hover:bg-surface-lighter transition-colors duration-200 cursor-pointer"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-medium text-white">
                                                            {item.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-400">
                                                            {item.date}
                                                        </p>
                                                    </div>
                                                    {item.progress && (
                                                        <span className="text-accent-lilac">
                                                            {item.progress}
                                                        </span>
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
