import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'var(--background-color)'
                }}>
                    <h1>Something went wrong</h1>
                    <p>Please try refreshing the page</p>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '10px 20px',
                            marginTop: '20px',
                            cursor: 'pointer',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px'
                        }}
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
