
// src/controllers/courseController.js
import asyncHandler from "express-async-handler";
import Course from "../models/Course.js";
import { isOwnerOrAdmin } from "../utils/permissions.js";

/**
 * Allowed fields for update to avoid overwriting sensitive data
 */
const allowedUpdateFields = ["title", "description", "category", "level", "tags"];

/**
 * @desc    Create new course
 * @route   POST /api/courses
 * @access  Teacher, Admin
 */
export const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, tags } = req.body;

  const course = await Course.create({
    title,
    description,
    category,
    tags,
    teacher: req.user._id, // owner of course
  });

  res.status(201).json(course);
});

/**
 * @desc    Get all published courses (public)
 * @route   GET /api/courses
 * @access  Public
 */
export const getPublishedCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ isPublished: true })
    .populate("teacher", "name avatar")
    .sort({ createdAt: -1 });

  res.json(courses);
});

/**
 * @desc    Get course by ID
 * @route   GET /api/courses/:id
 * @access  Public (published) | Owner/Admin (unpublished)
 */
export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate("teacher", "name avatar");
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (!course.isPublished && !isOwnerOrAdmin(req.user, course.teacher._id)) {
    res.status(403);
    throw new Error("Course not published");
  }

  res.json(course);
}); 






/**
 * @desc    Get all courses created by the logged-in teacher/admin
 * @route   GET /api/courses/my
 * @access  Teacher/Admin
 */
export const getMyCourses = asyncHandler(async (req, res) => {
  const user = req.user;

  // Admin sees all courses, teacher only their own
  const filter = user.role === "admin" ? {} : { teacher: user._id };

  const courses = await Course.find(filter)
    .populate("teacher", "name avatar")
    .sort({ createdAt: -1 });

  res.json({
    total: courses.length,
    courses,
  });
});


/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Owner (Teacher) or Admin
 */
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (!isOwnerOrAdmin(req.user, course.teacher)) {
    res.status(403);
    throw new Error("Not authorized");
  }

  // Only update allowed fields
  allowedUpdateFields.forEach((field) => {
    if (req.body[field] !== undefined) course[field] = req.body[field];
  });

  await course.save();
  res.json(course);
});

/**
 * @desc    Publish / Unpublish course
 * @route   PATCH /api/courses/:id/publish
 * @access  Owner (Teacher) or Admin
 */
export const togglePublishCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (!isOwnerOrAdmin(req.user, course.teacher)) {
    res.status(403);
    throw new Error("Not authorized");
  }

  course.isPublished = !course.isPublished;
  await course.save();

  res.json({
    message: `Course ${course.isPublished ? "published" : "unpublished"} successfully`,
  });
});

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Owner (Teacher) or Admin
 */
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (!isOwnerOrAdmin(req.user, course.teacher)) {
    res.status(403);
    throw new Error("Not authorized! Only Teacher can create course");
  }

  await course.deleteOne();
  res.json({ message: "Course deleted successfully" });
});




/**
 * @desc    Search courses (full-text + tags)
 * @route   GET /api/courses/search
 * @access  Public
 */
export const searchCourses = asyncHandler(async (req, res) => {
  const { q, tags, category } = req.query;

  const filter = { isPublished: true };

  // Category filter
  if (category) {
    filter.category = category;
  }

  // Tags filter (comma separated)
  if (tags) {
    filter.tags = { $in: tags.split(",") };
  }

  let courses;

  // Full-text search
  if (q) {
    courses = await Course.find(
      {
        ...filter,
        $text: { $search: q },
      },
      {
        score: { $meta: "textScore" },
      }
    ).sort({ score: { $meta: "textScore" } });
  } else {
    courses = await Course.find(filter);
  }

  res.json({
    total: courses.length,
    courses,
  });
});