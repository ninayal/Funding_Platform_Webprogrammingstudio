const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sanitizeHtml = require("sanitize-html");

const DATA_FILE = path.join(__dirname, "../data/forum.json");

const { categories, threads } = require("../data/forum.json");

const parseDate = (ddmmyyyy) => {
  const [day, month, year] = ddmmyyyy.split("/").map(Number);
  return new Date(year, month - 1, day);
};

const getCategoryMeta = (categoryId) => categories.find((c) => c.id === categoryId);

const isPublished = (thread) => thread.status !== "draft";

const getThreadsByCategory = (categoryId) => {
  const published = threads.filter(isPublished);
  const filtered =
    categoryId === "all" ? published : published.filter((t) => t.category === categoryId);

  return filtered
    .slice()
    .sort((a, b) => parseDate(getLatestPost(b).date) - parseDate(getLatestPost(a).date));
};

const getThreadBySlug = (slug) => threads.find((t) => t.slug === slug);

const getVisibleThreadBySlug = (slug, viewerId) => {
  const thread = getThreadBySlug(slug);

  if (!thread) {
    return null;
  }

  if (!isPublished(thread) && thread.authorId !== viewerId) {
    return null;
  }

  return thread;
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
});

const toggleReaction = (slug, postId, userId, kind) => {
  const found = findPost(slug, postId);

  if (!found || !userId) {
    return null;
  }

  const { post } = found;
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

const getRepliesCount = (thread) => thread.posts.length - 1;

const getLatestPost = (thread) => thread.posts[thread.posts.length - 1];

const getForumSummary = () =>
  categories.map((cat) => {
    const catThreads = getThreadsByCategory(cat.id);
    const totalViews = catThreads.reduce((sum, t) => sum + t.views, 0);
    const latestThread = catThreads.reduce((best, t) => {
      if (!best) return t;
      return parseDate(getLatestPost(t).date) >= parseDate(getLatestPost(best).date) ? t : best;
    }, null);
    return {
      ...cat,
      threadCount: catThreads.length,
      totalViews,
      latestThread,
    };
  });

const getThreadEngagementScore = (thread) => {
  const reactionTotal = thread.posts.reduce(
    (sum, post) => sum + post.likedBy.length + post.dislikedBy.length + post.bookmarkedBy.length,
    0
  );

  return reactionTotal * 5 + getRepliesCount(thread) * 2 + thread.views * 0.1;
};

const getTrendingThreads = (limit = 5) =>
  threads
    .filter(isPublished)
    .slice()
    .sort((a, b) => getThreadEngagementScore(b) - getThreadEngagementScore(a))
    .slice(0, limit);

const getLatestThreads = (limit = 5) =>
  threads
    .filter(isPublished)
    .slice()
    .sort((a, b) => parseDate(getLatestPost(b).date) - parseDate(getLatestPost(a).date))
    .slice(0, limit);

const getForumTotals = () => {
  const published = threads.filter(isPublished);
  return {
    posts: published.length,
    views: published.reduce((sum, t) => sum + t.views, 0),
  };
};

const stripHtml = (html) =>
  String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const sanitizeContent = (html) =>
  sanitizeHtml(String(html || ""), {
    allowedTags: [
      "p", "br", "b", "strong", "i", "em", "u", "s", "strike",
      "ul", "ol", "li", "a", "img", "blockquote", "h1", "h2", "h3", "div", "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
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

const searchThreads = (rawQuery) => {
  const query = String(rawQuery || "").trim();

  if (!query) {
    return [];
  }

  const needle = query.toLowerCase();

  return threads
    .filter(isPublished)
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

const saveThreadsToFile = () => {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify({ categories, threads }, null, 2),
    "utf8"
  );
};

const formatDate = (date) =>
  [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    date.getFullYear(),
  ].join("/");

const addThread = ({ category, title, content, author, authorId, initials, rank, status }) => {
  const now = new Date();

  const newThread = {
    slug: generateUniqueSlug(title),
    category,
    title,
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
        content,
        likedBy: [],
        dislikedBy: [],
        bookmarkedBy: [],
      },
    ],
  };

  threads.push(newThread);
  saveThreadsToFile();

  return newThread;
};

const addPost = (slug, { author, authorId, initials, rank, content }) => {
  const thread = getThreadBySlug(slug);

  if (!thread) {
    return null;
  }

  const post = {
    id: crypto.randomUUID(),
    author,
    authorId: authorId || null,
    initials,
    rank,
    date: formatDate(new Date()),
    content,
    likedBy: [],
    dislikedBy: [],
    bookmarkedBy: [],
  };

  thread.posts.push(post);
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
  getThreadsByAuthor,
  findPost,
  decoratePost,
  toggleLike,
  toggleDislike,
  toggleBookmark,
  getBookmarkedPosts,
  publishThread,
  getRepliesCount,
  getLatestPost,
  getForumSummary,
  getForumTotals,
  getTrendingThreads,
  getLatestThreads,
  addThread,
  addPost,
  sanitizeContent,
  isContentEmpty,
  searchThreads,
};
