"use strict";

const multer = require("multer");

const MAX_REVIEW_IMAGE_COUNT = 3;
const MAX_REVIEW_IMAGE_SIZE =
  1024 * 1024; // 1 MB per image

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
]);

const uploader = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize:
      MAX_REVIEW_IMAGE_SIZE,

    files:
      MAX_REVIEW_IMAGE_COUNT
  },

  fileFilter: (
    req,
    file,
    callback
  ) => {
    if (
      allowedMimeTypes.has(
        file.mimetype
      )
    ) {
      return callback(null, true);
    }

    const error = new Error(
      "Upload JPG, PNG, or WEBP images."
    );

    error.code =
      "INVALID_REVIEW_IMAGE_TYPE";

    return callback(error);
  }
});

const getUploadErrorMessage = (
  error
) => {
  if (!error) {
    return "";
  }

  if (
    error.code ===
    "LIMIT_FILE_SIZE"
  ) {
    return (
      "Each image must be " +
      "1 MB or smaller."
    );
  }

  if (
    error.code ===
      "LIMIT_FILE_COUNT" ||
    error.code ===
      "LIMIT_UNEXPECTED_FILE"
  ) {
    return (
      "Upload no more than " +
      "3 images."
    );
  }

  if (
    error.code ===
    "INVALID_REVIEW_IMAGE_TYPE"
  ) {
    return error.message;
  }

  return (
    "The review images " +
    "could not be processed."
  );
};

const uploadReviewImages = (
  req,
  res,
  next
) => {
  uploader.array(
    "reviewImages",
    MAX_REVIEW_IMAGE_COUNT
  )(
    req,
    res,
    (error) => {
      req.reviewUploadError =
        getUploadErrorMessage(
          error
        );

      return next();
    }
  );
};

module.exports = {
  MAX_REVIEW_IMAGE_COUNT,
  MAX_REVIEW_IMAGE_SIZE,
  uploadReviewImages
};
