import axiosClient from './axios';

const subjectAPI = {
    getAllSubjects: () => {
        return axiosClient.get('/api/subjects');
    },

    createSubject: (data) => {
        return axiosClient.post('/api/subjects', data);
    },

    updateSubject: (id, data) => {
        return axiosClient.put(`/api/subjects/${id}`, data);
    },

    deleteSubject: (id) => {
        return axiosClient.delete(`/api/subjects/${id}`);
    },
};

export default subjectAPI;
