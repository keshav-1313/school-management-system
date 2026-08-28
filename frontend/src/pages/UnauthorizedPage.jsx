import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';

export const UnauthorizedPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md text-center">
                <div className="flex justify-center mb-4">
                    <AlertCircle size={64} className="text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Access Denied
                </h1>
                <p className="text-gray-600 mb-8">
                    You don't have permission to access this page. Please contact an administrator if you believe this is an error.
                </p>
                <Link to="/dashboard">
                    <Button variant="primary" size="md" className="w-full">
                        Go to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
};
