import React from 'react';

const QuestionGrid = ({
    currentPage,
    handlePageChange,
    questions,
    currentQuestion,
    setCurrentQuestion,
    answeredQuestions,
    correctAnswers,
    flags
}) => {
    const QUESTIONS_PER_PAGE = 100;
    const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);

    return (
        <div className="flex-1 flex flex-col">
            {/* Grid navigation */}
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className={`p-2 rounded ${currentPage === 0 ? 'text-gray-600' : 'text-gray-400 hover:text-white'}`}
                >
                    ←
                </button>
                <span className="text-gray-400 text-sm">
                    {currentPage * 100 + 1}-{Math.min((currentPage + 1) * 100, questions.length)} of {questions.length}
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(questions.length / 100) - 1}
                    className={`p-2 rounded ${currentPage >= Math.ceil(questions.length / 100) - 1 ? 'text-gray-600' : 'text-gray-400 hover:text-white'}`}
                >
                    →
                </button>
            </div>

            {/* Question numbers grid */}
            <div className="grid grid-cols-10 gap-1 auto-rows-fr mb-4">
                {[...Array(100)].map((_, index) => {
                    const questionNumber = currentPage * 100 + index;
                    if (questionNumber >= questions.length) {
                        return <div key={index} />;
                    }
                    return (
                        <button
                            key={index}
                            onClick={() => setCurrentQuestion(questionNumber)}
                            className={`aspect-square rounded-sm flex items-center justify-center text-[10px] relative ${
                                questionNumber === currentQuestion
                                    ? 'bg-accent-lilac text-white'
                                    : answeredQuestions[questions[questionNumber].id]
                                        ? correctAnswers[questions[questionNumber].id]
                                            ? 'bg-green-600/70 text-white'
                                            : 'bg-red-600/70 text-white'
                                        : flags[questions[questionNumber].id] === 'green'
                                            ? 'bg-green-600/30 text-gray-300'
                                            : flags[questions[questionNumber].id] === 'yellow'
                                                ? 'bg-yellow-500/30 text-gray-300'
                                                : flags[questions[questionNumber].id] === 'red'
                                                    ? 'bg-red-600/30 text-gray-300'
                                                    : 'bg-surface-dark/50 text-gray-400 hover:bg-surface-dark'
                            }`}
                        >
                            {questionNumber + 1}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionGrid;
