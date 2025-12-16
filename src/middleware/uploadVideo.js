import multer from "multer";

// Use memory storage to upload buffer to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["video/mp4", "video/mkv", "video/quicktime"];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only video files are allowed"));
};

const uploadVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

export default uploadVideo;
