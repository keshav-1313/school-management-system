import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes.js";
import classRoutes from "./routes/class.routes.js";
import sectionRoutes from "./routes/section.routes.js";
import userManagementRoutes from "./routes/userManagement.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import examRoutes from "./routes/exam.routes.js";
import resultRoutes from "./routes/result.routes.js";
import timetableRoutes from "./routes/timetable.routes.js";
dotenv.config();
const app = express();

// Database & Cloudinary connection
import connectDB from "./config/db.js";
import connectCloudinary from "./config/cloudinary.js";
import seedAdmin from "./utils/adminSeeder.js";

const initializeServices = async () => {
    await connectDB();
    connectCloudinary();
    await seedAdmin();
};
initializeServices();


// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || (origin && origin.startsWith('http://localhost:'))) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet());
// Test route
app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});

// api endpoints
app.use("/api/auth", authRoutes);
app.use("/api/class", classRoutes);
app.use("/api/section", sectionRoutes);
app.use("/api/user-management", userManagementRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/timetable", timetableRoutes);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


