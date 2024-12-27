import React, { useEffect } from 'react';
import './ErrorToast.css';

const ErrorToast = ({ message, onClose, duration = 5000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="error-toast">
            <div className="error-toast-content">
                <span className="error-icon">⚠️</span>
                <span className="error-message">{message}</span>
                <button className="close-button" onClick={onClose}>×</button>
            </div>
        </div>
    );
};

export default ErrorToast;
