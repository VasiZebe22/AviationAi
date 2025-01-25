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

    // Handle navigation with question update
    const handleNavigation = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            // Calculate the first question of the new page
            const firstQuestionOnNewPage = newPage * QUESTIONS_PER_PAGE;
            // Update both the page and current question
            handlePageChange(newPage);
            setCurrentQuestion(firstQuestionOnNewPage);
        }
    };

    // Navigation arrow components
    const NavigationArrow = ({ direction, onClick, disabled, double = false }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-3 py-1.5 rounded-md transition-all duration-200 ${
                disabled 
                    ? 'text-gray-600/50 pointer-events-none' 
                    : 'text-gray-400 hover:text-white hover:bg-surface-dark'
            }`}
            title={`${direction === 'left' ? (double ? 'First' : 'Previous') : (double ? 'Last' : 'Next')} page`}
        >
            <span className="font-light text-lg tracking-tighter">
                {direction === 'left' 
                    ? (double ? '«' : '‹')
                    : (double ? '»' : '›')
                }
            </span>
        </button>
    );

    const canGoNext = currentPage < totalPages - 1;
    const canGoPrev = currentPage > 0;

    return (
        <div className="flex-1 flex flex-col">
            {/* Grid navigation */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-1">
                    <NavigationArrow
                        direction="left"
                        onClick={() => handleNavigation(0)}
                        disabled={!canGoPrev}
                        double
                    />
                    <NavigationArrow
                        direction="left"
                        onClick={() => handleNavigation(currentPage - 1)}
                        disabled={!canGoPrev}
                    />
                </div>
                <span className="text-gray-400 text-sm">
                    {currentPage * 100 + 1}-{Math.min((currentPage + 1) * 100, questions.length)} of {questions.length}
                </span>
                <div className="flex gap-1">
                    <NavigationArrow
                        direction="right"
                        onClick={() => handleNavigation(currentPage + 1)}
                        disabled={!canGoNext}
                    />
                    <NavigationArrow
                        direction="right"
                        onClick={() => handleNavigation(totalPages - 1)}
                        disabled={!canGoNext}
                        double
                    />
                </div>
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
