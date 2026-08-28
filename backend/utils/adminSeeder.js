import User from "../models/user.model.js";
import TeacherProfile from "../models/teacherProfile.model.js";
import StudentProfile from "../models/studentProfile.model.js";
import bcrypt from "bcryptjs";

const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@school.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "password";

        // Seed Admin
        const adminExists = await User.findOne({ email: adminEmail });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await User.create({
                name: "System Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
            });
            console.log("Admin account created");
        } else {
            const isPasswordMatch = await bcrypt.compare(adminPassword, adminExists.password);
            if (!isPasswordMatch) {
                adminExists.password = await bcrypt.hash(adminPassword, 10);
                await adminExists.save();
                console.log("Admin password updated");
            }
        }

        // Seed Teacher Demo Account
        const teacherEmail = "teacher@school.com";
        let teacherUser = await User.findOne({ email: teacherEmail });
        if (!teacherUser) {
            const hashedPassword = await bcrypt.hash("password", 10);
            teacherUser = await User.create({
                name: "Faculty Teacher",
                email: teacherEmail,
                password: hashedPassword,
                role: "teacher",
            });
            console.log("Teacher account created");
        }
        const teacherProfileExists = await TeacherProfile.findOne({ user: teacherUser._id });
        if (!teacherProfileExists) {
            await TeacherProfile.create({
                user: teacherUser._id,
                qualification: "Master of Science",
                experience: 5,
                salary: 50000,
                subjectSpecialization: "Mathematics",
                phoneNumber: "9876543210",
                gender: "Male",
                joiningDate: new Date(),
            });
            console.log("Teacher profile created");
        }

        // Seed Student Demo Account
        const studentEmail = "student@school.com";
        let studentUser = await User.findOne({ email: studentEmail });
        if (!studentUser) {
            const hashedPassword = await bcrypt.hash("password", 10);
            studentUser = await User.create({
                name: "Demo Student",
                email: studentEmail,
                password: hashedPassword,
                role: "student",
            });
            console.log("Student account created");
        }
        const studentProfileExists = await StudentProfile.findOne({ user: studentUser._id });
        if (!studentProfileExists) {
            await StudentProfile.create({
                user: studentUser._id,
                rollNumber: "101",
                fatherName: "John Doe",
                motherName: "Jane Doe",
                phoneNumber: "9876543211",
                gender: "Male",
                admissionDate: new Date(),
            });
            console.log("Student profile created");
        }
    } catch (error) {
        console.error("Seeder error:", error.message);
    }
};

export default seedAdmin;