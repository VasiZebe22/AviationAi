// Navigation state for continuing a test
export const getTestNavigationState = (test) => ({
    mode: test.mode,
    filters: test.filters,
    selectedSubcategories: test.selectedSubcategories,
    savedTestId: test.id,
    savedTestData: {
        currentQuestion: test.currentQuestion,
        timer: test.timer,
        answeredQuestions: test.answeredQuestions
    }
});

// Map test data for display
export const mapSavedTestForDisplay = (test, { getCategoryName, getRelativeTime, getProgress, getAnsweredCount, getSubcategoryNames }) => ({
    name: getCategoryName(test.categoryId),
    date: getRelativeTime(test.savedAt),
    progress: getProgress(test),
    questionsCompleted: getAnsweredCount(test),
    type: 'Saved Tests',
    originalTest: test,
    subcategories: getSubcategoryNames(test)
});

export const mapFinishedTestForDisplay = (test, { getCategoryName, getRelativeTime, formatSuccessRate, getTestStatus, getSubcategoryNames }) => ({
    id: test.id,
    name: getCategoryName(test.categoryId),
    subcategories: getSubcategoryNames(test),
    questionsCompleted: test.totalQuestions,
    successRate: formatSuccessRate(test.score, test.totalQuestions),
    status: getTestStatus(test.score, test.totalQuestions),
    date: getRelativeTime(test.completedAt),
    type: 'Finished Tests',
    // Add all the data needed for Results page
    score: test.score,
    totalQuestions: test.totalQuestions,
    timeTaken: test.timeTaken,
    categoryId: test.categoryId,
    questionResults: test.questionResults,
    filters: test.filters,
    selectedSubcategories: test.selectedSubcategories
});