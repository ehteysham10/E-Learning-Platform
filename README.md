
```
e-learning-backend
├─ .env
├─ package-lock.json
├─ package.json
└─ src
   ├─ config
   │  ├─ db.js
   │  └─ passportGoogle.js
   ├─ controllers
   │  ├─ authController.js
   │  ├─ courseController.js
   │  ├─ enrollmentController.js
   │  ├─ googleController.js
   │  ├─ lessonController.js
   │  ├─ quizController.js
   │  └─ userController.js
   ├─ middleware
   │  ├─ auth.js
   │  ├─ roleMiddleware.js
   │  ├─ upload.js
   │  └─ uploadVideo.js
   ├─ models
   │  ├─ Course.js
   │  ├─ Enrollment.js
   │  ├─ Lesson.js
   │  ├─ Quiz.js
   │  └─ User.js
   ├─ routes
   │  ├─ authRoutes.js
   │  ├─ courseRoutes.js
   │  ├─ emailService.js
   │  ├─ enrollmentRoutes.js
   │  ├─ googleRoutes.js
   │  ├─ lessonRoutes.js
   │  ├─ quizRoutes.js
   │  └─ userRoutes.js
   ├─ scripts
   │  └─ createAdmin.js
   ├─ server.js
   ├─ services
   │  ├─ emailService.js
   │  └─ tokenService.js
   ├─ uploads
   │  ├─ eventBanners
   │  ├─ posts
   │  └─ profilePic
   └─ utils
      ├─ cloudinary.js
      └─ passwordValidator.js

```