import express from "express";

import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import { createClass, getAllClasses, updateClass, deleteClass } from "../controllers/class.controller.js";

const router = express.Router();
router.post("/create", protect, authorizeRoles("admin"), createClass);
router.get("/get", protect, authorizeRoles("admin"), getAllClasses);
router.put("/:id", protect, authorizeRoles("admin"), updateClass);
router.delete("/:id", protect, authorizeRoles("admin"), deleteClass);


export default router;