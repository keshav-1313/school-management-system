import axiosClient from './axios';

const authAPI = {
    login: (email, password) => {
        return axiosClient.post('/api/auth/login', {
            email,
            password,
        });
    },

    logout: () => {
        return axiosClient.get('/api/auth/logout');
    },

    getCurrentUser: () => {
        return axiosClient.get('/api/auth/me');
    },

    forgotPassword: (email) => {
        return axiosClient.post('/api/auth/forgot-password', {
            email,
        });
    },

    resetPassword: (token, password) => {
        return axiosClient.put(`/api/auth/reset-password/${token}`, {
            password,
        });
    },
};

export default authAPI;
