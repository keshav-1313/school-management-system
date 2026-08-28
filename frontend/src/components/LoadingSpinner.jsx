import React from 'react';

export const LoadingSpinner = ({ size = 'md', center = true }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    const spinner = (
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`} />
    );

    if (center) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                {spinner}
            </div>
        );
    }

    return spinner;
};
