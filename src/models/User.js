// src/models/User.js
import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name must be less than 50 characters"],
      default: "New User",
    },
    nickname: {
      type: String,
      trim: true,
      minlength: [2, "Nickname must be at least 2 characters"],
      maxlength: [30, "Nickname must be less than 30 characters"],
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Email must be valid"],
    },
    password: {
      type: String,
      select: false,
    },
    googleId: { type: String, unique: true, sparse: true },
    isGoogleAccount: { type: Boolean, default: false },
    avatar: String,
    location: { type: String, trim: true, maxlength: [100, "Location cannot exceed 100 characters"] },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Male", "Female"], required: false },

    role: { type: String, enum: ["admin", "teacher", "student"], default: "student" },

    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    resetPasswordToken: String,
    resetPasswordExpires: Date,

    fcmToken: { type: String, default: null },
  },
  { timestamps: true }
);

// -----------------------------
// Password reset token
// -----------------------------
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// -----------------------------
// Email verification token
// -----------------------------
userSchema.methods.createEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto.createHash("sha256").update(token).digest("hex");
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

export default mongoose.models.User || mongoose.model("User", userSchema);
