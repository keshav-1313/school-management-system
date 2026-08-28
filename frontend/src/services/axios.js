import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important: Include cookies in requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token if needed
axiosClient.interceptors.request.use(
    (config) => {
        // Token is already in cookies (httpOnly), so no need to add it manually
        // But this is where you could add other headers if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors and token expiration
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized - token expired or invalid
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('user');
            const isAuthMeReq = error.config?.url?.includes('/api/auth/me');
            if (!isAuthMeReq && window.location.pathname !== '/login') {
                window.dispatchEvent(new CustomEvent('unauthorized'));
            }
        }

        // Handle 403 Forbidden - user doesn't have permission
        if (error.response && error.response.status === 403) {
            if (window.location.pathname !== '/unauthorized') {
                window.dispatchEvent(new CustomEvent('forbidden'));
            }
        }


        return Promise.reject(error);
    }
);

export default axiosClient;
