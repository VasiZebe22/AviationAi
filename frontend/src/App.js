import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './styles/global.css';
import './styles/utilities.css';
import './styles/markdown.css';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ToastContainer } from 'react-toastify';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import 'react-toastify/dist/ReactToastify.css';

// Lazy load components
const Homepage = React.lazy(() => import("./pages/Homepage/Homepage"));
const Login = React.lazy(() => import("./pages/Login/Login"));
const Signup = React.lazy(() => import("./pages/Signup/SignupPage"));
const Dashboard = React.lazy(() => import("./pages/Dashboard/Dashboard"));
const AiChat = React.lazy(() => import("./components/AiChat/AiChat"));
const Questions = React.lazy(() => import("./pages/Questions/Questions"));
const Categories = React.lazy(() => import("./pages/Categories"));
const Results = React.lazy(() => import("./pages/Results/Results"));
const SavedTests = React.lazy(() => import("./pages/SavedTests/SavedTests"));
const ActivityCenter = React.lazy(() => import("./pages/ActivityCenter/ActivityCenter"));

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();
    
    if (loading) {
        return <LoadingSpinner />;
    }
    
    return currentUser ? children : <Navigate to="/login" />;
};

// Routes component to avoid useAuth hook being called before AuthProvider is mounted
function AppRoutes() {
    const { currentUser } = useAuth();

    return (
        <>
            <Routes>
                <Route 
                    path="/" 
                    element={
                        <Suspense fallback={<LoadingSpinner />}>
                            <Homepage />
                        </Suspense>
                    } 
                />
                <Route 
                    path="/login" 
                    element={
                        currentUser ? (
                            <Navigate to="/dashboard" />
                        ) : (
                            <Suspense fallback={<LoadingSpinner />}>
                                <Login />
                            </Suspense>
                        )
                    } 
                />
                <Route 
                    path="/signup" 
                    element={
                        currentUser ? (
                            <Navigate to="/dashboard" />
                        ) : (
                            <Suspense fallback={<LoadingSpinner />}>
                                <Signup />
                            </Suspense>
                        )
                    } 
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingSpinner />}>
                                <Dashboard />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingSpinner />}>
                                <AiChat />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/practice"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingSpinner />}>
                                <Categories />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/questions/:categoryId"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingSpinner />}>
                                <Questions />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/results"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingSpinner />}>
                                <Results />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/saved-tests"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingSpinner />}>
                                <SavedTests />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/activity"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<LoadingSpinner />}>
                                <ActivityCenter />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="*"
                    element={<Navigate to="/" />}
                />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
        </>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <AuthProvider>
                    <ToastProvider>
                        <AppRoutes />
                        <ToastContainer />
                    </ToastProvider>
                </AuthProvider>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
