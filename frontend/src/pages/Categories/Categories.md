# Categories Component Documentation

## Overview
The Categories component is a crucial part of the Aviation AI application, responsible for displaying and managing ATPL (Airline Transport Pilot License) question categories. It provides an interactive interface for users to select study materials and track their progress across different aviation subjects.

## File Structure
```
frontend/src/pages/Categories/
├── Categories.js    # Main component implementation
├── index.js        # Export file
└── Categories.md   # Documentation (this file)
```

## Component Features

### 1. Study Modes
- **Study Mode**: For practice and learning
- **Exam Mode**: For test simulation
- Mode selection affects how questions are presented and scored

### 2. Question Filtering System
The component implements comprehensive filtering options:
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

### State Management
```javascript
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

#### `handleQuestionTypeChange(type)`
- Manages question type filter changes
- Ensures mutually exclusive selection

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
- Various UI components (CategoryCard, SavedTestsModal, Navbar)

## Best Practices
1. **State Management**
   - Uses React hooks for efficient state management
   - Implements loading states for better UX
   - Handles errors gracefully

2. **Performance**
   - Implements efficient filtering mechanisms
   - Uses async operations for data fetching
   - Optimizes re-renders with proper state structure

3. **User Experience**
   - Provides clear visual feedback
   - Implements intuitive navigation
   - Shows loading states during operations

4. **Code Organization**
   - Follows component-based architecture
   - Implements clear separation of concerns
   - Uses meaningful naming conventions

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
