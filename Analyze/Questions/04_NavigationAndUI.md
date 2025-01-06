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

## Question Display

### Question Content
```javascript
<div className="flex-1 bg-surface-dark/50 rounded-lg p-6">
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
                    {getQuestionText(currentQuestionData)}
                </div>
                <div className="space-y-3">
                    {getQuestionOptions(currentQuestionData).map(({ label, text }) => (
                        <button
                            key={label}
                            onClick={() => handleAnswerSelect(text)}
                            disabled={answeredQuestions[currentQuestionData.id]}
                            className={`w-full p-3 text-left rounded ${getOptionStyle(currentQuestionData, text)}`}
                        >
                            <span className="font-semibold mr-2">{label}.</span>
                            {text}
                        </button>
                    ))}
                </div>
            </div>
        )}
    </div>
</div>
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
                className={getQuestionButtonStyle(questionNumber)}
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
   - Question ID display

2. Question Display
   - Tabbed interface for content organization
   - Enhanced option display with labels
   - Support for both question formats
   - Learning materials integration

3. Question Grid
   - Visual progress tracking
   - Color-coded answer status
   - Efficient pagination
   - Responsive grid layout

4. UI Components
   - Modern, clean design
   - Consistent color scheme
   - Responsive layout
   - Accessibility features
