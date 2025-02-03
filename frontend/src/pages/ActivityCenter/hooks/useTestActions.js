import { useNavigate } from 'react-router-dom';
import { testService } from '../../../services/tests/testService';
import { getTestNavigationState } from '../utils/testUtils';

export const useTestActions = (setSavedTests, setFinishedTests, setError) => {
    const navigate = useNavigate();

    const handleContinueTest = (test) => {
        navigate(`/questions/${test.categoryId}`, {
            state: getTestNavigationState(test)
        });
    };

    const handleDeleteTest = async (testId) => {
        try {
            const success = await testService.deleteSavedTest(testId);
            if (success) {
                // Update local state to remove the deleted test
                setSavedTests(prev => prev.filter(test => test.id !== testId));
                // Only refresh saved tests, not finished tests
                try {
                    const tests = await testService.getSavedTests();
                    setSavedTests(tests);
                } catch (err) {
                    console.error('Error refreshing saved tests:', err);
                }
            } else {
                setError('Failed to delete test. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting test:', error);
            setError('Failed to delete test. Please try again.');
        }
    };

    const handleDeleteFinishedTest = async (testId) => {
        try {
            const success = await testService.deleteFinishedTest(testId);
            if (success) {
                // Update local state to remove the deleted test
                setFinishedTests(prev => prev.filter(test => test.id !== testId));
                // Refresh finished tests
                try {
                    const tests = await testService.getTestHistory();
                    setFinishedTests(tests);
                } catch (err) {
                    console.error('Error refreshing finished tests:', err);
                }
            } else {
                setError('Failed to delete finished test. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting finished test:', error);
            setError('Failed to delete finished test. Please try again.');
        }
    };

    return {
        handleContinueTest,
        handleDeleteTest,
        handleDeleteFinishedTest
    };
};