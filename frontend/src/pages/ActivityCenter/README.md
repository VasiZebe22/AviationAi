# Activity Center

## Overview
The Activity Center is a comprehensive dashboard that provides users with access to their learning activities, practice tests, study materials, and more. It features a modular, component-based architecture designed for maintainability and scalability.

## Directory Structure
```
frontend/src/pages/ActivityCenter/
├── ActivityCenter.js          # Main container component
├── components/               # UI components
│   ├── ActivitySidebar.js    # Left navigation sidebar
│   ├── ActivityTabs.js       # Subcategory tabs
│   ├── ActivityContent.js    # Main content area
│   └── cards/               # Card components for different item types
│       ├── SavedTestCard.js  # Saved test item display
│       └── FinishedTestCard.js # Completed test item display
├── hooks/                   # Custom React hooks
│   ├── useActivityData.js    # Data fetching and state management
│   └── useTestActions.js     # Test-related actions
└── utils/                   # Utility functions
    ├── formatters.js         # Time and data formatting utilities
    ├── categoryUtils.js      # Category/subcategory handling
    └── testUtils.js          # Test-specific utilities
```

## Features

### 1. Practice Tests & Exams
- View and manage saved tests
- Track completed tests and performance
- Continue partially completed tests
- Delete saved tests
- View detailed test statistics

### 2. Study Materials
- Access educational resources
- Browse categorized learning materials
- Track recently viewed materials

### 3. Flagged Questions
- View questions marked for review
- Filter by flag priority (Green, Yellow, Red)
- Track question categories

### 4. AI Chat History
- Access saved chat conversations
- View bookmarked messages
- Track discussion topics

## Components

### ActivityCenter.js
Main container component that orchestrates the entire feature. It:
- Manages global state through hooks
- Handles error states
- Coordinates between sidebar and content area
- Manages navigation between different sections

### ActivitySidebar
Navigation component that:
- Displays main category options
- Handles category selection
- Shows active state for current category
- Uses icons for visual recognition

### ActivityTabs
Subcategory navigation that:
- Shows relevant subcategories for current main category
- Manages subcategory selection
- Provides visual feedback for active state

### ActivityContent
Main content display that:
- Renders appropriate content for selected category
- Manages grid layout for items
- Handles different item types with specific cards

### Card Components
#### SavedTestCard
Displays saved test information:
- Test name and category
- Progress indicator
- Completion status
- Continue and delete actions
- Subcategory information

#### FinishedTestCard
Shows completed test results:
- Test name and category
- Success rate
- Pass/Fail status
- Completion date
- Detailed statistics

## Hooks

### useActivityData
Manages the application's data and state:
- Fetches saved and completed tests
- Manages category/subcategory selection
- Handles loading and error states
- Provides activity categories data
- Manages test data transformations

### useTestActions
Handles test-related operations:
- Continue test functionality
- Delete test operations
- Navigation to test pages
- Error handling for test actions

## Utilities

### formatters.js
Provides formatting functions:
- Time formatting (relative time)
- Progress calculation
- Success rate formatting
- Test status determination

### categoryUtils.js
Handles category-related operations:
- Category name resolution
- Subcategory mapping
- Category validation

### testUtils.js
Manages test-specific operations:
- Test navigation state preparation
- Test data mapping for display
- Test validation and processing

## Usage

### Basic Implementation
```jsx
import ActivityCenter from './pages/ActivityCenter/ActivityCenter';

function App() {
  return <ActivityCenter />;
}
```

### State Management
The Activity Center uses React's built-in state management through hooks. All state is managed at the appropriate level and passed down through props.

### Error Handling
Comprehensive error handling is implemented at multiple levels:
- API call errors in hooks
- User action error handling
- UI feedback for errors
- Graceful degradation

### Styling
The component uses Tailwind CSS for styling with:
- Responsive design
- Dark mode support
- Consistent color scheme
- Hover and active states
- Smooth transitions

## Future Enhancements
The modular architecture allows for easy addition of:
- New activity types
- Additional card layouts
- Enhanced filtering options
- Advanced analytics
- Performance optimizations

## Contributing
When adding new features:
1. Follow the established component structure
2. Create appropriate utility functions
3. Implement proper error handling
4. Add necessary documentation
5. Maintain consistent styling

## Dependencies
- React
- React Router DOM
- Heroicons
- Tailwind CSS