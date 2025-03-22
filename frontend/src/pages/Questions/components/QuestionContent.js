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
    const [showAngleTool, setShowAngleTool] = useState(false);
    
    if (!questionData) return null;

    // Toggle measurement tool visibility
    const toggleMeasurementTool = () => {
        setShowMeasurementTool(prev => !prev);
        // If turning on measurement tool, turn off angle tool
        if (!showMeasurementTool) {
            setShowAngleTool(false);
        }
    };

    // Toggle angle tool visibility
    const toggleAngleTool = () => {
        setShowAngleTool(prev => !prev);
        // If turning on angle tool, turn off measurement tool
        if (!showAngleTool) {
            setShowMeasurementTool(false);
        }
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={showMeasurementTool ? "white" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 4v16" />
                                <path d="M6 4v8" />
                                <path d="M10 4v4" />
                                <path d="M14 4v8" />
                                <path d="M18 4v4" />
                                <path d="M22 4v16" />
                                <path d="M2 20h20" />
                                <path d="M2 4h20" />
                            </svg>
                        </button>
                        
                        {/* Angle measurement icon button */}
                        <button
                            onClick={toggleAngleTool}
                            className="absolute -left-12 top-14 bg-surface-dark/80 hover:bg-surface-dark text-white p-2 rounded z-20"
                            title={showAngleTool ? "Hide angle measurement tool" : "Show angle measurement tool"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={showAngleTool ? "white" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 22L4 12L14 12" />
                                <path d="M4 12L18 5" />
                                <path d="M9 12C9 12 7 10.5 7 8.5C7 6.5 9 5 9 5" />
                            </svg>
                        </button>
                        
                        <ImageWithMeasurement
                            src={questionImageUrl}
                            alt="Question illustration"
                            className="max-w-full h-auto rounded-lg"
                            showMeasurementTool={showMeasurementTool}
                            showAngleTool={showAngleTool}
                            onToggleMeasurementTool={toggleMeasurementTool}
                            onToggleAngleTool={toggleAngleTool}
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
                            buttonStyle = 'bg-green-600/70 text-white';
                        } else if (isCorrect) {
                            buttonStyle = 'bg-green-600/70 text-white';
                        }
                    }

                    return (
                        <button
                            key={label}
                            onClick={() => handleAnswerSelect({ letter: label, text })}
                            className={`w-full p-3 text-left rounded ${buttonStyle} ${isAnswered && !isSelected ? 'opacity-80' : ''}`}
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
