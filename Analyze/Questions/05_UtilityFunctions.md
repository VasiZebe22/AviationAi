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

### Usage
- Converts seconds to HH:MM:SS format
- Used for displaying test duration
- Ensures consistent time display format

## Category Title Resolution

### Category Title Memo
```javascript
const categoryTitle = useMemo(() => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.title : '';
}, [categoryId]);
```

### Usage
- Resolves category title from ID
- Memoized to prevent unnecessary recalculations
- Provides fallback for missing categories

## Page Management

### Page Calculation
```javascript
const isQuestionOnCurrentPage = useMemo(() => {
    const questionIndex = currentQuestion;
    const currentPageStart = currentPage * QUESTIONS_PER_PAGE;
    const currentPageEnd = currentPageStart + QUESTIONS_PER_PAGE;
    return questionIndex >= currentPageStart && questionIndex < currentPageEnd;
}, [currentQuestion, currentPage]);
```

### Auto Page Update
```javascript
useEffect(() => {
    if (!isQuestionOnCurrentPage) {
        const newPage = Math.floor(currentQuestion / QUESTIONS_PER_PAGE);
        setCurrentPage(newPage);
    }
}, [currentQuestion, isQuestionOnCurrentPage]);
```

## Key Features
1. Time Management
   - Precise time tracking
   - Formatted display
   - Zero-padded numbers

2. Category Management
   - Efficient category lookup
   - Performance optimization
   - Error handling

3. Page Calculations
   - Automatic page switching
   - Boundary checking
   - Performance optimization through memoization
