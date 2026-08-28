import axiosClient from './axios';

const timetableAPI = {
    createTimetableSlot: (data) => {
        return axiosClient.post('/api/timetable', data);
    },

    getClassTimetable: (classId, sectionId) => {
        return axiosClient.get(`/api/timetable/class/${classId}/${sectionId}`);
    },

    getStudentTimetable: () => {
        return axiosClient.get('/api/timetable/student');
    },

    getTeacherTimetable: () => {
        return axiosClient.get('/api/timetable/teacher');
    },

    updateTimetableSlot: (id, data) => {
        return axiosClient.put(`/api/timetable/${id}`, data);
    },

    deleteTimetableSlot: (id) => {
        return axiosClient.delete(`/api/timetable/${id}`);
    },
};

export default timetableAPI;
