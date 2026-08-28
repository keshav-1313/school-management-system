import Attendance from "../models/attendance.model.js";
import TeacherProfile from "../models/teacherProfile.model.js";

// mark attendance
export const markAttendance = async (req, res) => {
    try {
        const { classId, sectionId, subjectId, attendanceData } = req.body;
        // validation
        if (!classId || !sectionId || !subjectId) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing",
            });
        }

        // teacher id
        let teacherProfile = await TeacherProfile.findOne({
            user: req.user._id
        });
        if (!teacherProfile && req.user.role === "teacher") {
            teacherProfile = await TeacherProfile.create({
                user: req.user._id,
                qualification: "Faculty Member",
                experience: 1,
            });
        }
        const teacherIdToSave = teacherProfile ? teacherProfile._id : req.user._id;

        // save attendance
        const attendanceRecords = [];
        for (const item of attendanceData) {
            const attendance = await Attendance.create({
                student: item.studentId,
                class: classId,
                section: sectionId,
                subject: subjectId,
                teacher: teacherIdToSave,
                status: item.status,
                remarks: item.remarks || "",
            });
            attendanceRecords.push(attendance);
        }
        res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            attendanceRecords,
        });
    } catch (error) {
        // duplicate attendance error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Attendance already marked for today",

            });
        }
        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// get attendance by class
export const getAttendanceByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const attendance = await Attendance.find({
            class: classId,
        }).populate({
            path: "student",
            populate: {
                path: "user",
            },
        }).populate("subject").populate("section");
        res.status(200).json({
            success: true,
            count: attendance.length,
            attendance,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// student attendance report
export const getStudentAttendance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const attendance = await Attendance.find({
            student: studentId,
        })
            .populate("subject")
            .populate("class")
            .populate("section");
        res.status(200).json({
            success: true,
            count: attendance.length,
            attendance,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// get attendance stats
export const getAttendanceStats = async (req, res) => {
    try {
        const { studentId } = req.params;
        const totalAttendance = await Attendance.countDocuments({
            student: studentId,
        });
        const presentAttendance = await Attendance.countDocuments({
            student: studentId,
            status: "present",
        });
        const absentAttendance = await Attendance.countDocuments({
            student: studentId,
            status: "absent",
        });
        const percentage = ((presentAttendance / totalAttendance) * 100).toFixed(2);
        res.status(200).json({
            success: true,
            totalAttendance,
            presentAttendance,
            absentAttendance,
            percentage,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });


    }
};