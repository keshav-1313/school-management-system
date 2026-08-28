import express from "express";
import {
    createTimetableSlot,
    getClassTimetable,
    getStudentTimetable,
    getTeacherTimetable,
    updateTimetableSlot,
    deleteTimetableSlot,
} from "../controllers/timetable.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
const router = express.Router();
router.post("/", protect, authorizeRoles("admin"), createTimetableSlot);
router.get("/class/:classId/:sectionId", protect, authorizeRoles("admin", "teacher", "student"), getClassTimetable);
router.get("/student", protect, authorizeRoles("admin", "teacher", "student"), getStudentTimetable);
router.get("/teacher", protect, authorizeRoles("admin", "teacher"), getTeacherTimetable);
router.put("/:id", protect, authorizeRoles("admin"), updateTimetableSlot);
router.delete("/:id", protect, authorizeRoles("admin"), deleteTimetableSlot);
export default router;

