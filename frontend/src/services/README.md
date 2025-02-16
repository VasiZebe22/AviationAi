# Services Architecture Documentation

## Overview
This document outlines the restructuring of the services layer in our application, specifically the split of the original `questionService.js` into multiple focused services.

## Directory Structure
```
frontend/src/services/
├── auth/
│   └── authService.js         # Authentication-related utilities
├── questions/
│   ├── questionService.js     # Core question operations
│   ├── progressService.js     # Progress tracking
│   └── userDataService.js     # User-specific data (notes, flags)
├── tests/
│   └── testService.js         # Test management and results
├── analytics/
│   ├── core/                  # Core analytics functionality
│   ├── transformers/          # Data transformation logic
│   ├── services/             # Analytics services
│   └── index.js              # Analytics service exports
├── utils/
│   └── firebaseUtils.js       # Shared Firebase utilities
└── index.js                   # Main export file
```

## Service Responsibilities

### 1. Auth Service (authService.js)
- User authentication state management
- Current user information

### 2. Question Service (questionService.js)
Core question operations:
- Fetching questions by category
- Fetching questions by subcategory
- Getting individual questions
- Basic question management

### 3. Progress Service (progressService.js)
Progress tracking functionality:
- Updating user progress
- Calculating skill scores
- Managing progress data
- Progress reset capabilities

### 4. Test Service (testService.js)
Test-related operations:
- Saving test states
- Managing saved tests
- Handling test results
- Test history tracking

### 5. Analytics Service (analyticsService.js)
Statistics and metrics:
- Basic stats calculation
- Monthly progress tracking
- Study time analytics
- Dashboard statistics
- Skills analysis with category handling:
  - Accuracy, speed, consistency, retention metrics
  - Category-based skill breakdown
  - Graceful handling of uncategorized items
  - Detailed performance tracking

### 6. User Data Service (userDataService.js)
User-specific data management:
- Flag management
- Notes management
- User preferences

### 7. Firebase Utils (firebaseUtils.js)
Shared utilities:
- Firebase error handling
- Common Firebase operations
- Shared helper functions

## Implementation Details

### Export Pattern
All services use named exports for better tree-shaking and module organization:
```javascript
// Service implementation
export const serviceName = {
    // service methods
};

// Usage
import { serviceName } from '../services/path/serviceName';
```

### Firebase Integration
Each service properly integrates with Firebase using:
- Imported Firestore operations (collection, query, doc, etc.)
- Shared Firebase utilities from firebaseUtils.js
- Proper batch operations using writeBatch
- Consistent error handling with default values
- Common database operations through db_operations utility

### Function Distribution
Each service maintains clear boundaries while working together:

1. **Question Service**:
   - getQuestionsByCategory()
   - getQuestionsBySubcategory()
   - getQuestion()

2. **Progress Service**:
   - updateProgress()
   - calculateSkillScores()
   - getSkillScores()
   - resetAllProgress()

3. **Test Service**:
   - saveTestState()
   - getSavedTest()
   - getSavedTests()
   - saveTestResults()
   - getTestHistory()
   - deleteSavedTest()

4. **Analytics Service**:
   - getBasicStats()
   - getMonthlyProgress()
   - getRecentStudyTime()
   - getDashboardStats()
   - resetStudyTime()
   - getSkillsAnalysis()
   - getCategoryPerformance()

5. **User Data Service**:
   - updateFlag()
   - getFlags()
   - saveNote()
   - getNotes()

## Usage Examples

### Previous Import Method:
```javascript
import questionService from '../services/questionService';
```

### New Import Methods:
```javascript
// Option 1: Import specific services
import { questionService, progressService } from '../services';

// Option 2: Import from specific service
import { questionService } from '../services/questions';
```

## Benefits of New Structure

1. **Improved Organization**:
   - Clear separation of concerns
   - Related functionality grouped together
   - Easier to locate specific features

2. **Better Maintainability**:
   - Smaller, focused files
   - Easier to understand and modify
   - Reduced complexity

3. **Enhanced Scalability**:
   - Easy to add new features
   - Clear structure for new services
   - Better organization for growing codebase

4. **Code Reusability**:
   - Shared utilities
   - Clear dependencies
   - Modular structure

## Migration Notes

When implementing these changes:
1. Maintain existing function signatures
2. Ensure backward compatibility
3. Update imports gradually
4. Test thoroughly after each change
5. Firebase Integration:
   - Update imports to use specific Firestore operations
   - Use writeBatch instead of db.batch()
   - Implement consistent error handling with default values
   - Utilize shared db_operations utilities
6. Export Pattern:
   - Convert to named exports
   - Update import statements in components
   - Maintain backward compatibility through index.js

## Future Considerations

1. **Potential Expansions**:
   - Additional analytics services
   - More specialized test types
   - Enhanced user data features
   - Advanced skills analysis features

2. **Performance Optimizations**:
   - Caching strategies
   - Query optimizations
   - Batch operations
   - Analytics data aggregation

3. **Security Enhancements**:
   - Additional validation
   - Rate limiting
   - Access control
   - Data integrity checks