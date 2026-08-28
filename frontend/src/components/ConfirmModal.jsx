import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmModal = ({
    isOpen,
    title = 'Confirm Action',
    message = 'Are you sure you want to perform this action?',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    confirmVariant = 'danger', // 'danger' | 'primary'
    loading = false,
    onConfirm,
    onClose,
}) => {
    if (!isOpen) return null;

    const confirmBtnStyles = {
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
        primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-2xl flex-shrink-0">
                                <AlertTriangle size={24} />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                                    <button
                                        onClick={onClose}
                                        className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{message}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="bg-gray-50/80 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 text-sm font-semibold rounded-xl transition-colors focus:outline-none"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 ${confirmBtnStyles[confirmVariant] || confirmBtnStyles.danger}`}
                        >
                            {loading && (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            )}
                            <span>{loading ? 'Processing...' : confirmText}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
