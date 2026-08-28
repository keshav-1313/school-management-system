import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ErrorBanner = ({
    title = 'Failed to load dashboard data',
    message = 'An error occurred while communicating with the backend server.',
    onRetry,
}) => {
    return (
        <div className="bg-red-50/80 border border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl flex-shrink-0">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-red-900">{title}</h3>
                        <p className="text-sm text-red-700 mt-1">{message}</p>
                    </div>
                </div>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm self-start sm:self-center"
                    >
                        <RefreshCw size={16} />
                        <span>Retry Request</span>
                    </button>
                )}
            </div>
        </div>
    );
};
