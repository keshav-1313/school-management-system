import express from "express";
import {
    markAttendance,
    getAttendanceByClass,
    getStudentAttendance,
    getAttendanceStats,
} from "../controllers/attendance.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/mark", protect, authorizeRoles("admin", "teacher"), markAttendance,);

router.get("/class/:classId", protect, authorizeRoles("admin", "teacher", "student"), getAttendanceByClass,);

router.get("/student/:studentId", protect, authorizeRoles("admin", "teacher", "student"), getStudentAttendance,);

router.get("/stats/:studentId", protect, authorizeRoles("admin", "teacher", "student"), getAttendanceStats,);

export default router;

