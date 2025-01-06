# Question Management

## Question Navigation

### Current Question Data
```javascript
const currentQuestionData = questions[currentQuestion] || null;
```

### Pagination Logic
```javascript
const totalPages = useMemo(() => Math.ceil(questions.length / QUESTIONS_PER_PAGE), [questions.length]);

const currentPageQuestions = useMemo(() => {
    const start = currentPage * QUESTIONS_PER_PAGE;
    return questions.slice(start, start + QUESTIONS_PER_PAGE);
}, [questions, currentPage]);
```

### Page Navigation
```javascript
const handlePageChange = useCallback((newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
        setCurrentPage(newPage);
    }
}, [totalPages]);
```

## Answer Management

### Answer Selection Handler
```javascript
const handleAnswerSelect = useCallback((selectedOption) => {
    if (answeredQuestions[currentQuestionData.id]) {
        return; // Don't allow changing answer if already answered
    }

    const isCorrect = selectedOption === currentQuestionData.correct_answer;
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
            }
        });
}, [currentQuestionData, answeredQuestions, navigate]);
```

## Question Flags and Notes

### Flag Management
```javascript
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
```

### Note Management
```javascript
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
```

## Key Features
1. Answer Processing
   - Immediate feedback
   - Progress tracking
   - Server synchronization
   - Authentication checks

2. Question Organization
   - Efficient pagination
   - Grid-based overview
   - Dynamic page calculation

3. Study Tools
   - Color-coded flagging system
   - Personal note-taking
   - Progress persistence
