import express from "express";

import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import { createClass, getAllClasses, updateClass, deleteClass } from "../controllers/class.controller.js";

const router = express.Router();
router.post("/create", protect, authorizeRoles("admin", "teacher"), createClass);
router.get("/get", protect, authorizeRoles("admin", "teacher", "student"), getAllClasses);
router.put("/:id", protect, authorizeRoles("admin", "teacher"), updateClass);
router.delete("/:id", protect, authorizeRoles("admin", "teacher"), deleteClass);


export default router;