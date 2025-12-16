
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// const auth = async (req, res, next) => {
//   const header = req.headers.authorization;

//   if (!header)
//     return res.status(401).json({ message: "Authorization header missing" });

//   const token = header.startsWith("Bearer ")
//     ? header.substring(7)
//     : header;

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.id).select("-password");
//     if (!user)
//       return res.status(401).json({ message: "Invalid token" });

//     req.user = user; // attach user to request
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };

// export default auth;













import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header)
    return res.status(401).json({ message: "Authorization header missing" });

  const token = header.startsWith("Bearer ")
    ? header.substring(7)
    : header;

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user (without password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user)
      return res.status(401).json({ message: "Invalid token" });

    // ✅ Check if email is verified
    if (!user.emailVerified)
      return res.status(403).json({ message: "Email not verified. Please verify your email to proceed." });

    req.user = user; // attach user to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default auth;
