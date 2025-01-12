# Questions Feature Overview

The Questions feature is organized following a feature-first architecture pattern, with all related components and hooks contained within the feature directory.

## Directory Structure
```
frontend/src/pages/Questions/
├── Questions.js              # Main container component
├── components/              # Feature-specific components
│   ├── QuestionContent.js   # Renders question text and options
│   ├── QuestionControls.js  # Navigation and flag controls
│   ├── QuestionExplanation.js # Explanation view
│   ├── QuestionGrid.js      # Question number grid
│   ├── QuestionNotes.js     # Notes functionality
│   └── QuestionTabs.js      # Tab navigation
└── hooks/                   # Feature-specific hooks
    ├── useQuestionImages.js # Image handling logic
    ├── useQuestionNavigation.js # Keyboard navigation
    └── useTimer.js          # Timer functionality
```

## Architecture Decisions

1. **Feature-First Organization**
   - All components and hooks specific to the Questions feature are contained within the feature directory
   - This promotes encapsulation and maintainability
   - Makes the feature self-contained and easier to understand

2. **Component Separation**
   - Components are split based on distinct responsibilities
   - Each component handles a specific aspect of the question interface
   - Promotes single responsibility principle and maintainability

3. **Custom Hooks**
   - Complex logic is extracted into custom hooks
   - Promotes reusability within the feature
   - Makes the main component cleaner and more focused on composition

4. **State Management**
   - Main state is managed in Questions.js
   - Passed down to child components via props
   - Complex state logic extracted into hooks where appropriate

## Key Features
- Question display and navigation
- Answer selection and validation
- Timer functionality
- Question flagging system
- Notes system
- Grid-based question overview
- Keyboard navigation support
- Optimized image handling with availability flags
