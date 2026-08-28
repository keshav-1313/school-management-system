import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        const adminExists = await User.findOne({ email: adminEmail });
        if (adminExists) {
            const isPasswordMatch = await bcrypt.compare(adminPassword, adminExists.password);
            if (!isPasswordMatch) {
                adminExists.password = await bcrypt.hash(adminPassword, 10);
                adminExists.name = adminExists.name || "Admin";
                adminExists.role = "admin";
                await adminExists.save();
                console.log("Admin password updated");
                return;
            }

            console.log("Admin already exists");
            return;
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await User.create({
            name: "Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
        });
        console.log("Admin Created");
    } catch (error) {
        console.error(error.message);
    }
};

export default seedAdmin;   