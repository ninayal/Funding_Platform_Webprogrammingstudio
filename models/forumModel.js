const { randomUUID } = require("node:crypto");

const ForumThreads = require("./schemas/ForumThread");
const ForumReports = require("./schemas/ForumReport");
const ForumNotifications = require("./schemas/ForumNotification");
const userModel = require("./userModel");
const { categories } = require("../data/forum.js");

const MAX_REPORT_REASON_LENGTH = 500;

const VISIBLE_FILTER = { status: { $ne: "draft" }, hidden: false };

const getCategoryMeta = (categoryId) => categories.find((c) => c.id === categoryId);

const isPublished = (thread) => thread.status !== "draft";
const isHidden = (thread) => Boolean(thread.hidden);
const isPubliclyVisible = (thread) => isPublished(thread) && !isHidden(thread);

const getLatestPost = (thread) => thread.posts[thread.posts.length - 1];

const getLatestPostTime = (thread) => new Date(getLatestPost(thread).createdAt).getTime();

const getRepliesCount = (thread) => thread.posts.length - 1;

const getThreadEngagementScore = (thread) => {
  const reactionTotal = thread.posts.reduce(
    (sum, post) => sum + post.likedBy.length + post.dislikedBy.length + post.bookmarkedBy.length,
    0
  );

  return reactionTotal * 5 + getRepliesCount(thread) * 2 + thread.views * 0.1;
};

const stripHtml = (html) =>
  String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const buildSnippet = (text, query, radius = 80) => {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());

  if (idx === -1) {
    return text.slice(0, radius * 2).trim();
  }

  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);

  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
};

const isContentEmpty = (html) => !/<img\b/i.test(html) && !stripHtml(html);

const parseTags = (rawTags) => {
  const source = Array.isArray(rawTags) ? rawTags.join(",") : rawTags;

  return Array.from(
    new Set(
      String(source || "")
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    )
  ).slice(0, 10);
};

const SORT_COMPARATORS = {
  new: (a, b) => getLatestPostTime(b) - getLatestPostTime(a),
  top: (a, b) => b.views - a.views,
};

/* =========================
   READS
========================= */

const getThreadBySlug = async (slug) => ForumThreads.findOne({ slug }).lean();

// Live Mongoose document (not lean) for callers that need to mutate + save.
const getThreadDocBySlug = async (slug) => ForumThreads.findOne({ slug });

const getThreadsByCategory = async (categoryId, sortBy = "new") => {
  const filter = { ...VISIBLE_FILTER };
  if (categoryId !== "all") {
    filter.category = categoryId;
  }

  const visible = await ForumThreads.find(filter).lean();

  const comparator = SORT_COMPARATORS[sortBy] || SORT_COMPARATORS.new;
  const sorted = visible.slice().sort(comparator);

  const pinned = sorted.filter((t) => t.pinned);
  const rest = sorted.filter((t) => !t.pinned);

  return [...pinned, ...rest];
};

const getVisibleThreadBySlug = async (slug, viewerId, isAdmin = false) => {
  const thread = await getThreadBySlug(slug);

  if (!thread) {
    return null;
  }

  if (isAdmin || thread.authorId === viewerId) {
    return thread;
  }

  if (!isPubliclyVisible(thread)) {
    return null;
  }

  return thread;
};

const incrementViews = async (slug) => {
  await ForumThreads.updateOne({ slug }, { $inc: { views: 1 } });
};

const getThreadsByAuthor = async (authorId) =>
  ForumThreads.find({ authorId }).sort({ createdAt: -1 }).lean();

const getAllThreadsForAdmin = async () =>
  ForumThreads.find().sort({ createdAt: -1 }).lean();

const findPost = async (slug, postId) => {
  const thread = await getThreadBySlug(slug);
  const post = thread?.posts.find((p) => p.id === postId);

  return post ? { thread, post } : null;
};

// Live document + live subdocument, for reaction/edit/delete/report mutations.
const findPostDoc = async (slug, postId) => {
  const threadDoc = await getThreadDocBySlug(slug);

  if (!threadDoc) {
    return null;
  }

  const post = threadDoc.posts.find((p) => p.id === postId);

  return post ? { threadDoc, post } : null;
};

const decoratePost = (post, viewerId) => ({
  ...post,
  likeCount: post.likedBy.length,
  dislikeCount: post.dislikedBy.length,
  likedByCurrentUser: Boolean(viewerId) && post.likedBy.includes(viewerId),
  dislikedByCurrentUser: Boolean(viewerId) && post.dislikedBy.includes(viewerId),
  bookmarkedByCurrentUser: Boolean(viewerId) && post.bookmarkedBy.includes(viewerId),
  reportedByCurrentUser: Boolean(viewerId) && post.reportedBy.includes(viewerId),
});

/* =========================
   NOTIFICATIONS
========================= */

const addNotification = async ({ userId, type, threadSlug, postId, actorId, actorName }) => {
  if (!userId || userId === actorId) {
    return null;
  }

  const notification = await ForumNotifications.create({
    _id: randomUUID(),
    userId,
    type,
    threadSlug,
    postId,
    actorId,
    actorName,
    read: false,
    createdAt: new Date(),
  });

  return notification.toObject();
};

const getNotificationsForUser = async (userId) =>
  ForumNotifications.find({ userId }).sort({ createdAt: -1 }).lean();

const getUnreadCount = async (userId) =>
  ForumNotifications.countDocuments({ userId, read: false });

const markAllRead = async (userId) => {
  await ForumNotifications.updateMany({ userId, read: false }, { $set: { read: true } });
};

/* =========================
   REACTIONS
========================= */

const toggleReaction = async (slug, postId, userId, kind) => {
  const found = await findPostDoc(slug, postId);

  if (!found || !userId) {
    return null;
  }

  const { post, threadDoc } = found;
  const [ownList, oppositeList] =
    kind === "like" ? [post.likedBy, post.dislikedBy] : [post.dislikedBy, post.likedBy];

  const oppositeIndex = oppositeList.indexOf(userId);
  if (oppositeIndex !== -1) {
    oppositeList.splice(oppositeIndex, 1);
  }

  const ownIndex = ownList.indexOf(userId);
  let active;
  if (ownIndex === -1) {
    ownList.push(userId);
    active = true;
  } else {
    ownList.splice(ownIndex, 1);
    active = false;
  }

  if (kind === "like" && active && post.authorId && post.authorId !== userId) {
    const actor = await userModel.findById(userId);
    await addNotification({
      userId: post.authorId,
      type: "like",
      threadSlug: threadDoc.slug,
      postId: post.id,
      actorId: userId,
      actorName: actor ? actor.name : "Someone",
    });
  }

  await threadDoc.save();

  return {
    ok: true,
    liked: post.likedBy.includes(userId),
    disliked: post.dislikedBy.includes(userId),
    likeCount: post.likedBy.length,
    dislikeCount: post.dislikedBy.length,
    active,
  };
};

const toggleLike = (slug, postId, userId) => toggleReaction(slug, postId, userId, "like");
const toggleDislike = (slug, postId, userId) => toggleReaction(slug, postId, userId, "dislike");

const toggleBookmark = async (slug, postId, userId) => {
  const found = await findPostDoc(slug, postId);

  if (!found || !userId) {
    return null;
  }

  const { post, threadDoc } = found;
  const index = post.bookmarkedBy.indexOf(userId);
  let bookmarked;

  if (index === -1) {
    post.bookmarkedBy.push(userId);
    bookmarked = true;
  } else {
    post.bookmarkedBy.splice(index, 1);
    bookmarked = false;
  }

  await threadDoc.save();

  return { ok: true, bookmarked, bookmarkCount: post.bookmarkedBy.length };
};

const getBookmarkedPosts = async (userId) => {
  const threads = await ForumThreads.find({ "posts.bookmarkedBy": userId }).lean();
  const entries = [];

  threads.forEach((thread) => {
    if (!isPublished(thread) && thread.authorId !== userId) {
      return;
    }

    thread.posts.forEach((post, index) => {
      if (post.bookmarkedBy.includes(userId)) {
        const snippet = stripHtml(post.content);
        entries.push({
          thread,
          post,
          index,
          snippet: snippet.length > 160 ? `${snippet.slice(0, 160).trim()}…` : snippet,
        });
      }
    });
  });

  return entries;
};

/* =========================
   THREAD / POST MUTATIONS
========================= */

const publishThread = async (slug, userId) =>
  ForumThreads.findOneAndUpdate(
    { slug, authorId: userId },
    { $set: { status: "published" } },
    { new: true }
  ).lean();

const editThread = async (slug, userId, { title, category, tags, content }) => {
  const threadDoc = await getThreadDocBySlug(slug);

  if (!threadDoc || threadDoc.authorId !== userId || threadDoc.locked) {
    return null;
  }

  const categoryMeta = getCategoryMeta(category);

  if (!categoryMeta || !String(title || "").trim() || isContentEmpty(content)) {
    return null;
  }

  threadDoc.title = String(title).trim();
  threadDoc.category = category;
  threadDoc.tags = parseTags(tags);
  threadDoc.posts[0].content = content;
  threadDoc.posts[0].editedAt = new Date();

  await threadDoc.save();

  return threadDoc.toObject();
};

const editPost = async (slug, postId, userId, content) => {
  const found = await findPostDoc(slug, postId);

  if (!found || found.post.authorId !== userId || found.threadDoc.locked) {
    return null;
  }

  if (isContentEmpty(content)) {
    return null;
  }

  found.post.content = content;
  found.post.editedAt = new Date();

  await found.threadDoc.save();

  return { thread: found.threadDoc.toObject(), post: found.post.toObject() };
};

const purgeReferencesToThread = async (slug) => {
  await Promise.all([
    ForumReports.deleteMany({ threadSlug: slug }),
    ForumNotifications.deleteMany({ threadSlug: slug }),
  ]);
};

const deleteThread = async (slug, userId, isAdmin = false) => {
  const thread = await ForumThreads.findOne({ slug }).select("authorId").lean();

  if (!thread) {
    return false;
  }

  if (thread.authorId !== userId && !isAdmin) {
    return false;
  }

  await ForumThreads.deleteOne({ slug });
  await purgeReferencesToThread(slug);

  return true;
};

const deletePost = async (slug, postId, userId, isAdmin = false) => {
  const threadDoc = await getThreadDocBySlug(slug);

  if (!threadDoc) {
    return false;
  }

  const index = threadDoc.posts.findIndex((p) => p.id === postId);

  if (index === -1) {
    return false;
  }

  const post = threadDoc.posts[index];

  if (post.authorId !== userId && !isAdmin) {
    return false;
  }

  if (index === 0) {
    return deleteThread(slug, threadDoc.authorId, true);
  }

  threadDoc.posts.splice(index, 1);
  await threadDoc.save();

  await ForumReports.deleteMany({ postId });

  return true;
};

const reportPost = async (slug, postId, reporterId, reason) => {
  const found = await findPostDoc(slug, postId);

  if (!found || !reporterId) {
    return null;
  }

  const { post, threadDoc } = found;

  if (post.reportedBy.includes(reporterId)) {
    return { ok: false, message: "You already reported this post." };
  }

  const trimmedReason = String(reason || "").trim().slice(0, MAX_REPORT_REASON_LENGTH);

  if (!trimmedReason) {
    return { ok: false, message: "Please describe why you're reporting this post." };
  }

  post.reportedBy.push(reporterId);
  await threadDoc.save();

  await ForumReports.create({
    _id: randomUUID(),
    threadSlug: threadDoc.slug,
    postId: post.id,
    reporterId,
    reason: trimmedReason,
    createdAt: new Date(),
    status: "open",
  });

  return { ok: true, message: "Report submitted. Thank you." };
};

const getPostPreview = async (slug, postId) => {
  const found = await findPost(slug, postId);

  if (!found || !isPubliclyVisible(found.thread)) {
    return null;
  }

  const { post, thread } = found;
  const snippetSource = stripHtml(post.content);

  return {
    author: post.author,
    initials: post.initials,
    date: post.date,
    permalink: `/forum/thread/${thread.slug}#post-${post.id}`,
    snippet: snippetSource.length > 200 ? `${snippetSource.slice(0, 200).trim()}…` : snippetSource,
  };
};

/* =========================
   REPORTS (MODERATION)
========================= */

const getOpenReports = async () => {
  const reports = await ForumReports.find({ status: "open" }).sort({ createdAt: -1 }).lean();

  return Promise.all(
    reports.map(async (r) => {
      const found = await findPost(r.threadSlug, r.postId);

      return {
        ...r,
        id: String(r._id),
        thread: found ? found.thread : null,
        post: found ? found.post : null,
      };
    })
  );
};

const resolveReport = async (reportId, status) =>
  ForumReports.findByIdAndUpdate(
    String(reportId),
    { $set: { status: status === "dismissed" ? "dismissed" : "resolved" } },
    { new: true }
  ).lean();

const MODERATION_UPDATES = {
  hide: { hidden: true },
  unhide: { hidden: false },
  lock: { locked: true },
  unlock: { locked: false },
  pin: { pinned: true },
  unpin: { pinned: false },
};

const moderateThread = async (slug, action) => {
  const update = MODERATION_UPDATES[action];

  if (!update) {
    return null;
  }

  return ForumThreads.findOneAndUpdate({ slug }, { $set: update }, { new: true }).lean();
};

/* =========================
   HOME / LISTING AGGREGATES
========================= */

const getForumSummary = async () =>
  Promise.all(
    categories.map(async (cat) => {
      const catThreads = await getThreadsByCategory(cat.id);
      const totalViews = catThreads.reduce((sum, t) => sum + t.views, 0);
      const latestThread = catThreads.reduce((best, t) => {
        if (!best) return t;
        return getLatestPostTime(t) >= getLatestPostTime(best) ? t : best;
      }, null);
      return {
        ...cat,
        threadCount: catThreads.length,
        totalViews,
        latestThread,
      };
    })
  );

const getTrendingThreads = async (limit = 5) => {
  const threads = await ForumThreads.find(VISIBLE_FILTER).lean();

  return threads
    .slice()
    .sort((a, b) => getThreadEngagementScore(b) - getThreadEngagementScore(a))
    .slice(0, limit);
};

const getLatestThreads = async (limit = 5) => {
  const threads = await ForumThreads.find(VISIBLE_FILTER).lean();

  return threads
    .slice()
    .sort((a, b) => getLatestPostTime(b) - getLatestPostTime(a))
    .slice(0, limit);
};

const getForumTotals = async () => {
  const published = await ForumThreads.find(VISIBLE_FILTER).select("views").lean();

  return {
    posts: published.length,
    views: published.reduce((sum, t) => sum + t.views, 0),
  };
};

const getAllTags = async () => {
  const threads = await ForumThreads.find(VISIBLE_FILTER).select("tags").lean();
  const tagSet = new Set();
  threads.forEach((t) => (t.tags || []).forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
};

const searchThreads = async (rawQuery, filters = {}) => {
  const query = String(rawQuery || "").trim();
  const { category, tag, author, from, to } = filters;

  const dbFilter = { ...VISIBLE_FILTER };
  if (category) {
    dbFilter.category = category;
  }

  let candidates = await ForumThreads.find(dbFilter).lean();

  if (tag) {
    const needleTag = String(tag).trim().toLowerCase();
    candidates = candidates.filter((t) => (t.tags || []).includes(needleTag));
  }

  if (author) {
    const needleAuthor = String(author).trim().toLowerCase();
    candidates = candidates.filter((t) =>
      t.posts.some((p) => (p.author || "").toLowerCase().includes(needleAuthor))
    );
  }

  if (from) {
    const fromDate = new Date(from);
    if (!Number.isNaN(fromDate.getTime())) {
      candidates = candidates.filter((t) => new Date(t.createdAt) >= fromDate);
    }
  }

  if (to) {
    const toDate = new Date(to);
    if (!Number.isNaN(toDate.getTime())) {
      candidates = candidates.filter((t) => new Date(t.createdAt) <= toDate);
    }
  }

  if (!query) {
    return candidates.map((thread) => ({ thread, matchedIn: null, snippet: null }));
  }

  const needle = query.toLowerCase();

  return candidates
    .map((thread) => {
      const titleMatch = thread.title.toLowerCase().includes(needle);

      const matchedPost = titleMatch
        ? null
        : thread.posts.find((post) => stripHtml(post.content).toLowerCase().includes(needle));

      if (!titleMatch && !matchedPost) {
        return null;
      }

      return {
        thread,
        matchedIn: titleMatch ? "title" : "post",
        snippet: matchedPost ? buildSnippet(stripHtml(matchedPost.content), query) : null,
      };
    })
    .filter(Boolean);
};

const slugify = (title) =>
  String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const generateUniqueSlug = async (title) => {
  const base = slugify(title) || "thread";
  let slug = base;
  let counter = 2;

  while (await ForumThreads.exists({ slug })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
};

const formatDate = (date) =>
  [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    date.getFullYear(),
  ].join("/");

const addThread = async ({ category, title, content, author, authorId, initials, rank, status, tags }) => {
  const now = new Date();
  const slug = await generateUniqueSlug(title);

  const thread = await ForumThreads.create({
    _id: `thread-${randomUUID()}`,
    slug,
    category,
    title,
    tags: parseTags(tags),
    pinned: false,
    locked: false,
    hidden: false,
    views: 0,
    authorId: authorId || null,
    status: status === "draft" ? "draft" : "published",
    posts: [
      {
        id: randomUUID(),
        author,
        authorId: authorId || null,
        initials,
        rank,
        date: formatDate(now),
        createdAt: now,
        content,
        editedAt: null,
        parentPostId: null,
        likedBy: [],
        dislikedBy: [],
        bookmarkedBy: [],
        reportedBy: [],
      },
    ],
  });

  return thread.toObject();
};

const addPost = async (slug, { author, authorId, initials, rank, content, parentPostId }) => {
  const threadDoc = await getThreadDocBySlug(slug);

  if (!threadDoc) {
    return null;
  }

  const now = new Date();

  const post = {
    id: randomUUID(),
    author,
    authorId: authorId || null,
    initials,
    rank,
    date: formatDate(now),
    createdAt: now,
    content,
    editedAt: null,
    parentPostId: parentPostId || null,
    likedBy: [],
    dislikedBy: [],
    bookmarkedBy: [],
    reportedBy: [],
  };

  threadDoc.posts.push(post);
  await threadDoc.save();

  if (threadDoc.authorId && threadDoc.authorId !== authorId) {
    await addNotification({
      userId: threadDoc.authorId,
      type: "reply",
      threadSlug: threadDoc.slug,
      postId: post.id,
      actorId: authorId,
      actorName: author,
    });
  }

  return { thread: threadDoc.toObject(), post };
};

module.exports = {
  categories,
  getCategoryMeta,
  getThreadsByCategory,
  getThreadBySlug,
  getVisibleThreadBySlug,
  getAllThreadsForAdmin,
  incrementViews,
  getThreadsByAuthor,
  findPost,
  decoratePost,
  toggleLike,
  toggleDislike,
  toggleBookmark,
  getBookmarkedPosts,
  publishThread,
  editThread,
  editPost,
  deleteThread,
  deletePost,
  reportPost,
  getPostPreview,
  getOpenReports,
  resolveReport,
  moderateThread,
  getRepliesCount,
  getLatestPost,
  getForumSummary,
  getForumTotals,
  getTrendingThreads,
  getLatestThreads,
  getAllTags,
  addThread,
  addPost,
  isContentEmpty,
  searchThreads,
  addNotification,
  getNotificationsForUser,
  getUnreadCount,
  markAllRead,
};
