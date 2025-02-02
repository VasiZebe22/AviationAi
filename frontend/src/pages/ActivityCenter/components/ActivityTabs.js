import React from 'react';

const ActivityTabs = ({ subcategories, selectedSubcategory, onSubcategoryChange }) => {
    if (!subcategories) return null;

    return (
        <div className="border-b border-surface-DEFAULT">
            <nav className="-mb-px flex space-x-8">
                {subcategories.map((subcategory) => (
                    <button
                        key={subcategory}
                        onClick={() => onSubcategoryChange(subcategory)}
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
    );
};

export default ActivityTabs;