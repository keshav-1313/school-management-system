import axiosClient from './axios';

const classAPI = {
    getAllClasses: () => {
        return axiosClient.get('/api/class/get');
    },

    createClass: (data) => {
        return axiosClient.post('/api/class/create', data);
    },

    updateClass: (id, data) => {
        return axiosClient.put(`/api/class/${id}`, data);
    },

    deleteClass: (id) => {
        return axiosClient.delete(`/api/class/${id}`);
    },
};

export default classAPI;
