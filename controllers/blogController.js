"use strict";

const blogModel = require("../models/blogModel");

const CATEGORY_ORDER = ["Mission", "Donation", "Places", "Guide"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HTTP_URL_PATTERN = /^https?:\/\/\S+$/i;

const getInitials = (name) =>
  String(name || "User")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getCurrentUser = (req) => {
  const sessionUser = req.session?.user;

  if (!sessionUser) {
    return null;
  }

  const id = String(
    sessionUser.id || sessionUser.userId || sessionUser._id || "",
  ).trim();

  if (!id) {
    return null;
  }

  const name = String(
    sessionUser.name ||
    sessionUser.fullName ||
    sessionUser.username ||
    "Current user",
  ).trim();

  return {
    ...sessionUser,
    id,
    name,
    email: String(sessionUser.email || "").trim(),
    initials: String(sessionUser.initials || getInitials(name)).trim(),
    role: String(sessionUser.role || "Author").trim(),
  };
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "Unpublished draft";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const toCategorySlug = (category) =>
  String(category || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const prepareCommentForView = (comment) => ({
  ...comment,
  displayDate: formatDate(comment.createdAt),
});

const preparePostForView = (post) => {
  if (!post) {
    return null;
  }

  const searchableText = [
    post.title,
    post.category,
    post.author?.name,
    post.summary,
    post.archiveSummary,
    ...(post.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return {
    ...post,
    categorySlug: toCategorySlug(post.category),
    displayDate: formatDate(post.publishedAt || post.updatedAt),
    url: `/blog/${encodeURIComponent(post.id)}`,
    searchableText,
    comments: (post.comments || []).map(prepareCommentForView),
    commentCount: Array.isArray(post.comments) ? post.comments.length : 0,
    shareEmailUrl:
      `mailto:?subject=${encodeURIComponent(`${post.title} — Làng & Co.`)}` +
      `&body=${encodeURIComponent(`Read this story from Làng & Co.: /blog/${post.id}`)}`,
  };
};

const getSharedViewData = (req) => {
  const currentUser = getCurrentUser(req);

  return {
    currentUser,
    currentUserId: currentUser?.id || null,
    myPostCount: currentUser
      ? blogModel.countPostsByAuthorId(currentUser.id)
      : 0,
  };
};

const getCategoriesForView = () => {
  const available = new Set(blogModel.getCategories());
  const ordered = CATEGORY_ORDER.filter((category) => available.has(category));
  const remaining = [...available].filter(
    (category) => !ordered.includes(category),
  );

  return [...ordered, ...remaining].map((name) => ({
    name,
    slug: toCategorySlug(name),
  }));
};

const getBlogPage = (req, res, next) => {
  try {
    const posts = blogModel.getPublishedPosts().map(preparePostForView);
    const leadStory = preparePostForView(blogModel.getLeadStory());
    const featuredPosts = blogModel
      .getFeaturedPosts()
      .map(preparePostForView);

    return res.render("blog/blog", {
      ...getSharedViewData(req),
      pageTitle: "Journal",
      pageSubtitle: "Stories, thoughts and ideas.",
      categories: getCategoriesForView(),
      posts,
      leadStory,
      featuredPosts,
    });
  } catch (error) {
    return next(error);
  }
};

const buildBlogViewData = (
  req,
  post,
  {
    commentErrors = {},
    commentValues = {},
    notice = "",
  } = {},
) => ({
  ...getSharedViewData(req),
  pageTitle: post.title,
  post: preparePostForView(post),
  relatedPosts: blogModel
    .getRelatedPosts(post.id, 3)
    .map(preparePostForView),
  commentErrors,
  commentValues,
  notice,
});

const getBlogViewPage = (req, res, next) => {
  try {
    const currentUser = getCurrentUser(req);
    const post = blogModel.getVisiblePostById(
      req.params.id,
      currentUser?.id || null,
    );

    if (!post) {
      return res.status(404).send("Blog post not found.");
    }

    const notice =
      req.query.comment === "added"
        ? "Your comment was posted."
        : "";

    return res.render(
      "blog/blogview",
      buildBlogViewData(req, post, { notice }),
    );
  } catch (error) {
    return next(error);
  }
};

const validateComment = (body, currentUser) => {
  const values = {
    name: currentUser?.name || String(body.name || "").trim(),
    email: currentUser?.email || String(body.email || "").trim(),
    comment: String(body.comment || body.content || "").trim(),
  };

  const errors = {};

  if (!currentUser) {
    if (values.name.length < 2 || values.name.length > 80) {
      errors.name = "Name must contain between 2 and 80 characters.";
    }

    if (!EMAIL_PATTERN.test(values.email)) {
      errors.email = "Enter a valid email address.";
    }
  }

  if (values.comment.length < 3 || values.comment.length > 1000) {
    errors.comment = "Comment must contain between 3 and 1000 characters.";
  }

  return { values, errors };
};

const addComment = (req, res, next) => {
  try {
    const post = blogModel.getVisiblePostById(req.params.id);

    if (!post || post.status !== "published") {
      return res.status(404).send("Blog post not found.");
    }

    const currentUser = getCurrentUser(req);
    const { values, errors } = validateComment(req.body, currentUser);

    if (Object.keys(errors).length > 0) {
      return res.status(422).render(
        "blog/blogview",
        buildBlogViewData(req, post, {
          commentErrors: errors,
          commentValues: values,
        }),
      );
    }

    const result = blogModel.addComment(post.id, {
      authorId: currentUser?.id || null,
      authorName: values.name,
      authorEmail: values.email,
      authorInitials: currentUser?.initials || getInitials(values.name),
      content: values.comment,
    });

    if (!result.ok) {
      return res.status(404).send("Blog post not found.");
    }

    return res.redirect(
      `/blog/${encodeURIComponent(post.id)}?comment=added#comments`,
    );
  } catch (error) {
    return next(error);
  }
};

const deleteComment = (req, res, next) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).send("You must be logged in to delete a comment.");
    }

    const result = blogModel.deleteComment(
      req.params.id,
      req.params.commentId,
      currentUser.id,
    );

    if (!result.ok) {
      const status = result.reason === "forbidden" ? 403 : 404;
      return res.status(status).send("Comment could not be deleted.");
    }

    return res.redirect(
      `/blog/${encodeURIComponent(req.params.id)}#comments`,
    );
  } catch (error) {
    return next(error);
  }
};

const requireCurrentUser = (req, res) => {
  const currentUser = getCurrentUser(req);

  if (!currentUser) {
    res.status(401).send("You must be logged in to manage blog posts.");
    return null;
  }

  return currentUser;
};

const parseTags = (value) => {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const parseContent = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  const text = String(value || "").trim();

  if (!text) {
    return [];
  }

  return text
    .split(/\n{2,}/)
    .map((paragraph, index) => ({
      type: "paragraph",
      introduction: index === 0,
      text: paragraph.trim(),
    }))
    .filter((block) => block.text);
};

const toBoolean = (value) =>
  value === true ||
  value === "true" ||
  value === "1" ||
  value === "on";

const normalisePostInput = (body, status) => ({
  title: String(body.title || "").trim(),
  category: String(body.category || "Guide").trim(),
  summary: String(body.summary || "").trim(),
  archiveSummary: String(body.archiveSummary || body.summary || "").trim(),
  readTime: Number(body.readTime) || 1,
  imageUrl: String(body.imageUrl || "").trim(),
  imageAlt: String(body.imageAlt || body.title || "Blog image").trim(),
  imageCaption: String(body.imageCaption || "").trim(),
  tags: parseTags(body.tags || body.categories),
  content: parseContent(body.content),
  isLead: toBoolean(body.isLead),
  isFeatured: toBoolean(body.isFeatured),
  status,
});

const validatePostInput = (values, { draft = false } = {}) => {
  const errors = {};

  if (draft) {
    if (values.title.length > 150) {
      errors.title = "Draft title must not exceed 150 characters.";
    }

    if (values.imageUrl && !HTTP_URL_PATTERN.test(values.imageUrl)) {
      errors.imageUrl = "Image URL must begin with http:// or https://.";
    }

    return errors;
  }

  if (values.title.length < 5 || values.title.length > 150) {
    errors.title = "Title must contain between 5 and 150 characters.";
  }

  if (!CATEGORY_ORDER.includes(values.category)) {
    errors.category = "Choose Mission, Donation, Places, or Guide.";
  }

  if (values.summary.length < 20 || values.summary.length > 400) {
    errors.summary = "Summary must contain between 20 and 400 characters.";
  }

  const contentLength = values.content
    .map((block) => String(block.text || ""))
    .join(" ")
    .length;

  if (contentLength < 50 || contentLength > 20000) {
    errors.content = "Content must contain between 50 and 20,000 characters.";
  }

  if (values.imageUrl && !HTTP_URL_PATTERN.test(values.imageUrl)) {
    errors.imageUrl = "Image URL must begin with http:// or https://.";
  }

  if (values.readTime < 1 || values.readTime > 120) {
    errors.readTime = "Read time must be between 1 and 120 minutes.";
  }

  return errors;
};

const sendPostValidationErrors = (res, errors) =>
  res.status(422).json({
    message: "Blog post validation failed.",
    errors,
  });

const createPost = (req, res, next) => {
  try {
    const currentUser = requireCurrentUser(req, res);

    if (!currentUser) {
      return undefined;
    }

    const status = req.body.status === "published" ? "published" : "draft";
    const values = normalisePostInput(req.body, status);
    const errors = validatePostInput(values, {
      draft: status === "draft",
    });

    if (Object.keys(errors).length > 0) {
      return sendPostValidationErrors(res, errors);
    }

    const post = blogModel.createPost(values, currentUser);
    return res.redirect(`/blog/${encodeURIComponent(post.id)}`);
  } catch (error) {
    return next(error);
  }
};

const updatePost = (req, res, next) => {
  try {
    const currentUser = requireCurrentUser(req, res);

    if (!currentUser) {
      return undefined;
    }

    const existingPost = blogModel.getPostById(req.params.id);

    if (!existingPost) {
      return res.status(404).send("Blog post not found.");
    }

    const status =
      req.body.status === "draft" || req.body.status === "published"
        ? req.body.status
        : existingPost.status;

    const values = normalisePostInput(req.body, status);
    const errors = validatePostInput(values, {
      draft: status === "draft",
    });

    if (Object.keys(errors).length > 0) {
      return sendPostValidationErrors(res, errors);
    }

    const result = blogModel.updatePost(
      req.params.id,
      currentUser.id,
      {
        ...values,
        image: {
          url: values.imageUrl,
          listUrl: values.imageUrl,
          alt: values.imageAlt,
          caption: values.imageCaption,
          listCaption: values.imageCaption,
        },
      },
    );

    if (!result.ok) {
      const responseStatus = result.reason === "forbidden" ? 403 : 404;
      return res
        .status(responseStatus)
        .send("Blog post could not be updated.");
    }

    return res.redirect(`/blog/${encodeURIComponent(result.post.id)}`);
  } catch (error) {
    return next(error);
  }
};

const saveDraft = (req, res, next) => {
  req.body.status = "draft";
  return updatePost(req, res, next);
};

const publishPost = (req, res, next) => {
  req.body.status = "published";
  return updatePost(req, res, next);
};

const deletePost = (req, res, next) => {
  try {
    const currentUser = requireCurrentUser(req, res);

    if (!currentUser) {
      return undefined;
    }

    const result = blogModel.deletePost(req.params.id, currentUser.id);

    if (!result.ok) {
      const status = result.reason === "forbidden" ? 403 : 404;
      return res.status(status).send("Blog post could not be deleted.");
    }

    return res.redirect("/blog");
  } catch (error) {
    return next(error);
  }
};

const getMyPostsPage = (req, res, next) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res.redirect("/shared/login");
    }

    const posts = blogModel
      .getPostsByAuthorId(currentUser.id)
      .map(preparePostForView);

    return res.render("blog/my_posts", {
      ...getSharedViewData(req),
      pageTitle: "My Blog Posts",
      posts,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getBlogPage,
  getBlogViewPage,
  addComment,
  deleteComment,
  createPost,
  updatePost,
  saveDraft,
  publishPost,
  deletePost,
  getMyPostsPage,
};
