import React, { useState, useEffect } from 'react';
import { ClockIcon, ChevronDownIcon, BookOpenIcon, PencilIcon, CheckIcon, XMarkIcon, TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { questionService } from '../../../../services/questions/questionService';
import { noteService } from '../../../../services/notes/noteService';
import ReactMarkdown from 'react-markdown';

// Custom components for markdown rendering
const MarkdownComponents = {
    // Override heading sizes
    h1: ({ children }) => <h1 className="text-lg font-medium mb-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-base font-medium mb-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
    // Add consistent paragraph spacing
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    // Style lists
    ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
};

const LoadingPulse = () => (
    <div className="animate-pulse bg-surface rounded h-4 w-3/4"></div>
);

const NoteCard = ({ note, onDelete, onUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [questionData, setQuestionData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(note.content);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const {
        content,
        relativeTime,
        questionId,
        id: noteId,
        isPinned,
        onTogglePin
    } = note;

    useEffect(() => {
        const fetchQuestionData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await questionService.getQuestionById(questionId);
                console.log('Question data in NoteCard:', data);
                setQuestionData(data);
            } catch (error) {
                console.error('Error fetching question:', error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuestionData();
    }, [questionId]);

    const handleStartEdit = () => {
        setIsEditing(true);
        setEditedContent(content);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedContent(content);
    };

    const handleSaveEdit = async () => {
        try {
            setIsSaving(true);
            await onUpdate(editedContent);
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving note:', error);
            // You might want to show an error toast here
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await onDelete();
        } catch (error) {
            console.error('Error deleting note:', error);
            // You might want to show an error toast here
        } finally {
            setIsDeleting(false);
        }
    };

    const questionText = questionData?.question || questionData?.text;
    const questionImage = questionData?.image_url;
    const explanationImage = questionData?.explanation_image_url;

    return (
        <div className="w-full bg-surface-light rounded-lg mb-4 overflow-hidden relative group">
            {/* Top Action Buttons */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                    onClick={onTogglePin}
                    className={`p-1.5 rounded-full transition-all duration-200 ${
                        isPinned
                            ? 'opacity-100 bg-purple-500/30 text-purple-400 hover:bg-purple-500/40'
                            : 'opacity-0 group-hover:opacity-100 bg-surface/70 text-gray-400 hover:bg-surface hover:text-white'
                    }`}
                    title={isPinned ? "Unpin note" : "Pin note"}
                >
                    <MapPinIcon className={`h-4 w-4 ${isPinned ? 'rotate-45' : ''}`} />
                </button>
                <button
                    onClick={handleDelete}
                    className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-500/20 text-red-500"
                    title="Delete note"
                    disabled={isDeleting}
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>

            {/* Main Content */}
            <div className="p-4">
                {/* Question Preview */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
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

                {/* Note Content */}
                <div className="text-sm text-gray-300 mt-4 p-3 bg-surface/50 border border-surface/30 rounded-md group relative hover:bg-surface/70 hover:border-surface/40 transition-all duration-200">
                    {!isEditing ? (
                        <>
                            <ReactMarkdown components={MarkdownComponents}>{content}</ReactMarkdown>
                            <button 
                                onClick={handleStartEdit}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-surface/70 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-surface"
                                title="Edit note"
                            >
                                <PencilIcon className="h-3.5 w-3.5 text-gray-400" />
                            </button>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="w-full h-32 bg-surface/70 text-white p-2 rounded border border-surface/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none resize-none transition-colors duration-200"
                                placeholder="Enter your note..."
                                disabled={isSaving}
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={handleCancelEdit}
                                    className="p-1.5 rounded-full text-xs font-medium text-gray-400 hover:text-white transition-colors hover:bg-surface/70"
                                    disabled={isSaving}
                                >
                                    <XMarkIcon className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="p-1.5 rounded-full text-xs font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-colors disabled:opacity-50"
                                    disabled={isSaving}
                                >
                                    <CheckIcon className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
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
                    {questionData.correct_answer && questionData.options && (
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

export default NoteCard;
