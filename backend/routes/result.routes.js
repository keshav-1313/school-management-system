import express from "express";
import {
    addResult,
    getStudentResults,
} from "../controllers/result.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("admin", "teacher"), addResult);
router.get("/:studentId", protect, authorizeRoles("admin", "teacher", "student"), getStudentResults);

export default router;