# Categories Component Documentation

## Overview
The Categories component is a crucial part of the Aviation AI application, responsible for displaying and managing EASA ATPL(A) question categories. It provides an interactive interface for users to select study materials, track their progress across different aviation subjects, and choose between study and exam modes.

## File Structure
```
frontend/src/
├── components/
│   ├── CategoryCard/           # Individual category card display
│   │   ├── CategoryCard.js     # Card component with subcategory selection
│   │   └── index.js            # Export file
│   ├── FilterPanel/            # Filter options UI and logic
│   │   ├── FilterPanel.js      # Filter component implementation
│   │   └── index.js            # Export file
│   ├── ModeSelector/           # Study/Exam mode selection
│   │   ├── ModeSelector.js     # Mode selector implementation
│   │   └── index.js            # Export file
│   └── SavedTests/             # Modal for accessing saved tests
├── data/
│   ├── categoryData.js         # Centralized category definition data
│   └── examConfig.js           # Exam mode configuration (time limits, etc.)
├── pages/
│   ├── Categories/
│   │   ├── Categories.js       # Main component implementation
│   │   ├── index.js            # Export file
│   │   └── README.md           # Documentation (this file)
│   ├── Questions/              # Study mode question display
│   └── ExamQuestions/          # Exam mode question display
└── services/
    └── analytics/              # Analytics service for progress tracking
```

## Component Architecture

The Categories feature follows SOLID, KISS, DRY, and YAGNI principles to improve maintainability and code organization:

1. **Single Responsibility Principle (SRP)**:
   - `Categories.js`: Main page orchestration and layout
   - `FilterPanel.js`: Handles all filtering UI and logic
   - `ModeSelector.js`: Manages study/exam mode selection
   - `CategoryCard.js`: Manages individual category display and interaction
   - `categoryData.js`: Stores and exports category data

2. **Code Organization Benefits**:
   - Improved maintainability with smaller, focused components
   - Better separation of concerns
   - Enhanced reusability of components
   - Cleaner, more readable code

## Data Flow & State Management

### Category Data Source
- Categories are defined in `frontend/src/data/categoryData.js`
- Each category has:
  - `id`: Standardized EASA ID format (e.g., '010' for Air Law)
  - `title`: Display name
  - `description`: Brief content explanation
  - `image`: Path to category illustration
  - `subcategories`: Array of subcategories with codes and names

### User Progress Data
- Progress data is fetched from Firebase via `analyticsService.getBasicStats()`
- The component tracks:
  - Total questions per category
  - Attempted questions
  - Correctly answered questions
  - Completion percentage

### Component State
The Categories component maintains several state variables:
- `loading`: Tracks API loading state
- `error`: Stores any error messages
- `userProgress`: Stores progress data from Firebase
- `mode`: Tracks selected mode (study/exam)
- `selectedSubcategories`: Stores user's subcategory selections
- `filters`: Stores filter settings for questions

## Key Features

### 1. Mode Selection
- **Study Mode**: For practice and learning
- **Exam Mode**: For timed test simulation
- Mode selection affects navigation target (Questions vs ExamQuestions)

### 2. Question Filtering
- Filter by question attributes (with/without annexes)
- Filter by user interaction (unseen, incorrectly answered)
- Filter by flag color (green, yellow, red)
- Option to show or hide correct answers

### 3. Subcategory Selection
- Each category displays its subcategories
- Users can select specific subcategories to study
- Selections are passed to the Questions/ExamQuestions components

### 4. Progress Tracking
- Visual progress indicators
- Numerical completion statistics (X/Y questions)
- Data is dynamically updated from Firebase

## Integration with Firebase/Firestore

The Categories component integrates with Firebase in several ways:

1. **Progress Data**: 
   - Uses `analyticsService.getBasicStats()` to fetch user progress
   - Data is structured by category ID in Firestore
   - Format: `{ byCategory: { '010': { total, attempted, correct }, ... } }`

2. **Question Data**:
   - Questions are stored in Firestore with category and subcategory IDs
   - Categories match standardized EASA ATPL(A) subjects (010-090)
   - When a category is selected, relevant questions are retrieved

## Important Notes

1. **Category ID System**:
   - The application uses a standardized category ID system:
   - "010": Air Law
   - "021": Airframe and Systems
   - "022": Instrumentation
   - "031": Mass and Balance
   - "032": Performance
   - "033": Flight Planning
   - "040": Human Performance
   - "050": Meteorology
   - "061": General Navigation
   - "062": Radio Navigation
   - "070": Operational Procedures
   - "081": Principles of Flight
   - "090": Communications

2. **Navigation Pattern**:
   - When a category is selected, the app navigates to:
     - `/questions/:categoryId` for study mode
     - `/exam-questions/:categoryId` for exam mode
   - Navigation includes state data (filters, subcategories)

## Usage Example

```javascript
// Navigation to Questions with state
navigate(`/questions/${categoryId}`, {
  state: {
    mode,
    filters,
    selectedSubcategories: selectedSubcategories[categoryId] || []
  }
});
```

## Maintenance Notes

- When adding new categories, update `categoryData.js` following the established format
- Ensure corresponding entries exist in Firestore and `examConfig.js`
- The component dynamically handles new categories without code changes
- All 13 EASA ATPL(A) standard categories (010-090) should be included
