import Exam from "../models/exam.model.js";

// create exam
export const createExam = async (req, res) => {
    try {
        const {
            examName,
            classId,
            sectionId,
            subjectId,
            examDate,
            totalMarks,
            passingMarks,
            description,
        } = req.body;

        const exam = await Exam.create({
            examName,
            class: classId,
            section: sectionId,
            subject: subjectId,
            examDate,
            totalMarks,
            passingMarks,
            description,
        });

        return res.status(201).json({
            success: true,
            message: "Exam created successfully",
            exam,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// get all exams
export const getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find()
            .populate("class")
            .populate("section")
            .populate("subject");

        return res.status(200).json({
            success: true,
            count: exams.length,
            exams,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// delete exam
export const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found",
            });
        }
        await exam.deleteOne();
        res.status(200).json({
            success: true,
            message: "Exam deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};