import React from 'react';

const AIChatHistoryTabs = ({ selectedTab, onTabChange }) => {
  const tabs = ['Starred Conversations', 'Bookmarked Messages'];

  return (
    <div className="border-b border-surface-DEFAULT">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm
              ${selectedTab === tab
                ? 'border-accent-lilac text-accent-lilac'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'}
            `}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AIChatHistoryTabs;