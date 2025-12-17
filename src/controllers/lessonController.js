
// src/controllers/lessonController.js
import asyncHandler from "express-async-handler";
import Lesson from "../models/Lesson.js";
import Course from "../models/Course.js";
import { uploadVideoToCloudinary } from "../utils/cloudinary.js";
import { isOwnerOrAdmin } from "../utils/permissions.js";

/**
 * Helper: Fetch course and check ownership/admin
 */
const getCourseAndCheckPermission = async (user, courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    const error = new Error("Course not found");
    error.status = 404;
    throw error;
  }

  if (!isOwnerOrAdmin(user, course.teacher)) {
    const error = new Error("Not authorized");
    error.status = 403;
    throw error;
  }

  return course;
};

/**
 * Helper: Fetch lesson by ID
 */
const getLessonById = async (id) => {
  const lesson = await Lesson.findById(id);
  if (!lesson) {
    const error = new Error("Lesson not found");
    error.status = 404;
    throw error;
  }
  return lesson;
};

/**
 * @desc    Create lesson (with optional video upload)
 * @route   POST /api/courses/:courseId/lessons
 * @access  Owner (Teacher) or Admin
 */
export const createLesson = asyncHandler(async (req, res) => {
  const { title, content, duration, order, resources } = req.body;
  const { courseId } = req.params;

  const course = await getCourseAndCheckPermission(req.user, courseId);

  let videoUrl = null;
  if (req.file) {
    videoUrl = await uploadVideoToCloudinary(req.file.buffer, "lessons");
  }

  const lesson = await Lesson.create({
    title,
    content,
    videoUrl,
    duration,
    order,
    resources: resources ? JSON.parse(resources) : [],
    course: courseId,
  });

  course.totalLessons += 1;
  await course.save();

  res.status(201).json(lesson);
});

/**
 * @desc    Get lessons of a course
 * @route   GET /api/courses/:courseId/lessons
 * @access  Public (published course)
 */
export const getLessonsByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course || !course.isPublished) {
    res.status(404);
    throw new Error("Course not found or not published");
  }

  const lessons = await Lesson.find({
    course: courseId,
    isPublished: true,
  }).sort({ order: 1 });

  res.json(lessons);
});

/**
 * @desc    Update lesson (can replace video)
 * @route   PUT /api/lessons/:id
 * @access  Owner (Teacher) or Admin
 */
export const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await getLessonById(req.params.id);
  const course = await getCourseAndCheckPermission(req.user, lesson.course);

  if (req.file) {
    lesson.videoUrl = await uploadVideoToCloudinary(req.file.buffer, "lessons");
  }

  const { title, content, duration, order, resources } = req.body;
  if (title) lesson.title = title;
  if (content) lesson.content = content;
  if (duration) lesson.duration = duration;
  if (order) lesson.order = order;
  if (resources) lesson.resources = JSON.parse(resources);

  await lesson.save();
  res.json(lesson);
});

/**
 * @desc    Delete lesson
 * @route   DELETE /api/lessons/:id
 * @access  Owner (Teacher) or Admin
 */
export const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await getLessonById(req.params.id);
  const course = await getCourseAndCheckPermission(req.user, lesson.course);

  await lesson.deleteOne();
  course.totalLessons = Math.max(course.totalLessons - 1, 0);
  await course.save();

  res.json({ message: "Lesson deleted successfully" });
});
