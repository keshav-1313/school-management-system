import React, { createContext, useState, useEffect, useCallback } from 'react';
import authAPI from '../services/authAPI';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is already authenticated on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Try to fetch current user - if token is valid, backend will return user data
                const response = await authAPI.getCurrentUser();
                if (response.data.success && response.data.user) {
                    setUser(response.data.user);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
            } catch (err) {
                // User is not authenticated or token is invalid
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Listen for unauthorized events (token expired)
    useEffect(() => {
        const handleUnauthorized = () => {
            setUser(null);
            localStorage.removeItem('user');
        };

        window.addEventListener('unauthorized', handleUnauthorized);
        return () => window.removeEventListener('unauthorized', handleUnauthorized);
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            setError(null);
            setLoading(true);
            const response = await authAPI.login(email, password);

            if (response.data.success && response.data.user) {
                setUser(response.data.user);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                return { success: true, user: response.data.user };
            }
            throw new Error('Login failed');
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Login failed';
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            setError(null);
            await authAPI.logout();
            setUser(null);
            localStorage.removeItem('user');
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Logout failed';
            setError(message);
            return { success: false, error: message };
        }
    }, []);

    const isAuthenticated = Boolean(user);
    const isAdmin = user?.role === 'admin';
    const isTeacher = user?.role === 'teacher';
    const isStudent = user?.role === 'student';

    const value = {
        user,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        isTeacher,
        isStudent,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
