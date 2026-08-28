import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export const ErrorAlert = ({ message, onClose, variant = 'error' }) => {
    if (!message) return null;

    const styles = {
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    return (
        <div className={`${styles[variant]} border rounded-lg p-4 flex items-start gap-3`}>
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
                <p className="text-sm font-medium">{message}</p>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="text-current hover:opacity-75 transition-opacity"
                >
                    <X size={20} />
                </button>
            )}
        </div>
    );
};

export const SuccessAlert = ({ message, onClose }) => {
    if (!message) return null;

    return (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-start gap-3">
            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">✓</span>
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium">{message}</p>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="text-current hover:opacity-75 transition-opacity"
                >
                    <X size={20} />
                </button>
            )}
        </div>
    );
};
