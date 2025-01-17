import { useState, useCallback } from 'react';
import questionService from '../../../services/questionService';

const useSaveTest = (testData, onError) => {
    const [saveStatus, setSaveStatus] = useState('');

    const handleSaveTest = useCallback(async () => {
        try {
            setSaveStatus('saving');
            await questionService.saveTestState(testData);
            setSaveStatus('saved');
            
            // Reset status after 3 seconds
            setTimeout(() => {
                setSaveStatus('');
            }, 3000);
        } catch (err) {
            console.error('Error saving test:', err);
            setSaveStatus('error');
            onError('Failed to save test. Please try again.');
            
            // Reset error status after 3 seconds
            setTimeout(() => {
                setSaveStatus('');
            }, 3000);
        }
    }, [testData, onError]);

    return {
        saveStatus,
        handleSaveTest
    };
};

export default useSaveTest;