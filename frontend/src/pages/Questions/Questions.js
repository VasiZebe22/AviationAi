import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { questionService } from '../../services/questions/questionService';
import { progressService } from '../../services/questions/progressService';
import { userDataService } from '../../services/questions/userDataService';
import { categories } from '../Categories/Categories';

// Components
import QuestionContent from './components/QuestionContent';
import QuestionExplanation from './components/QuestionExplanation';
import QuestionNotes from './components/QuestionNotes';
import QuestionTabs from './components/QuestionTabs';
import QuestionGrid from './components/QuestionGrid';
import QuestionControls from './components/QuestionControls';
import SaveTestButton from './components/SaveTestButton';

// Hooks
import useQuestionImages from './hooks/useQuestionImages';
import useQuestionNavigation from './hooks/useQuestionNavigation';
import useTimer from './hooks/useTimer';

const Questions = () => {
    // Router hooks
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // State hooks
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [activeTab, setActiveTab] = useState('question');
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [flags, setFlags] = useState({});
    const [notes, setNotes] = useState({});
    const [showExplanation, setShowExplanation] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [answeredQuestions, setAnsweredQuestions] = useState({});
    const [correctAnswers, setCorrectAnswers] = useState({});

    // Derived state
    const mode = location.state?.mode || 'study';
    const savedTimer = location.state?.savedTestData?.timer || 0;
    const { timer, formatTime } = useTimer(savedTimer);

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

    // Update current page and reset timer when question changes
    useEffect(() => {
        if (!isQuestionOnCurrentPage) {
            const newPage = Math.floor(currentQuestion / QUESTIONS_PER_PAGE);
            setCurrentPage(newPage);
        }
        // Reset question start time when question changes
        setQuestionStartTime(Date.now());
    }, [currentQuestion, isQuestionOnCurrentPage]);

    // Get current question data
    const currentQuestionData = questions[currentQuestion] || null;
    const { questionImageUrl, explanationImageUrl } = useQuestionImages(currentQuestionData, activeTab);

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

    // Get question options in a consistent format
    const getQuestionOptions = useCallback((question) => {
        if (!question) return [];
        
        let options = [];
        
        // Handle current format where options is a map of letters to texts
        if (question.options && typeof question.options === 'object') {
            options = Object.entries(question.options).map(([letter, text]) => ({
                label: letter,
                text: text
            }));
        } else {
            // Fallback for old format (array of options)
            options = (question.options || [question.correct_answer, ...(question.incorrect_answers || [])]).map((option, index) => ({
                label: String.fromCharCode(65 + index), // A, B, C, D
                text: option
            }));
        }
        
        // Sort options alphabetically by label (A, B, C, D)
        return options.sort((a, b) => a.label.localeCompare(b.label));
    }, []);

    // Check if answer is correct
    const isAnswerCorrect = useCallback((question, selectedAnswer) => {
        if (!question) return false;
        return selectedAnswer === question.correct_answer;
    }, []);

    // Handle answer selection
    const handleAnswerSelect = useCallback((selectedAnswer) => {
        if (!currentQuestionData) return;

        const isCorrect = isAnswerCorrect(currentQuestionData, selectedAnswer.letter);
        const answerTime = Math.round((Date.now() - questionStartTime) / 1000); // Convert to seconds

        // Store only the letter in answeredQuestions
        setAnsweredQuestions(prev => ({
            ...prev,
            [currentQuestionData.id]: selectedAnswer.letter
        }));
        
        setCorrectAnswers(prev => ({
            ...prev,
            [currentQuestionData.id]: isCorrect
        }));

        // Update the question status in the database with answer time
        progressService.updateProgress(currentQuestionData.id, isCorrect, answerTime)
            .catch(error => {
                if (error.message === 'User not authenticated') {
                    navigate('/login');
                } else {
                    console.error('Error updating progress:', error);
                    // Still show the answer result even if saving fails
                }
            });
    }, [currentQuestionData, answeredQuestions, navigate]);

    // Image error handler
    const handleImageError = useCallback((e) => {
        e.target.style.display = 'none';
        console.log('Image failed to load:', e.target.src);
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
                
                // Fetch flags and notes for visible questions only
                const fetchFlagsAndNotes = async () => {
                    if (!filteredQuestions.length) return;
                    
                    // Only fetch for the current page of questions (e.g., 10 at a time)
                    const visibleQuestions = filteredQuestions.slice(0, 10);
                    const visibleQuestionIds = visibleQuestions.map(q => q.id);
                    
                    try {
                        const [fetchedFlags, fetchedNotes] = await Promise.all([
                            userDataService.getFlags(visibleQuestionIds),
                            userDataService.getNotes(visibleQuestionIds)
                        ]);
                        
                        setFlags(prev => ({ ...prev, ...fetchedFlags }));
                        setNotes(prev => ({ ...prev, ...fetchedNotes }));
                    } catch (error) {
                        console.error('Error fetching flags/notes:', error);
                    }
                };

                fetchFlagsAndNotes();
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            setError(error.message || 'Failed to fetch questions. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [categoryId, filters, mode]);

    // Load saved test state if available
    useEffect(() => {
        const savedTestData = location.state?.savedTestData;
        if (savedTestData && questions.length > 0) {
            setCurrentQuestion(savedTestData.currentQuestion || 0);
            setAnsweredQuestions(savedTestData.answeredQuestions || {});

            // Rebuild correctAnswers state for saved answers
            const newCorrectAnswers = {};
            Object.entries(savedTestData.answeredQuestions || {}).forEach(([questionId, selectedAnswer]) => {
                const question = questions.find(q => q.id === questionId);
                if (question) {
                    newCorrectAnswers[questionId] = isAnswerCorrect(question, selectedAnswer);
                }
            });
            setCorrectAnswers(newCorrectAnswers);
        }
    }, [location.state?.savedTestData, questions, isAnswerCorrect]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const handleFlag = useCallback((color) => {
        if (!currentQuestionData) return;

        userDataService.updateFlag(currentQuestionData.id, color)
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

        userDataService.saveNote(currentQuestionData.id, note)
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
            // Calculate time for the last question
            const answerTime = Math.round((Date.now() - questionStartTime) / 1000);
            await progressService.updateProgress(
                currentQuestionData.id,
                answeredQuestions[currentQuestionData.id] === currentQuestionData.correct_answer,
                answerTime
            );

            // Only include questions that were actually answered, storing only the option letters
            const questionResults = questions
                .filter(question => answeredQuestions[question.id] !== undefined)
                .map(question => {
                    // Get just the option letter from the answer
                    const userAnswerMatch = answeredQuestions[question.id].match(/^([A-D]):/);
                    const userAnswer = userAnswerMatch ? userAnswerMatch[1] : answeredQuestions[question.id];
                    
                    return {
                        questionId: question.id,
                        userAnswer: userAnswer, // Just 'A', 'B', 'C', or 'D'
                        isCorrect: correctAnswers[question.id] || false
                    };
                });

            // Calculate score based on answered questions only
            const answeredTotal = questionResults.length;
            const correctTotal = questionResults.filter(q => q.isCorrect).length;

            // Get filters and selectedSubcategories from location state
            const testFilters = location.state?.filters;
            const selectedSubcategories = location.state?.selectedSubcategories;

            navigate('/results', {
                state: {
                    categoryId,
                    score: correctTotal,
                    total: answeredTotal,
                    time: timer,
                    questionResults: questionResults,
                    filters: testFilters,
                    selectedSubcategories: selectedSubcategories
                }
            });
        } catch (err) {
            console.error('Error finishing test:', err);
            setError('Failed to save test results. Please try again.');
        }
    }, [currentQuestionData, answeredQuestions, correctAnswers, categoryId, questions, timer, navigate, location.state, questionStartTime]);

    // Setup keyboard navigation
    useQuestionNavigation({
        currentQuestion,
        questions,
        setCurrentQuestion,
        handleAnswerSelect,
        answeredQuestions,
        currentQuestionData,
        handleKeyboardSelect: (number) => {
            if (!currentQuestionData || answeredQuestions[currentQuestionData.id]) return;
            
            // Convert number (1-4) to letter (A-D)
            const letterMap = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' };
            const letter = letterMap[number];
            
            if (letter && currentQuestionData.options[letter]) {
                handleAnswerSelect({
                    letter,
                    text: currentQuestionData.options[letter]
                });
            }
        }
    });

    // Navigation handlers
    const handleDashboardClick = useCallback(() => {
        navigate('/dashboard');
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
                            <SaveTestButton
                                categoryId={categoryId}
                                mode={mode}
                                currentQuestion={currentQuestion}
                                timer={timer}
                                answeredQuestions={answeredQuestions}
                                filters={location.state?.filters}
                                selectedSubcategories={location.state?.selectedSubcategories}
                                setError={setError}
                            />
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
                        <QuestionTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                        {/* Content area */}
                        <div className="flex-1">
                            {activeTab === 'question' && currentQuestionData && (
                                <QuestionContent
                                    questionData={currentQuestionData}
                                    questionImageUrl={questionImageUrl}
                                    handleImageError={handleImageError}
                                    getQuestionText={getQuestionText}
                                    getQuestionOptions={getQuestionOptions}
                                    handleAnswerSelect={handleAnswerSelect}
                                    answeredQuestions={answeredQuestions}
                                    isAnswerCorrect={isAnswerCorrect}
                                />
                            )}

                            {activeTab === 'explanation' && currentQuestionData && (
                                <QuestionExplanation
                                    questionData={currentQuestionData}
                                    explanationImageUrl={explanationImageUrl}
                                    getExplanationContent={getExplanationContent}
                                    handleImageError={handleImageError}
                                />
                            )}

                            {activeTab === 'note' && currentQuestionData && (
                                <QuestionNotes
                                    questionId={currentQuestionData.id}
                                    notes={notes}
                                    handleSaveNote={handleSaveNote}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Right sidebar */}
                <div className="w-72 bg-surface-dark/30 p-4 flex flex-col">
                    <QuestionGrid
                        currentPage={currentPage}
                        handlePageChange={handlePageChange}
                        questions={questions}
                        currentQuestion={currentQuestion}
                        setCurrentQuestion={setCurrentQuestion}
                        answeredQuestions={answeredQuestions}
                        correctAnswers={correctAnswers}
                        flags={flags}
                    />

                    <QuestionControls
                        currentQuestion={currentQuestion}
                        questions={questions}
                        setCurrentQuestion={setCurrentQuestion}
                        handleFlag={handleFlag}
                    />
                </div>
            </div>
        </div>
    );
};

export default Questions;
