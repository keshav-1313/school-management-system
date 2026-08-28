import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check role-based access
    if (requiredRole) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!allowedRoles.includes(user?.role)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};

export const PublicRoute = ({ children }) => {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return children;
};
