import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CheckCircleIcon, XCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { questionService } from '../../services/questions/questionService';
import { testService } from '../../services/tests/testService';
import TestResultQuestionCard from './components/TestResultQuestionCard';

ChartJS.register(ArcElement, Tooltip, Legend);

const MarkdownComponents = {
    h1: ({ node, children, ...props }) => <h1 className="text-xl text-white mb-3" {...props}>{children}</h1>,
    h2: ({ node, children, ...props }) => <h2 className="text-lg text-white mb-2" {...props}>{children}</h2>,
    h3: ({ node, children, ...props }) => <h3 className="text-md text-white mb-2" {...props}>{children}</h3>,
    p: ({ node, ...props }) => <p className="text-gray-300 mb-2" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
    li: ({ node, ...props }) => <li className="text-gray-300 ml-4" {...props} />,
    strong: ({ node, ...props }) => <strong className="text-white font-medium" {...props} />,
    em: ({ node, ...props }) => <em className="text-gray-200 italic" {...props} />,
    code: ({ node, inline, ...props }) => 
        inline ? (
            <code className="bg-gray-800 px-1 rounded text-gray-200" {...props} />
        ) : (
            <code className="block bg-gray-800 p-2 rounded text-gray-200 my-2" {...props} />
        ),
};

const Results = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { score, total, time, categoryId, questionResults, filters, selectedSubcategories, isExistingTest } = location.state || {};
    const resultsSaved = useRef(false);
    const [detailedQuestions, setDetailedQuestions] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [isExpanded, setIsExpanded] = useState(true);

    // Helper function to clean up markdown content
    const cleanMarkdown = (content) => {
        if (!content) return '';
        
        // Replace multiple # with ### for consistent header sizing
        let cleaned = content.replace(/#{1,6} /g, '### ');
        
        // Clean up LaTeX formulas
        cleaned = cleaned.replace(/\\text{([^}]+)}/g, '$1');  // Replace \text{} with plain text
        cleaned = cleaned.replace(/\\\[|\\\]/g, '$$');  // Replace \[ and \] with $$
        cleaned = cleaned.replace(/\\quad/g, ' ');  // Replace \quad with space
        
        return cleaned;
    };

    // Fetch detailed question data
    useEffect(() => {
        let isMounted = true;

        const fetchQuestionDetails = async () => {
            if (!questionResults || loading === false) return;
            
            try {
                const details = {};
                const promises = questionResults.map(result => 
                    questionService.getQuestion(result.questionId)
                        .then(data => {
                            if (isMounted) {
                                details[result.questionId] = data;
                            }
                        })
                );

                await Promise.all(promises);
                
                if (isMounted) {
                    setDetailedQuestions(details);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching question details:', error);
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchQuestionDetails();

        return () => {
            isMounted = false;
        };
    }, [questionResults, loading]);

    // Save test results when component mounts
    useEffect(() => {
        const saveResults = async () => {
            if (resultsSaved.current) return; // Prevent multiple saves
            
            try {
                resultsSaved.current = true; // Mark as saved immediately
                
                // Check for duplicates in the last minute
                const existingResults = await testService.getTestHistory();
                const isDuplicate = existingResults.some(result => {
                    const timeDiff = Math.abs(result.completedAt.toDate() - new Date());
                    const isRecentEnough = timeDiff < 60000; // Within last minute
                    
                    return result.categoryId === categoryId && 
                           result.score === score && 
                           result.totalQuestions === total &&
                           isRecentEnough;
                });
                
                if (!isDuplicate) {
                    await testService.saveTestResults({
                        categoryId,
                        score,
                        total,
                        time,
                        questionResults,
                        filters,
                        selectedSubcategories
                    });
                } else {
                    console.log('Duplicate test result detected, skipping save');
                }
            } catch (error) {
                console.error('Error saving test results:', error);
                resultsSaved.current = false; // Reset flag on error
            }
        };

        // Only save results if this is a new test (not viewing an existing one)
        if (score !== undefined && total !== undefined && !isExistingTest) {
            saveResults();
        }
    }, [categoryId, score, total, time, questionResults, filters, selectedSubcategories]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const percentage = Math.round((score / total) * 100);
    const isPassing = percentage >= 75; // Standard aviation passing score

    const chartData = {
        labels: ['Correct', 'Incorrect'],
        datasets: [
            {
                data: [score, total - score],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 99, 132, 0.8)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    const handleReturnToCategories = () => {
        navigate('/practice');
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-light text-white mb-8">Test Results</h1>
                
                {/* Results Summary */}
                <div className="bg-surface-dark rounded-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-xl text-white mb-4">Score Summary</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Score:</span>
                                    <span className="text-white font-medium">{score}/{total}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Percentage:</span>
                                    <span className={`font-medium ${isPassing ? 'text-green-400' : 'text-red-400'}`}>
                                        {percentage}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Time Taken:</span>
                                    <span className="text-white font-medium">{formatTime(time)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Status:</span>
                                    <span className={`font-medium ${isPassing ? 'text-green-400' : 'text-red-400'}`}>
                                        {isPassing ? 'PASS' : 'FAIL'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="w-48">
                                <Doughnut data={chartData} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Question Results */}
                {loading ? (
                    <div className="bg-surface-dark rounded-lg p-6 text-center">
                        <p className="text-gray-400">Loading question details...</p>
                    </div>
                ) : questionResults && questionResults.length > 0 ? (
                    <div className="bg-surface-dark rounded-lg p-6">
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full flex justify-between items-center"
                        >
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl text-white">Question Details</h2>
                                <span className="text-gray-400 text-sm">
                                    ({questionResults.length} questions)
                                </span>
                            </div>
                            <ChevronDownIcon 
                                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                                    isExpanded ? 'transform rotate-180' : ''
                                }`}
                            />
                        </button>
                        
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                            <div className="flex flex-col space-y-4 mt-6">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilter('all')}
                                        className={`px-4 py-2 rounded-md transition-colors ${
                                            filter === 'all'
                                                ? 'bg-primary text-white'
                                                : 'bg-surface text-gray-400 hover:bg-surface-light'
                                        }`}
                                    >
                                        All Questions
                                    </button>
                                    <button
                                        onClick={() => setFilter('correct')}
                                        className={`px-4 py-2 rounded-md transition-colors ${
                                            filter === 'correct'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-surface text-gray-400 hover:bg-surface-light'
                                        }`}
                                    >
                                        Correct Answers
                                    </button>
                                    <button
                                        onClick={() => setFilter('wrong')}
                                        className={`px-4 py-2 rounded-md transition-colors ${
                                            filter === 'wrong'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-surface text-gray-400 hover:bg-surface-light'
                                        }`}
                                    >
                                        Wrong Answers
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-4 mt-6">
                                {questionResults
                                    .filter(result => {
                                        if (filter === 'all') return true;
                                        if (filter === 'correct') return result.isCorrect;
                                        if (filter === 'wrong') return !result.isCorrect;
                                        return true;
                                    })
                                    .map((result, index) => {
                                        const questionData = detailedQuestions[result.questionId];
                                        if (!questionData) return null;

                                        return (
                                            <TestResultQuestionCard
                                                key={result.questionId}
                                                questionData={questionData}
                                                result={result}
                                                index={index}
                                            />
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-surface-dark rounded-lg p-6 text-center">
                        <p className="text-gray-400">No questions were answered in this test.</p>
                    </div>
                )}

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleReturnToCategories}
                        className="px-6 py-2 bg-accent-lilac text-white rounded hover:bg-accent-lilac/90 transition-colors"
                    >
                        Return to Categories
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Results;
