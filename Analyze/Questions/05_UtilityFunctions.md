# Utility Functions

## Time Formatting

### Format Time Function
```javascript
const formatTime = useCallback((seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}, []);
```

## Question Format Helpers

### Question Text Helper
```javascript
const getQuestionText = useCallback((question) => {
    return question.question || question.question_text || '';
}, []);
```

### Question Options Helper
```javascript
const getQuestionOptions = useCallback((question) => {
    if (question.options && typeof question.options === 'object') {
        // New format: options is a map
        return Object.entries(question.options).map(([key, value]) => ({
            label: key,
            text: value
        }));
    }
    // Old format: array of options with correct_answer first
    return (question.options || [question.correct_answer, ...(question.incorrect_answers || [])]).map((option, index) => ({
        label: String.fromCharCode(65 + index), // A, B, C, D
        text: option
    }));
}, []);
```

### Answer Validation Helper
```javascript
const isAnswerCorrect = useCallback((question, selectedOption) => {
    if (typeof question.options === 'object') {
        // New format
        return selectedOption === question.correct_answer;
    }
    // Old format
    return selectedOption === question.correct_answer;
}, []);
```

### Option Style Helper
```javascript
const getOptionStyle = useCallback((question, option) => {
    const isAnswered = answeredQuestions[question.id];
    const isSelected = answeredQuestions[question.id] === option;
    const isCorrect = isAnswerCorrect(question, option);
    
    let style = 'bg-surface-dark/50 text-gray-300 hover:bg-surface-dark';
    if (isAnswered) {
        if (isSelected) {
            style = isCorrect ? 'bg-green-600/70 text-white' : 'bg-red-600/70 text-white';
        } else if (isCorrect) {
            style = 'bg-green-600/70 text-white';
        }
    }
    return style;
}, [answeredQuestions, isAnswerCorrect]);
```

### Question Button Style Helper
```javascript
const getQuestionButtonStyle = useCallback((questionNumber) => {
    const baseStyle = 'aspect-square rounded-sm flex items-center justify-center text-[10px]';
    const question = questions[questionNumber];
    
    if (questionNumber === currentQuestion) {
        return `${baseStyle} bg-accent-lilac text-white`;
    }
    
    if (answeredQuestions[question.id]) {
        return `${baseStyle} ${
            correctAnswers[question.id]
                ? 'bg-green-600/70 text-white'
                : 'bg-red-600/70 text-white'
        }`;
    }
    
    return `${baseStyle} bg-surface-dark/50 text-gray-400 hover:bg-surface-dark`;
}, [questions, currentQuestion, answeredQuestions, correctAnswers]);
```

## Key Features
1. Time Management
   - Precise time tracking
   - Formatted display
   - Zero-padded numbers

2. Question Format Support
   - Backward compatibility
   - Format detection
   - Consistent output structure
   - Label generation (A, B, C, D)

3. Style Management
   - Dynamic style generation
   - State-based styling
   - Consistent UI feedback
   - Accessibility support

4. Helper Functions
   - Modular design
   - Reusable components
   - Performance optimization
   - Clear documentation
