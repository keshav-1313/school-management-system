import StudentProfile from "../models/studentProfile.model.js";
import TeacherProfile from "../models/teacherProfile.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";


// create student
export const createStudent = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            classId,
            sectionId,
            rollNumber,
            fatherName,
            motherName,
            phoneNumber: requestPhoneNumber,
            gender,
            dateOfBirth: requestDateOfBirth,
            address,
            admissionDate,
        } = req.body;

        const phoneNumber = requestPhoneNumber ?? req.body.phone ?? "";
        const dateOfBirth = requestDateOfBirth ?? req.body.dob ?? null;

        // check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "student",
        });



        // create student profile
        const studentProfile = await StudentProfile.create({
            user: createdUser._id,
            class: classId,
            section: sectionId,
            rollNumber,
            fatherName,
            motherName,
            phoneNumber,
            gender,
            dateOfBirth,
            address,
            admissionDate,
        });

        return res.status(201).json({
            success: true,
            message: "Student created successfully",
            user: createdUser,
            studentProfile,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// get all students
export const getAllStudents = async (req, res) => {
    try {
        const students = await StudentProfile.find().populate("user").populate("class").populate("section")
        res.status(200).json({
            success: true,
            count: students.length,
            students,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


// update student
export const updateStudent = async (req, res) => {
    try {
        const student = await StudentProfile.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }
        // update user
        await User.findByIdAndUpdate(
            student.user,
            {
                name: req.body.name,
                email: req.body.email,
            },
            {
                new: true,
            },
        );
        // update profile
        const updatedStudent = await StudentProfile.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            },
        )
            .populate("user")
            .populate("class")
            .populate("section");
        res.status(200).json({
            success: true,
            message: "Student updated succesfully",
            updatedStudent,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// delete student
export const deleteStudent = async (req, res) => {
    try {
        const student = await StudentProfile.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        // delete user
        await User.findByIdAndDelete(student.user);
        // delete profile
        await StudentProfile.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: "Student deleted successsfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// create teacher
export const createTeacher = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            qualification,
            experience,
            salary,
            subjectSpecialization,
            phoneNumber,
            gender,
            address,
            joiningDate,
        } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "teacher",
        });

        const teacherProfile = await TeacherProfile.create({
            user: createdUser._id,
            qualification,
            experience,
            salary,
            subjectSpecialization,
            phoneNumber,
            gender,
            address,
            joiningDate,
        });

        return res.status(201).json({
            success: true,
            message: "Teacher created successfully",
            user: createdUser,
            teacherProfile,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// get all teachers
export const getAllTeachers = async (req, res) => {
    try {
        const teachers = await TeacherProfile.find()
            .populate("user");
        res.status(200).json({
            success: true,
            count: teachers.length,
            teachers,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });


    }
};
// update teacher
export const updateTeacher = async (req, res) => {
    try {
        const teacher = await TeacherProfile.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found",
            });
        }
        // update user
        await User.findByIdAndUpdate(teacher.user, {
            name: req.body.name,
            email: req.body.email,
        });
        //update profile
        const updatedTeacher = await TeacherProfile.findByIdAndUpdate(req.params.id, req.body,
            {
                new: true,
            },
        ).populate("user");
        res.status(200).json({
            success: true,
            message: "Teacher updated successfully",
        });



    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// delete teacher
export const deleteTeacher = async (req, res) => {
    try {
        const teacher = await TeacherProfile.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found",
            });
        }

        // delete user
        await User.findByIdAndDelete(teacher.user);
        // delete profile
        await TeacherProfile.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: "Teacher deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
