# Questions Component Documentation

## Overview
The Questions component is a React-based interactive quiz/test interface for ATPL (Airline Transport Pilot License) questions. It provides a comprehensive interface for users to practice and test their knowledge of aviation-related topics.

## Component Structure

### State Management
- Uses React hooks (useState, useEffect, useCallback, useMemo) for efficient state management
- Manages multiple states including:
  - questions: Array of question objects
  - currentQuestion: Current question index
  - selectedAnswer: User's selected answer
  - timer: Test duration timer
  - flags: Question flagging system
  - notes: User notes for questions
  - answeredQuestions: Track answered questions
  - correctAnswers: Track correct/incorrect answers

### Key Features
1. Question Navigation
   - Arrow key navigation between questions
   - Grid-based question overview
   - Pagination system (100 questions per page)

2. Answer Management
   - Multiple choice answer selection (A, B, C, D format)
   - Support for both old and new question formats
   - Immediate feedback on correct/incorrect answers
   - Progress tracking with category and subcategory support

3. Study Tools
   - Question flagging system (green, yellow, red)
   - Note-taking capability
   - Enhanced explanation view with learning materials
   - Keyboard shortcuts

4. Test Management
   - Timer tracking
   - Test saving functionality
   - Test completion handling
   - Category and subcategory progress tracking

## File Organization
- Location: frontend/src/pages/Questions/Questions.js
- Total Lines: ~500
- Dependencies:
  - React and React Router
  - questionService
  - Categories component

## Component Files
1. [State and Initialization](./01_StateAndInitialization.md)
2. [Question Management](./02_QuestionManagement.md)
3. [User Interaction Handlers](./03_UserInteractionHandlers.md)
4. [Navigation and UI](./04_NavigationAndUI.md)
5. [Utility Functions](./05_UtilityFunctions.md)

## Security Considerations
- User authentication checks in place
- Secure API calls through questionService
- Protected routes and navigation

## Question Format Support
- Supports both legacy and new question formats:
  - Legacy: Array-based options with correct_answer
  - New: Map-based options (A, B, C, D) with category.code
- Maintains backward compatibility while supporting new features

## Image Support
- Automatic image handling based on question ID
- Images stored in `/figures` directory
- Naming convention:
  - Question images: `[question_id]_question_0.png`
  - Explanation images: `[question_id]_explanation_0.png`
- Graceful fallback for missing images
- Error handling for failed image loads
