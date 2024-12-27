import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './styles/global.css';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';

// Lazy load components
const Homepage = React.lazy(() => import("./pages/Homepage/Homepage"));
const Login = React.lazy(() => import("./pages/Login/Login"));
const Signup = React.lazy(() => import("./pages/Signup/SignupPage"));
const Dashboard = React.lazy(() => import("./pages/Dashboard/Dashboard"));
const AiChat = React.lazy(() => import("./components/AiChat/AiChat"));
const ProfileEdit = React.lazy(() => import("./components/Profile/ProfileEdit"));

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
                path="/profile/edit"
                element={
                    <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                            <ProfileEdit />
                        </Suspense>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

const App = () => {
    return (
        <ErrorBoundary>
            <ToastProvider>
                <AuthProvider>
                    <Router>
                        <AppRoutes />
                    </Router>
                </AuthProvider>
            </ToastProvider>
        </ErrorBoundary>
    );
};

export default App;
