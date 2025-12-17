// src/controllers/userController.js
import User from "../models/User.js";

// -------------------------
// Helper functions
// -------------------------
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  nickname: user.nickname || "",
  email: user.email,
  avatar: user.avatar || "",
  location: user.location || "",
  dateOfBirth: user.dateOfBirth,
  gender: user.gender,
  emailVerified: user.emailVerified || false,
  role: user.role || "student",
  createdAt: user.createdAt,
});

const findUserByIdOrFail = async (id) => {
  const user = await User.findById(id);
  if (!user) throw { status: 404, message: "User not found" };
  return user;
};

// -------------------------
// GET current authenticated user
// -------------------------
export const getMe = asyncHandler(async (req, res) => {
  const user = await findUserByIdOrFail(req.user._id);
  res.json(formatUser(user));
});  








// Promote a student to teacher
export const makeTeacher = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Only admin can promote
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Only admin can promote users");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.role = "teacher";
  await user.save();

  res.json({ message: `${user.name} is now a teacher`, user });
});


// -------------------------
// UPDATE current user profile
// -------------------------
export const updateMe = asyncHandler(async (req, res) => {
  const updates = {};
  const allowed = ["name", "nickname", "location", "dateOfBirth", "gender"];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  if (req.file) updates.avatar = `/uploads/profilePic/${req.file.filename}`;
  else if (req.body.deleteAvatar === true || req.body.deleteAvatar === "true") {
    updates.avatar = "";
  }

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




// Soft delete a user (disable account)
export const softDeleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (req.user._id.toString() === userId) {
    return res.status(400).json({ message: "You cannot delete yourself" });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();

  res.json({ message: "User account disabled successfully" });
});

// Restore a soft-deleted user
export const restoreUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

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
