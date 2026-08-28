import express from "express";
import {
    createExam,
    getAllExams,
    deleteExam,
} from "../controllers/exam.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("admin", "teacher"), createExam);
router.get("/", protect, authorizeRoles("admin", "teacher", "student"), getAllExams);
router.delete("/:id", protect, authorizeRoles("admin"), deleteExam);

export default router;