
// src/routes/courseRoutes.js
import express from "express";
import auth from "../middleware/auth.js";
import authorize from "../middleware/roleMiddleware.js";
import {
  createCourse,
  getPublishedCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  searchCourses,
  getMyCourses,
  togglePublishCourse,
} from "../controllers/courseController.js";

const router = express.Router();

// STATIC SEARCH FIRST
router.get("/search", searchCourses); // ✅ ONLY "/search", no extra "courses"
// get own courses list
router.get("/my", auth, authorize("teacher", "admin"), getMyCourses);

// PUBLIC
router.get("/", getPublishedCourses);

// MIXED
router.get("/:id", auth, getCourseById);

// PROTECTED
router.post("/", auth, authorize("admin", "teacher"), createCourse);
router.put("/:id", auth, authorize("admin", "teacher"), updateCourse);
router.patch("/:id/publish", auth, authorize("admin", "teacher"), togglePublishCourse);
router.delete("/:id", auth, authorize("admin", "teacher"), deleteCourse);

export default router;
