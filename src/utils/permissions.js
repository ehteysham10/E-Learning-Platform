// src/utils/permissions.js
export const isOwnerOrAdmin = (user, ownerId) => {
  if (!user) return false;
  return user.role === "admin" || ownerId.toString() === user._id.toString();
};
