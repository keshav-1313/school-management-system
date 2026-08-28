import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md text-center">
                <div className="text-6xl font-bold text-blue-600 mb-4">404</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Page Not Found
                </h1>
                <p className="text-gray-600 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link to="/">
                    <Button variant="primary" size="md" className="w-full">
                        Go Home
                    </Button>
                </Link>
            </div>
        </div>
    );
};
