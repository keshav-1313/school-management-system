import axiosClient from './axios';

const resultAPI = {
    addResult: (data) => {
        return axiosClient.post('/api/results', data);
    },

    getStudentResults: (studentId) => {
        return axiosClient.get(`/api/results/${studentId}`);
    },
};

export default resultAPI;
