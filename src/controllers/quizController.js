
// src/controllers/quizController.js
import asyncHandler from "express-async-handler";
import Quiz from "../models/Quiz.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
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
 * Helper: Fetch quiz by ID
 */
const getQuizById = async (id) => {
  const quiz = await Quiz.findById(id);
  if (!quiz) {
    const error = new Error("Quiz not found");
    error.status = 404;
    throw error;
  }
  return quiz;
};

/**
 * Helper: Check student enrollment
 */
const isStudentEnrolled = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });
  return !!enrollment;
};

/**
 * @desc    Create quiz
 * @route   POST /api/courses/:courseId/quizzes
 * @access  Owner (Teacher) or Admin
 */
export const createQuiz = asyncHandler(async (req, res) => {
  const { title, description, questions, timeLimit, passingScore, lesson } = req.body;
  const { courseId } = req.params;

  const course = await getCourseAndCheckPermission(req.user, courseId);

  const quiz = await Quiz.create({
    title,
    description,
    questions,
    timeLimit,
    passingScore,
    course: courseId,
    lesson: lesson || null,
  });

  course.totalQuizzes += 1;
  await course.save();

  res.status(201).json(quiz);
});

/**
 * @desc    Get quizzes by course
 * @route   GET /api/courses/:courseId/quizzes
 * @access  Enrolled Students | Owner | Admin
 */
export const getQuizzesByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const user = req.user;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  // Teacher or Admin → see all quizzes
  if (isOwnerOrAdmin(user, course.teacher)) {
    const quizzes = await Quiz.find({ course: courseId });
    return res.json(quizzes);
  }

  // Student → must be enrolled
  if (user.role === "student") {
    const enrolled = await isStudentEnrolled(user._id, courseId);
    if (!enrolled) {
      res.status(403);
      throw new Error("You are not enrolled in this course");
    }

    const quizzes = await Quiz.find({
      course: courseId,
      isPublished: true,
    }).select("-questions.correctAnswerIndex");

    return res.json(quizzes);
  }

  res.status(403);
  throw new Error("Not authorized");
});

/**
 * @desc    Update quiz
 * @route   PUT /api/quizzes/:id
 * @access  Owner (Teacher) or Admin
 */
export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await getQuizById(req.params.id);
  await getCourseAndCheckPermission(req.user, quiz.course);

  Object.assign(quiz, req.body);
  await quiz.save();

  res.json(quiz);
});

/**
 * @desc    Publish / Unpublish quiz
 * @route   PATCH /api/quizzes/:id/publish
 * @access  Owner (Teacher) or Admin
 */
export const togglePublishQuiz = asyncHandler(async (req, res) => {
  const quiz = await getQuizById(req.params.id);
  await getCourseAndCheckPermission(req.user, quiz.course);

  quiz.isPublished = !quiz.isPublished;
  await quiz.save();

  res.json({
    message: `Quiz ${quiz.isPublished ? "published" : "unpublished"} successfully`,
  });
});

/**
 * @desc    Delete quiz
 * @route   DELETE /api/quizzes/:id
 * @access  Owner (Teacher) or Admin
 */
export const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await getQuizById(req.params.id);
  const course = await getCourseAndCheckPermission(req.user, quiz.course);

  await quiz.deleteOne();
  course.totalQuizzes = Math.max(course.totalQuizzes - 1, 0);
  await course.save();

  res.json({ message: "Quiz deleted successfully" });
});
