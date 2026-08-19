const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "public", "images", "uploads", "products");
fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error("Only JPG, PNG, WEBP, or GIF images are allowed."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
}).fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
]);

// Wraps multer so upload errors (bad file type, too large) surface as req.uploadError
// instead of crashing the request, letting the controller re-render the form normally.
const uploadProductImages = (req, res, next) => {
  upload(req, res, (error) => {
    if (error) {
      req.uploadError = error instanceof multer.MulterError
        ? (error.code === "LIMIT_FILE_SIZE" ? "Each image must be 5MB or smaller." : error.message)
        : error.message;
    }
    next();
  });
};

module.exports = uploadProductImages;
