// src/models/Course.js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },

    thumbnail: {
      type: String, // Cloudinary URL
    },

    // Ownership
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Course state
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Future-proof fields
    totalLessons: {
      type: Number,
      default: 0,
    },
    totalQuizzes: {
      type: Number,
      default: 0,
    },

    tags: [String],
  },
  { timestamps: true }
);



// 🔍 TEXT SEARCH INDEX
courseSchema.index({
  title: "text",
  description: "text",
  category: "text",
  tags: "text",
});
export default mongoose.model("Course", courseSchema);
