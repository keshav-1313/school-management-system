import Exam from "../models/exam.model.js";
import Result from "../models/result.model.js";
import StudentProfile from "../models/studentProfile.model.js";

// add result
export const addResult = async (req, res) => {
    try {
        const { studentId, examId, obtainedMarks, remarks } = req.body;

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found",
            });
        }

        const percentage = ((Number(obtainedMarks) / exam.totalMarks) * 100).toFixed(2);
        const status = Number(obtainedMarks) >= exam.passingMarks ? "pass" : "fail";

        let grade = "F";
        if (Number(percentage) >= 90) grade = "A+";
        else if (Number(percentage) >= 80) grade = "A";
        else if (Number(percentage) >= 70) grade = "B";
        else if (Number(percentage) >= 60) grade = "C";
        else if (Number(percentage) >= 50) grade = "D";

        const result = await Result.create({
            student: studentId,
            exam: examId,
            obtainedMarks,
            percentage,
            grade,
            remarks,
            status,
        });

        return res.status(201).json({
            success: true,
            message: "Result added successfully",
            result,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Result already added",
            });
        }
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// get student results
export const getStudentResults = async (req, res) => {
    try {
        const results = await Result.find({
            student: req.params.studentId,
        }).populate("exam");

        return res.status(200).json({
            success: true,
            count: results.length,
            results,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};