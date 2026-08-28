import mongoose from "mongoose";
import Subject from "./subject.model.js";

const attendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentProfile",
        required: true,
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true,
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
        required: true,
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TeacherProfile",
        required: true,
    },
    status: {
        type: String,
        enum: ["present", "absent", "late"],
        default: "present",
    },
    remarks: {
        type: String,
    },
    attendanceDate: {
        type: Date,
        default: Date.now,
    },


}, {
    timestamps: true,
},
);

// prevent duplicate attendance
attendanceSchema.index(
    {
        student: 1,
        subject: 1,
        attendanceDate: 1,
    },
    {
        unique: true
    },
);
const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;