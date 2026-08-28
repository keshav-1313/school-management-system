import User from "../models/user.model.js";
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
        const teacherExists = await User.findOne({ email: teacherEmail });
        if (!teacherExists) {
            const hashedPassword = await bcrypt.hash("password", 10);
            await User.create({
                name: "Faculty Teacher",
                email: teacherEmail,
                password: hashedPassword,
                role: "teacher",
            });
            console.log("Teacher account created");
        }

        // Seed Student Demo Account
        const studentEmail = "student@school.com";
        const studentExists = await User.findOne({ email: studentEmail });
        if (!studentExists) {
            const hashedPassword = await bcrypt.hash("password", 10);
            await User.create({
                name: "Demo Student",
                email: studentEmail,
                password: hashedPassword,
                role: "student",
            });
            console.log("Student account created");
        }
    } catch (error) {
        console.error("Seeder error:", error.message);
    }
};

export default seedAdmin;