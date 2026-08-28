import axiosClient from './axios';

const attendanceAPI = {
    markAttendance: (data) => {
        return axiosClient.post('/api/attendance/mark', data);
    },

    getAttendanceByClass: (classId) => {
        return axiosClient.get(`/api/attendance/class/${classId}`);
    },

    getStudentAttendance: (studentId) => {
        return axiosClient.get(`/api/attendance/student/${studentId}`);
    },

    getAttendanceStats: (studentId) => {
        return axiosClient.get(`/api/attendance/stats/${studentId}`);
    },
};

export default attendanceAPI;
