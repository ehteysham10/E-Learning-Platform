
// src/routes/userRoutes.js
import express from "express";
import auth from "../middleware/auth.js";
import authorize from "../middleware/roleMiddleware.js";
import { uploadAvatar } from "../middleware/upload.js";
import {
  getMe,
  updateMe,
  getUserById,
  makeTeacher,
  softDeleteUser,
  restoreUser,
  saveFcmToken,
} from "../controllers/userController.js";

const router = express.Router();

// Get current user
router.get("/me", auth, getMe);

// Get user by ID (public)
router.get("/:id", getUserById);

// Update current user profile with avatar
router.patch("/me", auth, uploadAvatar.single("avatar"), updateMe);

// Admin promotes a student to teacher
router.patch(
  "/:userId/make-teacher",auth,authorize("admin"),makeTeacher);

  // Soft delete user
router.patch("/:userId/disable", auth, authorize("admin"), softDeleteUser);

// Restore user
router.patch("/:userId/restore", auth, authorize("admin"), restoreUser);

// Save FCM token
router.post("/fcm-token", auth, saveFcmToken);


export default router;
