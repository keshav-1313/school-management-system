import React, { forwardRef } from 'react';

export const Input = forwardRef(({
    label,
    error,
    helperText,
    className = '',
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="label">
                    {label}
                    {props.required && <span className="text-red-600">*</span>}
                </label>
            )}
            <input
                ref={ref}
                className={`
          input
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export const Select = forwardRef(({
    label,
    error,
    options = [],
    placeholder = 'Select an option',
    helperText,
    className = '',
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="label">
                    {label}
                    {props.required && <span className="text-red-600">*</span>}
                </label>
            )}
            <select
                ref={ref}
                className={`
          input
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export const Textarea = forwardRef(({
    label,
    error,
    helperText,
    rows = 4,
    className = '',
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="label">
                    {label}
                    {props.required && <span className="text-red-600">*</span>}
                </label>
            )}
            <textarea
                ref={ref}
                rows={rows}
                className={`
          input
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
});

Textarea.displayName = 'Textarea';
