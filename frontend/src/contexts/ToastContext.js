import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const Toast = ({ type, message, onClose }) => {
    const bgColor = type === 'error' ? 'bg-red-900/50' : type === 'success' ? 'bg-green-900/50' : 'bg-dark-lighter';
    const textColor = type === 'error' ? 'text-red-200' : type === 'success' ? 'text-green-200' : 'text-gray-200';

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 ${bgColor} ${textColor} px-4 py-2 rounded-lg shadow-lg z-50`}
        >
            <div className="flex items-center space-x-2">
                <span className="text-sm">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
                >
                    ×
                </button>
            </div>
        </motion.div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((type, message) => {
        setToast({ type, message });
        // Auto-hide after 3 seconds
        setTimeout(() => {
            setToast(null);
        }, 3000);
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <AnimatePresence>
                {toast && (
                    <Toast
                        type={toast.type}
                        message={toast.message}
                        onClose={hideToast}
                    />
                )}
            </AnimatePresence>
        </ToastContext.Provider>
    );
};

export default ToastContext;
