# Question Service Documentation

## Overview
The Question Service is a core service that handles all question-related operations in the application. It provides a comprehensive interface for interacting with the Firestore database, managing questions, user progress, notes, and statistics.

## Service Structure

### Dependencies
```javascript
import { db, auth } from './firebase';
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    doc, 
    updateDoc, 
    getDoc, 
    addDoc, 
    orderBy, 
    limit 
} from 'firebase/firestore';
```

## Core Functions

### Question Retrieval

#### Get Questions by Category
```javascript
async getQuestionsByCategory(categoryCode, filters = {})
```
- **Purpose**: Retrieves questions filtered by category and optional filters
- **Parameters**:
  - `categoryCode`: Category identifier
  - `filters`: Optional filters object
    - `markedQuestions`: Filter for marked questions
    - `unseenQuestions`: Filter for unseen questions
    - `incorrectlyAnswered`: Filter for incorrectly answered questions
- **Authentication**: Requires user authentication
- **Returns**: Array of question objects sorted by creation date

#### Get Questions by Subcategory
```javascript
async getQuestionsBySubcategory(subcategoryCode)
```
- **Purpose**: Retrieves questions for a specific subcategory
- **Parameters**:
  - `subcategoryCode`: Subcategory identifier
- **Authentication**: Requires user authentication
- **Returns**: Array of question objects sorted by creation date

#### Get Single Question
```javascript
async getQuestion(questionId)
```
- **Purpose**: Retrieves a single question by ID
- **Parameters**:
  - `questionId`: Question identifier
- **Returns**: Single question object with its data
- **Error Handling**: Throws error if question not found

### Progress Management

#### Update Progress
```javascript
async updateProgress(questionId, isCorrect)
```
- **Purpose**: Updates user progress for a specific question
- **Parameters**:
  - `questionId`: Question identifier
  - `isCorrect`: Boolean indicating if answer was correct
- **Functionality**:
  - Creates/updates progress document
  - Stores user-specific data
  - Tracks attempts and last attempt date
  - Maintains category and subcategory information
- **Authentication**: Requires user authentication

### User Interaction

#### Update Flag
```javascript
async updateFlag(questionId, flag)
```
- **Purpose**: Updates flag status for a question
- **Parameters**:
  - `questionId`: Question identifier
  - `flag`: Flag value to set
- **Authentication**: Requires user authentication

#### Save Note
```javascript
async saveNote(questionId, note)
```
- **Purpose**: Saves or updates a user's note for a question
- **Parameters**:
  - `questionId`: Question identifier
  - `note`: Note content
- **Functionality**:
  - Creates new note if doesn't exist
  - Updates existing note if present
  - Tracks creation and update timestamps
- **Authentication**: Requires user authentication

### Statistics

#### Get User Statistics
```javascript
async getUserStats()
```
- **Purpose**: Retrieves comprehensive user statistics
- **Returns**: Statistics object containing:
  - Total questions attempted
  - Correct/incorrect answer counts
  - Category-wise statistics
  - Subcategory-wise statistics
- **Authentication**: Requires user authentication

## Data Structures

### Question Object
```javascript
{
    id: string,
    category: {
        code: string,
        name: string
    },
    subcategories: [{
        code: string,
        name: string
    }],
    question: string,
    options: {
        A: string,
        B: string,
        C: string,
        D: string
    },
    correct_answer: string,
    explanation: string,
    created_at: timestamp
}
```

### Progress Object
```javascript
{
    userId: string,
    questionId: string,
    isCorrect: boolean,
    isSeen: boolean,
    lastAttempted: timestamp,
    attempts: number,
    category: {
        code: string,
        name: string
    },
    subcategories: [{
        code: string,
        name: string
    }]
}
```

### Statistics Object
```javascript
{
    totalQuestions: number,
    correctAnswers: number,
    incorrectAnswers: number,
    byCategory: {
        [categoryCode]: {
            name: string,
            total: number,
            correct: number
        }
    },
    bySubcategory: {
        [subcategoryCode]: {
            name: string,
            total: number,
            correct: number
        }
    }
}
```

## Security Considerations
1. Authentication required for all operations
2. User-specific data isolation
3. Proper error handling and logging
4. Firestore security rules enforcement

## Error Handling
- Authentication errors
- Database configuration errors
- Document not found errors
- Permission errors
- General error logging and propagation

## Best Practices
1. Consistent error handling pattern
2. Authentication checks before operations
3. Proper data validation
4. Efficient query construction
5. Comprehensive logging for debugging
6. Transaction usage for data integrity
7. Proper timestamp handling
