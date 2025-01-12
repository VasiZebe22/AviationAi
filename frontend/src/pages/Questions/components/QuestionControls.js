import React from 'react';

const QuestionControls = ({
    currentQuestion,
    questions,
    setCurrentQuestion,
    handleFlag
}) => {
    return (
        <div className="mt-auto space-y-4">
            {/* Flag controls */}
            <div className="flex justify-center space-x-2">
                <button onClick={() => handleFlag('green')} className="w-6 h-6 rounded-full bg-green-600/70 hover:bg-green-600" />
                <button onClick={() => handleFlag('yellow')} className="w-6 h-6 rounded-full bg-yellow-500/70 hover:bg-yellow-500" />
                <button onClick={() => handleFlag('red')} className="w-6 h-6 rounded-full bg-red-600/70 hover:bg-red-600" />
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between">
                <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className={`px-4 py-2 rounded text-sm ${currentQuestion === 0 ? 'text-gray-600' : 'text-gray-400 hover:text-white hover:bg-surface-dark/50'}`}
                >
                    Previous
                </button>
                <button
                    onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                    disabled={currentQuestion === questions.length - 1}
                    className={`px-4 py-2 rounded text-sm ${currentQuestion === questions.length - 1 ? 'text-gray-600' : 'text-gray-400 hover:text-white hover:bg-surface-dark/50'}`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default QuestionControls;
