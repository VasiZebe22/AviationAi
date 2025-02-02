import React from 'react';

const ActivitySidebar = ({ categories, selectedTab, onTabChange }) => (
    <div className="w-64 shrink-0">
        <nav className="space-y-1">
            {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                    <button
                        key={category.name}
                        onClick={() => onTabChange(index)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                            selectedTab === index 
                                ? 'bg-accent-lilac text-white' 
                                : 'text-gray-300 hover:bg-surface-light'
                        }`}
                    >
                        <Icon className="h-6 w-6" />
                        <span>{category.name}</span>
                    </button>
                );
            })}
        </nav>
    </div>
);

export default ActivitySidebar;