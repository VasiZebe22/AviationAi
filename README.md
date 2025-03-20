# AviationAI - EASA ATPL(A) Study & Exam Platform

## Overview
AviationAI is a comprehensive training platform designed for pilots preparing for their EASA ATPL(A) exams. The application provides two primary modes:

- **Study Mode**: Interactive learning with immediate feedback and explanations
- **Exam Mode**: Simulated exam environment following official EASA ATPL(A) specifications

## Features

### Study Mode
- Practice questions with immediate feedback
- Detailed explanations for each question
- Progress tracking by category
- Question filtering options (annexes, incorrectly answered, flagged)
- Personal notes for each question
- Question flagging system

### Exam Mode (New)
- Timed exams following official EASA specifications
- No feedback until exam completion
- Automatic submission when time expires
- Results analysis with correct/incorrect answers
- Category-specific question counts and time limits

### Additional Features
- User authentication and progress tracking
- Performance analytics
- Saved tests for continued practice
- Activity center to track progress
- Category-based organization of question banks

## Technical Structure

### Project Organization
- **Frontend**: React application with hooks and context API (Port 3001)
- **Backend**: Express.js server with Firebase integration (Port 3000)

### Key Components
- **Categories**: Browse and select question categories
- **Questions/ExamQuestions**: Question display and interaction
- **Results**: Performance analysis after completing tests
- **Dashboard**: Overview of progress and activities

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Firebase account (for database and authentication)

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/AviationAi.git
cd AviationAi
```

2. Install backend dependencies:
```
cd backend
npm install
```

3. Install frontend dependencies:
```
cd ../frontend
npm install
```

4. Configure environment variables:
   - Create `.env` files in both frontend and backend directories
   - Add required API keys and configuration variables

5. Start the development servers:
   - Backend: `npm run start` (runs on port 3000)
   - Frontend: `npm run start` (runs on port 3001)

## EASA ATPL(A) Exam Structure
The application follows the official EASA ATPL(A) exam structure:

| Subject | Questions | Time (minutes) |
|---------|-----------|----------------|
| Air Law | 44 | 60 |
| Aircraft General Knowledge | 80 | 120 |
| Instrumentation | 60 | 90 |
| Mass and Balance | 25 | 60 |
| Performance | 35 | 120 |
| Flight Planning and Monitoring | 43 | 120 |
| Human Performance | 48 | 60 |
| Meteorology | 84 | 120 |
| General Navigation | 60 | 120 |
| Radio Navigation | 66 | 90 |
| Operational Procedures | 45 | 75 |
| Principles of Flight | 44 | 60 |
| Communications | 34 | 60 |

## Recent Updates
- **March 2025**: Added Exam Mode with official EASA specifications
- **January 2024**: 
  - Changed port configuration (Backend: 3000, Frontend: 3001)
  - Security improvements (removed sensitive logs, added input validation)
  - Updated dependencies (MUI Material v5.15.0)
  - Added question bank data and new routes

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes following our code standards
4. Submit a pull request

## Code Standards
- Follow SOLID, KISS, DRY, and YAGNI principles
- Write clear, concise comments explaining why, not just what
- Maintain existing functionality while adding new features
- Use consistent naming conventions

## License
[Add your license information here]
