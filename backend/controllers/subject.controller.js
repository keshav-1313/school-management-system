import Subject from "../models/subject.model.js";
import Class from "../models/class.model.js";
import TeacherProfile from "../models/teacherProfile.model.js";

// create subject
export const createSubject = async (req, res) => {
    try {
        const { subjectName, subjectCode, classId, teacherId, description } = req.body;

        if (!subjectName || !subjectCode || !classId) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing",
            });
        }

        const academicClass = await Class.findById(classId);
        if (!academicClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found",
            });
        }

        if (teacherId) {
            const teacher = await TeacherProfile.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: "Teacher not found",
                });
            }
        }

        const existingSubject = await Subject.findOne({
            subjectCode,
        });
        if (existingSubject) {
            return res.status(400).json({
                success: false,
                message: "Subject code already exists",
            });
        }

        const subject = await Subject.create({
            subjectName,
            subjectCode,
            class: classId,
            teacher: teacherId,
            description,
        });

        return res.status(201).json({
            success: true,
            message: "Subject created successfully",
            subject,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// get all subjects
export const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find()
            .populate("class")
            .populate({
                path: "teacher",
                populate: {
                    path: "user",
                },
            });
        res.status(200).json({
            success: true,
            count: subjects.length,
            subjects,
        });



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// update subject
export const updateSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Subject updated successfully",
            subject,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// delete subject
export const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            });
        }
        await subject.deleteOne();
        return res.status(200).json({
            success: true,
            message: "Subject deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
