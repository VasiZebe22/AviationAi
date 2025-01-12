import React from 'react';

const QuestionTabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'question', label: 'Question' },
        { id: 'explanation', label: 'Explanation' },
        { id: 'note', label: 'Note' }
    ];

    return (
        <div className="flex space-x-1 mb-6">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded text-sm ${
                        activeTab === tab.id 
                            ? 'bg-accent-lilac text-white' 
                            : 'text-gray-400 hover:bg-surface-dark/50'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default QuestionTabs;
