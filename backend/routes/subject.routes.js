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
router.post("/", protect, authorizeRoles("admin"), createSubject);
router.get("/", protect, authorizeRoles("admin"), getAllSubjects);
router.put("/:id", protect, authorizeRoles("admin"), updateSubject);
router.delete("/:id", protect, authorizeRoles("admin"), deleteSubject);
export default router;


