import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Toast = ({ type = 'info', message, onClose, duration = 4000 }) => {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            if (onClose) onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    const variantStyles = {
        success: 'bg-emerald-900/90 text-white border-emerald-700/50 shadow-emerald-950/30',
        error: 'bg-red-900/90 text-white border-red-700/50 shadow-red-950/30',
        warning: 'bg-amber-900/90 text-white border-amber-700/50 shadow-amber-950/30',
        info: 'bg-slate-900/90 text-white border-slate-700/50 shadow-slate-950/30',
    };

    const icons = {
        success: <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />,
        error: <AlertCircle size={18} className="text-red-400 shrink-0" />,
        warning: <AlertTriangle size={18} className="text-amber-400 shrink-0" />,
        info: <Info size={18} className="text-blue-400 shrink-0" />,
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in max-w-md">
            <div className={`px-4 py-3.5 rounded-2xl border backdrop-blur-md shadow-xl flex items-center justify-between gap-3 text-xs font-semibold ${variantStyles[type] || variantStyles.info}`}>
                <div className="flex items-center gap-2.5">
                    {icons[type] || icons.info}
                    <span>{message}</span>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};
