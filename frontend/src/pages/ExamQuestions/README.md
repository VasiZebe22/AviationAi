# ExamQuestions Component

## Overview
The ExamQuestions component simulates EASA ATPL(A) aviation exams with timed tests. It provides an authentic examination environment following the official EASA standards for time limits and question counts across different aviation subjects.

## Main Features
- Simulates real EASA ATPL(A) exam conditions
- Timed examinations with automatic submission when time expires
- No immediate feedback until exam completion
- Customized question counts and time limits based on official EASA subject requirements
- Progress tracking with a question grid showing answered questions
- Keyboard navigation support

## Component Structure

### Dependencies
- **React Router:** For navigation between exam, results, and other pages
- **Firebase:** For data storage and retrieval
- **React Markdown:** For rendering questions with proper formatting

### Custom Hooks
1. **useQuestionImages**: 
   - Manages loading of question images from Firebase storage
   - Handles different image types (question images vs explanation images)
   - Provides error handling for image loading failures

2. **useTimer**:
   - Manages the countdown timer for the exam
   - Provides time formatting utilities
   - Handles exam auto-submission when time expires

3. **useQuestionNavigation**:
   - Implements keyboard navigation throughout the exam
   - Supports arrow keys for navigation between questions
   - Allows number key (1-4) shortcuts for answering multiple-choice questions

### Child Components
1. **QuestionContent**:
   - Renders the question text and answer options
   - Displays question images when available
   - Includes measurement tools for aviation diagrams
   - Handles answer selection logic

2. **QuestionGrid**:
   - Provides a grid view of all questions
   - Shows progress through color coding (answered vs. unanswered)
   - Supports pagination for exams with many questions

3. **QuestionControls**:
   - Provides navigation buttons for moving between questions
   - Includes question flagging functionality for review

### Data Flow
1. User selects a category from the practice page
2. ExamQuestions component loads and displays exam instructions
3. When started, the timer begins counting down
4. User navigates through questions, selecting answers
5. Progress is tracked but no feedback is given during the exam
6. When completed (either manually or via timeout), results are calculated
7. User is redirected to the results page with their score

## Exam Configuration
The component uses `examConfig.js` which defines:
- Number of questions per subject
- Time allocation in minutes per subject
- Passing percentage (standardized at 75% for all subjects)

All configurations follow the official EASA ATPL(A) exam structure for the respective subjects.

## Integration with Firebase
- Questions are fetched through the `questionService`
- Questions can be filtered by category and subcategories
- Images are loaded from Firebase Storage when needed

## Usage Guidelines
- The component is designed for exam simulation mode only
- For practice mode with immediate feedback, refer to other components
- No modifications to the timer or question count should be made as they follow EASA standards
