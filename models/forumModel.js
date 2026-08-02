const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/forum.json");

const { categories, threads } = require("../data/forum.json");

const parseDate = (ddmmyyyy) => {
  const [day, month, year] = ddmmyyyy.split("/").map(Number);
  return new Date(year, month - 1, day);
};

const getCategoryMeta = (categoryId) => categories.find((c) => c.id === categoryId);

const getThreadsByCategory = (categoryId) =>
  categoryId === "all" ? threads : threads.filter((t) => t.category === categoryId);

const getThreadBySlug = (slug) => threads.find((t) => t.slug === slug);

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

const getForumTotals = () => ({
  posts: threads.length,
  views: threads.reduce((sum, t) => sum + t.views, 0),
});

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

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

const addThread = ({ category, title, content, author, initials, rank }) => {
  const now = new Date();
  const date = [
    String(now.getDate()).padStart(2, "0"),
    String(now.getMonth() + 1).padStart(2, "0"),
    now.getFullYear(),
  ].join("/");

  const paragraphs = String(content)
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");

  const newThread = {
    slug: generateUniqueSlug(title),
    category,
    title,
    views: 0,
    posts: [
      {
        author,
        initials,
        rank,
        date,
        content: paragraphs,
      },
    ],
  };

  threads.push(newThread);
  saveThreadsToFile();

  return newThread;
};

module.exports = {
  categories,
  threads,
  getCategoryMeta,
  getThreadsByCategory,
  getThreadBySlug,
  getRepliesCount,
  getLatestPost,
  getForumSummary,
  getForumTotals,
  addThread,
};
