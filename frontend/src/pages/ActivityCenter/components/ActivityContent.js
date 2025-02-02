import React from 'react';
import ActivityTabs from './ActivityTabs';
import SavedTestCard from './cards/SavedTestCard';
import FinishedTestCard from './cards/FinishedTestCard';
import StudyMaterials from './StudyMaterials';

const ActivityContent = ({
    selectedCategory,
    selectedSubcategory,
    onSubcategoryChange,
    onContinueTest,
    onDeleteTest,
    onDeleteNote
}) => {
    // If it's the Notes section, render the StudyMaterials component
    if (selectedCategory.name === 'Notes') {
        return <StudyMaterials notes={selectedCategory.items} onDelete={onDeleteNote} />;
    }

    const renderItem = (item, index) => {
        if (item.type === 'Saved Tests') {
            return (
                <SavedTestCard
                    key={index}
                    item={item}
                    onContinue={onContinueTest}
                    onDelete={onDeleteTest}
                />
            );
        } else if (item.type === 'Finished Tests') {
            return (
                <FinishedTestCard
                    key={index}
                    item={item}
                />
            );
        }

        // Default card for other types (Study Materials, Flagged Questions, AI Chat)
        return (
            <div 
                key={index}
                className="bg-surface-DEFAULT p-4 rounded-lg relative group cursor-pointer hover:bg-surface-lighter transition-colors duration-200"
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h3 className="font-medium text-white">
                            {item.name}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">
                                {item.date}
                            </span>
                            {item.flag && (
                                <span className={`
                                    px-2 py-0.5 rounded text-xs
                                    ${item.flag === 'Green' ? 'bg-emerald-500/20 text-emerald-400' :
                                      item.flag === 'Yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                                      'bg-red-500/20 text-red-400'}
                                `}>
                                    {item.flag}
                                </span>
                            )}
                            {item.type && (
                                <span className="text-xs text-gray-400">
                                    {item.type}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 bg-surface-light rounded-lg p-6">
            <div className="space-y-6">
                {/* Subcategory Tabs */}
                {selectedCategory.subcategories && (
                    <ActivityTabs
                        subcategories={selectedCategory.subcategories}
                        selectedSubcategory={selectedSubcategory}
                        onSubcategoryChange={onSubcategoryChange}
                    />
                )}

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCategory.items.map((item, index) => renderItem(item, index))}
                </div>
            </div>
        </div>
    );
};

export default ActivityContent;