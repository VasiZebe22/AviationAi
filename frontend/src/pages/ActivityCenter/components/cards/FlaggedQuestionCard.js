import React, { useState, useEffect, useRef } from 'react';
import { ClockIcon, ChevronDownIcon, BookOpenIcon, NoSymbolIcon, FlagIcon } from '@heroicons/react/24/outline';
import { questionService } from '../../../../services/questions/questionService';
import ReactMarkdown from 'react-markdown';

const MarkdownComponents = {
    h1: ({ children }) => <h1 className="text-lg font-medium mb-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-base font-medium mb-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
};

const LoadingPulse = () => (
    <div className="animate-pulse bg-surface rounded h-4 w-3/4"></div>
);

const FlaggedQuestionCard = ({ flag, onRemoveFlag, onUpdateFlag }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
    const colorMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (colorMenuRef.current && !colorMenuRef.current.contains(event.target)) {
                setIsColorMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const {
        relativeTime,
        questionId,
        flag: flagColor,
        id: flagId
    } = flag;

    const handleRemoveFlag = async () => {
        try {
            setIsDeleting(true);
            await onRemoveFlag(flagId);
        } catch (error) {
            console.error('Error removing flag:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const questionData = flag.question;
    const questionText = questionData?.question || questionData?.text;
    const questionImage = questionData?.image_url;
    const explanationImage = questionData?.explanation_image_url;

    const getColorClass = () => {
        switch (flagColor.toLowerCase()) {
            case 'red': return 'bg-red-500/20 text-red-500';
            case 'yellow': return 'bg-yellow-500/20 text-yellow-500';
            case 'green': return 'bg-green-500/20 text-green-500';
            default: return 'bg-gray-500/20 text-gray-500';
        }
    };

    return (
        <div 
            className="w-full bg-surface-light rounded-lg mb-4 relative group"
            onMouseLeave={() => setIsColorMenuOpen(false)}
        >
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
                {/* Color Change Button */}
                <div className="relative" ref={colorMenuRef}>
                    <button
                        onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
                        className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 bg-primary/20 text-primary hover:bg-primary/30"
                        title="Change flag color"
                    >
                        <FlagIcon className="h-4 w-4" />
                    </button>

                    {/* Color Menu Dropdown */}
                    {isColorMenuOpen && (
                        <div className="fixed mt-2 w-36 rounded-lg bg-surface-light border border-surface shadow-lg z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{
                            top: colorMenuRef.current?.getBoundingClientRect().bottom ?? 0,
                            left: colorMenuRef.current?.getBoundingClientRect().right ?? 0,
                            transform: 'translateX(-100%)'
                        }}>
                            {['green', 'yellow', 'red'].map((color) => (
                                <button
                                    key={color}
                                    onClick={() => {
                                        onUpdateFlag(color);
                                        setIsColorMenuOpen(false);
                                    }}
                                    disabled={flagColor.toLowerCase() === color}
                                    className={`
                                        w-full px-4 py-2 text-sm text-left first:rounded-t-lg last:rounded-b-lg
                                        flex items-center space-x-2 transition-colors duration-200
                                        ${flagColor.toLowerCase() === color ? 'bg-surface/50 cursor-default' : 'hover:bg-surface/30'}
                                        ${color === 'green' ? 'text-green-500 hover:text-green-400' : ''}
                                        ${color === 'yellow' ? 'text-yellow-500 hover:text-yellow-400' : ''}
                                        ${color === 'red' ? 'text-red-500 hover:text-red-400' : ''}
                                    `}
                                >
                                    <div className={`
                                        w-2 h-2 rounded-full
                                        ${color === 'green' ? 'bg-green-500' : ''}
                                        ${color === 'yellow' ? 'bg-yellow-500' : ''}
                                        ${color === 'red' ? 'bg-red-500' : ''}
                                    `}></div>
                                    <span className="capitalize">{color}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Remove Button */}
                <button
                    onClick={handleRemoveFlag}
                    className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-500/20 text-red-500 hover:bg-red-500/30"
                    title="Remove flag"
                    disabled={isDeleting}
                >
                    <div className="relative">
                        <FlagIcon className="h-4 w-4" />
                        <NoSymbolIcon className="h-3 w-3 absolute -bottom-1 -right-1 text-red-500" />
                    </div>
                </button>
            </div>

            {/* Main Content */}
            <div className="p-4">
                {/* Question Preview */}
                <div className="flex items-start mb-3">
                    <div className="flex-1 pr-16">
                        {isLoading ? (
                            <div className="space-y-2 mb-2">
                                <LoadingPulse />
                                <LoadingPulse />
                            </div>
                        ) : error ? (
                            <div className="text-red-400 text-sm mb-2">
                                Error loading question: {error}
                            </div>
                        ) : questionText ? (
                            <div className="text-sm font-medium text-white mb-2">
                                <div className="line-clamp-2">
                                    <ReactMarkdown components={MarkdownComponents}>{questionText}</ReactMarkdown>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-400 text-sm mb-2">
                                No question text available
                            </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                            <span className="px-2 py-1 bg-primary rounded-full text-xs">
                                #{questionId}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getColorClass()}`}>
                                {flagColor}
                            </span>
                            {!isLoading && !error && questionData?.category && (
                                <span className="flex items-center text-xs">
                                    <BookOpenIcon className="h-3.5 w-3.5 mr-1" />
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
                            <div className="flex items-center">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {relativeTime}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expand Button */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-center w-full mt-4 pt-2 border-t border-surface hover:bg-surface-hover transition-colors"
                    disabled={isLoading || error}
                >
                    <ChevronDownIcon 
                        className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                            isExpanded ? 'transform rotate-180' : ''
                        } ${(isLoading || error) ? 'opacity-50' : ''}`}
                    />
                </button>
            </div>

            {/* Expanded Content */}
            {isExpanded && !isLoading && !error && questionData && (
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
                                {questionText}
                            </ReactMarkdown>
                            {questionImage && (
                                <div className="flex justify-center">
                                    <img 
                                        src={questionImage} 
                                        alt="Question illustration" 
                                        className="max-w-[400px] w-full h-auto rounded-lg mt-4 border border-surface/30"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Answer */}
                    {questionData.correct_answer !== undefined && questionData.options && (
                        <div className="mb-8">
                            <div className="text-xs font-medium uppercase text-gray-400 mb-2">
                                Answer
                            </div>
                            <div className="text-sm text-white">
                                {questionData.options[questionData.correct_answer].charAt(0).toUpperCase() + 
                                 questionData.options[questionData.correct_answer].slice(1)}
                            </div>
                        </div>
                    )}

                    {/* Explanation */}
                    {questionData.explanation && (
                        <div>
                            <div className="text-xs font-medium uppercase text-gray-400 mb-2">
                                Explanation
                            </div>
                            <div className="text-sm text-white">
                                <ReactMarkdown 
                                    components={MarkdownComponents}
                                    className="prose prose-invert prose-sm max-w-none"
                                >
                                    {questionData.explanation}
                                </ReactMarkdown>
                                {explanationImage && (
                                    <div className="flex justify-center">
                                        <img 
                                            src={explanationImage} 
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

export default FlaggedQuestionCard;
