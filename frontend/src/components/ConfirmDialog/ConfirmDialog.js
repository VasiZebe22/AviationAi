import React from 'react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black/70 transition-opacity"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div 
                    className="relative bg-surface-dark rounded-lg w-full max-w-sm shadow-xl transform transition-all p-6"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Title */}
                    <h3 className="text-lg font-medium text-white mb-2">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-gray-300 mb-6">
                        {message}
                    </p>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-surface-dark/50 text-gray-300 rounded hover:bg-surface-dark/70 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="px-4 py-2 bg-red-600/80 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;