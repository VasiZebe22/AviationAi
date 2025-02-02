import React from 'react';

const SavedTestCard = ({ item, onContinue, onDelete }) => (
    <div className="bg-surface-DEFAULT p-4 rounded-lg relative group cursor-pointer hover:bg-surface-lighter transition-colors duration-200">
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
                        {item.subcategories}
                    </div>
                </div>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex flex-col items-center ml-4">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onContinue(item.originalTest);
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
                            onDelete(item.originalTest.id);
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
    </div>
);

export default SavedTestCard;