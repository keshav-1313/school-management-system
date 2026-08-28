import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",

    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
    },

    rollNumber: {
        type: String,
    },
    fatherName: {
        type: String,
    },
    motherName: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    gender: {
        type: String,
        enum: ["male", "female"],
    },
    dateOfBirth: {
        type: Date,
    },
    address: {
        type: String,
    },
    admissionDate: {
        type: Date,
        default: Date.now
    },
},
    { timestamps: true }
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);
export default StudentProfile;
