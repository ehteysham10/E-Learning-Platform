// src/utils/userHelpers.js
import User from "../models/User.js";

/**
 * Fetch a user by ID or throw 404
 * @param {string} id - User ID
 * @returns {Promise<User>}
 */
export const findUserByIdOrFail = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return user;
};

/**
 * Format user object for API response
 * @param {User} user
 */
export const formatUser = (user) => ({
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
