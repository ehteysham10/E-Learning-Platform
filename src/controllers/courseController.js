// src/controllers/courseController.js
import asyncHandler from "express-async-handler";
import Course from "../models/Course.js";

/**
 * @desc    Create new course
 * @route   POST /api/courses
 * @access  Teacher, Admin
 */
export const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, level, tags } = req.body;

  const course = await Course.create({
    title,
    description,
    category,
    level,
    tags,
    teacher: req.user._id,
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
  const course = await Course.findById(req.params.id).populate(
    "teacher",
    "name avatar"
  );

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  // If not published, only owner or admin can view
  if (
    !course.isPublished &&
    req.user &&
    (req.user.role === "admin" ||
      course.teacher._id.toString() === req.user._id.toString())
  ) {
    return res.json(course);
  }

  if (!course.isPublished) {
    res.status(403);
    throw new Error("Course not published");
  }

  res.json(course);
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

  if (
    req.user.role !== "admin" &&
    course.teacher.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  Object.assign(course, req.body);
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

  if (
    req.user.role !== "admin" &&
    course.teacher.toString() !== req.user._id.toString()
  ) {
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

  if (
    req.user.role !== "admin" &&
    course.teacher.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  await course.deleteOne();
  res.json({ message: "Course deleted successfully" });
});
