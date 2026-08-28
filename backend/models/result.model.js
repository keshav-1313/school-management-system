import mongoose from "mongoose";
const resultSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StudentProfile",
            required: true,
        },
        exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exam",
        },
        obtainedMarks: {
            type: Number,
            required: true,
        },
        percentage: {
            type: Number,
        },
        grade: {
            type: String,
        },
        remarks: {
            type: String,
        },
        status: {
            type: String,
            enum: ["pass", "fail"],
        },
    },
    {
        timestamps: true,
    },
);
// prevent duplicate results
resultSchema.index(
    {
        student: 1,
        exam: 1,
    },
    {
        unique: true,
    },
);
const Result = mongoose.model("Result", resultSchema);
export default Result;