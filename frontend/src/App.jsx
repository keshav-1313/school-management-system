import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes';

function App() {
    useEffect(() => {
        // Handle unauthorized events
        const handleUnauthorized = () => {
            console.warn('Session expired. Please login again.');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        };

        // Handle forbidden events
        const handleForbidden = () => {
            console.warn('Access forbidden.');
            if (window.location.pathname !== '/unauthorized') {
                window.location.href = '/unauthorized';
            }
        };


        window.addEventListener('unauthorized', handleUnauthorized);
        window.addEventListener('forbidden', handleForbidden);

        return () => {
            window.removeEventListener('unauthorized', handleUnauthorized);
            window.removeEventListener('forbidden', handleForbidden);
        };
    }, []);

    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;
