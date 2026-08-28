import express from "express";
import {
    createSubject,
    getAllSubjects,
    updateSubject,
    deleteSubject,
} from "../controllers/subject.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
const router = express.Router();
router.post("/", protect, authorizeRoles("admin", "teacher"), createSubject);
router.get("/", protect, authorizeRoles("admin", "teacher", "student"), getAllSubjects);
router.put("/:id", protect, authorizeRoles("admin", "teacher"), updateSubject);
router.delete("/:id", protect, authorizeRoles("admin", "teacher"), deleteSubject);
export default router;


