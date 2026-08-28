import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';

export const UnauthorizedPage = () => {
    const handleLoginRedirect = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md text-center">
                <div className="flex justify-center mb-4">
                    <AlertCircle size={64} className="text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Access Denied
                </h1>
                <p className="text-gray-600 mb-6">
                    You don't have permission to access this page. Please sign in with appropriate credentials or contact an administrator.
                </p>
                <div className="space-y-3">
                    <button
                        onClick={handleLoginRedirect}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all"
                    >
                        Sign In to Portal (Email & Password)
                    </button>
                    <div className="flex items-center justify-center gap-4 text-xs font-semibold text-gray-500 pt-1">
                        <Link to="/dashboard" className="hover:text-blue-600 transition-colors">
                            Go to Dashboard
                        </Link>
                        <span>•</span>
                        <Link to="/" className="hover:text-blue-600 transition-colors">
                            Homepage
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
