import React, { useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const MarkdownComponents = {
    h1: ({ children }) => <h1 className="text-lg font-medium mb-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-base font-medium mb-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
};

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

const TestResultQuestionCard = ({ questionData, result, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!questionData) return null;

    return (
        <div className="w-full bg-surface-light rounded-lg mb-4 relative">
            {/* Main Content */}
            <div className="p-4">
                {/* Question Preview */}
                <div className="flex items-start mb-3">
                    <div className="flex-shrink-0 mt-1 mr-3">
                        {result.isCorrect ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-400" />
                        ) : (
                            <XCircleIcon className="w-5 h-5 text-red-400" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-white mb-2">
                            <div className="line-clamp-2">
                                {index + 1}. {questionData.question}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                            <span className="px-2 py-1 bg-primary rounded-full text-xs">
                                #{questionData.id}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                result.isCorrect 
                                    ? 'bg-green-500/20 text-green-500' 
                                    : 'bg-red-500/20 text-red-500'
                            }`}>
                                {result.isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                            {questionData.category && (
                                <span className="flex items-center text-xs">
                                    <span>
                                        {questionData.category.name}
                                        {questionData.subcategories?.[0] && (
                                            <span className="text-gray-500">
                                                {" - "}{questionData.subcategories[0].name}
                                            </span>
                                        )}
                                    </span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expand Button */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-center w-full mt-4 pt-2 border-t border-surface hover:bg-surface-hover transition-colors"
                >
                    <ChevronDownIcon 
                        className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                            isExpanded ? 'transform rotate-180' : ''
                        }`}
                    />
                </button>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-4 pt-6 pb-4 bg-surface">
                    {/* Full Question */}
                    <div className="mb-8">
                        <div className="text-xs font-medium uppercase text-gray-400 mb-2">
                            Question
                        </div>
                        <div className="text-sm text-white">
                            <ReactMarkdown 
                                components={MarkdownComponents}
                                className="prose prose-invert prose-sm max-w-none"
                            >
                                {questionData.question}
                            </ReactMarkdown>
                            {questionData.image_url && (
                                <div className="flex justify-center">
                                    <img 
                                        src={questionData.image_url} 
                                        alt="Question illustration" 
                                        className="max-w-[400px] w-full h-auto rounded-lg mt-4 border border-surface/30"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Your Answer */}
                    <div className="mb-4">
                        <div className="text-xs font-medium uppercase text-gray-400 mb-2">
                            Your Answer
                        </div>
                        <div className={`text-sm font-medium ${result.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {result.userAnswer ? `${result.userAnswer}: ${questionData.options[result.userAnswer]}` : 'Not answered'}
                        </div>
                    </div>

                    {/* Correct Answer */}
                    <div className="mb-4">
                        <div className="text-xs font-medium uppercase text-gray-400 mb-2">
                            Correct Answer
                        </div>
                        <div className="text-sm text-green-400 font-medium">
                            {questionData.correct_answer}: {questionData.options[questionData.correct_answer]}
                        </div>
                    </div>

                    {/* All Options */}
                    {questionData.options && (
                        <div className="mb-8">
                            <div className="text-xs font-medium uppercase text-gray-400 mb-2">
                                All Options
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {Object.entries(questionData.options).map(([key, value]) => (
                                    <div 
                                        key={key} 
                                        className={`p-2 rounded text-sm ${
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

                    {/* Explanation */}
                    {questionData.explanation && (
                        <div>
                            <div className="text-xs font-medium uppercase text-gray-400 mb-2">
                                Explanation
                            </div>
                            <div className="text-sm text-white bg-surface-darker rounded-lg p-4">
                                <ReactMarkdown 
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={MarkdownComponents}
                                    className="prose prose-invert prose-sm max-w-none"
                                >
                                    {cleanMarkdown(questionData.explanation)}
                                </ReactMarkdown>
                                {questionData.explanation_image_url && (
                                    <div className="flex justify-center">
                                        <img 
                                            src={questionData.explanation_image_url} 
                                            alt="Explanation illustration" 
                                            className="max-w-[400px] w-full h-auto rounded-lg mt-4 border border-surface/30"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TestResultQuestionCard;
