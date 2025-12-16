// // src/routes/lessonRoutes.js
// import express from "express";
// import auth from "../middleware/auth.js";
// import authorize from "../middleware/roleMiddleware.js";
// import {
//   createLesson,
//   getLessonsByCourse,
//   updateLesson,
//   deleteLesson,
// } from "../controllers/lessonController.js";

// const router = express.Router();

// // Course-based lessons
// router.get("/courses/:courseId/lessons", getLessonsByCourse);
// router.post(
//   "/courses/:courseId/lessons",
//   auth,
//   authorize("admin", "teacher"),
//   createLesson
// );

// // Lesson-level actions
// router.put("/lessons/:id", auth, authorize("admin", "teacher"), updateLesson);
// router.delete("/lessons/:id", auth, authorize("admin", "teacher"), deleteLesson);

// export default router;







import express from "express";
import auth from "../middleware/auth.js";
import authorize from "../middleware/roleMiddleware.js";
import uploadVideo from "../middleware/uploadVideo.js";
import { createLesson, getLessonsByCourse, updateLesson, deleteLesson } from "../controllers/lessonController.js";

const router = express.Router();

// Create lesson with video
router.post(
  "/courses/:courseId/lessons",
  auth,
  authorize("teacher", "admin"),
  uploadVideo.single("video"),
  createLesson
);

// Get lessons of a course
router.get("/courses/:courseId/lessons", getLessonsByCourse);

// Update lesson (can replace video)
router.put(
  "/lessons/:id",
  auth,
  authorize("teacher", "admin"),
  uploadVideo.single("video"),
  updateLesson
);

// Delete lesson
router.delete("/lessons/:id", auth, authorize("teacher", "admin"), deleteLesson);

export default router;
