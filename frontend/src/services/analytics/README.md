# Analytics Service Documentation

## Overview
The Analytics Service provides comprehensive analytics functionality for tracking and analyzing user progress in the Aviation AI application. It follows SOLID principles, maintains code simplicity (KISS), avoids unnecessary features (YAGNI), and eliminates code duplication (DRY).

## Architecture
The service is organized into a modular structure:

```
analytics/
├── core/
│   ├── CacheManager.js         - Centralized caching logic
│   └── FirestoreAdapter.js     - Database operations
├── transformers/
│   ├── BasicStatsTransformer.js - Data transformation for basic stats
│   ├── TimeSeriesTransformer.js - Time-series data processing
│   └── SkillsTransformer.js     - Skills analysis and categorization
├── services/
│   ├── BaseAnalyticsService.js  - Common service functionality
│   └── AnalyticsService.js      - Main analytics service
└── index.js                     - Public API
```

## Core Components

### CacheManager
Handles all caching operations with consistent interface:
- `get(key)`: Retrieve cached data
- `set(key, data)`: Store data in cache
- `generateKey(userId, type)`: Generate cache keys
- `invalidate(userId, types)`: Invalidate specific cache entries

### FirestoreAdapter
Abstracts all Firestore database operations:
- `getUserProgress(userId)`: Fetch user progress data
- `getAllQuestions()`: Fetch all available questions
- `getRecentProgress(userId, startDate)`: Fetch recent progress
- `batchUpdateStudyTime(userId, updates)`: Update study time in batch

## Data Transformers

### BasicStatsTransformer
Transforms raw data into basic statistics:
- Question counts
- Correct/incorrect answers
- Category-wise performance

### TimeSeriesTransformer
Handles time-based data processing:
- Monthly progress aggregation
- Study time calculations
- Category-wise temporal analysis

### SkillsTransformer
Processes and analyzes user skills data:
- Calculates skill metrics (accuracy, speed, consistency, retention)
- Handles category-based skill analysis
- Gracefully manages missing category information:
  - Uses 'UNKNOWN' category code for uncategorized items
  - Assigns 'Uncategorized' as default category name
  - Maintains data integrity with proper validation
  - Provides detailed logging for debugging
- Sorts skills breakdown with categorized items before uncategorized ones

## Services

### BaseAnalyticsService
Provides common functionality:
- Authentication checks
- Caching operations
- Error handling
- Safe responses

### AnalyticsService
Main service implementing core analytics features:
- `getBasicStats()`: Basic performance statistics
- `getMonthlyProgress()`: 6-month progress data
- `getRecentStudyTime()`: 7-day study time analysis
- `resetStudyTime()`: Reset study time stats
- `getDashboardStats()`: Combined dashboard statistics
- `getUserProgress(userId)`: Comprehensive user progress including all stats
- `refreshUserProgress(userId)`: Force refresh user progress data

## Usage Examples

```javascript
// Import the service
import { analyticsService } from './services/analytics';

// Get basic statistics
const stats = await analyticsService.getBasicStats();

// Get comprehensive user progress
const progress = await analyticsService.getUserProgress(userId);

// Force refresh user progress
const freshProgress = await analyticsService.refreshUserProgress(userId);

// Get dashboard data
const dashboard = await analyticsService.getDashboardStats();

// Reset study time
await analyticsService.resetStudyTime();
```

## Data Structures

### User Progress Data
```javascript
{
    // Basic stats
    totalQuestions: number,
    totalAttempted: number,
    correctAnswers: number,
    incorrectAnswers: number,
    byCategory: {
        [categoryCode: string]: {
            name: string,
            total: number,
            attempted: number,
            correct: number
        }
    },
    
    // Monthly progress
    monthlyProgress: {
        months: Array<{
            month: string,
            total: number,
            correct: number,
            incorrect: number,
            byCategory: Array<{
                code: string,
                name: string,
                correct: number,
                incorrect: number
            }>
        }>,
        categories: Array<{
            code: string,
            name: string
        }>
    },
    
    // Study time
    studyTime: {
        labels: string[],  // Day names (Sun-Sat)
        data: number[]     // Minutes per day, rounded up to nearest minute
    },
    
    // Performance summary
    performance: {
        correct: number,
        incorrect: number
    },

    // Skills analysis
    skills: {
        overall: {
            accuracy: number,
            speed: number,
            consistency: number,
            retention: number
        },
        byCategory: Array<{
            code: string,
            name: string,
            accuracy: number,
            speed: number,
            consistency: number,
            retention: number
        }>
    }
}
```

## Error Handling
All service methods include proper error handling:
- Authentication errors
- Database operation failures
- Cache-related issues
- Data transformation errors

## Caching Strategy
The service implements a smart caching strategy:
1. Check cache before database queries
2. Cache results for frequent operations
3. Provide refresh methods for force-updating data
4. Automatic cache invalidation when needed

## Security Considerations
- All operations require user authentication
- Firestore security rules must be configured
- Sensitive data is not cached
- Rate limiting on database operations

## Best Practices
1. Always use the provided service methods instead of direct database access
2. Handle potential errors in consuming components
3. Use refresh methods when real-time data is critical
4. Consider performance implications of frequent refreshes

## Contributing
When adding new features:
1. Follow existing patterns and principles
2. Add appropriate documentation
3. Consider caching implications
4. Maintain backward compatibility
5. Add error handling

## Future Improvements
1. Add data export capabilities
2. Implement more advanced analytics
3. Add real-time updates
4. Enhance performance monitoring
