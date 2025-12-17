// src/controllers/userController.js
import asyncHandler from "../utils/asyncHandler.js";
import { findUserByIdOrFail, formatUser } from "../utils/userHelpers.js";
import User from "../models/User.js";

// -------------------------
// GET current authenticated user
// -------------------------
export const getMe = asyncHandler(async (req, res) => {
  const user = await findUserByIdOrFail(req.user._id);
  res.json(formatUser(user));
});

// -------------------------
// Promote a student to teacher
// -------------------------
export const makeTeacher = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (req.user.role !== "admin") {
    const err = new Error("Only admin can promote users");
    err.status = 403;
    throw err;
  }

  const user = await findUserByIdOrFail(userId);
  user.role = "teacher";
  await user.save();

  res.json({ message: `${user.name} is now a teacher`, user });
});

// -------------------------
// UPDATE current user profile
// -------------------------
export const updateMe = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "nickname", "location", "dateOfBirth", "gender"];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  if (req.file) updates.avatar = `/uploads/profilePic/${req.file.filename}`;
  else if (req.body.deleteAvatar === true || req.body.deleteAvatar === "true") updates.avatar = "";

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ message: "Profile updated", user: formatUser(user) });
});

// -------------------------
// GET user by ID (public)
// -------------------------
export const getUserById = asyncHandler(async (req, res) => {
  const user = await findUserByIdOrFail(req.params.id);
  res.json(formatUser(user));
});

// -------------------------
// Soft delete a user (disable account)
// -------------------------
export const softDeleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (req.user._id.toString() === userId)
    return res.status(400).json({ message: "You cannot delete yourself" });

  const user = await findUserByIdOrFail(userId);
  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();

  res.json({ message: "User account disabled successfully" });
});

// -------------------------
// Restore a soft-deleted user
// -------------------------
export const restoreUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await findUserByIdOrFail(userId);
  user.isDeleted = false;
  user.deletedAt = null;
  await user.save();

  res.json({ message: "User restored successfully" });
});

// -------------------------
// SAVE or update FCM token
// -------------------------
export const saveFcmToken = asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;

  if (!fcmToken) return res.status(400).json({ message: "fcmToken is required" });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { fcmToken },
    { new: true }
  );

  res.json({ message: "FCM token saved", user: formatUser(user) });
});
