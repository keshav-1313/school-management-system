import Timetable from "../models/timetable.model.js";
import Subject from "../models/subject.model.js";
import StudentProfile from "../models/studentProfile.model.js";
import TeacherProfile from "../models/teacherProfile.model.js";
// create timetable slot
export const createTimetableSlot = async (req, res) => {
    try {
        const {
            classId,
            sectionId,
            day,
            periodNumber,
            startTime,
            endTime,
            subjectId,
        } = req.body;
        // validation
        if (
            !classId ||
            !sectionId ||
            !day ||
            !periodNumber ||
            !startTime ||
            !endTime ||
            !subjectId
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }
        // find subject
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            });
        }
        // check duplicate period
        const existingPeriod = await Timetable.findOne({
            class: classId,
            section: sectionId,
            day,
            periodNumber,
        });
        if (existingPeriod) {
            return res.status(400).json({
                success: false,
                message: `Period ${periodNumber} already exists for ${day}`,
            });
        }
        // check time overlap
        const existingSlots = await Timetable.find({
            class: classId,
            section: sectionId,
            day,
        });
        const newStart = startTime.replace(":", "");
        const newEnd = endTime.replace(":", "");
        const conflict = existingSlots.find((slot) => {
            const slotStart = slot.startTime.replace(":", "");
            const slotEnd = slot.endTime.replace(":", "");
            return newStart < slotEnd && newEnd > slotStart;
        });
        if (conflict) {
            return res.status(400).json({
                success: false,
                message: "Time slot overlaps with existing timetable period",
            });
        }
        // create slot
        const timetable = await Timetable.create({
            class: classId,
            section: sectionId,
            day,
            periodNumber,
            startTime,
            endTime,
            subject: subjectId,
            teacher: subject.teacher,
        });
        res.status(201).json({
            success: true,
            message: "Timetable slot created successfully",
            timetable,
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

export const getClassTimetable = async (req, res) => {
    try {
        const { classId, sectionId } = req.params;
        const timetable = await Timetable.find({
            class: classId,
            section: sectionId,
        })
            .populate("subject")
            .populate({
                path: "teacher",
                populate: {
                    path: "user",
                },

            })
            .sort({
                day: 1,
                periodNumber: 1,
            });
        res.status(200).json({
            success: true,
            count: timetable.length,
            timetable,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

export const getStudentTimetable = async (req, res) => {
    try {
        const studentProfile = await studentProfile.findOne({
            user: req.user._id,

        });
        if (!studentProfile) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found",
            });
        }
        const timetable = await Timetable.find({
            class: studentProfile.class,
            section: studentProfile.section,
        })
            .populate("subject")
            .populate({
                path: "teacher",
                populate: {
                    path: "user",
                },
            })
            .sort({
                day: 1,
                periodNumber: 1,
            });
        res.status(200).json({
            success: true,
            timetable,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

export const getTeacherTimetable = async (req, res) => {
    try {
        const teacherProfile = await teacherProfile.findOne({
            user: req.user._id,

        });
        if (!teacherProfile) {
            return res.status(404).json({
                success: false,
                message: "Teacher profile not found",
            });
        }
        const timetable = await Timetable.find({
            teacher: teacherProfile._id,
        })
            .populate("subject")
            .populate("class")
            .populate("section")
            .sort({
                day: 1,
                periodNumber: 1,
            });



        res.status(200).json({
            success: true,
            timetable,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

export const updateTimetableSlot = async (req, res) => {
    try {
        const timetable = await Timetable.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            },
        );
        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: "Timetable not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Timetable updated successfully",
            timetable,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });


    }
};

export const deleteTimetableSlot = async (req, res) => {
    try {
        const timetable = await Timetable.findById(
            req.params.id);


        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: "Timetable not found",
            });
        }
        await timetable.deleteOne();

        res.status(200).json({
            success: true,
            message: "Timetable deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });


    }
};