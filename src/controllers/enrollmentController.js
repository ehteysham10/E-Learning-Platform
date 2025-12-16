// src/controllers/enrollmentController.js
import asyncHandler from "express-async-handler";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";

/**
 * @desc    Enroll student in course
 * @route   POST /api/courses/:courseId/enroll
 * @access  Student
 */
export const enrollCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (req.user.role !== "student") {
    res.status(403);
    throw new Error("Only students can enroll");
  }

  const course = await Course.findById(courseId);
  if (!course || !course.isPublished) {
    res.status(404);
    throw new Error("Course not found or not published");
  }

  const existing = await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
  });

  if (existing) {
    return res.status(400).json({ message: "Already enrolled in this course" });
  }

  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: courseId,
  });

  res.status(201).json({ message: "Enrolled successfully", enrollment });
});

/**
 * @desc    Get student's enrolled courses
 * @route   GET /api/enrollments/me
 * @access  Student
 */
export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate("course", "title description teacher")
    .sort({ enrolledAt: -1 });

  res.json(enrollments);
});

/**
 * @desc    Mark lesson as completed
 * @route   POST /api/enrollments/:enrollmentId/complete-lesson
 * @access  Student
 */
export const completeLesson = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const { lessonId } = req.body;

  const enrollment = await Enrollment.findById(enrollmentId).populate("course");
  if (!enrollment) {
    res.status(404);
    throw new Error("Enrollment not found");
  }

  if (enrollment.student.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (!enrollment.completedLessons.includes(lessonId)) {
    enrollment.completedLessons.push(lessonId);
  }

  // Update progress percentage
  const totalLessons = enrollment.course.totalLessons || 1;
  enrollment.progress =
    Math.min((enrollment.completedLessons.length / totalLessons) * 100, 100);

  await enrollment.save();

  res.json({ message: "Lesson marked as completed", progress: enrollment.progress });
});
