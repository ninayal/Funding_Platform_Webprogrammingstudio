"use strict";

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(
    __dirname,
    "../public/uploads/profile"
);

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, uploadDir);
    },

    filename: (_, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `profile-${Date.now()}${ext}`);
    }
});

const fileFilter = (_, file, cb) => {
    const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    cb(
        allowed.includes(file.mimetype)
            ? null
            : new Error("Only JPG, PNG and WEBP images are allowed."),
        allowed.includes(file.mimetype)
    );
};

module.exports = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
}).single("avatar");