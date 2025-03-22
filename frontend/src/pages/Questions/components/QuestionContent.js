import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import ImageWithMeasurement from '../../../components/LineDrawingTool';

const QuestionContent = ({
    questionData,
    questionImageUrl,
    handleImageError,
    getQuestionText,
    getQuestionOptions,
    handleAnswerSelect,
    answeredQuestions,
    isAnswerCorrect
}) => {
    const [showMeasurementTool, setShowMeasurementTool] = useState(false);
    
    if (!questionData) return null;

    // Toggle measurement tool visibility
    const toggleMeasurementTool = () => {
        setShowMeasurementTool(prev => !prev);
    };

    return (
        <div className="space-y-6">
            <div className="text-white text-lg">
                <ReactMarkdown>{getQuestionText(questionData).text}</ReactMarkdown>
                {questionImageUrl && (
                    <div className="relative mt-4 max-w-2xl mx-auto">
                        {/* Ruler icon button */}
                        <button
                            onClick={toggleMeasurementTool}
                            className="absolute -left-12 top-2 bg-surface-dark/80 hover:bg-surface-dark text-white p-2 rounded z-20"
                            title={showMeasurementTool ? "Hide measurement tool" : "Show measurement tool"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 5v14" />
                                <path d="M21 5v14" />
                                <path d="M3 5h18" />
                                <path d="M3 19h18" />
                                <path d="M9 5v4" />
                                <path d="M15 5v4" />
                                <path d="M9 15v4" />
                                <path d="M15 15v4" />
                            </svg>
                        </button>
                        <ImageWithMeasurement
                            src={questionImageUrl}
                            alt="Question illustration"
                            className="max-w-full h-auto rounded-lg"
                            showMeasurementTool={showMeasurementTool}
                            onToggleMeasurementTool={toggleMeasurementTool}
                        />
                    </div>
                )}
            </div>
            <div className="space-y-3">
                {getQuestionOptions(questionData).map(({ label, text }) => {
                    const isAnswered = answeredQuestions[questionData.id];
                    const isSelected = answeredQuestions[questionData.id] === label;
                    const isCorrect = isAnswerCorrect(questionData, label);

                    let buttonStyle = 'bg-surface-dark/50 text-gray-300 hover:bg-surface-dark';
                    if (isAnswered) {
                        if (isSelected) {
                            buttonStyle = isCorrect ? 'bg-green-600/70 text-white' : 'bg-red-600/70 text-white';
                        } else if (isCorrect) {
                            buttonStyle = 'bg-green-600/70 text-white';
                        }
                    }

                    return (
                        <button
                            key={label}
                            onClick={() => handleAnswerSelect({ letter: label, text })}
                            disabled={isAnswered}
                            className={`w-full p-3 text-left rounded ${buttonStyle} ${isAnswered && !isSelected ? 'opacity-50' : ''}`}
                        >
                            <span className="font-medium">{label}:</span> {text}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionContent;
