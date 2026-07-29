"use strict";

const CATEGORY_ORDER = [
  "Mission",
  "Donation",
  "Places",
  "Guide",
];

const HTTP_URL_PATTERN =
  /^https?:\/\/\S+$/i;

const clean = (value) =>
  String(value || "").trim();

const parseTags = (value) =>
  (
    Array.isArray(value)
      ? value
      : String(
          value || "",
        ).split(",")
  )
    .map(clean)
    .filter(Boolean)
    .slice(0, 12);

const parseContent = (
  value,
) => {
  if (Array.isArray(value)) {
    return value;
  }

  return clean(value)
    .split(/\n{2,}/)
    .map(
      (
        paragraph,
        index,
      ) => ({
        type: "paragraph",
        introduction:
          index === 0,
        text:
          clean(paragraph),
      }),
    )
    .filter(
      (block) =>
        block.text,
    );
};

const contentToText = (
  content = [],
) =>
  content
    .filter((block) =>
      [
        "paragraph",
        "heading",
        "quote",
      ].includes(
        block.type,
      ),
    )
    .map(
      (block) =>
        block.text,
    )
    .filter(Boolean)
    .join("\n\n");

const toBoolean = (
  value,
) =>
  value === true ||
  value === "true" ||
  value === "1" ||
  value === "on";

const normalisePostInput = (
  body = {},
  forcedStatus = null,
) => {
  const status =
    forcedStatus ||
    (body.status ===
    "published"
      ? "published"
      : "draft");

  return {
    title:
      clean(body.title),

    category:
      clean(
        body.category ||
          "Guide",
      ),

    summary:
      clean(body.summary),

    archiveSummary:
      clean(
        body.archiveSummary ||
          body.summary,
      ),

    readTime:
      Number(
        body.readTime,
      ) || 1,

    imageUrl:
      clean(
        body.imageUrl,
      ),

    imageAlt:
      clean(
        body.imageAlt ||
          body.title ||
          "Blog image",
      ),

    imageCaption:
      clean(
        body.imageCaption,
      ),

    tags:
      parseTags(
        body.tags,
      ),

    content:
      parseContent(
        body.content,
      ),

    isLead:
      toBoolean(
        body.isLead,
      ),

    isFeatured:
      toBoolean(
        body.isFeatured,
      ),

    status,
  };
};

const validatePost = (
  values,
  {
    draft = false,
  } = {},
) => {
  const errors = {};

  if (draft) {
    if (!values.title) {
      errors.title =
        "Give the draft a title before saving it.";
    } else if (
      values.title.length >
      150
    ) {
      errors.title =
        "Draft title must not exceed 150 characters.";
    }

    if (
      values.imageUrl &&
      !HTTP_URL_PATTERN.test(
        values.imageUrl,
      )
    ) {
      errors.imageUrl =
        "Image URL must begin with http:// or https://.";
    }

    return errors;
  }

  if (
    values.title.length <
      5 ||
    values.title.length >
      150
  ) {
    errors.title =
      "Title must contain between 5 and 150 characters.";
  }

  if (
    !CATEGORY_ORDER.includes(
      values.category,
    )
  ) {
    errors.category =
      "Choose Mission, Donation, Places, or Guide.";
  }

  if (
    values.summary.length <
      20 ||
    values.summary.length >
      400
  ) {
    errors.summary =
      "Summary must contain between 20 and 400 characters.";
  }

  const contentLength =
    contentToText(
      values.content,
    ).length;

  if (
    contentLength < 50 ||
    contentLength > 20000
  ) {
    errors.content =
      "Content must contain between 50 and 20,000 characters.";
  }

  if (
    !values.imageUrl ||
    !HTTP_URL_PATTERN.test(
      values.imageUrl,
    )
  ) {
    errors.imageUrl =
      "Enter an image URL beginning with http:// or https://.";
  }

  if (
    values.readTime < 1 ||
    values.readTime > 120
  ) {
    errors.readTime =
      "Read time must be between 1 and 120 minutes.";
  }

  return errors;
};

const validateCommentContent = (
  value,
  label = "Comment",
) => {
  const content =
    clean(value);

  const errors = {};

  if (
    content.length < 3 ||
    content.length > 1000
  ) {
    errors.content =
      `${label} must contain between 3 and 1000 characters.`;
  }

  return {
    content,
    errors,
  };
};

module.exports = {
  CATEGORY_ORDER,
  contentToText,
  normalisePostInput,
  validateCommentContent,
  validatePost,
};