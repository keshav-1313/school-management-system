import axiosClient from './axios';

const sectionAPI = {
    getSectionsByClass: (classId) => {
        return axiosClient.get(`/api/section/${classId}`);
    },

    createSection: (data) => {
        return axiosClient.post('/api/section/create', data);
    },

    updateSection: (id, data) => {
        return axiosClient.put(`/api/section/${id}`, data);
    },

    deleteSection: (id) => {
        return axiosClient.delete(`/api/section/${id}`);
    },
};

export default sectionAPI;
