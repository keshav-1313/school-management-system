import axiosClient from './axios';

const examAPI = {
    getAllExams: () => {
        return axiosClient.get('/api/exams');
    },

    createExam: (data) => {
        return axiosClient.post('/api/exams', data);
    },

    deleteExam: (id) => {
        return axiosClient.delete(`/api/exams/${id}`);
    },
};

export default examAPI;
