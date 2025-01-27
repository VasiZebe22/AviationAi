// Import all services
import questionService from './questions/questionService';
import progressService from './questions/progressService';
import userDataService from './questions/userDataService';
import testService from './tests/testService';
import analyticsService from './analytics/analyticsService';

// Export individual services
export {
    questionService,
    progressService,
    userDataService,
    testService,
    analyticsService
};

// Export a combined service for backward compatibility
const combinedQuestionService = {
    ...questionService,
    ...progressService,
    ...userDataService,
    ...testService,
    ...analyticsService
};

// Default export for backward compatibility
export default combinedQuestionService;