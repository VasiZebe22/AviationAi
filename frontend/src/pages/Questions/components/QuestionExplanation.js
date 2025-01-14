import React from 'react';
import ReactMarkdown from 'react-markdown';

const QuestionExplanation = ({
    questionData,
    explanationImageUrl,
    getExplanationContent,
    handleImageError
}) => {
    if (!questionData) return null;

    return (
        <div className="text-gray-300 space-y-4">
            <div className="text-lg font-semibold mb-4">Explanation</div>
            <ReactMarkdown>{getExplanationContent(questionData).text}</ReactMarkdown>
            {explanationImageUrl && (
                <div className="mt-4 max-w-2xl mx-auto">
                    <img 
                        src={explanationImageUrl} 
                        alt="Explanation illustration" 
                        className="max-w-full h-auto rounded-lg"
                        onError={handleImageError}
                    />
                </div>
            )}
        </div>
    );
};

export default QuestionExplanation;
