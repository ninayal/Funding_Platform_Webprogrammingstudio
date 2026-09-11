"use strict";

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirectory = path.join(
    __dirname,
    "..",
    "public",
    "uploads",
    "blog"
);

fs.mkdirSync(uploadDirectory, {
    recursive: true,
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(
            file.originalname
        ).toLowerCase();

        const baseName = path
            .basename(
                file.originalname,
                extension
            )
            .replace(/[^a-z0-9-_]/gi, "-")
            .replace(/-+/g, "-")
            .toLowerCase();

        const uniqueName =
            `${Date.now()}-${baseName || "image"}${extension}`;

        cb(null, uniqueName);
    },
});

const fileFilter = (
    req,
    file,
    cb
) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (
        !allowedTypes.includes(
            file.mimetype
        )
    ) {
        return cb(
            new Error(
                "Only JPG, PNG, and WEBP images are allowed."
            )
        );
    }

    cb(null, true);
};

const uploadBlogImage = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

module.exports = uploadBlogImage;