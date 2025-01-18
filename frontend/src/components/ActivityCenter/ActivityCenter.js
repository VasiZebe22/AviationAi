import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { BookOpenIcon, ClockIcon, BookmarkIcon, ChatBubbleLeftRightIcon, FlagIcon } from '@heroicons/react/24/outline';
import Navbar from '../Navbar/Navbar';

const ActivityCenter = () => {
    const [selectedTab, setSelectedTab] = useState(0);

    const categories = [
        {
            name: 'Tests & Quizzes',
            icon: BookOpenIcon,
            sections: [
                {
                    title: 'Saved Tests',
                    items: [
                        { name: 'Radio Navigation Test', date: '2025-01-18', progress: '60%' },
                        { name: 'Meteorology Quiz', date: '2025-01-17', progress: '0%' },
                    ]
                },
                {
                    title: 'Test History',
                    items: [
                        { name: 'Aircraft Systems', date: '2025-01-15', score: '85%' },
                        { name: 'Flight Planning', date: '2025-01-14', score: '92%' },
                    ]
                }
            ]
        },
        {
            name: 'Study Materials',
            icon: BookmarkIcon,
            sections: [
                {
                    title: 'Notes',
                    items: [
                        { name: 'VOR Navigation Tips', date: '2025-01-18' },
                        { name: 'Weather Patterns', date: '2025-01-16' },
                    ]
                },
                {
                    title: 'Bookmarks',
                    items: [
                        { name: 'ILS Approach Procedures', date: '2025-01-17' },
                        { name: 'METAR Interpretation', date: '2025-01-15' },
                    ]
                }
            ]
        },
        {
            name: 'Flagged Items',
            icon: FlagIcon,
            sections: [
                {
                    title: 'Questions to Review',
                    items: [
                        { name: 'Question #156 - Radio Navigation', date: '2025-01-18' },
                        { name: 'Question #89 - Weather Minimums', date: '2025-01-17' },
                    ]
                }
            ]
        },
        {
            name: 'AI Chat History',
            icon: ChatBubbleLeftRightIcon,
            sections: [
                {
                    title: 'Saved Conversations',
                    items: [
                        { name: 'Weather Radar Discussion', date: '2025-01-18' },
                        { name: 'Flight Planning Tips', date: '2025-01-16' },
                    ]
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
                                        onClick={() => setSelectedTab(index)}
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
                            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                                <Tab.Panels>
                                    {categories.map((category, idx) => (
                                        <Tab.Panel key={idx} className="space-y-8">
                                            {category.sections.map((section, sectionIdx) => (
                                                <div key={sectionIdx}>
                                                    <h2 className="text-xl font-semibold text-accent-lilac mb-4">
                                                        {section.title}
                                                    </h2>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {section.items.map((item, itemIdx) => (
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
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </Tab.Panel>
                                    ))}
                                </Tab.Panels>
                            </Tab.Group>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ActivityCenter;
