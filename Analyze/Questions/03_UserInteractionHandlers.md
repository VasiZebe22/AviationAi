# User Interaction Handlers

## Keyboard Navigation

### Key Press Handler
```javascript
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
            const options = currentQuestionData.options;
            const index = parseInt(e.key) - 1;
            if (index < options.length) {
                handleAnswerSelect(options[index]);
            }
            break;
        default:
            break;
    }
}, [currentQuestion, questions.length, flags, currentQuestionData, handleAnswerSelect, handleFlag]);
```

## Navigation Handlers

### Dashboard Navigation
```javascript
const handleDashboardClick = useCallback(() => {
    navigate('/');
}, [navigate]);
```

### Categories Navigation
```javascript
const handleCategoriesClick = useCallback(() => {
    navigate('/practice');
}, [navigate]);
```

### Test Navigation
```javascript
const handleTestClick = useCallback(() => {
    navigate('/test');
}, [navigate]);
```

### Saved Tests Navigation
```javascript
const handleSavedTestsClick = useCallback(() => {
    navigate('/saved-tests');
}, [navigate]);
```

### Search Navigation
```javascript
const handleSearchClick = useCallback(() => {
    navigate('/search');
}, [navigate]);
```

## Test Completion Handler

### Finish Test
```javascript
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
```

## Key Features
1. Keyboard Shortcuts
   - Question navigation (←/→)
   - Tab switching (e/n)
   - Flag toggling (f)
   - Answer selection (1-4)

2. Navigation System
   - Centralized navigation handling
   - Consistent routing patterns
   - Error handling

3. Test Management
   - Score calculation
   - Progress tracking
   - Result submission
