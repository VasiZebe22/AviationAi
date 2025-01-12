# Questions Components

## QuestionContent.js
Responsible for rendering the main question content including:
- Question text
- Question image (if present)
- Answer options
- Answer selection handling
- Correct/incorrect answer indication

Key responsibilities:
- Renders question text with proper formatting
- Handles image display and error states
- Manages answer option display and selection
- Shows correct/incorrect feedback after answering
- Maintains consistent styling across different question types

## QuestionControls.js
Handles navigation and question management:
- Next/Previous question buttons
- Flag controls (red, yellow, green)
- Navigation shortcuts

Key responsibilities:
- Provides intuitive navigation between questions
- Manages question flagging system
- Ensures smooth user experience with keyboard shortcuts
- Updates question status in the backend

## QuestionExplanation.js
Displays the explanation for questions:
- Explanation text
- Explanation image (if present)
- Formatting and styling of explanation content

Key responsibilities:
- Renders explanation text with proper formatting
- Handles explanation image display
- Maintains consistent styling with question content
- Provides clear visual separation from question content

## QuestionGrid.js
Provides an overview of all questions:
- Grid layout of question numbers
- Question status indicators (answered/unanswered)
- Current question highlighting
- Flag status display
- Pagination controls

Key responsibilities:
- Displays 100 questions per page in a 10x10 grid
- Shows question status through visual indicators
- Enables quick navigation to any question
- Manages pagination for large question sets
- Reflects flag status for each question

## QuestionNotes.js
Manages the notes functionality:
- Note input interface
- Note saving/updating
- Note display
- Auto-save functionality

Key responsibilities:
- Provides text area for note input
- Handles note persistence to backend
- Manages auto-save functionality
- Shows save status indicators
- Maintains note state across sessions

## QuestionTabs.js
Controls the tab navigation between:
- Question view
- Explanation view
- Notes view

Key responsibilities:
- Manages tab state and switching
- Provides visual feedback for active tab
- Ensures smooth transition between views
- Maintains tab state during navigation
