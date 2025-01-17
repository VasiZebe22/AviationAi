import React from 'react';
import useSaveTest from '../hooks/useSaveTest';

const SaveTestButton = ({ 
    categoryId, 
    mode, 
    currentQuestion, 
    timer, 
    answeredQuestions, 
    filters, 
    selectedSubcategories,
    setError 
}) => {
    const testData = {
        categoryId,
        mode,
        currentQuestion,
        timer,
        answeredQuestions,
        filters: filters || {},
        selectedSubcategories: selectedSubcategories || []
    };

    const { saveStatus, handleSaveTest } = useSaveTest(testData, setError);

    return (
        <button 
            onClick={handleSaveTest} 
            disabled={saveStatus === 'saving'}
            className={`px-4 py-2 rounded text-sm flex items-center ${
                saveStatus === 'saving' 
                    ? 'bg-surface-dark/30 text-gray-500 cursor-not-allowed' 
                    : saveStatus === 'saved'
                    ? 'bg-green-600/50 text-white hover:bg-green-600/70'
                    : saveStatus === 'error'
                    ? 'bg-red-600/50 text-white hover:bg-red-600/70'
                    : 'bg-surface-dark/50 text-gray-400 hover:bg-surface-dark/70'
            }`}
        >
            {saveStatus === 'saving' ? 'Saving...' :
             saveStatus === 'saved' ? 'Test Saved!' :
             saveStatus === 'error' ? 'Save Failed' :
             'Save Test'}
        </button>
    );
};

export default SaveTestButton;