// src/routes/enrollmentRoutes.js
import express from "express";
import auth from "../middleware/auth.js";
import authorize from "../middleware/roleMiddleware.js";
import {
  enrollCourse,
  getMyEnrollments,
  completeLesson,
} from "../controllers/enrollmentController.js";

const router = express.Router();

// Enroll in a course
router.post(
  "/courses/:courseId/enroll",
  auth,
  authorize("student"),
  enrollCourse
);

// Get student's enrolled courses
router.get("/enrollments/me", auth, authorize("student"), getMyEnrollments);

// Mark lesson as completed
router.post(
  "/enrollments/:enrollmentId/complete-lesson",
  auth,
  authorize("student"),
  completeLesson
);

export default router;
