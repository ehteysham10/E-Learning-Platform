// src/controllers/quizController.js
import asyncHandler from "express-async-handler";
import Quiz from "../models/Quiz.js";
import Course from "../models/Course.js";

/**
 * @desc    Create quiz
 * @route   POST /api/courses/:courseId/quizzes
 * @access  Owner (Teacher) or Admin
 */
export const createQuiz = asyncHandler(async (req, res) => {
  const { title, description, questions, timeLimit, passingScore, lesson } = req.body;
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
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
 * @access  Public (published course)
 */
export const getQuizzesByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const quizzes = await Quiz.find({
    course: courseId,
    isPublished: true,
  }).select("-questions.correctAnswerIndex");

  res.json(quizzes);
});

/**
 * @desc    Update quiz
 * @route   PUT /api/quizzes/:id
 * @access  Owner (Teacher) or Admin
 */
export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  const course = await Course.findById(quiz.course);
  if (
    req.user.role !== "admin" &&
    course.teacher.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

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
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  const course = await Course.findById(quiz.course);
  if (
    req.user.role !== "admin" &&
    course.teacher.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

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
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  const course = await Course.findById(quiz.course);
  if (
    req.user.role !== "admin" &&
    course.teacher.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  await quiz.deleteOne();
  course.totalQuizzes = Math.max(course.totalQuizzes - 1, 0);
  await course.save();

  res.json({ message: "Quiz deleted successfully" });
});
