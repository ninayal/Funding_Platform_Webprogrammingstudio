"use strict";

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const UPLOAD_DIR = path.join(__dirname, "../public/uploads/reviews");
const MAX_REVIEW_IMAGE_COUNT = 3;

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const allowedSignatures = [
  { mime: "image/jpeg", bytes: [0xff,0xd8,0xff], ext: ".jpg" },
  { mime: "image/png", bytes: [0x89,0x50,0x4e,0x47], ext: ".png" },
  { mime: "image/webp", bytes: [0x52,0x49,0x46,0x46], ext: ".webp" }
];

const checkMagicBytes = (buffer) => {
  const match = allowedSignatures.find(item =>
    item.bytes.every((byte, index) => buffer[index] === byte)
  );
  return match || null;
};

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => {
    cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
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

    const invalid = (req.files || []).find(file => {
      const buffer = fs.readFileSync(file.path);
      return !checkMagicBytes(buffer);
    });

    if (invalid) {
      fs.unlinkSync(invalid.path);
      req.reviewUploadError = "Upload JPG, PNG, or WEBP images only.";
    }

    next();
  });
};

module.exports = {
  MAX_REVIEW_IMAGE_COUNT,
  uploadReviewImages
};
