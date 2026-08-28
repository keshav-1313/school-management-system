import express from "express";
import { loginUser, logoutUser, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import protect from "../middleware/auth.middleware.js";
import { getMe } from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/me", protect, getMe);
export default router;