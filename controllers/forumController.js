const forumModel = require("../models/forumModel");
const userModel = require("../models/userModel");
const { requestWantsJson } = require("../middlewares/authMiddleware");

const MAX_CONTENT_LENGTH = 3_000_000;
const MAX_TITLE_LENGTH = 150;
const MAX_TEXT_LENGTH = 10_000;
const SORT_OPTIONS = ["new", "top"];

const isAdminUser = (user) => userModel.isAdminRole(user?.role);

const plainTextLength = (html) => String(html || "").replace(/<[^>]*>/g, "").trim().length;

const getForumHome = async (req, res) => {
  const members = await userModel.getAllUsers();
  const latestMember = members
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  const [categorySummary, totals, trendingThreads, latestThreads] = await Promise.all([
    forumModel.getForumSummary(),
    forumModel.getForumTotals(),
    forumModel.getTrendingThreads(3),
    forumModel.getLatestThreads(5),
  ]);

  res.render("forum/forum", {
    categorySummary,
    totals,
    trendingThreads,
    latestThreads,
    memberCount: members.length,
    latestMemberUsername: latestMember ? latestMember.username : "—",
    getLatestPost: forumModel.getLatestPost,
    getRepliesCount: forumModel.getRepliesCount,
  });
};

const getThreadList = async (req, res, next) => {
  const categoryId = req.params.category || "all";
  const categoryMeta = categoryId === "all" ? null : forumModel.getCategoryMeta(categoryId);

  if (categoryId !== "all" && !categoryMeta) {
    return next();
  }

  const sortBy = SORT_OPTIONS.includes(req.query.sort) ? req.query.sort : "new";
  const threads = await forumModel.getThreadsByCategory(categoryId, sortBy);

  res.render("forum/thread_list", {
    categoryId,
    categoryLabel: categoryMeta ? categoryMeta.label : "New Posts",
    threads,
    categories: forumModel.categories,
    sortBy,
    getLatestPost: forumModel.getLatestPost,
    getRepliesCount: forumModel.getRepliesCount,
  });
};

const getThreadContent = async (req, res, next) => {
  const viewerId = req.currentUser?.id || null;
  const isAdmin = isAdminUser(req.currentUser);
  const thread = await forumModel.getVisibleThreadBySlug(req.params.slug, viewerId, isAdmin);

  if (!thread) {
    return next();
  }

  await forumModel.incrementViews(thread.slug);
  thread.views += 1;

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

const searchForum = async (req, res) => {
  const query = String(req.query.q || "").trim();
  const filters = {
    category: String(req.query.category || "").trim(),
    tag: String(req.query.tag || "").trim(),
    author: String(req.query.author || "").trim(),
    from: String(req.query.from || "").trim(),
    to: String(req.query.to || "").trim(),
  };

  const hasFilters = Object.values(filters).some(Boolean);

  const [tags, results] = await Promise.all([
    forumModel.getAllTags(),
    query || hasFilters ? forumModel.searchThreads(query, filters) : Promise.resolve([]),
  ]);

  res.render("forum/search_results", {
    query,
    filters,
    categories: forumModel.categories,
    tags,
    results,
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

const getEditThreadPage = async (req, res, next) => {
  const thread = await forumModel.getThreadBySlug(req.params.slug);

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

const createThread = async (req, res) => {
  const { category, title, content, status, tags } = req.body;
  const categoryMeta = forumModel.getCategoryMeta(category);

  if (
    String(content || "").length > MAX_CONTENT_LENGTH ||
    String(title || "").length > MAX_TITLE_LENGTH ||
    plainTextLength(content) > MAX_TEXT_LENGTH
  ) {
    return res.redirect("/forum/create");
  }

  if (!categoryMeta || !String(title || "").trim() || forumModel.isContentEmpty(content)) {
    return res.redirect("/forum/create");
  }

  const author = req.currentUser;

  const thread = await forumModel.addThread({
    category,
    title: String(title).trim(),
    content,
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

const editThread = async (req, res) => {
  const { category, title, content, tags } = req.body;

  if (
    String(content || "").length > MAX_CONTENT_LENGTH ||
    String(title || "").length > MAX_TITLE_LENGTH ||
    plainTextLength(content) > MAX_TEXT_LENGTH
  ) {
    return res.redirect(`/forum/thread/${req.params.slug}/edit`);
  }

  const thread = await forumModel.editThread(req.params.slug, req.currentUser.id, {
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

const deleteThread = async (req, res) => {
  const isAdmin = isAdminUser(req.currentUser);
  const ok = await forumModel.deleteThread(req.params.slug, req.currentUser.id, isAdmin);

  if (!ok) {
    return res.status(403).redirect(`/forum/thread/${req.params.slug}`);
  }

  return res.redirect("/forum/your-posts");
};

const getEditPostPage = async (req, res, next) => {
  const found = await forumModel.findPost(req.params.slug, req.params.postId);

  if (!found || found.post.authorId !== req.currentUser.id) {
    return next();
  }

  res.render("forum/edit_post", {
    thread: found.thread,
    post: found.post,
    maxTextLength: MAX_TEXT_LENGTH,
  });
};

const editPost = async (req, res) => {
  const { content } = req.body;

  if (String(content || "").length > MAX_CONTENT_LENGTH || plainTextLength(content) > MAX_TEXT_LENGTH) {
    return res.redirect(`/forum/thread/${req.params.slug}/post/${req.params.postId}/edit`);
  }

  const result = await forumModel.editPost(req.params.slug, req.params.postId, req.currentUser.id, content);

  if (!result) {
    return res.redirect(`/forum/thread/${req.params.slug}/post/${req.params.postId}/edit`);
  }

  return res.redirect(`/forum/thread/${req.params.slug}#post-${req.params.postId}`);
};

const deletePost = async (req, res) => {
  const isAdmin = isAdminUser(req.currentUser);
  const found = await forumModel.findPost(req.params.slug, req.params.postId);
  const wasOriginalPost = Boolean(found && found.thread.posts[0].id === req.params.postId);

  const ok = await forumModel.deletePost(req.params.slug, req.params.postId, req.currentUser.id, isAdmin);

  if (!ok) {
    return res.status(403).redirect(`/forum/thread/${req.params.slug}`);
  }

  if (wasOriginalPost) {
    return res.redirect("/forum/your-posts");
  }

  return res.redirect(`/forum/thread/${req.params.slug}`);
};

const reportPost = async (req, res) => {
  const { reason } = req.body;
  const result = await forumModel.reportPost(req.params.slug, req.params.postId, req.currentUser.id, reason);

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

const getPostPreview = async (req, res) => {
  const preview = await forumModel.getPostPreview(req.params.slug, req.params.postId);

  if (!preview) {
    return res.status(404).json({ ok: false, message: "Post not found." });
  }

  return res.json({ ok: true, ...preview });
};

const replyToThread = async (req, res) => {
  const viewerId = req.currentUser?.id || null;
  const isAdmin = isAdminUser(req.currentUser);
  const thread = await forumModel.getVisibleThreadBySlug(req.params.slug, viewerId, isAdmin);

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

  if (forumModel.isContentEmpty(content)) {
    return res.redirect(`/forum/thread/${thread.slug}`);
  }

  const author = req.currentUser;

  const result = await forumModel.addPost(thread.slug, {
    author: author.name,
    authorId: author.id,
    initials: author.initials || "GU",
    rank: "Member",
    content,
    parentPostId: parentPostId || null,
  });

  return res.redirect(`/forum/thread/${thread.slug}#post-${result.post.id}`);
};

const getYourPostsPage = async (req, res) => {
  const threads = await forumModel.getThreadsByAuthor(req.currentUser.id);

  res.render("forum/your_posts", {
    threads,
    categories: forumModel.categories,
    getLatestPost: forumModel.getLatestPost,
    getRepliesCount: forumModel.getRepliesCount,
  });
};

const publishThread = async (req, res) => {
  const thread = await forumModel.publishThread(req.params.slug, req.currentUser.id);

  if (!thread) {
    return res.status(404).redirect("/forum/your-posts");
  }

  return res.redirect("/forum/your-posts");
};

const getBookmarkedPage = async (req, res) => {
  const bookmarks = await forumModel.getBookmarkedPosts(req.currentUser.id);

  res.render("forum/bookmarked", {
    bookmarks,
    categories: forumModel.categories,
  });
};

const getNotificationsPage = async (req, res) => {
  const notifications = await forumModel.getNotificationsForUser(req.currentUser.id);
  await forumModel.markAllRead(req.currentUser.id);

  res.render("forum/notifications", { notifications });
};

const getUserProfilePage = async (req, res, next) => {
  const profileUser = await userModel.findById(req.params.userId);

  if (!profileUser) {
    return next();
  }

  const isAdmin = isAdminUser(req.currentUser);
  const viewerId = req.currentUser?.id || null;

  const authoredThreads = await forumModel.getThreadsByAuthor(profileUser.id);
  const threads = authoredThreads.filter((t) => {
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

const getAdminModerationPage = async (req, res) => {
  const [threads, reports] = await Promise.all([
    forumModel.getAllThreadsForAdmin(),
    forumModel.getOpenReports(),
  ]);

  res.render("forum/admin_moderation", {
    threads,
    categories: forumModel.categories,
    reports,
    getRepliesCount: forumModel.getRepliesCount,
  });
};

const moderateThread = async (req, res) => {
  await forumModel.moderateThread(req.params.slug, req.params.action);
  return res.redirect("/forum/admin");
};

const resolveReport = async (req, res) => {
  await forumModel.resolveReport(req.params.id, req.params.status);
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

const toggleLike = async (req, res) => {
  const result = await forumModel.toggleLike(req.params.slug, req.params.postId, req.currentUser.id);
  return respondToReaction(req, res, result);
};

const toggleDislike = async (req, res) => {
  const result = await forumModel.toggleDislike(req.params.slug, req.params.postId, req.currentUser.id);
  return respondToReaction(req, res, result);
};

const toggleBookmark = async (req, res) => {
  const result = await forumModel.toggleBookmark(req.params.slug, req.params.postId, req.currentUser.id);
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
