import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import ImageWithMeasurement from '../../../components/LineDrawingTool';

const QuestionExplanation = ({
    questionData,
    explanationImageUrl,
    getExplanationContent,
    handleImageError
}) => {
    const [showMeasurementTool, setShowMeasurementTool] = useState(false);
    
    if (!questionData) return null;

    // Toggle measurement tool visibility
    const toggleMeasurementTool = () => {
        setShowMeasurementTool(prev => !prev);
    };

    return (
        <div className="text-gray-300 space-y-4">
            <div className="text-lg font-semibold mb-4">Explanation</div>
            <ReactMarkdown>{getExplanationContent(questionData).text}</ReactMarkdown>
            {explanationImageUrl && (
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
                        src={explanationImageUrl}
                        alt="Explanation illustration"
                        className="max-w-full h-auto rounded-lg"
                        showMeasurementTool={showMeasurementTool}
                        onToggleMeasurementTool={toggleMeasurementTool}
                    />
                </div>
            )}
        </div>
    );
};

export default QuestionExplanation;
