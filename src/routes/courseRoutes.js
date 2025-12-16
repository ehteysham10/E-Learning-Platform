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
  togglePublishCourse,
} from "../controllers/courseController.js";

const router = express.Router();

// Public
router.get("/", getPublishedCourses);

// Mixed (auth optional, but required for unpublished access)
router.get("/:id", auth, getCourseById);

// Protected
router.post("/", auth, authorize("admin", "teacher"), createCourse);
router.put("/:id", auth, authorize("admin", "teacher"), updateCourse);
router.patch("/:id/publish", auth, authorize("admin", "teacher"), togglePublishCourse);
router.delete("/:id", auth, authorize("admin", "teacher"), deleteCourse);

export default router;
