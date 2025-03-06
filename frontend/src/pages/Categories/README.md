# Categories Component Documentation

## Overview
The Categories component is a crucial part of the Aviation AI application, responsible for displaying and managing ATPL (Airline Transport Pilot License) question categories. It provides an interactive interface for users to select study materials and track their progress across different aviation subjects.

## File Structure
```
frontend/src/
├── components/
│   ├── FilterPanel/            # Filter options UI and logic
│   │   ├── FilterPanel.js      # Filter component implementation
│   │   └── index.js            # Export file
│   ├── ModeSelector/           # Study/Exam mode selection
│   │   ├── ModeSelector.js     # Mode selector implementation
│   │   └── index.js            # Export file
│   └── CategoryCard/           # Category card component
├── data/
│   └── categoryData.js         # Centralized category data
├── pages/
│   └── Categories/
│       ├── Categories.js       # Main component implementation
│       ├── index.js            # Export file
│       └── Categories.md       # Documentation (this file)
└── services/
    └── analytics/              # Analytics service for progress tracking
```

## Component Architecture

The Categories feature has been refactored following SOLID, KISS, DRY, and YAGNI principles to improve maintainability and code organization:

1. **Single Responsibility Principle (SRP)**:
   - `Categories.js`: Main page orchestration and layout
   - `FilterPanel.js`: Handles all filtering UI and logic
   - `ModeSelector.js`: Manages study/exam mode selection
   - `categoryData.js`: Stores and exports category data

2. **Code Organization Benefits**:
   - Improved maintainability with smaller, focused components
   - Better separation of concerns
   - Enhanced reusability of components
   - Cleaner, more readable code

## Component Features

### 1. Study Modes
- **Study Mode**: For practice and learning
- **Exam Mode**: For test simulation
- Mode selection affects how questions are presented and scored
- Implemented in the dedicated `ModeSelector` component

### 2. Question Filtering System
The component implements comprehensive filtering options through the `FilterPanel` component:
- Question Types:
  - All questions
  - Questions with annexes
  - Questions without annexes
- Special Filters:
  - Real exam questions
  - Review questions
  - Marked questions
  - Unseen questions
  - Incorrectly answered
  - Flag-based filtering (Green, Yellow, Red)
  - Option to show correct answers

### 3. Progress Tracking
- Tracks user progress for each category
- Displays completion percentages
- Shows attempted vs. total questions ratio

### 4. Category Structure
Each category contains:
- Unique identifier (e.g., '010' for Air Law)
- Title
- Description
- Associated image
- List of subcategories with codes and names
- Data centralized in `categoryData.js`

## Available Categories

1. **Air Law (010)**
   - International Law
   - Airworthiness
   - Personnel Licensing
   - And more...

2. **Airframe and Systems (021)**
   - System Design
   - Hydraulics
   - Flight Controls
   - And more...

3. **Instrumentation (022)**
   - Sensors and Instruments
   - Air Data Parameters
   - Gyroscopic Instruments
   - And more...

[... and 9 more categories]

## Key Components and Functions

### Main Categories Component
The main `Categories` component now focuses on:
- Orchestrating the overall page layout
- Managing shared state
- Handling navigation and progress tracking
- Integrating the specialized components

### FilterPanel Component
- Encapsulates all filtering logic and UI
- Manages question type selection
- Handles all filter checkbox interactions
- Can be reused in other parts of the application

### ModeSelector Component
- Manages the study/exam mode toggle
- Provides clear visual feedback on current mode
- Designed for potential reuse in other contexts

### State Management
```javascript
// In Categories.js
- loading: Tracks data loading state
- error: Stores error messages
- userProgress: Tracks user progress across categories
- mode: Controls study/exam mode
- selectedSubcategories: Manages selected subcategories
- filters: Manages question filtering options
```

### Main Functions

#### `fetchUserProgress()`
- Asynchronously fetches user progress statistics
- Updates progress state with completion percentages
- Handles error states

#### `handleCategoryStart(categoryId)`
- Initiates navigation to questions page
- Passes selected mode, filters, and subcategories

#### `getCategoryProgress(categoryId)`
- Calculates completion percentage for a category
- Returns percentage (0-100)

#### `handleSubcategoryChange(categoryId, subcategoryCode)`
- Manages subcategory selection/deselection
- Updates selected subcategories state

## UI Components

### Navigation Bar
- Implemented using `<Navbar />` component
- Provides consistent navigation across the application

### Category Cards
- Uses `<CategoryCard />` component
- Displays category information
- Shows progress statistics
- Provides subcategory selection

### Saved Tests Modal
- Implemented via `<SavedTestsModal />` component
- Manages saved test sessions
- Provides access to previous work

## Dependencies
- React (useState, useEffect)
- react-router-dom (useNavigate)
- analyticsService (for progress tracking)
- Various UI components (CategoryCard, SavedTestsModal, Navbar, FilterPanel, ModeSelector)

## Best Practices
1. **SOLID Principles**
   - Single Responsibility: Each component has one job
   - Open/Closed: Components can be extended without modification
   - Interface Segregation: Components expose only what's needed
   - Dependency Inversion: High-level components don't depend on details

2. **DRY (Don't Repeat Yourself)**
   - Common UI patterns extracted to reusable components
   - Shared data centralized in dedicated files
   - Utility functions designed for reuse

3. **KISS (Keep It Simple, Stupid)**
   - Components designed to be intuitive and straightforward
   - Clear naming conventions
   - Focused functionality

4. **YAGNI (You Aren't Gonna Need It)**
   - Only implemented what's currently needed
   - Avoided speculative features
   - Kept the codebase lean and maintainable

5. **Performance**
   - Implements efficient filtering mechanisms
   - Uses async operations for data fetching
   - Optimizes re-renders with proper state structure

6. **User Experience**
   - Provides clear visual feedback
   - Implements intuitive navigation
   - Shows loading states during operations

## Usage Example
```javascript
// Import the Categories component
import Categories from './pages/Categories';

// Use in a router or parent component
<Categories />
```

## Future Considerations
1. Implement caching for better performance
2. Add more detailed progress analytics
3. Enhance filter combinations
4. Add support for custom category groups
5. Implement offline mode support
