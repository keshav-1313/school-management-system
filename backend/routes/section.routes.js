import express from "express";
import { createSection, getSectionsByClass, updateSection, deleteSection } from "../controllers/section.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/create", protect, authorizeRoles("admin", "teacher"), createSection);

router.get("/:classId", protect, authorizeRoles("admin", "teacher", "student"), getSectionsByClass);

router.put("/:id", protect, authorizeRoles("admin", "teacher"), updateSection);

router.delete("/:id", protect, authorizeRoles("admin", "teacher"), deleteSection);
export default router;