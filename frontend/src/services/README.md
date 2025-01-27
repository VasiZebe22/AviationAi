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
│   └── analyticsService.js    # Statistics and metrics
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

## Future Considerations

1. **Potential Expansions**:
   - Additional analytics services
   - More specialized test types
   - Enhanced user data features

2. **Performance Optimizations**:
   - Caching strategies
   - Query optimizations
   - Batch operations

3. **Security Enhancements**:
   - Additional validation
   - Rate limiting
   - Access control