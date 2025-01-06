# Navigation and UI Components

## Navigation Bar

### Structure
```javascript
<nav className="bg-surface-dark/30 border-b border-gray-800/50">
    <div className="flex justify-between items-center h-14 px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
            <span className="text-accent-lilac font-semibold tracking-wide">ATPL Questions</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400 text-sm">No. Q-{currentQuestionData?.id || ''}</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400 text-sm">{currentQuestion + 1} / {questions.length}</span>
        </div>
        {/* Right Section */}
        <div className="flex items-center space-x-8">
            <button onClick={handleDashboardClick} className="text-gray-400 hover:text-white text-sm">DASHBOARD</button>
            <button onClick={handleTestClick} className="text-gray-400 hover:text-white text-sm">TEST</button>
            <button onClick={handleSavedTestsClick} className="text-gray-400 hover:text-white text-sm">SAVED TESTS</button>
            <button onClick={handleSearchClick} className="text-gray-400 hover:text-white text-sm">SEARCH</button>
        </div>
    </div>
</nav>
```

## Question Grid

### Grid Navigation
```javascript
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
```

### Question Numbers Grid
```javascript
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
                className={`aspect-square rounded-sm flex items-center justify-center text-[10px] ${
                    questionNumber === currentQuestion
                        ? 'bg-accent-lilac text-white'
                        : answeredQuestions[questions[questionNumber].id]
                            ? correctAnswers[questions[questionNumber].id]
                                ? 'bg-green-600/70 text-white'
                                : 'bg-red-600/70 text-white'
                            : 'bg-surface-dark/50 text-gray-400 hover:bg-surface-dark'
                }`}
            >
                {questionNumber + 1}
            </button>
        );
    })}
</div>
```

## Flag Controls

### Color Buttons
```javascript
<div className="flex justify-center space-x-2">
    <button onClick={() => handleFlag('green')} className="w-6 h-6 rounded-full bg-green-600/70 hover:bg-green-600" />
    <button onClick={() => handleFlag('yellow')} className="w-6 h-6 rounded-full bg-yellow-500/70 hover:bg-yellow-500" />
    <button onClick={() => handleFlag('red')} className="w-6 h-6 rounded-full bg-red-600/70 hover:bg-red-600" />
</div>
```

## Key Features
1. Navigation Bar
   - Clear question progress display
   - Easy access to main sections
   - Consistent styling

2. Question Grid
   - Visual progress tracking
   - Color-coded answer status
   - Efficient pagination
   - Responsive layout

3. Flag System
   - Intuitive color coding
   - Quick access buttons
   - Visual feedback

4. Styling
   - Consistent color scheme
   - Responsive design
   - Clear visual hierarchy
   - Hover states for better UX
