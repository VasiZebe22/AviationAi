import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import ActivitySidebar from './components/ActivitySidebar';
import ActivityContent from './components/ActivityContent';
import { useActivityData } from './hooks/useActivityData';
import { useTestActions } from './hooks/useTestActions';

const ActivityCenter = () => {
    const {
        selectedTab,
        setSelectedTab,
        selectedSubcategory,
        setSelectedSubcategory,
        savedTests,
        setSavedTests,
        finishedTests,
        setFinishedTests,
        notes,
        setNotes,
        loading,
        error,
        setError,
        activityCategories,
        deleteNote
    } = useActivityData();

    const { handleContinueTest, handleDeleteTest, handleDeleteFinishedTest, handleViewFinishedTest } = useTestActions(
        setSavedTests,
        setFinishedTests,
        setError
    );

    // Show error state if there's an error
    if (error) {
        return (
            <div className="text-red-400 text-sm text-center py-2">
                {error}
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="pt-24 min-h-screen bg-surface-DEFAULT text-white p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex space-x-6">
                        {/* Left Sidebar Navigation */}
                        <ActivitySidebar
                            categories={activityCategories}
                            selectedTab={selectedTab}
                            onTabChange={(index) => {
                                setSelectedTab(index);
                                setSelectedSubcategory(
                                    activityCategories[index].subcategories?.[0] || 'Saved Tests'
                                );
                            }}
                        />

                        {/* Main Content Area */}
                        <ActivityContent
                            selectedCategory={activityCategories[selectedTab]}
                            selectedSubcategory={selectedSubcategory}
                            onSubcategoryChange={setSelectedSubcategory}
                            onContinueTest={handleContinueTest}
                            onDeleteTest={handleDeleteTest}
                            onDeleteNote={deleteNote}
                            onDeleteFinishedTest={handleDeleteFinishedTest}
                            onViewFinishedTest={handleViewFinishedTest}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ActivityCenter;