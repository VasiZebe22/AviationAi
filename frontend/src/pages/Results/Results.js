import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import questionService from '../../services/questionService';

ChartJS.register(ArcElement, Tooltip, Legend);

const MarkdownComponents = {
    h1: ({ node, ...props }) => <h1 className="text-xl text-white mb-3" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-lg text-white mb-2" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-md text-white mb-2" {...props} />,
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
    const { score, total, time, categoryId, questionResults } = location.state || {};
    const resultsSaved = useRef(false);
    const [detailedQuestions, setDetailedQuestions] = useState({});
    const [loading, setLoading] = useState(true);

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
    }, [questionResults]);

    // Save test results when component mounts
    useEffect(() => {
        const saveResults = async () => {
            // Prevent double saves
            if (resultsSaved.current) return;
            
            try {
                console.log('Attempting to save test results...');
                const result = await questionService.saveTestResults({
                    categoryId,
                    score,
                    total,
                    time,
                    questionResults
                });
                console.log('Test results saved successfully:', result);
                resultsSaved.current = true;
            } catch (error) {
                console.error('Error saving test results:', error);
                console.error('Error details:', {
                    name: error.name,
                    message: error.message,
                    code: error.code,
                    stack: error.stack
                });
            }
        };

        if (score !== undefined && total !== undefined) {
            console.log('Starting save process...');
            saveResults();
        } else {
            console.log('Missing required data, not saving results');
        }
    }, [categoryId, score, total, time, questionResults]);

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
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl text-white">Question Details</h2>
                            <span className="text-gray-400 text-sm">
                                Showing {questionResults.length} answered questions
                            </span>
                        </div>
                        <div className="space-y-6">
                            {questionResults.map((result, index) => {
                                const questionData = detailedQuestions[result.questionId];
                                if (!questionData) return null;

                                return (
                                    <div key={result.questionId} className="border-b border-gray-700 last:border-0 pb-4 last:pb-0">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1">
                                                {result.isCorrect ? (
                                                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                                ) : (
                                                    <XCircleIcon className="w-5 h-5 text-red-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-white flex-1">
                                                        {index + 1}. {questionData.question}
                                                    </p>
                                                    <span className="text-gray-400 text-sm ml-4">
                                                        {questionData.id}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-400 mb-1">Your Answer:</p>
                                                        <p className={`font-medium ${result.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                            {result.userAnswer ? `${result.userAnswer}: ${questionData.options[result.userAnswer]}` : 'Not answered'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400 mb-1">Correct Answer:</p>
                                                        <p className="text-green-400 font-medium">
                                                            {questionData.correct_answer}: {questionData.options[questionData.correct_answer]}
                                                        </p>
                                                    </div>
                                                    {questionData.options && (
                                                        <div className="mt-2">
                                                            <p className="text-gray-400 mb-1">All Options:</p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                {Object.entries(questionData.options).map(([key, value]) => (
                                                                    <div 
                                                                        key={key} 
                                                                        className={`p-2 rounded ${
                                                                            key === questionData.correct_answer 
                                                                                ? 'bg-green-400/10 text-green-400' 
                                                                                : key === result.userAnswer
                                                                                    ? result.isCorrect 
                                                                                        ? 'bg-green-400/10 text-green-400'
                                                                                        : 'bg-red-400/10 text-red-400'
                                                                                    : 'text-gray-400'
                                                                        }`}
                                                                    >
                                                                        <span className="font-medium">{key}:</span> {value}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {questionData.explanation && (
                                                    <div className="mt-4 bg-surface-darker rounded-lg p-4">
                                                        <p className="text-gray-400 text-sm mb-2">Explanation:</p>
                                                        <div className="prose prose-invert max-w-none">
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkMath]}
                                                                rehypePlugins={[rehypeKatex]}
                                                                components={MarkdownComponents}
                                                                className="text-gray-300"
                                                            >
                                                                {cleanMarkdown(questionData.explanation)}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
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
