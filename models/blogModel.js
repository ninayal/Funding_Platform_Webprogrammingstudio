"use strict";

const fs = require("fs");
const path = require("path");

const {
  posts: seedPosts,
} = require("../data/blog");

const HUY_BA_USER_ID =
  "user-huy-ba";

const storagePath = path.join(
  __dirname,
  "../data/posts.json",
);

const clone = (value) => {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(
    JSON.stringify(value),
  );
};

const createEmptyStorage = () => ({
  posts: [],
  deletedPostIds: [],
});

const ensureStorageFile = () => {
  if (fs.existsSync(storagePath)) {
    return;
  }

  fs.writeFileSync(
    storagePath,
    JSON.stringify(
      createEmptyStorage(),
      null,
      2,
    ),
    "utf8",
  );
};

const readStorage = () => {
  ensureStorageFile();

  try {
    const content = fs.readFileSync(
      storagePath,
      "utf8",
    );

    const parsed = JSON.parse(content);

    return {
      posts: Array.isArray(parsed.posts)
        ? parsed.posts
        : [],

      deletedPostIds:
        Array.isArray(
          parsed.deletedPostIds,
        )
          ? parsed.deletedPostIds
          : [],
    };
  } catch (error) {
    console.error(
      "Could not read Blog JSON storage:",
      error,
    );

    return createEmptyStorage();
  }
};

const writeStorage = (storage) => {
  fs.writeFileSync(
    storagePath,
    JSON.stringify(
      storage,
      null,
      2,
    ),
    "utf8",
  );
};

const isHuyBaPost = (post) =>
  post?.author?.id ===
  HUY_BA_USER_ID;

const mergeStoredPosts = () => {
  const storage = readStorage();

  const deletedIds = new Set(
    storage.deletedPostIds,
  );

  const postsById = new Map();

  seedPosts.forEach((post) => {
    if (
      post?.id &&
      !deletedIds.has(post.id)
    ) {
      postsById.set(
        post.id,
        clone(post),
      );
    }
  });

  storage.posts.forEach((post) => {
    if (
      post?.id &&
      isHuyBaPost(post) &&
      !deletedIds.has(post.id)
    ) {
      postsById.set(
        post.id,
        clone(post),
      );
    }
  });

  return [
    ...postsById.values(),
  ];
};

const saveHuyBaPost = (post) => {
  if (!isHuyBaPost(post)) {
    return false;
  }

  const storage = readStorage();

  const existingIndex =
    storage.posts.findIndex(
      (storedPost) =>
        storedPost.id === post.id,
    );

  if (existingIndex === -1) {
    storage.posts.push(
      clone(post),
    );
  } else {
    storage.posts[existingIndex] =
      clone(post);
  }

  storage.deletedPostIds =
    storage.deletedPostIds.filter(
      (postId) =>
        postId !== post.id,
    );

  writeStorage(storage);

  return true;
};

const deleteStoredHuyBaPost = (
  post,
) => {
  if (!isHuyBaPost(post)) {
    return false;
  }

  const storage = readStorage();

  storage.posts =
    storage.posts.filter(
      (storedPost) =>
        storedPost.id !== post.id,
    );

  if (
    !storage.deletedPostIds.includes(
      post.id,
    )
  ) {
    storage.deletedPostIds.push(
      post.id,
    );
  }

  writeStorage(storage);

  return true;
};

const posts = mergeStoredPosts();

const allowedStatuses =
  new Set([
    "draft",
    "published",
  ]);

const normaliseId = (value) =>
  String(value || "").trim();

const findPostIndex = (
  postId,
) => {
  const id =
    normaliseId(postId);

  return posts.findIndex(
    (post) =>
      post.id === id,
  );
};

const getMutablePost = (
  postId,
) => {
  const index =
    findPostIndex(postId);

  return index === -1
    ? null
    : posts[index];
};

const sortNewestFirst = (
  postA,
  postB,
) => {
  const dateA =
    new Date(
      postA.publishedAt ||
      postA.updatedAt ||
      postA.createdAt ||
      0,
    ).getTime();

  const dateB =
    new Date(
      postB.publishedAt ||
      postB.updatedAt ||
      postB.createdAt ||
      0,
    ).getTime();

  return dateB - dateA;
};

const createSlug = (
  title,
) => {
  const baseSlug =
    String(
      title || "post",
    )
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      ) || "post";

  let slug =
    baseSlug;

  let counter =
    2;

  while (
    posts.some(
      (post) =>
        post.id === slug,
    )
  ) {
    slug =
      `${baseSlug}-${counter}`;

    counter += 1;
  }

  return slug;
};

const getInitials = (
  name,
) =>
  String(
    name || "User",
  )
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (part) =>
        part[0],
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getPublishedPosts = () =>
  clone(
    posts
      .filter(
        (post) =>
          post.status ===
          "published",
      )
      .sort(
        sortNewestFirst,
      ),
  );

const getPostById = (
  postId,
) => {
  const post =
    getMutablePost(postId);

  return post
    ? clone(post)
    : null;
};

const getVisiblePostById = (
  postId,
  viewerId = null,
) => {
  const post =
    getMutablePost(postId);

  if (!post) {
    return null;
  }

  const canViewDraft =
    post.status ===
      "draft" &&
    normaliseId(viewerId) &&
    normaliseId(
      viewerId,
    ) ===
      normaliseId(
        post.author?.id,
      );

  if (
    post.status !==
      "published" &&
    !canViewDraft
  ) {
    return null;
  }

  return clone(post);
};

const getLeadStory = () => {
  const post =
    posts.find(
      (item) =>
        item.status ===
          "published" &&
        item.isLead,
    );

  return post
    ? clone(post)
    : null;
};

const getFeaturedPosts = () =>
  clone(
    posts
      .filter(
        (post) =>
          post.status ===
            "published" &&
          post.isFeatured,
      )
      .sort(
        sortNewestFirst,
      ),
  );

const getRelatedPosts = (
  postId,
  limit = 3,
) => {
  const sourcePost =
    getMutablePost(postId);

  if (!sourcePost) {
    return [];
  }

  const sameCategory =
    posts.filter(
      (post) =>
        post.status ===
          "published" &&
        post.id !==
          sourcePost.id &&
        post.category ===
          sourcePost.category,
    );

  const otherCategories =
    posts.filter(
      (post) =>
        post.status ===
          "published" &&
        post.id !==
          sourcePost.id &&
        post.category !==
          sourcePost.category,
    );

  return clone(
    [
      ...sameCategory,
      ...otherCategories,
    ]
      .sort(
        sortNewestFirst,
      )
      .slice(
        0,
        Number(limit) || 3,
      ),
  );
};

const getPostsByAuthorId = (
  authorId,
) => {
  const id =
    normaliseId(authorId);

  return clone(
    posts
      .filter(
        (post) =>
          normaliseId(
            post.author?.id,
          ) === id,
      )
      .sort(
        sortNewestFirst,
      ),
  );
};

const countPostsByAuthorId = (
  authorId,
) => {
  const id =
    normaliseId(authorId);

  return posts.filter(
    (post) =>
      normaliseId(
        post.author?.id,
      ) === id,
  ).length;
};

const getCategories = () =>
  [
    ...new Set(
      posts
        .map(
          (post) =>
            String(
              post.category ||
              "",
            ).trim(),
        )
        .filter(Boolean),
    ),
  ].sort(
    (
      categoryA,
      categoryB,
    ) =>
      categoryA.localeCompare(
        categoryB,
      ),
  );

const createPost = (
  postData = {},
  owner,
) => {
  if (
    !owner ||
    !normaliseId(owner.id)
  ) {
    throw new Error(
      "An owner is required to create a post.",
    );
  }

  const now =
    new Date()
      .toISOString();

  const status =
    allowedStatuses.has(
      postData.status,
    )
      ? postData.status
      : "draft";

  const title =
    String(
      postData.title ||
      "Untitled draft",
    ).trim() ||
    "Untitled draft";

  const imageUrl =
    String(
      postData.imageUrl ||
      "",
    ).trim();

  const imageCaption =
    String(
      postData.imageCaption ||
      "",
    ).trim();

  const post = {
    id:
      createSlug(title),

    title,

    category:
      String(
        postData.category ||
        "Guide",
      ).trim(),

    author: {
      id:
        normaliseId(
          owner.id,
        ),

      name:
        String(
          owner.name ||
          "Current user",
        ).trim(),

      initials:
        String(
          owner.initials ||
          getInitials(
            owner.name,
          ),
        ).trim(),

      role:
        String(
          owner.role ||
          "Author",
        ).trim(),
    },

    createdAt:
      now,

    publishedAt:
      status ===
      "published"
        ? now
        : null,

    updatedAt:
      now,

    readTime:
      Number(
        postData.readTime,
      ) || 1,

    summary:
      String(
        postData.summary ||
        "",
      ).trim(),

    archiveSummary:
      String(
        postData.archiveSummary ||
        postData.summary ||
        "",
      ).trim(),

    image: {
      url:
        imageUrl,

      listUrl:
        imageUrl,

      alt:
        String(
          postData.imageAlt ||
          title ||
          "Blog image",
        ).trim(),

      caption:
        imageCaption,

      listCaption:
        imageCaption,
    },

    tags:
      Array.isArray(
        postData.tags,
      )
        ? clone(
            postData.tags,
          )
        : [],

    status,

    isLead:
      Boolean(
        postData.isLead,
      ),

    isFeatured:
      Boolean(
        postData.isFeatured,
      ),

    content:
      Array.isArray(
        postData.content,
      )
        ? clone(
            postData.content,
          )
        : [],
  };

  posts.push(post);
  saveHuyBaPost(post);
  return clone(post);
};

const updatePost = (
  postId,
  ownerId,
  updates = {},
) => {
  const post =
    getMutablePost(postId);

  if (!post) {
    return {
      ok: false,
      reason: "not-found",
    };
  }

  if (
    normaliseId(
      post.author?.id,
    ) !==
    normaliseId(ownerId)
  ) {
    return {
      ok: false,
      reason: "forbidden",
    };
  }

  const editableFields = [
    "title",
    "category",
    "summary",
    "archiveSummary",
    "readTime",
    "tags",
    "content",
    "isLead",
    "isFeatured",
  ];

  editableFields.forEach(
    (field) => {
      if (
        Object.prototype
          .hasOwnProperty
          .call(
            updates,
            field,
          )
      ) {
        post[field] =
          clone(
            updates[field],
          );
      }
    },
  );

  if (
    updates.image &&
    typeof updates.image ===
      "object"
  ) {
    post.image = {
      ...post.image,
      ...clone(
        updates.image,
      ),
    };
  }

  if (
    allowedStatuses.has(
      updates.status,
    )
  ) {
    const wasDraft =
      post.status ===
      "draft";

    post.status =
      updates.status;

    if (
      wasDraft &&
      updates.status ===
        "published" &&
      !post.publishedAt
    ) {
      post.publishedAt =
        new Date()
          .toISOString();
    }
  }

  post.updatedAt =
  new Date().toISOString();

/*
 * Save the updated Huy Ba post
 * into huy-blog-posts.json.
 */
saveHuyBaPost(post);

return {
  ok: true,
  post: clone(post),
};
};

const deletePost = (
  postId,
  ownerId,
) => {
  const index =
    findPostIndex(postId);

  if (index === -1) {
    return {
      ok: false,
      reason: "not-found",
    };
  }

  if (
    posts[index].author.id !==
    normaliseId(ownerId)
  ) {
    return {
      ok: false,
      reason: "forbidden",
    };
  }

  const [deletedPost] =
    posts.splice(index, 1);

  /*
   * Remove the post from JSON
   * and remember its deleted ID.
   */
  deleteStoredHuyBaPost(
    deletedPost,
  );

  return {
    ok: true,
    post: clone(deletedPost),
  };
};

module.exports = {
  getPublishedPosts,
  getPostById,
  getVisiblePostById,
  getLeadStory,
  getFeaturedPosts,
  getRelatedPosts,
  getPostsByAuthorId,
  countPostsByAuthorId,
  getCategories,
  createPost,
  updatePost,
  deletePost,
};