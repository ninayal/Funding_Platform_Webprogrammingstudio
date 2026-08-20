const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sanitizeHtml = require("sanitize-html");
const userModel = require("./userModel");
const { categories, threads: seedThreads } = require("../data/forum.js");

const STORAGE_FILE = path.join(__dirname, "../data/forum-storage.json");

const EMPTY_STORAGE = { threads: [], deletedThreadSlugs: [], reports: [], notifications: [] };

const ensureStorageFile = () => {
  if (!fs.existsSync(STORAGE_FILE)) {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(EMPTY_STORAGE, null, 2), "utf8");
  }
};

const readStorage = () => {
  ensureStorageFile();
  try {
    const raw = JSON.parse(fs.readFileSync(STORAGE_FILE, "utf8"));
    return {
      threads: Array.isArray(raw.threads) ? raw.threads : [],
      deletedThreadSlugs: Array.isArray(raw.deletedThreadSlugs) ? raw.deletedThreadSlugs : [],
      reports: Array.isArray(raw.reports) ? raw.reports : [],
      notifications: Array.isArray(raw.notifications) ? raw.notifications : [],
    };
  } catch {
    return { ...EMPTY_STORAGE };
  }
};

// Merge the static seed threads (data/forum.js) with whatever has been created/edited
// at runtime (data/forum-storage.json). Stored threads win over seed threads sharing the
// same slug (this is how an edit to a seed thread "sticks"), and deletedThreadSlugs keeps
// a removed thread from reappearing out of the seed on the next server start.
const mergeThreads = (deletedSlugs, storedThreads) => {
  const deleted = new Set(deletedSlugs);
  const bySlug = new Map();

  seedThreads.forEach((thread) => {
    if (!deleted.has(thread.slug)) bySlug.set(thread.slug, thread);
  });

  storedThreads.forEach((thread) => {
    if (!deleted.has(thread.slug)) bySlug.set(thread.slug, thread);
  });

  return Array.from(bySlug.values());
};

const initialStorage = readStorage();
const deletedThreadSlugs = initialStorage.deletedThreadSlugs;
const threads = mergeThreads(deletedThreadSlugs, initialStorage.threads);
const reports = initialStorage.reports;
const notifications = initialStorage.notifications;

const parseDate = (ddmmyyyy) => {
  const [day, month, year] = ddmmyyyy.split("/").map(Number);
  return new Date(year, month - 1, day);
};

// Normalize older thread/post records so newly-added fields always exist.
threads.forEach((thread) => {
  if (thread.tags === undefined) thread.tags = [];
  if (thread.pinned === undefined) thread.pinned = false;
  if (thread.locked === undefined) thread.locked = false;
  if (thread.hidden === undefined) thread.hidden = false;

  thread.posts.forEach((post, index) => {
    if (post.editedAt === undefined) post.editedAt = null;
    if (post.parentPostId === undefined) post.parentPostId = null;
    if (post.reportedBy === undefined) post.reportedBy = [];
    // Legacy posts only recorded a day-level date, so same-day posts couldn't
    // be ordered against each other. Fall back to that date plus the post's
    // position in the thread so existing order is at least preserved.
    if (post.createdAt === undefined) {
      post.createdAt = new Date(parseDate(post.date).getTime() + index).toISOString();
    }
  });
});

const MAX_REPORT_REASON_LENGTH = 500;

const getCategoryMeta = (categoryId) => categories.find((c) => c.id === categoryId);

const isPublished = (thread) => thread.status !== "draft";
const isHidden = (thread) => Boolean(thread.hidden);
const isPubliclyVisible = (thread) => isPublished(thread) && !isHidden(thread);

const getThreadBySlug = (slug) => threads.find((t) => t.slug === slug);

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

const sanitizeContent = (html) =>
  sanitizeHtml(String(html || ""), {
    allowedTags: [
      "p", "br", "b", "strong", "i", "em", "u", "s", "strike",
      "ul", "ol", "li", "a", "img", "blockquote", "h1", "h2", "h3", "div", "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "class"],
      img: ["src", "alt"],
      blockquote: ["class"],
      span: ["class"],
    },
    allowedClasses: {
      blockquote: ["forum-quote-embed"],
      a: ["forum-quote-embed__link"],
      span: ["forum-quote-embed__author", "forum-quote-embed__snippet"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
    },
  }).trim();

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

const getThreadsByCategory = (categoryId, sortBy = "new") => {
  const visible = threads.filter(isPubliclyVisible);
  const filtered =
    categoryId === "all" ? visible : visible.filter((t) => t.category === categoryId);

  const comparator = SORT_COMPARATORS[sortBy] || SORT_COMPARATORS.new;
  const sorted = filtered.slice().sort(comparator);

  const pinned = sorted.filter((t) => t.pinned);
  const rest = sorted.filter((t) => !t.pinned);

  return [...pinned, ...rest];
};

const getVisibleThreadBySlug = (slug, viewerId, isAdmin = false) => {
  const thread = getThreadBySlug(slug);

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

const incrementViews = (slug) => {
  const thread = getThreadBySlug(slug);

  if (!thread) {
    return;
  }

  thread.views += 1;
  saveThreadsToFile();
};

const getThreadsByAuthor = (authorId) =>
  threads
    .filter((t) => t.authorId === authorId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const findPost = (slug, postId) => {
  const thread = getThreadBySlug(slug);
  const post = thread?.posts.find((p) => p.id === postId);

  return post ? { thread, post } : null;
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

const addNotification = ({ userId, type, threadSlug, postId, actorId, actorName }) => {
  if (!userId || userId === actorId) {
    return null;
  }

  const notification = {
    id: crypto.randomUUID(),
    userId,
    type,
    threadSlug,
    postId,
    actorId,
    actorName,
    read: false,
    createdAt: new Date().toISOString(),
  };

  notifications.push(notification);

  return notification;
};

const getNotificationsForUser = (userId) =>
  notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const getUnreadCount = (userId) =>
  notifications.filter((n) => n.userId === userId && !n.read).length;

const markAllRead = (userId) => {
  let changed = false;

  notifications.forEach((n) => {
    if (n.userId === userId && !n.read) {
      n.read = true;
      changed = true;
    }
  });

  if (changed) {
    saveThreadsToFile();
  }
};

const toggleReaction = (slug, postId, userId, kind) => {
  const found = findPost(slug, postId);

  if (!found || !userId) {
    return null;
  }

  const { post, thread } = found;
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
    const actor = userModel.findById(userId);
    addNotification({
      userId: post.authorId,
      type: "like",
      threadSlug: thread.slug,
      postId: post.id,
      actorId: userId,
      actorName: actor ? actor.name : "Someone",
    });
  }

  saveThreadsToFile();

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

const toggleBookmark = (slug, postId, userId) => {
  const found = findPost(slug, postId);

  if (!found || !userId) {
    return null;
  }

  const { post } = found;
  const index = post.bookmarkedBy.indexOf(userId);
  let bookmarked;

  if (index === -1) {
    post.bookmarkedBy.push(userId);
    bookmarked = true;
  } else {
    post.bookmarkedBy.splice(index, 1);
    bookmarked = false;
  }

  saveThreadsToFile();

  return { ok: true, bookmarked, bookmarkCount: post.bookmarkedBy.length };
};

const getBookmarkedPosts = (userId) => {
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

const publishThread = (slug, userId) => {
  const thread = getThreadBySlug(slug);

  if (!thread || thread.authorId !== userId) {
    return null;
  }

  thread.status = "published";
  saveThreadsToFile();

  return thread;
};

const editThread = (slug, userId, { title, category, tags, content }) => {
  const thread = getThreadBySlug(slug);

  if (!thread || thread.authorId !== userId || thread.locked) {
    return null;
  }

  const categoryMeta = getCategoryMeta(category);
  const sanitizedContent = sanitizeContent(content);

  if (!categoryMeta || !String(title || "").trim() || isContentEmpty(sanitizedContent)) {
    return null;
  }

  thread.title = String(title).trim();
  thread.category = category;
  thread.tags = parseTags(tags);
  thread.posts[0].content = sanitizedContent;
  thread.posts[0].editedAt = new Date().toISOString();

  saveThreadsToFile();

  return thread;
};

const editPost = (slug, postId, userId, content) => {
  const found = findPost(slug, postId);

  if (!found || found.post.authorId !== userId || found.thread.locked) {
    return null;
  }

  const sanitizedContent = sanitizeContent(content);

  if (isContentEmpty(sanitizedContent)) {
    return null;
  }

  found.post.content = sanitizedContent;
  found.post.editedAt = new Date().toISOString();

  saveThreadsToFile();

  return found;
};

const purgeReferencesToThread = (slug) => {
  for (let i = reports.length - 1; i >= 0; i -= 1) {
    if (reports[i].threadSlug === slug) {
      reports.splice(i, 1);
    }
  }

  for (let i = notifications.length - 1; i >= 0; i -= 1) {
    if (notifications[i].threadSlug === slug) {
      notifications.splice(i, 1);
    }
  }
};

const deleteThread = (slug, userId, isAdmin = false) => {
  const index = threads.findIndex((t) => t.slug === slug);

  if (index === -1) {
    return false;
  }

  const thread = threads[index];

  if (thread.authorId !== userId && !isAdmin) {
    return false;
  }

  threads.splice(index, 1);
  purgeReferencesToThread(slug);

  if (!deletedThreadSlugs.includes(slug)) {
    deletedThreadSlugs.push(slug);
  }

  saveThreadsToFile();

  return true;
};

const deletePost = (slug, postId, userId, isAdmin = false) => {
  const thread = getThreadBySlug(slug);

  if (!thread) {
    return false;
  }

  const index = thread.posts.findIndex((p) => p.id === postId);

  if (index === -1) {
    return false;
  }

  const post = thread.posts[index];

  if (post.authorId !== userId && !isAdmin) {
    return false;
  }

  if (index === 0) {
    return deleteThread(slug, thread.authorId, true);
  }

  thread.posts.splice(index, 1);

  for (let i = reports.length - 1; i >= 0; i -= 1) {
    if (reports[i].postId === postId) {
      reports.splice(i, 1);
    }
  }

  saveThreadsToFile();

  return true;
};

const reportPost = (slug, postId, reporterId, reason) => {
  const found = findPost(slug, postId);

  if (!found || !reporterId) {
    return null;
  }

  const { post, thread } = found;

  if (post.reportedBy.includes(reporterId)) {
    return { ok: false, message: "You already reported this post." };
  }

  const trimmedReason = String(reason || "").trim().slice(0, MAX_REPORT_REASON_LENGTH);

  if (!trimmedReason) {
    return { ok: false, message: "Please describe why you're reporting this post." };
  }

  post.reportedBy.push(reporterId);

  reports.push({
    id: crypto.randomUUID(),
    threadSlug: thread.slug,
    postId: post.id,
    reporterId,
    reason: trimmedReason,
    createdAt: new Date().toISOString(),
    status: "open",
  });

  saveThreadsToFile();

  return { ok: true, message: "Report submitted. Thank you." };
};

const getPostPreview = (slug, postId) => {
  const found = findPost(slug, postId);

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

const getOpenReports = () =>
  reports
    .filter((r) => r.status === "open")
    .map((r) => {
      const found = findPost(r.threadSlug, r.postId);
      return { ...r, thread: found ? found.thread : null, post: found ? found.post : null };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const resolveReport = (reportId, status) => {
  const report = reports.find((r) => r.id === reportId);

  if (!report) {
    return null;
  }

  report.status = status === "dismissed" ? "dismissed" : "resolved";
  saveThreadsToFile();

  return report;
};

const MODERATION_ACTIONS = {
  hide: (t) => { t.hidden = true; },
  unhide: (t) => { t.hidden = false; },
  lock: (t) => { t.locked = true; },
  unlock: (t) => { t.locked = false; },
  pin: (t) => { t.pinned = true; },
  unpin: (t) => { t.pinned = false; },
};

const moderateThread = (slug, action) => {
  const thread = getThreadBySlug(slug);
  const apply = MODERATION_ACTIONS[action];

  if (!thread || !apply) {
    return null;
  }

  apply(thread);
  saveThreadsToFile();

  return thread;
};

const getForumSummary = () =>
  categories.map((cat) => {
    const catThreads = getThreadsByCategory(cat.id);
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
  });

const getTrendingThreads = (limit = 5) =>
  threads
    .filter(isPubliclyVisible)
    .slice()
    .sort((a, b) => getThreadEngagementScore(b) - getThreadEngagementScore(a))
    .slice(0, limit);

const getLatestThreads = (limit = 5) =>
  threads
    .filter(isPubliclyVisible)
    .slice()
    .sort((a, b) => getLatestPostTime(b) - getLatestPostTime(a))
    .slice(0, limit);

const getForumTotals = () => {
  const published = threads.filter(isPubliclyVisible);
  return {
    posts: published.length,
    views: published.reduce((sum, t) => sum + t.views, 0),
  };
};

const getAllTags = () => {
  const tagSet = new Set();
  threads.filter(isPubliclyVisible).forEach((t) => (t.tags || []).forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
};

const searchThreads = (rawQuery, filters = {}) => {
  const query = String(rawQuery || "").trim();
  const { category, tag, author, from, to } = filters;

  let candidates = threads.filter(isPubliclyVisible);

  if (category) {
    candidates = candidates.filter((t) => t.category === category);
  }

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

const generateUniqueSlug = (title) => {
  const base = slugify(title) || "thread";
  let slug = base;
  let counter = 2;

  while (getThreadBySlug(slug)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
};

function saveThreadsToFile() {
  fs.writeFileSync(
    STORAGE_FILE,
    JSON.stringify({ threads, deletedThreadSlugs, reports, notifications }, null, 2),
    "utf8"
  );
}

const formatDate = (date) =>
  [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    date.getFullYear(),
  ].join("/");

const addThread = ({ category, title, content, author, authorId, initials, rank, status, tags }) => {
  const now = new Date();

  const newThread = {
    slug: generateUniqueSlug(title),
    category,
    title,
    tags: parseTags(tags),
    pinned: false,
    locked: false,
    hidden: false,
    views: 0,
    authorId: authorId || null,
    status: status === "draft" ? "draft" : "published",
    createdAt: now.toISOString(),
    posts: [
      {
        id: crypto.randomUUID(),
        author,
        authorId: authorId || null,
        initials,
        rank,
        date: formatDate(now),
        createdAt: now.toISOString(),
        content,
        editedAt: null,
        parentPostId: null,
        likedBy: [],
        dislikedBy: [],
        bookmarkedBy: [],
        reportedBy: [],
      },
    ],
  };

  threads.push(newThread);
  saveThreadsToFile();

  return newThread;
};

const addPost = (slug, { author, authorId, initials, rank, content, parentPostId }) => {
  const thread = getThreadBySlug(slug);

  if (!thread) {
    return null;
  }

  const now = new Date();

  const post = {
    id: crypto.randomUUID(),
    author,
    authorId: authorId || null,
    initials,
    rank,
    date: formatDate(now),
    createdAt: now.toISOString(),
    content,
    editedAt: null,
    parentPostId: parentPostId || null,
    likedBy: [],
    dislikedBy: [],
    bookmarkedBy: [],
    reportedBy: [],
  };

  thread.posts.push(post);

  if (thread.authorId && thread.authorId !== authorId) {
    addNotification({
      userId: thread.authorId,
      type: "reply",
      threadSlug: thread.slug,
      postId: post.id,
      actorId: authorId,
      actorName: author,
    });
  }

  saveThreadsToFile();

  return { thread, post };
};

module.exports = {
  categories,
  threads,
  getCategoryMeta,
  getThreadsByCategory,
  getThreadBySlug,
  getVisibleThreadBySlug,
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
  sanitizeContent,
  isContentEmpty,
  searchThreads,
  addNotification,
  getNotificationsForUser,
  getUnreadCount,
  markAllRead,
};
