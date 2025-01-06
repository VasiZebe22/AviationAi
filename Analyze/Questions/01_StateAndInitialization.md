# State and Initialization

## State Declarations
```javascript
const [questions, setQuestions] = useState([]);
const [currentQuestion, setCurrentQuestion] = useState(0);
const [selectedAnswer, setSelectedAnswer] = useState('');
const [activeTab, setActiveTab] = useState('question');
const [timer, setTimer] = useState(0);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [flags, setFlags] = useState({});
const [notes, setNotes] = useState({});
const [showExplanation, setShowExplanation] = useState(false);
const [showShortcuts, setShowShortcuts] = useState(false);
const [currentPage, setCurrentPage] = useState(0);
const [answeredQuestions, setAnsweredQuestions] = useState({});
const [correctAnswers, setCorrectAnswers] = useState({});
```

### Purpose of Each State
- `questions`: Stores the array of questions fetched from the API
- `currentQuestion`: Tracks the index of the currently displayed question
- `selectedAnswer`: Stores the user's selected answer for the current question
- `activeTab`: Controls which tab is currently active (question/explanation/note)
- `timer`: Tracks the time spent on the test/practice session
- `loading`: Indicates whether questions are being fetched
- `error`: Stores any error messages
- `flags`: Object storing question flags (green/yellow/red) by question ID
- `notes`: Object storing user notes by question ID
- `showExplanation`: Controls visibility of question explanations
- `showShortcuts`: Controls visibility of keyboard shortcuts
- `currentPage`: Tracks the current page in pagination
- `answeredQuestions`: Object tracking which questions have been answered
- `correctAnswers`: Object tracking which questions were answered correctly

## Constants and Configuration
```javascript
const QUESTIONS_PER_PAGE = 100;
const GRID_COLS = 10;
const GRID_ROWS = 10;
```

### Usage
- `QUESTIONS_PER_PAGE`: Number of questions displayed per page in the grid
- `GRID_COLS`: Number of columns in the question grid
- `GRID_ROWS`: Number of rows in the question grid

## Initialization Functions

### fetchQuestions
```javascript
const fetchQuestions = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);
        const fetchedQuestions = await questionService.getQuestionsByCategory(categoryId, {
            ...filters,
            mode
        });
        
        if (fetchedQuestions.length === 0) {
            setError('No questions found for this category.');
        } else {
            setQuestions(fetchedQuestions);
            setCurrentQuestion(0);
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        setError(error.message || 'Failed to fetch questions. Please try again later.');
    } finally {
        setLoading(false);
    }
}, [categoryId, filters, mode]);
```

### Timer Initialization
```javascript
useEffect(() => {
    const interval = setInterval(() => {
        setTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
}, []);
```

## Key Features
1. Error Handling
   - Comprehensive error handling in fetchQuestions
   - User-friendly error messages
   - Loading state management

2. Timer Management
   - Automatic timer initialization
   - Cleanup on component unmount
   - Second-by-second updates

3. Data Fetching
   - Category-based question fetching
   - Filter support
   - Mode-based fetching (study/test)
