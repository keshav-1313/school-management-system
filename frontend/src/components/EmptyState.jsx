import React from 'react';
import { Inbox, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
    icon: Icon = Inbox,
    title = 'No data available',
    description = 'There are no records to display right now.',
    actionLabel,
    actionLink,
    onAction,
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <Icon size={28} />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
            {actionLabel && actionLink && (
                <Link
                    to={actionLink}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={16} />
                    <span>{actionLabel}</span>
                </Link>
            )}
            {actionLabel && onAction && !actionLink && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={16} />
                    <span>{actionLabel}</span>
                </button>
            )}
        </div>
    );
};
