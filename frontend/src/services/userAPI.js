import axiosClient from './axios';

const userAPI = {
    // Student endpoints
    getAllStudents: () => {
        return axiosClient.get('/api/user-management/students');
    },

    createStudent: (data) => {
        return axiosClient.post('/api/user-management/student', data);
    },

    updateStudent: (id, data) => {
        return axiosClient.put(`/api/user-management/student/${id}`, data);
    },

    deleteStudent: (id) => {
        return axiosClient.delete(`/api/user-management/student/${id}`);
    },

    // Teacher endpoints
    getAllTeachers: () => {
        return axiosClient.get('/api/user-management/teachers');
    },

    createTeacher: (data) => {
        return axiosClient.post('/api/user-management/teacher', data);
    },

    updateTeacher: (id, data) => {
        return axiosClient.put(`/api/user-management/teacher/${id}`, data);
    },

    deleteTeacher: (id) => {
        return axiosClient.delete(`/api/user-management/teacher/${id}`);
    },
};

export default userAPI;
