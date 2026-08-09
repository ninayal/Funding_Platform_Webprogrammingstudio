const forumModel = require("../models/forumModel");
const userModel = require("../models/userModel");
const { requestWantsJson } = require("../middlewares/authMiddleware");

const MAX_CONTENT_LENGTH = 3_000_000;

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

  res.render("forum/thread_list", {
    categoryId,
    categoryLabel: categoryMeta ? categoryMeta.label : "New Posts",
    threads: forumModel.getThreadsByCategory(categoryId),
    categories: forumModel.categories,
    getLatestPost: forumModel.getLatestPost,
    getRepliesCount: forumModel.getRepliesCount,
  });
};

const getThreadContent = (req, res, next) => {
  const viewerId = req.currentUser?.id || null;
  const thread = forumModel.getVisibleThreadBySlug(req.params.slug, viewerId);

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

  res.render("forum/search_results", {
    query,
    results: query ? forumModel.searchThreads(query) : [],
    getRepliesCount: forumModel.getRepliesCount,
    getLatestPost: forumModel.getLatestPost,
  });
};

const getCreateThreadPage = (req, res) => {
  res.render("forum/Create_thread", {
    categories: forumModel.categories,
  });
};

const createThread = (req, res) => {
  const { category, title, content, status } = req.body;
  const categoryMeta = forumModel.getCategoryMeta(category);

  if (String(content || "").length > MAX_CONTENT_LENGTH) {
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
  });

  if (thread.status === "draft") {
    return res.redirect("/forum/your-posts");
  }

  return res.redirect(`/forum/thread/${thread.slug}`);
};

const replyToThread = (req, res) => {
  const viewerId = req.currentUser?.id || null;
  const thread = forumModel.getVisibleThreadBySlug(req.params.slug, viewerId);

  if (!thread) {
    return res.status(404).redirect("/forum/new-posts");
  }

  const { content } = req.body;

  if (String(content || "").length > MAX_CONTENT_LENGTH) {
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
  createThread,
  replyToThread,
  searchForum,
  getYourPostsPage,
  publishThread,
  getBookmarkedPage,
  toggleLike,
  toggleDislike,
  toggleBookmark,
};
