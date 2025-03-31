import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { categories } from '../Categories/Categories';
import examConfig from '../../data/examConfig';

// Components
import QuestionContent from '../Questions/components/QuestionContent';
import QuestionGrid from '../Questions/components/QuestionGrid';
import QuestionControls from '../Questions/components/QuestionControls';

// Services
import { questionService } from '../../services/questions/questionService';

// Hooks
import useQuestionImages from '../Questions/hooks/useQuestionImages';
import useTimer from '../Questions/hooks/useTimer';
import { useQuestionNavigation } from '../Questions/hooks/useQuestionNavigation';
import Navbar from '../../components/Navbar/Navbar';

/**
 * ExamQuestions Component
 * Handles the examination mode with timed tests and no feedback
 * until all questions are answered
 */
const ExamQuestions = () => {
    // Router hooks
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Refs
    const examTimerRef = useRef(null);
    
    // State hooks
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [examStarted, setExamStarted] = useState(false);
    const [examCompleted, setExamCompleted] = useState(false);
    const [answeredQuestions, setAnsweredQuestions] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    
    // Memoized exam configuration for the current category
    const examSettings = useMemo(() => {
        return examConfig[categoryId] || { questions: 40, timeInMinutes: 60 };
    }, [categoryId]);
    
    // Derived state
    const { formatTime } = useTimer(0);
    
    // Memoize filters to prevent recreation on every render
    const filters = useMemo(() => location.state?.filters || {}, [location.state?.filters]);
    const selectedSubcategories = useMemo(() => location.state?.selectedSubcategories || [], [location.state?.selectedSubcategories]);
    
    // Get category title from categoryId
    const categoryTitle = useMemo(() => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.title : '';
    }, [categoryId]);
    
    // Constants for pagination
    const QUESTIONS_PER_PAGE = 100;
    
    // Calculate pagination values
    const totalPages = useMemo(() => Math.ceil(questions.length / QUESTIONS_PER_PAGE), [questions.length]);
    
    // Handle page navigation for question grid
    const handlePageChange = useCallback((newPage) => {
        setCurrentPage(newPage);
    }, []);

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
    const { questionImageUrl } = useQuestionImages(currentQuestionData, 'question');
    
    // Helper function to get question text (supports both old and new format)
    const getQuestionText = useCallback((question) => {
        if (!question) return { text: '' };
        const text = question.question || question.question_text || '';
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
    
    // Handle answer selection
    const handleAnswerSelect = useCallback((selectedAnswer) => {
        if (!currentQuestionData) return;
        
        // Store only the letter in answeredQuestions (without updating progress in DB)
        setAnsweredQuestions(prev => ({
            ...prev,
            [currentQuestionData.id]: selectedAnswer.letter
        }));
        
        // Removed automatic move to next question so users can see their selected answers
    }, [currentQuestionData]);
    
    // Image error handler
    const handleImageError = useCallback((e) => {
        e.target.style.display = 'none';
        console.log('Image failed to load:', e.target.src);
    }, []);
    
    // Fetch exam questions using the questionService
    const fetchExamQuestions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Use the questionService that follows the same pattern as the backend API implementation
            // This maintains consistency with how questions are fetched in other parts of the app
            const fetchedQuestions = await questionService.getQuestionsByCategory(categoryId, {
                subcategories: selectedSubcategories,
                mode: 'exam'  // This helps the service know it's exam mode
            });
            
            console.log(`Successfully fetched ${fetchedQuestions.length} questions from questionService`);
            
            // If we have more questions than needed for the exam, randomly select the required number
            let examQuestions = [...fetchedQuestions];
            const requiredCount = examSettings.questions || 40;
            
            if (examQuestions.length > requiredCount) {
                // Shuffle array using Fisher-Yates algorithm
                for (let i = examQuestions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [examQuestions[i], examQuestions[j]] = [examQuestions[j], examQuestions[i]];
                }
                
                // Take only the required number of questions
                examQuestions = examQuestions.slice(0, requiredCount);
                console.log(`Selected ${requiredCount} random questions for the exam`);
            }
            
            setQuestions(examQuestions);
            
            // Initialize time remaining based on exam configuration
            setTimeRemaining(examSettings.timeInMinutes * 60); // Convert minutes to seconds
            
        } catch (err) {
            console.error('Error fetching exam questions:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [categoryId, selectedSubcategories, examSettings.timeInMinutes, examSettings.questions]);
    
    // Handle direct navigation to results after exam completion
    const submitExam = useCallback(() => {
        // Stop the timer
        if (examTimerRef.current) {
            clearInterval(examTimerRef.current);
        }
        
        setExamCompleted(true);
        
        // Compute results
        const totalQuestions = questions.length;
        
        const questionResults = questions.map(q => {
            const answeredCorrectly = answeredQuestions[q.id] === q.correct_answer;
            return {
                questionId: q.id,
                userAnswer: answeredQuestions[q.id] || '',
                correctAnswer: q.correct_answer,
                isCorrect: answeredCorrectly
            };
        });
        
        // Calculate score
        const score = questionResults.filter(r => r.isCorrect).length;
        
        // Navigate to results page
        navigate('/results', {
            state: {
                score,
                total: totalQuestions,
                time: examSettings.timeInMinutes * 60 - timeRemaining,
                categoryId,
                questionResults,
                filters,
                selectedSubcategories,
                isExamMode: true
            }
        });
    }, [questions, answeredQuestions, examSettings.timeInMinutes, timeRemaining, categoryId, filters, selectedSubcategories, navigate]);
    
    // Start exam timer
    const startExam = useCallback(() => {
        setExamStarted(true);
        
        // Start countdown timer
        examTimerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    // Time's up - auto-submit the exam
                    clearInterval(examTimerRef.current);
                    submitExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [submitExam]);
    
    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (examTimerRef.current) {
                clearInterval(examTimerRef.current);
            }
        };
    }, []);
    
    // Fetch questions on component mount
    useEffect(() => {
        fetchExamQuestions();
    }, [fetchExamQuestions]);
    
    // Handle flag (no-op in exam mode but required by QuestionControls)
    const handleFlag = useCallback(() => {
        // No-op in exam mode
    }, []);
    
    // Check if all questions have been answered
    const allQuestionsAnswered = useMemo(() => {
        return questions.length > 0 && Object.keys(answeredQuestions).length === questions.length;
    }, [questions, answeredQuestions]);

    const handlePrevQuestion = useCallback(() => {
        setCurrentQuestion(prev => {
            if (prev > 0) {
                return prev - 1;
            }
            return prev;
        });
    }, []);

    const handleNextQuestion = useCallback(() => {
        setCurrentQuestion(prev => {
            if (prev < questions.length - 1) {
                return prev + 1;
            }
            return prev;
        });
    }, [questions.length]);

    // Add keyboard navigation functionality
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
            
            if (letter && currentQuestionData?.options && currentQuestionData.options[letter]) {
                handleAnswerSelect({
                    letter,
                    text: currentQuestionData.options[letter]
                });
            }
        }
    });

    // Show loading spinner while fetching data
    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-lilac"></div>
            </div>
        );
    }
    
    // If not yet started, show exam instructions
    if (!examStarted && !examCompleted) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-dark pt-24">
                    <div className="max-w-4xl mx-auto p-6 bg-surface-dark rounded-lg shadow-lg">
                        <h1 className="text-3xl font-light text-white mb-6">
                            {categoryTitle} - Exam Mode
                        </h1>
                        
                        <div className="bg-dark-lighter p-4 rounded-lg mb-6">
                            <h2 className="text-xl text-white mb-4">Exam Instructions</h2>
                            <ul className="text-gray-300 space-y-2 list-disc list-inside">
                                <li>You will have {examSettings.timeInMinutes} minutes to complete {examSettings.questions} questions.</li>
                                <li>You will not see if your answers are correct until you submit the exam.</li>
                                <li>You cannot access explanations or learning materials during the exam.</li>
                                <li>The exam will be automatically submitted when time expires.</li>
                                <li>The passing score is 75%.</li>
                            </ul>
                        </div>
                        
                        {error && (
                            <div className="bg-red-600/20 text-red-200 p-4 mb-6 rounded flex items-center justify-between">
                                <span>{error}</span>
                                <button
                                    onClick={fetchExamQuestions}
                                    className="text-sm bg-red-600/30 hover:bg-red-600/50 px-3 py-1 rounded"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}
                        
                        <div className="flex justify-between">
                            <button
                                onClick={() => navigate('/practice')}
                                className="px-6 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                            >
                                Return to Categories
                            </button>
                            
                            {/* Only enable start button if we have questions */}
                            <button
                                onClick={startExam}
                                disabled={!questions.length}
                                className={`px-6 py-3 rounded-lg ${
                                    questions.length 
                                        ? 'bg-accent-lilac text-white hover:bg-accent-lilac-dark' 
                                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                } transition-colors`}
                            >
                                Start Exam
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }
    
    // Error state after exam started
    if (error && questions.length === 0) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-dark pt-24">
                    <div className="max-w-4xl mx-auto p-6 bg-surface-dark rounded-lg shadow-lg">
                        <h1 className="text-3xl font-light text-white mb-6">
                            Error Loading Exam
                        </h1>
                        
                        <div className="bg-red-600/20 text-red-200 p-4 mb-6 rounded">
                            <p>{error}</p>
                        </div>
                        
                        <div className="flex justify-between">
                            <button
                                onClick={() => navigate('/practice')}
                                className="px-6 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                            >
                                Return to Categories
                            </button>
                            
                            <button
                                onClick={fetchExamQuestions}
                                className="px-6 py-3 rounded-lg bg-accent-lilac text-white hover:bg-accent-lilac-dark transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

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
                        </span>
                        <span className="text-gray-600">|</span>
                        <span className="text-gray-400 text-sm">{currentQuestion + 1} / {questions.length}</span>
                    </div>
                    <div className="flex items-center space-x-8">
                        {/* Navigation buttons */}
                        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white text-sm">DASHBOARD</button>
                        <button onClick={() => navigate('/test')} className="text-gray-400 hover:text-white text-sm">TEST</button>
                        <button onClick={() => navigate('/practice')} className="text-gray-400 hover:text-white text-sm">CATEGORIES</button>
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
                                {formatTime(timeRemaining)}
                            </div>
                            <div className="text-gray-400 ml-6 mt-3">
                                <button
                                    onClick={() => navigate('/practice')}
                                    className="text-accent-lilac hover:text-accent-lilac/90 transition-colors"
                                >
                                    Question Categories
                                </button>
                                <span className="mx-2 text-gray-600">/</span>
                                <span className="text-white">{categoryTitle}</span>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button onClick={submitExam} className="px-4 py-2 bg-accent-lilac text-white rounded hover:bg-accent-lilac/90 text-sm">
                                Submit Exam
                            </button>
                        </div>
                    </div>

                    {/* Question content */}
                    <div className="flex-1 bg-surface-dark/50 rounded-lg p-6 relative">
                        {currentQuestionData && (
                            <QuestionContent
                                questionData={currentQuestionData}
                                questionImageUrl={questionImageUrl}
                                handleImageError={handleImageError}
                                getQuestionText={getQuestionText}
                                getQuestionOptions={getQuestionOptions}
                                handleAnswerSelect={handleAnswerSelect}
                                answeredQuestions={answeredQuestions}
                                isAnswerCorrect={(question, answer) => answeredQuestions[question.id] === answer}
                            />
                        )}
                    </div>
                </div>

                {/* Right sidebar */}
                <div className="w-64 bg-surface-dark/30 p-4 flex flex-col">
                    <h3 className="text-white text-lg mb-4">Questions</h3>
                    <div className="text-sm text-gray-400 mb-2">{currentQuestion + 1}-{questions.length} of {questions.length}</div>
                    
                    {/* Question grid */}
                    <div className="flex-1">
                        <QuestionGrid
                            currentPage={currentPage}
                            handlePageChange={handlePageChange}
                            questions={questions}
                            currentQuestion={currentQuestion}
                            setCurrentQuestion={setCurrentQuestion}
                            answeredQuestions={answeredQuestions}
                            correctAnswers={answeredQuestions} // Use answeredQuestions as correctAnswers to make all answered questions green
                            flags={{}}
                        />
                    </div>
                    
                    {/* Flag buttons */}
                    <div className="mt-4 flex space-x-2 justify-center">
                        <button className="w-7 h-7 rounded-full bg-green-600 hover:bg-green-700"></button>
                        <button className="w-7 h-7 rounded-full bg-yellow-500 hover:bg-yellow-600"></button>
                        <button className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700"></button>
                    </div>
                    
                    {/* Navigation controls */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <button 
                            onClick={handlePrevQuestion}
                            className="px-3 py-2 text-sm bg-surface-dark/50 text-gray-300 rounded hover:bg-surface-dark disabled:opacity-50"
                            disabled={currentQuestion === 0}
                        >
                            Previous
                        </button>
                        <button 
                            onClick={handleNextQuestion}
                            className="px-3 py-2 text-sm bg-surface-dark/50 text-gray-300 rounded hover:bg-surface-dark disabled:opacity-50"
                            disabled={currentQuestion === questions.length - 1}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamQuestions;
