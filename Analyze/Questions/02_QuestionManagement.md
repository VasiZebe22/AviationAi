# Question Management

## Question Navigation

### Current Question Data
```javascript
const currentQuestionData = questions[currentQuestion] || null;
```

### Question Display
```javascript
{activeTab === 'question' && currentQuestionData && (
    <div className="space-y-6">
        <div className="text-white text-lg">
            {getQuestionText(currentQuestionData)}
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
```

### Explanation Display
```javascript
{activeTab === 'explanation' && currentQuestionData && (
    <div className="text-gray-300 prose prose-invert max-w-none">
        <div className="mb-6">
            <h3 className="text-white text-lg font-semibold mb-2">Explanation</h3>
            {currentQuestionData.explanation}
        </div>
        {currentQuestionData.learning_materials && currentQuestionData.learning_materials.length > 0 && (
            <div>
                <h3 className="text-white text-lg font-semibold mb-2">Learning Materials</h3>
                <ul className="list-disc pl-5">
                    {currentQuestionData.learning_materials.map((material, index) => (
                        <li key={index} className="mb-2">{material}</li>
                    ))}
                </ul>
            </div>
        )}
    </div>
)}
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
            }
        });
}, [currentQuestionData, answeredQuestions, navigate, isAnswerCorrect]);
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
1. Question Display
   - Support for both old and new question formats
   - Consistent option labeling (A, B, C, D)
   - Enhanced explanation view with learning materials

2. Answer Management
   - Format-agnostic answer validation
   - Progress tracking with category support
   - Immediate feedback on answers

3. User Tools
   - Question flagging system
   - Note-taking capability
   - Learning materials display

4. Navigation
   - Efficient pagination
   - Question grid overview
   - Progress tracking
