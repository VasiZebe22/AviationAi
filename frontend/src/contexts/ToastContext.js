import React, { createContext, useContext, useState, useCallback } from 'react';
import ErrorToast from '../components/ErrorToast/ErrorToast';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showError = useCallback((message) => {
        setToast({ message });
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    return (
        <ToastContext.Provider value={{ showError }}>
            {children}
            {toast && (
                <ErrorToast
                    message={toast.message}
                    onClose={hideToast}
                />
            )}
        </ToastContext.Provider>
    );
};

export default ToastContext;
