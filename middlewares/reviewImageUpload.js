"use strict";

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const UPLOAD_DIR = path.join(__dirname, "../public/images/uploads/reviews");
const MAX_REVIEW_IMAGE_COUNT = 3;

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const allowedSignatures = [
  { mime: "image/jpeg", bytes: [0xff,0xd8,0xff], ext: ".jpg" },
  { mime: "image/png", bytes: [0x89,0x50,0x4e,0x47], ext: ".png" },
  { mime: "image/webp", bytes: [0x52,0x49,0x46,0x46], ext: ".webp" }
];

const checkMagicBytes = (buffer) => {
  const match = allowedSignatures.find((item) => {
    if (!item.bytes.every((byte, index) => buffer[index] === byte)) {
      return false;
    }

    if (item.mime === "image/webp") {
      return buffer.toString("ascii", 8, 12) === "WEBP";
    }

    return true;
  });

  return match || null;
};

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => {
    cb(null,`review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${path.extname(file.originalname).toLowerCase()}`);
  }
});

const uploader = multer({
  storage,
  limits: { fileSize: 1024 * 1024, files: MAX_REVIEW_IMAGE_COUNT }
});

const uploadReviewImages = (req, res, next) => {
  uploader.array("reviewImages", MAX_REVIEW_IMAGE_COUNT)(req,res,(error)=>{
    if (error) {
      req.reviewUploadError = error.code === "LIMIT_FILE_SIZE"
        ? "Each image must be 1 MB or smaller."
        : "Upload no more than 3 images.";
      return next();
    }

    const invalidFiles = (req.files || []).filter((file) => {
      const buffer = fs.readFileSync(file.path);
      return !checkMagicBytes(buffer);
    });

    invalidFiles.forEach((file) => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    if (invalidFiles.length) {
      req.reviewUploadError = "Upload JPG, PNG, or WEBP images only.";
    }

    next();
  });
};

module.exports = {
  MAX_REVIEW_IMAGE_COUNT,
  uploadReviewImages
};
