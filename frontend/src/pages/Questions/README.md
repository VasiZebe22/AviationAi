# Questions Module

## Overview
The Questions module is a core component of AviationAI, handling question display and interaction for both Study and Exam modes. The module is designed following SOLID, KISS, DRY, and YAGNI principles to ensure maintainability and extensibility.

## Modes

### Study Mode
- **Interactive Learning**: Immediate feedback on answers
- **Detailed Explanations**: Access to explanations and learning materials
- **Notes System**: Ability to add and save personal notes
- **Flagging System**: Mark questions with different flags based on confidence level

### Exam Mode
- **Simulated Exam Environment**: Follows official EASA ATPL(A) specifications
- **Timed Tests**: Category-specific time limits as per EASA requirements
- **No Feedback**: No access to explanations or correct answers until exam completion
- **Auto-submission**: Automatically submits when time expires
- **Consistent UI**: Maintains the same user interface structure as Study mode for seamless experience

## Component Structure

### Core Components
- `Questions.js`: Main component for Study mode
- `ExamQuestions.js` (in `../ExamQuestions/`): Main component for Exam mode, shares the same UI structure as Questions
- `Results.js` (in `../Results/`): Displays test results for both modes

### UI Components
- `QuestionContent.js`: Renders question text and answer options (shared between Study and Exam modes)
- `QuestionExplanation.js`: Displays explanations (Study mode only)
- `QuestionNotes.js`: Interface for adding and viewing notes (Study mode only)
- `QuestionTabs.js`: Tab navigation between question, explanation, etc.
- `QuestionGrid.js`: Visual grid of question numbers with status indicators (shared between Study and Exam modes)
- `QuestionControls.js`: Navigation controls between questions (Study mode only)

### Hooks
- `useQuestionImages.js`: Manages loading and error handling for question images
- `useQuestionNavigation.js`: Handles keyboard shortcuts for navigation
- `useTimer.js`: Manages timer functionality for both modes

## Data Flow
1. User selects a category and mode (Study/Exam) from Categories page
2. Based on mode, routes to either Questions or ExamQuestions
3. Component fetches questions directly from Firebase using questionService, following DRY principles
4. User navigates through questions and submits answers
5. On completion, results are calculated and displayed in Results page

## EASA Exam Specifications
The Exam mode implements the official EASA ATPL(A) exam structure:

| Subject | Questions | Time (minutes) |
|---------|-----------|----------------|
| Air Law | 44 | 60 |
| Aircraft General Knowledge | 80 | 120 |
| Instrumentation | 60 | 90 |
| Mass and Balance | 25 | 60 |
| Performance | 35 | 120 |
| Flight Planning and Monitoring | 43 | 120 |
| Human Performance | 48 | 60 |
| Meteorology | 84 | 120 |
| General Navigation | 60 | 120 |
| Radio Navigation | 66 | 90 |
| Operational Procedures | 45 | 75 |
| Principles of Flight | 44 | 60 |
| Communications | 34 | 60 |

## Configuration
Exam settings are stored in `frontend/src/data/examConfig.js` with subject-specific parameters:
- Number of questions
- Time allocation in minutes
- Passing percentage (75%)

## Implementation Notes

### Study Mode Features
- Question filtering (annexes, flagged, incorrectly answered)
- Progress saving and tracking
- Flag questions for review (red, yellow, green)
- Add personal notes to questions

### Exam Mode Features
- Countdown timer based on exam specifications
- Question count matching official exams
- Navigation grid to track answered questions
- Submit button available when all questions answered
- Results display with exam-specific tag
- Consistent UI with study mode for improved user experience
- Direct Firebase integration using the shared questionService

## Usage Examples

### Starting a Study Session
```javascript
// From Categories.js
navigate(`/questions/${categoryId}`, {
  state: {
    mode: 'study',
    filters,
    selectedSubcategories: selectedSubcategories[categoryId] || []
  }
});
```

### Starting an Exam
```javascript
// From Categories.js
navigate(`/exam-questions/${categoryId}`, {
  state: {
    mode: 'exam',
    filters,
    selectedSubcategories: selectedSubcategories[categoryId] || []
  }
});
```

### Displaying Results
```javascript
// From ExamQuestions.js
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
```
