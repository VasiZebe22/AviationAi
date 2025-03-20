import React from 'react';
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
    if (!questionData) return null;

    return (
        <div className="space-y-6">
            <div className="text-white text-lg">
                <ReactMarkdown>{getQuestionText(questionData).text}</ReactMarkdown>
                {questionImageUrl && (
                    <div className="mt-4 max-w-2xl mx-auto">
                        <ImageWithMeasurement
                            src={questionImageUrl}
                            alt="Question illustration"
                            className="max-w-full h-auto rounded-lg"
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
