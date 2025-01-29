import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testService } from '../../services/tests/testService';
import { categories } from '../../pages/Categories/Categories';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';

const SavedTestsList = ({ onTestContinue, className = '' }) => {
    const [savedTests, setSavedTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [testToDelete, setTestToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSavedTests = async () => {
            try {
                setLoading(true);
                const tests = await testService.getSavedTests();
                
                // Sort by most recently saved
                const sortedTests = tests.sort((a, b) => 
                    b.savedAt.toDate() - a.savedAt.toDate()
                );
                
                setSavedTests(sortedTests);
            } catch (err) {
                console.error('Error fetching saved tests:', err);
                setError('Failed to load saved tests. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchSavedTests();
    }, []);

    const handleContinueTest = (test) => {
        if (onTestContinue) {
            onTestContinue(test);
        } else {
            navigate(`/questions/${test.categoryId}`, {
                state: {
                    mode: test.mode,
                    filters: test.filters,
                    selectedSubcategories: test.selectedSubcategories,
                    savedTestId: test.id,
                    savedTestData: {
                        currentQuestion: test.currentQuestion,
                        timer: test.timer,
                        answeredQuestions: test.answeredQuestions
                    }
                }
            });
        }
    };

    const getCategoryTitle = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.title : 'Unknown Category';
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getProgress = (test) => {
        const answered = Object.keys(test.answeredQuestions || {}).length;
        return `${answered} questions answered`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <div className="text-white">Loading saved tests...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-6">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    const handleDelete = async (test) => {
        try {
            await testService.deleteSavedTest(test.id);
            setSavedTests(prev => prev.filter(t => t.id !== test.id));
        } catch (err) {
            console.error('Error deleting test:', err);
            setError('Failed to delete test. Please try again.');
        }
    };

    if (savedTests.length === 0) {
        return (
            <div className={`bg-surface-dark/50 rounded-lg p-6 text-gray-400 ${className}`}>
                No saved tests found. Save a test to continue it later.
            </div>
        );
    }

    return (
        <>
            <div className={`space-y-4 ${className}`}>
                {savedTests.map(test => (
                    <div
                        key={test.id}
                        className="bg-surface-dark/50 rounded-lg p-6 flex items-center justify-between"
                    >
                        <div className="flex-1">
                            <h2 className="text-white text-lg font-medium">
                                {getCategoryTitle(test.categoryId)}
                            </h2>
                            <div className="text-gray-400 text-sm mt-1">
                                {formatDate(test.savedAt)}
                            </div>
                            <div className="text-accent-lilac mt-2">
                                {getProgress(test)}
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => handleContinueTest(test)}
                                className="px-4 py-2 bg-accent-lilac text-white rounded hover:bg-accent-lilac/90 text-sm"
                            >
                                Continue Test
                            </button>
                            <button
                                onClick={() => setTestToDelete(test)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete saved test"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmDialog
                isOpen={testToDelete !== null}
                onClose={() => setTestToDelete(null)}
                onConfirm={() => {
                    handleDelete(testToDelete);
                    setTestToDelete(null);
                }}
                title="Delete Saved Test"
                message="Are you sure you want to delete this saved test? This action cannot be undone."
            />
        </>
    );
};

export default SavedTestsList;