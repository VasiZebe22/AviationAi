# Dashboard Components

## Overview
The Dashboard system is a comprehensive UI implementation that provides users with an interactive interface to monitor their learning progress, manage their profile, and access various features of the aviation learning platform. It consists of multiple components that work together to create a cohesive user experience.

## File Structure
```
frontend/src/components/Dashboard/
├── charts/                    # Chart components for data visualization
├── DashboardCard.js          # Wrapper component for dashboard sections
├── ProfileSection.js         # User profile management component
├── QuestionsToReview.js      # Component showing questions needing review
├── RecentSavedTests.js       # Component displaying recent saved tests
└── StatItem.js               # Statistical item display component

frontend/src/pages/Dashboard/
└── Dashboard.js              # Main dashboard page component
```

## Components

### DashboardCard
A reusable card component that provides consistent styling and animation for dashboard sections.

**Features:**
- Animated entrance using Framer Motion
- Customizable header with title
- Optional settings menu for Learning Progress cards
- Support for progress reset functionality

**Usage:**
```jsx
<DashboardCard title="Profile" className="lg:col-span-2">
  <ProfileSection userData={userData} onSave={handleProfileUpdate} />
</DashboardCard>
```

### ProfileSection
Handles user profile management and display.

**Features:**
- Display/edit user information
- Password change functionality
- Form validation
- Loading states
- Error handling

### QuestionsToReview
Displays questions that need review based on incorrect answers.

**Features:**
- Shows count of incorrect answers
- Direct link to practice wrong answers
- Loading state handling
- Progress tracking

### RecentSavedTests
Shows the most recent saved tests with options to continue them.

**Features:**
- Displays up to 3 recent tests
- Shows progress for each test
- Provides continuation functionality
- Groups tests by category
- Relative timestamp display

### StatItem
A reusable component for displaying statistical information.

**Features:**
- Value and label display
- Optional trend indicator
- Consistent styling

## Key Features
1. **Progress Tracking**
   - Visual representation of learning progress
   - Performance metrics
   - Skills analysis
   - Study time tracking (in minutes, with non-zero times rounded up to at least 1 minute)

2. **User Management**
   - Profile editing
   - Password management
   - Session control

3. **Test Management**
   - Save and resume tests
   - Track test progress
   - Quick access to recent tests

4. **Data Visualization**
   - Learning overview charts
   - Performance charts
   - Skills analysis charts
   - Study time visualization (displays daily study time in minutes, with any non-zero time rounded up to at least 1 minute)

## Dependencies
- React
- Framer Motion (for animations)
- Chart.js (for data visualization)
- Tailwind CSS (for styling)
- Firebase (for authentication and data storage)

## Services Integration
The dashboard components integrate with several services:
- `analyticsService` - For tracking user progress and statistics
- `progressService` - For managing learning progress
- `testService` - For handling saved tests
- Firebase Authentication - For user management

## Usage Example
```jsx
import DashboardCard from './components/Dashboard/DashboardCard';
import ProfileSection from './components/Dashboard/ProfileSection';
import QuestionsToReview from './components/Dashboard/QuestionsToReview';
import RecentSavedTests from './components/Dashboard/RecentSavedTests';
import StatItem from './components/Dashboard/StatItem';

const DashboardExample = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <DashboardCard title="Profile">
        <ProfileSection />
      </DashboardCard>
      
      <DashboardCard title="Questions to Review">
        <QuestionsToReview />
      </DashboardCard>
      
      <DashboardCard title="Recent Tests">
        <RecentSavedTests />
      </DashboardCard>
      
      <DashboardCard title="Statistics">
        <StatItem value="85%" label="Completion Rate" trend={5} />
      </DashboardCard>
    </div>
  );
};
```

## Best Practices
1. Always provide loading states for async operations
2. Implement error handling for all user interactions
3. Use consistent styling through DashboardCard components
4. Maintain responsive design across all components
5. Implement proper validation for user inputs
6. Use proper type checking for component props

## Contributing
When adding new features or modifying existing ones:
1. Maintain consistent styling with existing components
2. Follow the established pattern for error handling
3. Implement proper loading states
4. Add appropriate documentation
5. Ensure responsive design
6. Test across different screen sizes