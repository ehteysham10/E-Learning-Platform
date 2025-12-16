// src/models/Lesson.js
import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    content: {
      type: String, // lesson text / markdown
    },
    videoUrl: {
      type: String, // Cloudinary / streaming URL
    },
    duration: {
      type: Number, // minutes
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lesson", lessonSchema);
