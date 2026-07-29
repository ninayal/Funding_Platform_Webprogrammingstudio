const forumModel = require("../models/forumModel");

const TRENDING_SLUGS = ["qa-handmade-verification", "experience-dongho-village"];
const LATEST_SLUGS = ["experience-bamboo-tea-set", "feedback-checkout-mobile"];

const getForumHome = (req, res) => {
  res.render("forum/forum", {
    categorySummary: forumModel.getForumSummary(),
    totals: forumModel.getForumTotals(),
    trendingThreads: TRENDING_SLUGS.map(forumModel.getThreadBySlug),
    latestThreads: LATEST_SLUGS.map(forumModel.getThreadBySlug),
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
  const thread = forumModel.getThreadBySlug(req.params.slug);

  if (!thread) {
    return next();
  }

  res.render("forum/thread_content", {
    thread,
    categoryMeta: forumModel.getCategoryMeta(thread.category),
    getLatestPost: forumModel.getLatestPost,
    getRepliesCount: forumModel.getRepliesCount,
  });
};

const getCreateThreadPage = (req, res) => {
  res.render("forum/Create_thread");
};

module.exports = {
  getForumHome,
  getThreadList,
  getThreadContent,
  getCreateThreadPage,
};
