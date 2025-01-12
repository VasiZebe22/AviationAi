# Questions Custom Hooks

## useQuestionImages.js
Manages optimized image loading and handling for questions and explanations.

Key responsibilities:
- Checks image availability flags before attempting to load
- Constructs image URLs based on question data
- Handles image loading states
- Provides error handling for failed image loads
- Returns appropriate image URLs for both question and explanation views

Implementation details:
- Takes current question data and active tab as inputs
- Uses has_question_image and has_explanation_image flags to optimize loading
- Only attempts to load images when they are flagged as available
- Clears image URLs when images are not available
- Returns object with questionImageUrl and explanationImageUrl
- Implements error boundaries for image loading failures

Performance optimizations:
- Avoids unnecessary Firebase Storage requests
- Only loads images when tab is active and image exists
- Immediate feedback when no images are available
- Reduces network traffic and latency

## useQuestionNavigation.js
Manages keyboard navigation and shortcuts for the Questions feature.

Key responsibilities:
- Handles keyboard event listeners
- Implements navigation shortcuts (next/previous question)
- Manages tab switching shortcuts
- Provides flagging shortcuts
- Handles answer selection via keyboard

Implementation details:
- Uses React's useEffect for event listener management
- Implements cleanup to prevent memory leaks
- Provides consistent navigation experience
- Handles multiple keyboard shortcut combinations
- Prevents default browser shortcuts when needed

## useTimer.js
Manages the timer functionality for question sessions.

Key responsibilities:
- Tracks elapsed time
- Provides formatted time display
- Handles timer start/stop/reset
- Manages timer persistence
- Provides timer controls

Implementation details:
- Uses setInterval for time tracking
- Provides formatted time string
- Handles timer state persistence
- Manages cleanup on unmount
- Provides pause/resume functionality

## State Management Patterns

The hooks follow these common patterns:
1. **Encapsulation**
   - Each hook encapsulates specific functionality
   - Provides clean interfaces to components
   - Handles its own cleanup

2. **Performance Optimization**
   - Uses useCallback for function memoization
   - Implements useMemo for expensive calculations
   - Minimizes unnecessary re-renders

3. **Error Handling**
   - Implements try/catch blocks
   - Provides error states
   - Handles edge cases gracefully

4. **Cleanup**
   - Properly removes event listeners
   - Clears intervals/timeouts
   - Prevents memory leaks

5. **State Updates**
   - Uses functional updates for state changes
   - Handles race conditions
   - Maintains state consistency
