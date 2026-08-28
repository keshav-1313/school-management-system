import mongoose from "mongoose";
const teacherProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    qualification: {
        type: String,
    },
    experience: {
        type: Number,
    },
    salary: {
        type: Number,
    },
    subjectSpecialization: {
        type: String,
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    phoneNumber: {
        type: String,
    },
    gender: {
        type: String,
        enum: ["male", "female"]
    },
    address: {
        type: String,
    },
},
    { timestamps: true }
);
const TeacherProfile = mongoose.model("TeacherProfile", teacherProfileSchema);
export default TeacherProfile;
