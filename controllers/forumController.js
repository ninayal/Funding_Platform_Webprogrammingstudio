const forumModel = require("../models/forumModel");
const userModel = require("../models/userModel");
const { requestWantsJson } = require("../middlewares/authMiddleware");

const MAX_CONTENT_LENGTH = 3_000_000;
const MAX_TITLE_LENGTH = 150;
const MAX_TEXT_LENGTH = 10_000;
const SORT_OPTIONS = ["new", "top", "hot"];

const isAdminUser = (user) => userModel.isAdminRole(user?.role);

const plainTextLength = (html) => String(html || "").replace(/<[^>]*>/g, "").trim().length;

const getForumHome = (req, res) => {
  const members = userModel.getAllUsers();
  const latestMember = members
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  res.render("forum/forum", {
    categorySummary: forumModel.getForumSummary(),
    totals: forumModel.getForumTotals(),
    trendingThreads: forumModel.getTrendingThreads(3),
    latestThreads: forumModel.getLatestThreads(5),
    memberCount: members.length,
    latestMemberUsername: latestMember ? latestMember.username : "—",
    getLatestPost: forumModel.getLatestPost,
    getRepliesCount: forumModel.getRepliesCount,
  });
};

const getThreadList = (req, res, next) => {
  const categoryId = req.params.category || "all";
  const categoryMeta = categoryId === "all" ? null : forumModel.getCategoryMeta(categoryId);

  if (categoryId !== "all" && !categoryMeta) {
    return next();
  }

  const sortBy = SORT_OPTIONS.includes(req.query.sort) ? req.query.sort : "new";

  res.render("forum/thread_list", {
    categoryId,
    categoryLabel: categoryMeta ? categoryMeta.label : "New Posts",
    threads: forumModel.getThreadsByCategory(categoryId, sortBy),
    categories: forumModel.categories,
    sortBy,
    getLatestPost: forumModel.getLatestPost,
    getRepliesCount: forumModel.getRepliesCount,
  });
};

const getThreadContent = (req, res, next) => {
  const viewerId = req.currentUser?.id || null;
  const isAdmin = isAdminUser(req.currentUser);
  const thread = forumModel.getVisibleThreadBySlug(req.params.slug, viewerId, isAdmin);

  if (!thread) {
    return next();
  }

  const decoratedThread = {
    ...thread,
    posts: thread.posts.map((post) => forumModel.decoratePost(post, viewerId)),
  };

  res.render("forum/thread_content", {
    thread: decoratedThread,
    categoryMeta: forumModel.getCategoryMeta(thread.category),
    getLatestPost: forumModel.getLatestPost,
    getRepliesCount: forumModel.getRepliesCount,
  });
};

const searchForum = (req, res) => {
  const query = String(req.query.q || "").trim();
  const filters = {
    category: String(req.query.category || "").trim(),
    tag: String(req.query.tag || "").trim(),
    author: String(req.query.author || "").trim(),
    from: String(req.query.from || "").trim(),
    to: String(req.query.to || "").trim(),
  };

  const hasFilters = Object.values(filters).some(Boolean);

  res.render("forum/search_results", {
    query,
    filters,
    categories: forumModel.categories,
    tags: forumModel.getAllTags(),
    results: query || hasFilters ? forumModel.searchThreads(query, filters) : [],
    getRepliesCount: forumModel.getRepliesCount,
    getLatestPost: forumModel.getLatestPost,
  });
};

const getCreateThreadPage = (req, res) => {
  res.render("forum/Create_thread", {
    categories: forumModel.categories,
    maxTitleLength: MAX_TITLE_LENGTH,
    maxTextLength: MAX_TEXT_LENGTH,
    thread: null,
  });
};

const getEditThreadPage = (req, res, next) => {
  const thread = forumModel.getThreadBySlug(req.params.slug);

  if (!thread || thread.authorId !== req.currentUser.id) {
    return next();
  }

  res.render("forum/Create_thread", {
    categories: forumModel.categories,
    maxTitleLength: MAX_TITLE_LENGTH,
    maxTextLength: MAX_TEXT_LENGTH,
    thread,
  });
};

const createThread = (req, res) => {
  const { category, title, content, status, tags } = req.body;
  const categoryMeta = forumModel.getCategoryMeta(category);

  if (
    String(content || "").length > MAX_CONTENT_LENGTH ||
    String(title || "").length > MAX_TITLE_LENGTH ||
    plainTextLength(content) > MAX_TEXT_LENGTH
  ) {
    return res.redirect("/forum/create");
  }

  const sanitizedContent = forumModel.sanitizeContent(content);

  if (!categoryMeta || !String(title || "").trim() || forumModel.isContentEmpty(sanitizedContent)) {
    return res.redirect("/forum/create");
  }

  const author = req.currentUser;

  const thread = forumModel.addThread({
    category,
    title: String(title).trim(),
    content: sanitizedContent,
    author: author.name,
    authorId: author.id,
    initials: author.initials || "GU",
    rank: "Member",
    status: status === "draft" ? "draft" : "published",
    tags,
  });

  if (thread.status === "draft") {
    return res.redirect("/forum/your-posts");
  }

  return res.redirect(`/forum/thread/${thread.slug}`);
};

const editThread = (req, res) => {
  const { category, title, content, tags } = req.body;

  if (
    String(content || "").length > MAX_CONTENT_LENGTH ||
    String(title || "").length > MAX_TITLE_LENGTH ||
    plainTextLength(content) > MAX_TEXT_LENGTH
  ) {
    return res.redirect(`/forum/thread/${req.params.slug}/edit`);
  }

  const thread = forumModel.editThread(req.params.slug, req.currentUser.id, {
    title,
    category,
    tags,
    content,
  });

  if (!thread) {
    return res.redirect(`/forum/thread/${req.params.slug}/edit`);
  }

  return res.redirect(`/forum/thread/${thread.slug}`);
};

const deleteThread = (req, res) => {
  const isAdmin = isAdminUser(req.currentUser);
  const ok = forumModel.deleteThread(req.params.slug, req.currentUser.id, isAdmin);

  if (!ok) {
    return res.status(403).redirect(`/forum/thread/${req.params.slug}`);
  }

  return res.redirect("/forum/your-posts");
};

const getEditPostPage = (req, res, next) => {
  const found = forumModel.findPost(req.params.slug, req.params.postId);

  if (!found || found.post.authorId !== req.currentUser.id) {
    return next();
  }

  res.render("forum/edit_post", {
    thread: found.thread,
    post: found.post,
    maxTextLength: MAX_TEXT_LENGTH,
  });
};

const editPost = (req, res) => {
  const { content } = req.body;

  if (String(content || "").length > MAX_CONTENT_LENGTH || plainTextLength(content) > MAX_TEXT_LENGTH) {
    return res.redirect(`/forum/thread/${req.params.slug}/post/${req.params.postId}/edit`);
  }

  const result = forumModel.editPost(req.params.slug, req.params.postId, req.currentUser.id, content);

  if (!result) {
    return res.redirect(`/forum/thread/${req.params.slug}/post/${req.params.postId}/edit`);
  }

  return res.redirect(`/forum/thread/${req.params.slug}#post-${req.params.postId}`);
};

const deletePost = (req, res) => {
  const isAdmin = isAdminUser(req.currentUser);
  const found = forumModel.findPost(req.params.slug, req.params.postId);
  const wasOriginalPost = Boolean(found && found.thread.posts[0].id === req.params.postId);

  const ok = forumModel.deletePost(req.params.slug, req.params.postId, req.currentUser.id, isAdmin);

  if (!ok) {
    return res.status(403).redirect(`/forum/thread/${req.params.slug}`);
  }

  if (wasOriginalPost) {
    return res.redirect("/forum/your-posts");
  }

  return res.redirect(`/forum/thread/${req.params.slug}`);
};

const reportPost = (req, res) => {
  const { reason } = req.body;
  const result = forumModel.reportPost(req.params.slug, req.params.postId, req.currentUser.id, reason);

  if (!result) {
    if (requestWantsJson(req)) {
      return res.status(404).json({ ok: false, message: "Post not found." });
    }
    return res.redirect(`/forum/thread/${req.params.slug}`);
  }

  if (requestWantsJson(req)) {
    return res.json(result);
  }

  return res.redirect(`/forum/thread/${req.params.slug}#post-${req.params.postId}`);
};

const getPostPreview = (req, res) => {
  const preview = forumModel.getPostPreview(req.params.slug, req.params.postId);

  if (!preview) {
    return res.status(404).json({ ok: false, message: "Post not found." });
  }

  return res.json({ ok: true, ...preview });
};

const replyToThread = (req, res) => {
  const viewerId = req.currentUser?.id || null;
  const isAdmin = isAdminUser(req.currentUser);
  const thread = forumModel.getVisibleThreadBySlug(req.params.slug, viewerId, isAdmin);

  if (!thread) {
    return res.status(404).redirect("/forum/new-posts");
  }

  if (thread.locked) {
    return res.redirect(`/forum/thread/${thread.slug}`);
  }

  const { content, parentPostId } = req.body;

  if (String(content || "").length > MAX_CONTENT_LENGTH || plainTextLength(content) > MAX_TEXT_LENGTH) {
    return res.redirect(`/forum/thread/${thread.slug}`);
  }

  const sanitizedContent = forumModel.sanitizeContent(content);

  if (forumModel.isContentEmpty(sanitizedContent)) {
    return res.redirect(`/forum/thread/${thread.slug}`);
  }

  const author = req.currentUser;

  const result = forumModel.addPost(thread.slug, {
    author: author.name,
    authorId: author.id,
    initials: author.initials || "GU",
    rank: "Member",
    content: sanitizedContent,
    parentPostId: parentPostId || null,
  });

  return res.redirect(`/forum/thread/${thread.slug}#post-${result.post.id}`);
};

const getYourPostsPage = (req, res) => {
  const threads = forumModel.getThreadsByAuthor(req.currentUser.id);

  res.render("forum/your_posts", {
    threads,
    categories: forumModel.categories,
    getLatestPost: forumModel.getLatestPost,
    getRepliesCount: forumModel.getRepliesCount,
  });
};

const publishThread = (req, res) => {
  const thread = forumModel.publishThread(req.params.slug, req.currentUser.id);

  if (!thread) {
    return res.status(404).redirect("/forum/your-posts");
  }

  return res.redirect("/forum/your-posts");
};

const getBookmarkedPage = (req, res) => {
  const bookmarks = forumModel.getBookmarkedPosts(req.currentUser.id);

  res.render("forum/bookmarked", {
    bookmarks,
    categories: forumModel.categories,
  });
};

const getNotificationsPage = (req, res) => {
  const notifications = forumModel.getNotificationsForUser(req.currentUser.id);
  forumModel.markAllRead(req.currentUser.id);

  res.render("forum/notifications", { notifications });
};

const getUserProfilePage = (req, res, next) => {
  const profileUser = userModel.findById(req.params.userId);

  if (!profileUser) {
    return next();
  }

  const isAdmin = isAdminUser(req.currentUser);
  const viewerId = req.currentUser?.id || null;

  const threads = forumModel.getThreadsByAuthor(profileUser.id).filter((t) => {
    if (isAdmin || t.authorId === viewerId) {
      return true;
    }
    return t.status !== "draft" && !t.hidden;
  });

  res.render("forum/user_profile", {
    profileUser,
    threads,
    getRepliesCount: forumModel.getRepliesCount,
  });
};

const getAdminModerationPage = (req, res) => {
  const threads = forumModel.threads
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.render("forum/admin_moderation", {
    threads,
    categories: forumModel.categories,
    reports: forumModel.getOpenReports(),
    getRepliesCount: forumModel.getRepliesCount,
  });
};

const moderateThread = (req, res) => {
  forumModel.moderateThread(req.params.slug, req.params.action);
  return res.redirect("/forum/admin");
};

const resolveReport = (req, res) => {
  forumModel.resolveReport(req.params.id, req.params.status);
  return res.redirect("/forum/admin");
};

const respondToReaction = (req, res, result) => {
  if (!result) {
    if (requestWantsJson(req)) {
      return res.status(404).json({ ok: false, message: "Post not found." });
    }
    return res.redirect(`/forum/thread/${req.params.slug}`);
  }

  if (requestWantsJson(req)) {
    return res.json(result);
  }

  return res.redirect(`/forum/thread/${req.params.slug}#post-${req.params.postId}`);
};

const toggleLike = (req, res) => {
  const result = forumModel.toggleLike(req.params.slug, req.params.postId, req.currentUser.id);
  return respondToReaction(req, res, result);
};

const toggleDislike = (req, res) => {
  const result = forumModel.toggleDislike(req.params.slug, req.params.postId, req.currentUser.id);
  return respondToReaction(req, res, result);
};

const toggleBookmark = (req, res) => {
  const result = forumModel.toggleBookmark(req.params.slug, req.params.postId, req.currentUser.id);
  return respondToReaction(req, res, result);
};

module.exports = {
  getForumHome,
  getThreadList,
  getThreadContent,
  getCreateThreadPage,
  getEditThreadPage,
  createThread,
  editThread,
  deleteThread,
  getEditPostPage,
  editPost,
  deletePost,
  reportPost,
  getPostPreview,
  replyToThread,
  searchForum,
  getYourPostsPage,
  publishThread,
  getBookmarkedPage,
  getNotificationsPage,
  getUserProfilePage,
  getAdminModerationPage,
  moderateThread,
  resolveReport,
  toggleLike,
  toggleDislike,
  toggleBookmark,
};
