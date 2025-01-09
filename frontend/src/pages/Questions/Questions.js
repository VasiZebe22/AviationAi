import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import questionService from '../../services/questionService';
import { getImageFromStorage } from '../../services/firebase';
import { categories } from '../Categories/Categories';

const Questions = () => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [activeTab, setActiveTab] = useState('question');
    const [timer, setTimer] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [flags, setFlags] = useState({});
    const [questionImageUrl, setQuestionImageUrl] = useState(null);
    const [explanationImageUrl, setExplanationImageUrl] = useState(null);
    const [notes, setNotes] = useState({});
    const [showExplanation, setShowExplanation] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [answeredQuestions, setAnsweredQuestions] = useState({});
    const [correctAnswers, setCorrectAnswers] = useState({});
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const mode = location.state?.mode || 'study';

    // Get category title from categoryId
    const categoryTitle = useMemo(() => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.title : '';
    }, [categoryId]);

    // Constants for pagination
    const QUESTIONS_PER_PAGE = 100;
    const GRID_COLS = 10;
    const GRID_ROWS = 10;

    // Memoize filters to prevent recreation on every render
    const filters = useMemo(() => location.state?.filters || {}, [location.state?.filters]);

    // Calculate pagination values
    const totalPages = useMemo(() => Math.ceil(questions.length / QUESTIONS_PER_PAGE), [questions.length]);

    // Get questions for current page
    const currentPageQuestions = useMemo(() => {
        const start = currentPage * QUESTIONS_PER_PAGE;
        return questions.slice(start, start + QUESTIONS_PER_PAGE);
    }, [questions, currentPage]);

    // Handle page navigation
    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    }, [totalPages]);

    // Check if current question is on current page
    const isQuestionOnCurrentPage = useMemo(() => {
        const questionIndex = currentQuestion;
        const currentPageStart = currentPage * QUESTIONS_PER_PAGE;
        const currentPageEnd = currentPageStart + QUESTIONS_PER_PAGE;
        return questionIndex >= currentPageStart && questionIndex < currentPageEnd;
    }, [currentQuestion, currentPage]);

    // Update current page when question changes
    useEffect(() => {
        if (!isQuestionOnCurrentPage) {
            const newPage = Math.floor(currentQuestion / QUESTIONS_PER_PAGE);
            setCurrentPage(newPage);
        }
    }, [currentQuestion, isQuestionOnCurrentPage]);

    // Get current question data
    const currentQuestionData = questions[currentQuestion] || null;

    // Log only image-related data when question changes
    useEffect(() => {
        if (currentQuestionData) {
            // Only log if there are image fields
            if (currentQuestionData.question_image || currentQuestionData.explanation_image) {
                console.log('Question Images:', {
                    id: currentQuestionData.id,
                    questionImage: currentQuestionData.question_image || 'none',
                    explanationImage: currentQuestionData.explanation_image || 'none'
                });
            }
        }
    }, [currentQuestionData]);

    // Helper function to get question text (supports both old and new format)
    const getQuestionText = useCallback((question) => {
        if (!question) return { text: '' };
        const text = question.question || question.question_text || '';
        return { text };
    }, []);

    // Helper function to get explanation content
    const getExplanationContent = useCallback((question) => {
        if (!question) return { text: '' };
        const text = question.explanation || '';
        return { text };
    }, []);

    // Load question image when needed
    useEffect(() => {
        const loadQuestionImage = async () => {
            if (currentQuestionData?.id && activeTab === 'question') {
                setQuestionImageUrl(null);
                try {
                    const questionPath = `figures/${currentQuestionData.id}_question_0.png`;
                    const qImageUrl = await getImageFromStorage(questionPath);
                    setQuestionImageUrl(qImageUrl);
                } catch (error) {
                    console.error('Error loading question image:', error);
                }
            }
        };

        loadQuestionImage();
    }, [currentQuestionData, activeTab]);

    // Load explanation image only when explanation tab is active
    useEffect(() => {
        const loadExplanationImage = async () => {
            if (currentQuestionData?.id && activeTab === 'explanation') {
                setExplanationImageUrl(null);
                try {
                    const explanationPath = `figures/${currentQuestionData.id}_explanation_0.png`;
                    const eImageUrl = await getImageFromStorage(explanationPath);
                    setExplanationImageUrl(eImageUrl);
                } catch (error) {
                    console.error('Error loading explanation image:', error);
                }
            }
        };

        loadExplanationImage();
    }, [currentQuestionData, activeTab]);

    // Helper function to get question options (supports both old and new format)
    const getQuestionOptions = useCallback((question) => {
        let options;
        if (question.options && typeof question.options === 'object') {
            // New format: options is a map
            options = Object.entries(question.options).map(([key, value]) => ({
                label: key,
                text: value
            }));
        } else {
            // Old format: array of options with correct_answer first
            options = (question.options || [question.correct_answer, ...(question.incorrect_answers || [])]).map((option, index) => ({
                label: String.fromCharCode(65 + index), // A, B, C, D
                text: option
            }));
        }
        
        // Sort options alphabetically by label (A, B, C, D)
        return options.sort((a, b) => a.label.localeCompare(b.label));
    }, []);

    // Helper function to check if answer is correct (supports both formats)
    const isAnswerCorrect = useCallback((question, selectedOption) => {
        if (typeof question.options === 'object') {
            // Find the label (A, B, C, D) for the selected option text
            const selectedLabel = Object.entries(question.options)
                .find(([_, value]) => value === selectedOption)?.[0];
            // Compare the label with the correct_answer
            return selectedLabel === question.correct_answer;
        }
        // Old format
        return selectedOption === question.correct_answer;
    }, []);

    // Image error handler
    const handleImageError = useCallback((e) => {
        e.target.style.display = 'none';
        console.log('Image failed to load:', e.target.src);
    }, []);

    // Timer effect
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = useCallback((seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, []);

    const fetchQuestions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedQuestions = await questionService.getQuestionsByCategory(categoryId, {
                ...filters,
                mode
            });

            // Filter questions by selected subcategories if any are selected
            const selectedSubcats = location.state?.selectedSubcategories || [];
            const filteredQuestions = selectedSubcats.length > 0
                ? fetchedQuestions.filter(question => 
                    question.subcategories?.some(sub => 
                        selectedSubcats.includes(sub.code)
                    )
                )
                : fetchedQuestions;

            if (filteredQuestions.length === 0) {
                setError('No questions found for this category.');
            } else {
                setQuestions(filteredQuestions);
                setCurrentQuestion(0);
                
                // Fetch flags and notes for all questions
                const questionIds = fetchedQuestions.map(q => q.id);
                const [fetchedFlags, fetchedNotes] = await Promise.all([
                    questionService.getFlags(questionIds),
                    questionService.getNotes(questionIds)
                ]);
                setFlags(fetchedFlags);
                setNotes(fetchedNotes);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            setError(error.message || 'Failed to fetch questions. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [categoryId, filters, mode]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const handleAnswerSelect = useCallback((selectedOption) => {
        if (answeredQuestions[currentQuestionData.id]) {
            return; // Don't allow changing answer if already answered
        }

        const isCorrect = isAnswerCorrect(currentQuestionData, selectedOption);
        setAnsweredQuestions(prev => ({
            ...prev,
            [currentQuestionData.id]: selectedOption
        }));
        setCorrectAnswers(prev => ({
            ...prev,
            [currentQuestionData.id]: isCorrect
        }));

        // Update the question status in the database
        questionService.updateProgress(currentQuestionData.id, isCorrect)
            .catch(error => {
                if (error.message === 'User not authenticated') {
                    navigate('/login');
                } else {
                    console.error('Error updating progress:', error);
                    // Still show the answer result even if saving fails
                }
            });
    }, [currentQuestionData, answeredQuestions, navigate]);

    const handleFlag = useCallback((color) => {
        if (!currentQuestionData) return;

        questionService.updateFlag(currentQuestionData.id, color)
            .catch(error => {
                if (error.message === 'User not authenticated') {
                    navigate('/login');
                } else {
                    console.error('Error updating flag:', error);
                }
            });

        setFlags(prev => ({
            ...prev,
            [currentQuestionData.id]: color
        }));
    }, [currentQuestionData, navigate]);

    const handleSaveNote = useCallback((note) => {
        if (!currentQuestionData) return;

        questionService.saveNote(currentQuestionData.id, note)
            .catch(error => {
                if (error.message === 'User not authenticated') {
                    navigate('/login');
                } else {
                    console.error('Error saving note:', error);
                }
            });

        setNotes(prev => ({
            ...prev,
            [currentQuestionData.id]: note
        }));
    }, [currentQuestionData, navigate]);

    const handleFinishTest = useCallback(async () => {
        if (!currentQuestionData) return;
        try {
            await questionService.updateProgress(currentQuestionData.id,
                answeredQuestions[currentQuestionData.id] === currentQuestionData.correct_answer
            );
            navigate('/results', {
                state: {
                    categoryId,
                    score: Object.values(correctAnswers).filter(Boolean).length,
                    total: questions.length,
                    time: timer
                }
            });
        } catch (err) {
            console.error('Error finishing test:', err);
            setError('Failed to save test results. Please try again.');
        }
    }, [currentQuestionData, answeredQuestions, correctAnswers, categoryId, questions, timer, navigate]);

    const handleKeyPress = useCallback((e) => {
        // Prevent handling if user is typing in a text field
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
            return;
        }

        // Don't handle shortcuts if no questions are loaded
        if (!currentQuestionData) return;

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
                const currentFlag = flags[currentQuestionData.id];
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
                const options = getQuestionOptions(currentQuestionData);
                const index = parseInt(e.key) - 1;
                if (index < options.length) {
                    handleAnswerSelect(options[index].text);
                }
                break;
            default:
                break;
        }
    }, [currentQuestion, questions.length, flags, currentQuestionData, handleAnswerSelect, handleFlag]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    // Navigation handlers
    const handleDashboardClick = useCallback(() => {
        navigate('/');
    }, [navigate]);

    const handleCategoriesClick = useCallback(() => {
        navigate('/practice');
    }, [navigate]);

    const handleTestClick = useCallback(() => {
        navigate('/test');
    }, [navigate]);

    const handleSavedTestsClick = useCallback(() => {
        navigate('/saved-tests');
    }, [navigate]);

    const handleSearchClick = useCallback(() => {
        navigate('/search');
    }, [navigate]);

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Navbar */}
            <nav className="bg-surface-dark/30 border-b border-gray-800/50">
                <div className="flex justify-between items-center h-14 px-6">
                        <div className="flex items-center space-x-4">
                            <span className="text-accent-lilac font-semibold tracking-wide">ATPL Questions</span>
                            <span className="text-gray-600">|</span>
                            <span className="text-gray-400 text-sm">
                                No. Q-{currentQuestionData?.id || ''}
                                {currentQuestionData && flags[currentQuestionData.id] && (
                                    <span 
                                        className={`inline-block w-2 h-2 ml-2 rounded-full ${
                                            flags[currentQuestionData.id] === 'green' ? 'bg-green-600' :
                                            flags[currentQuestionData.id] === 'yellow' ? 'bg-yellow-500' :
                                            flags[currentQuestionData.id] === 'red' ? 'bg-red-600' : ''
                                        }`}
                                    />
                                )}
                            </span>
                        <span className="text-gray-600">|</span>
                        <span className="text-gray-400 text-sm">{currentQuestion + 1} / {questions.length}</span>
                    </div>
                    <div className="flex items-center space-x-8">
                        {/* Navigation buttons */}
                        <button onClick={handleDashboardClick} className="text-gray-400 hover:text-white text-sm">DASHBOARD</button>
                        <button onClick={handleTestClick} className="text-gray-400 hover:text-white text-sm">TEST</button>
                        <button onClick={handleSavedTestsClick} className="text-gray-400 hover:text-white text-sm">SAVED TESTS</button>
                        <button onClick={handleSearchClick} className="text-gray-400 hover:text-white text-sm">SEARCH</button>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left content area */}
                <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                    {/* Timer and controls */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                            <div className="text-2xl text-white font-light w-[100px]">
                                {formatTime(timer)}
                            </div>
                            <div className="text-gray-400 ml-6 mt-3">
                                <button
                                    onClick={handleCategoriesClick}
                                    className="text-accent-lilac hover:text-accent-lilac/90 transition-colors"
                                >
                                    Question Categories
                                </button>
                                <span className="mx-2 text-gray-600">/</span>
                                <span className="text-white">{categoryTitle}</span>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button onClick={() => setShowShortcuts(!showShortcuts)} className="px-4 py-2 bg-surface-dark/50 text-gray-400 rounded hover:bg-surface-dark/70 text-sm">
                                Save Test
                            </button>
                            <button onClick={handleFinishTest} className="px-4 py-2 bg-accent-lilac text-white rounded hover:bg-accent-lilac/90 text-sm">
                                Finish Test
                            </button>
                        </div>
                    </div>

                    {/* Question content */}
                    <div className="flex-1 bg-surface-dark/50 rounded-lg p-6 relative">
                        {flags[currentQuestionData?.id] && (
                            <div className="absolute top-4 right-4">
                                <div 
                                    className={`w-4 h-4 rounded-full ${
                                        flags[currentQuestionData.id] === 'green' ? 'bg-green-600' :
                                        flags[currentQuestionData.id] === 'yellow' ? 'bg-yellow-500' :
                                        flags[currentQuestionData.id] === 'red' ? 'bg-red-600' : ''
                                    }`}
                                />
                            </div>
                        )}
                        {/* Question tabs */}
                        <div className="flex space-x-1 mb-6">
                            <button
                                onClick={() => setActiveTab('question')}
                                className={`px-4 py-2 rounded text-sm ${activeTab === 'question' ? 'bg-accent-lilac text-white' : 'text-gray-400 hover:bg-surface-dark/50'}`}
                            >
                                Question
                            </button>
                            <button
                                onClick={() => setActiveTab('explanation')}
                                className={`px-4 py-2 rounded text-sm ${activeTab === 'explanation' ? 'bg-accent-lilac text-white' : 'text-gray-400 hover:bg-surface-dark/50'}`}
                            >
                                Explanation
                            </button>
                            <button
                                onClick={() => setActiveTab('note')}
                                className={`px-4 py-2 rounded text-sm ${activeTab === 'note' ? 'bg-accent-lilac text-white' : 'text-gray-400 hover:bg-surface-dark/50'}`}
                            >
                                Note
                            </button>
                        </div>

                        {/* Content area */}
                        <div className="flex-1">
                            {activeTab === 'question' && currentQuestionData && (
                                <div className="space-y-6">
                                    <div className="text-white text-lg">
                                        <ReactMarkdown>{getQuestionText(currentQuestionData).text}</ReactMarkdown>
                                        {questionImageUrl && (
                                            <div className="mt-4">
                                                <img 
                                                    src={questionImageUrl} 
                                                    alt="Question illustration" 
                                                    className="max-w-full h-auto rounded-lg"
                                                    onError={handleImageError}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        {getQuestionOptions(currentQuestionData).map(({ label, text }) => {
                                            const isAnswered = answeredQuestions[currentQuestionData.id];
                                            const isSelected = answeredQuestions[currentQuestionData.id] === text;
                                            const isCorrect = isAnswerCorrect(currentQuestionData, text);

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
                                                    onClick={() => handleAnswerSelect(text)}
                                                    disabled={isAnswered}
                                                    className={`w-full p-3 text-left rounded ${buttonStyle} ${isAnswered && !isSelected ? 'opacity-50' : ''}`}
                                                >
                                                    <span className="font-semibold mr-2">{label}.</span>
                                                    {text}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'explanation' && currentQuestionData && (
                                <div className="text-gray-300 space-y-4">
                                    <div className="text-lg font-semibold mb-4">Explanation</div>
                                    <ReactMarkdown>{getExplanationContent(currentQuestionData).text}</ReactMarkdown>
                                    {explanationImageUrl && (
                                        <div className="mt-4">
                                            <img 
                                                src={explanationImageUrl} 
                                                alt="Explanation illustration" 
                                                className="max-w-full h-auto rounded-lg"
                                                onError={handleImageError}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'note' && currentQuestionData && (
                                <textarea
                                    value={notes[currentQuestionData?.id] || ''}
                                    onChange={(e) => handleSaveNote(e.target.value)}
                                    className="w-full h-48 bg-surface-dark/50 text-gray-300 p-3 rounded resize-none focus:outline-none focus:ring-1 focus:ring-accent-lilac"
                                    placeholder="Add your notes here..."
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Right sidebar */}
                <div className="w-72 bg-surface-dark/30 p-4 flex flex-col">
                    {/* Question grid */}
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

                    {/* Controls */}
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
                </div>
            </div>
        </div>
    );
};

export default Questions;
