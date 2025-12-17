// src/routes/quizRoutes.js
import express from "express";
import auth from "../middleware/auth.js";
import authorize from "../middleware/roleMiddleware.js";
import {
  createQuiz,
  getQuizzesByCourse,
  updateQuiz,
  deleteQuiz,
  togglePublishQuiz,
} from "../controllers/quizController.js";

const router = express.Router();

// Course-based quizzes
router.get("/courses/:courseId/quizzes",auth, getQuizzesByCourse);
router.post("/courses/:courseId/quizzes",auth,authorize("admin", "teacher"),createQuiz);

// Quiz-level actions
router.put("/quizzes/:id", auth, authorize("admin", "teacher"), updateQuiz);
router.patch("/quizzes/:id/publish", auth, authorize("admin", "teacher"), togglePublishQuiz);
router.delete("/quizzes/:id", auth, authorize("admin", "teacher"), deleteQuiz);

export default router;
