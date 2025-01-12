import { useCallback, useEffect } from 'react';

export const useQuestionNavigation = ({
    currentQuestion,
    questions,
    setCurrentQuestion,
    activeTab,
    setActiveTab,
    handleFlag,
    handleAnswerSelect,
    getQuestionOptions
}) => {
    const handleKeyPress = useCallback((e) => {
        // Prevent handling if user is typing in a text field
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
            return;
        }

        // Don't handle shortcuts if no questions are loaded
        if (!questions[currentQuestion]) return;

        switch (e.key) {
            case 'ArrowLeft':
                // Previous question
                if (currentQuestion > 0) {
                    setCurrentQuestion(curr => curr - 1);
                }
                break;
            case 'ArrowRight':
                // Next question
                if (currentQuestion < questions.length - 1) {
                    setCurrentQuestion(curr => curr + 1);
                }
                break;
            case 'e':
                // Toggle explanation
                setActiveTab(prev => prev === 'explanation' ? 'question' : 'explanation');
                break;
            case 'n':
                // Toggle notes
                setActiveTab(prev => prev === 'note' ? 'question' : 'note');
                break;
            case 'f':
                // Flag menu
                const flagColors = ['green', 'yellow', 'red'];
                const currentFlag = questions[currentQuestion].flag;
                const currentIndex = flagColors.indexOf(currentFlag);
                const nextColor = currentIndex === -1 ? flagColors[0] :
                                currentIndex === flagColors.length - 1 ? undefined :
                                flagColors[currentIndex + 1];
                handleFlag(nextColor);
                break;
            case '1':
            case '2':
            case '3':
            case '4':
                // Select answer options
                const options = getQuestionOptions(questions[currentQuestion]);
                const index = parseInt(e.key) - 1;
                if (index < options.length) {
                    handleAnswerSelect(options[index].text);
                }
                break;
            default:
                break;
        }
    }, [currentQuestion, questions, setCurrentQuestion, activeTab, setActiveTab, handleFlag, handleAnswerSelect, getQuestionOptions]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    return handleKeyPress;
};

export default useQuestionNavigation;
