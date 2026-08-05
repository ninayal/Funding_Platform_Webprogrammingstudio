"use strict";

const blogModel = require(
  "../models/blogModel",
);

const blogCommentModel =
  require(
    "../models/blogCommentModel",
  );

const {
  CATEGORY_ORDER,
  contentToText,
  normalisePostInput,
  validateCommentContent,
  validatePost,
} = require(
  "../validators/blogValidators",
);

const BLOG_DEVELOPMENT_ACTOR =
  Object.freeze({
    id: "user-huy-ba",
    name: "Huy Ba",
    email: "huy@example.com",
    initials: "HB",
    role: "Community contributor",
  });

const requestWantsJson = (req) => {
  const acceptHeader =
    req.get("accept") || "";

  return (
    req.xhr ||
    acceptHeader.includes(
      "application/json",
    )
  );
};

const formatDate = (
  value,
) => {
  if (!value) {
    return "Unpublished draft";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  ).format(date);
};

const toCategorySlug = (
  category,
) =>
  String(category || "")
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );


const getCurrentUser = () =>
  BLOG_DEVELOPMENT_ACTOR;

const preparePostForView = (
  req,
  post,
) => {
  if (!post) {
    return null;
  }

  const url =
    `/blog/${encodeURIComponent(
      post.id,
    )}`;

  const absoluteUrl =
    `${req.protocol}://${req.get(
      "host",
    )}${url}`;

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

    categorySlug:
      toCategorySlug(
        post.category,
      ),

    displayDate:
      formatDate(
        post.publishedAt ||
        post.updatedAt,
      ),

    url,
    absoluteUrl,
    searchableText,

    shareEmailUrl:
      `mailto:?subject=${encodeURIComponent(
        `${post.title} — Làng & Co.`,
      )}` +
      `&body=${encodeURIComponent(
        `${post.summary}\n\n${absoluteUrl}`,
      )}`,
  };
};

const toDateInputValue = (
  value,
) => {
  const date =
    value
      ? new Date(value)
      : new Date();

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return date
    .toISOString()
    .slice(0, 10);
};

const getPostFormValues = (
  post = {},
) => ({
  title:
    post.title || "",

  category:
    post.category || "Guide",

  tags:
    Array.isArray(post.tags)
      ? post.tags.join(", ")
      : "",

  imageUrl:
    post.image?.url || "",

  imageAlt:
    post.image?.alt || "",

  imageCaption:
    post.image?.caption || "",

  summary:
    post.summary || "",

  archiveSummary:
    post.archiveSummary || "",

  content:
    contentToText(
      post.content || [],
    ),

  readTime:
    post.readTime || 5,

  status:
    post.status || "draft",

  dateAdded:
    toDateInputValue(
      post.publishedAt ||
      post.updatedAt,
    ),

  displayDate:
    post.publishedAt ||
      post.updatedAt
      ? formatDate(
        post.publishedAt ||
        post.updatedAt,
      )
      : "Not published",
});

const calculateDraftCompletion = (
  post,
) => {
  const requiredSections = [
    Boolean(
      String(
        post.title || "",
      ).trim(),
    ),

    Boolean(
      String(
        post.summary || "",
      ).trim(),
    ),

    Boolean(
      post.image &&
      post.image.url,
    ),

    Boolean(
      Array.isArray(
        post.content,
      ) &&
      post.content.some(
        (block) =>
          String(
            block.text || "",
          ).trim(),
      ),
    ),

    Boolean(
      Array.isArray(
        post.tags,
      ) &&
      post.tags.length > 0,
    ),
  ];

  const completed =
    requiredSections.filter(
      Boolean,
    ).length;

  return Math.round(
    (
      completed /
      requiredSections.length
    ) *
    100,
  );
};

const prepareMyPostForView = (
  req,
  post,
) => {
  const preparedPost =
    preparePostForView(
      req,
      post,
    );

  const status =
    post.status === "published"
      ? "published"
      : "draft";

  return {
    ...preparedPost,

    status,

    statusLabel:
      status === "published"
        ? "Published"
        : "Draft",

    dateText:
      status === "draft"
        ? `Last edited ${preparedPost.displayDate}`
        : preparedPost.displayDate,

    dateTime:
      post.publishedAt ||
      post.updatedAt ||
      "",

    editUrl:
      `/blog/${encodeURIComponent(
        post.id,
      )}/edit`,

    imageUrl:
      post.image?.listUrl ||
      post.image?.url ||
      "/images/blog-placeholder.jpg",

    imageAlt:
      post.image?.alt ||
      post.title ||
      "Blog post image",

    summary:
      post.archiveSummary ||
      post.summary ||
      "No summary has been added.",

    commentCount:
      blogCommentModel.countCommentsByPostId(
        post.id,
      ),

    draftCompletion:
      status === "draft"
        ? calculateDraftCompletion(
          post,
        )
        : 100,
  };
};

const prepareCommentsForView = (
  post,
  currentUser,
) =>
  blogCommentModel
    .getCommentsByPostId(
      post.id,
      currentUser?.id ||
      null,
    )
    .map((comment) => ({
      ...comment,

      displayDate:
        formatDate(
          comment.createdAt,
        ),

      canDelete:
        Boolean(
          currentUser &&
          (
            comment.author.id ===
            currentUser.id ||
            post.author.id ===
            currentUser.id
          ),
        ),

      replies:
        comment.replies.map(
          (reply) => ({
            ...reply,

            displayDate:
              formatDate(
                reply.createdAt,
              ),

            canDelete:
              Boolean(
                currentUser &&
                (
                  reply.author.id ===
                  currentUser.id ||
                  post.author.id ===
                  currentUser.id
                ),
              ),
          }),
        ),
    }));

const getSharedViewData = () => ({
  myPostCount:
    blogModel.countPostsByAuthorId(
      BLOG_DEVELOPMENT_ACTOR.id,
    ),
});

const getCategoriesForView =
  () => {
    const available =
      new Set(
        blogModel.getCategories(),
      );

    const ordered =
      CATEGORY_ORDER.filter(
        (category) =>
          available.has(
            category,
          ),
      );

    const remaining = [
      ...available,
    ].filter(
      (category) =>
        !ordered.includes(
          category,
        ),
    );

    return [
      ...ordered,
      ...remaining,
    ].map((name) => ({
      name,
      slug:
        toCategorySlug(
          name,
        ),
    }));
  };

const getNotice = (
  query,
) => {
  if (
    query.comment ===
    "added"
  ) {
    return "Your comment was posted.";
  }

  if (
    query.reply ===
    "added"
  ) {
    return "Your reply was posted.";
  }

  if (
    query.comment ===
    "deleted"
  ) {
    return "The comment was deleted.";
  }

  return "";
};

const buildBlogViewData = (
  req,
  post,
  options = {},
) => {
  const currentUser =
    getCurrentUser(req);

  const preparedPost =
    preparePostForView(
      req,
      post,
    );

  preparedPost.commentCount =
    blogCommentModel.countCommentsByPostId(
      post.id,
    );

  return {
    ...getSharedViewData(),

    pageTitle:
      preparedPost.title,

    post: preparedPost,

    comments:
      prepareCommentsForView(
        post,
        currentUser,
      ),

    relatedPosts:
      blogModel
        .getRelatedPosts(
          post.id,
          3,
        )
        .map(
          (relatedPost) =>
            preparePostForView(
              req,
              relatedPost,
            ),
        ),

    commentErrors:
      options.commentErrors ||
      {},

    commentValues:
      options.commentValues ||
      {},

    replyErrors:
      options.replyErrors ||
      {},

    replyValues:
      options.replyValues ||
      {},

    openReplyId:
      options.openReplyId ||
      "",

    notice:
      options.notice || "",
  };
};

const getBlogPage = (
  req,
  res,
  next,
) => {
  try {
    const posts =
      blogModel
        .getPublishedPosts()
        .map((post) =>
          preparePostForView(
            req,
            post,
          ),
        );

    return res.render(
      "blog/blog",
      {
        ...getSharedViewData(),

        pageTitle:
          "Journal",

        pageSubtitle:
          "Stories, thoughts and ideas.",

        categories:
          getCategoriesForView(),

        posts,

        leadStory:
          preparePostForView(
            req,
            blogModel.getLeadStory(),
          ),

        featuredPosts:
          blogModel
            .getFeaturedPosts()
            .map((post) =>
              preparePostForView(
                req,
                post,
              ),
            ),
      },
    );
  } catch (error) {
    return next(error);
  }
};

const getBlogViewPage = (
  req,
  res,
  next,
) => {
  try {
    const currentUser =
      getCurrentUser(req);

    const post =
      blogModel.getVisiblePostById(
        req.params.id,
        currentUser?.id ||
        null,
      );

    if (!post) {
      return res
        .status(404)
        .send(
          "Blog post not found.",
        );
    }

    return res.render(
      "blog/blogview",
      buildBlogViewData(
        req,
        post,
        {
          notice:
            getNotice(
              req.query,
            ),
          openReplyId:
            req.query.openReply ||
            "",
        },
      ),
    );
  } catch (error) {
    return next(error);
  }
};

const addComment = (
  req,
  res,
  next,
) => {
  try {
    const post =
      blogModel.getVisiblePostById(
        req.params.id,
        BLOG_DEVELOPMENT_ACTOR.id,
      );

    if (
      !post ||
      post.status !==
      "published"
    ) {
      return res
        .status(404)
        .send(
          "Blog post not found.",
        );
    }

    const {
      content,
      errors,
    } =
      validateCommentContent(
        req.body.comment,
        "Comment",
      );

    if (
      Object.keys(errors)
        .length > 0
    ) {
      return res
        .status(422)
        .render(
          "blog/blogview",
          buildBlogViewData(
            req,
            post,
            {
              commentErrors: {
                comment:
                  errors.content,
              },

              commentValues: {
                comment:
                  content,
              },
            },
          ),
        );
    }

    blogCommentModel.addComment(
      post.id,
      BLOG_DEVELOPMENT_ACTOR,
      content,
    );

    return res.redirect(
      `/blog/${encodeURIComponent(
        post.id,
      )}?comment=added#comments`,
    );
  } catch (error) {
    return next(error);
  }
};

const addReply = (
  req,
  res,
  next,
) => {
  try {
    const post =
      blogModel.getVisiblePostById(
        req.params.id,
        BLOG_DEVELOPMENT_ACTOR.id,
      );

    if (
      !post ||
      post.status !==
      "published"
    ) {
      return res
        .status(404)
        .send(
          "Blog post not found.",
        );
    }

    const {
      content,
      errors,
    } =
      validateCommentContent(
        req.body.reply,
        "Reply",
      );

    if (
      Object.keys(errors)
        .length > 0
    ) {
      return res
        .status(422)
        .render(
          "blog/blogview",
          buildBlogViewData(
            req,
            post,
            {
              replyErrors: {
                [req.params
                  .commentId]:
                  errors.content,
              },

              replyValues: {
                [req.params
                  .commentId]:
                  content,
              },

              openReplyId:
                req.params
                  .commentId,
            },
          ),
        );
    }

    const result =
      blogCommentModel.addReply(
        post.id,
        req.params.commentId,
        BLOG_DEVELOPMENT_ACTOR,
        content,
      );

    if (!result.ok) {
      return res
        .status(404)
        .send(
          "Parent comment not found.",
        );
    }

    return res.redirect(
      `/blog/${encodeURIComponent(
        post.id,
      )}?reply=added&openReply=${encodeURIComponent(
        req.params.commentId,
      )}#comment-${encodeURIComponent(
        req.params.commentId,
      )}`,
    );
  } catch (error) {
    return next(error);
  }
};

const toggleCommentLike = (
  req,
  res,
  next,
) => {
  try {
    const post =
      blogModel.getVisiblePostById(
        req.params.id,
        BLOG_DEVELOPMENT_ACTOR.id,
      );

    if (!post) {
      return res
        .status(404)
        .json({
          ok: false,
          message:
            "Blog post not found.",
        });
    }

    const result =
      blogCommentModel.toggleLike(
        post.id,
        req.params.commentId,
        BLOG_DEVELOPMENT_ACTOR.id,
      );

    if (!result.ok) {
      return res
        .status(404)
        .json({
          ok: false,
          message:
            "Comment not found.",
        });
    }

    if (
      requestWantsJson(req)
    ) {
      return res.json(
        result,
      );
    }

    return res.redirect(
      `/blog/${encodeURIComponent(
        post.id,
      )}#comment-${encodeURIComponent(
        req.params.commentId,
      )}`,
    );
  } catch (error) {
    return next(error);
  }
};

const deleteComment = (
  req,
  res,
  next,
) => {
  try {
    const post =
      blogModel.getPostById(
        req.params.id,
      );

    if (!post) {
      return res
        .status(404)
        .send(
          "Blog post not found.",
        );
    }

    const result =
      blogCommentModel.deleteComment(
        post.id,
        req.params.commentId,
        BLOG_DEVELOPMENT_ACTOR.id,
        post.author.id,
      );

    if (!result.ok) {
      return res
        .status(
          result.reason ===
            "forbidden"
            ? 403
            : 404,
        )
        .send(
          "Comment could not be deleted.",
        );
    }

    return res.redirect(
      `/blog/${encodeURIComponent(
        post.id,
      )}?comment=deleted#comments`,
    );
  } catch (error) {
    return next(error);
  }
};

const getMyPostsPage = (
  req,
  res,
  next,
) => {
  try {
    const posts =
      blogModel
        .getPostsByAuthorId(
          BLOG_DEVELOPMENT_ACTOR.id,
        )
        .map((post) =>
          prepareMyPostForView(
            req,
            post,
          ),
        );

    const statistics = {
      total:
        posts.length,

      published:
        posts.filter(
          (post) =>
            post.status ===
            "published",
        ).length,

      drafts:
        posts.filter(
          (post) =>
            post.status ===
            "draft",
        ).length,
    };

    const author = {
      ...BLOG_DEVELOPMENT_ACTOR,

      description:
        "Writing about Vietnamese traditional crafts, cultural preservation, community support, and responsible digital platforms.",
    };

    return res.render(
      "blog/my_posts",
      {
        ...getSharedViewData(),

        pageTitle:
          "My Blog Posts",

        author,

        statistics,

        posts,
      },
    );
  } catch (error) {
    return next(error);
  }
};

const renderPostForm = (
  req,
  res,
  {
    mode,
    post = null,
    values = {},
    errors = {},
    status = 200,
  },
) => {
  const preparedPost =
    post
      ? preparePostForView(
        req,
        post,
      )
      : null;

  const formValues = {
    ...getPostFormValues(
      post || {},
    ),

    ...values,
  };

  const author = {
    ...(
      post?.author ||
      BLOG_DEVELOPMENT_ACTOR
    ),
  };

  const previewStats = {
    commentCount:
      post
        ? blogCommentModel
          .countCommentsByPostId(
            post.id,
          )
        : 0,

    viewCount:
      Number(
        post?.viewCount || 0,
      ),

    lastEdited:
      post?.updatedAt
        ? formatDate(
          post.updatedAt,
        )
        : "Not saved yet",
  };

  return res
    .status(status)
    .render(
      "blog/post_edit",
      {
        ...getSharedViewData(),

        pageTitle:
          mode === "create"
            ? "Create Blog Post"
            : "Edit Blog Post",

        mode,

        post:
          preparedPost,

        author,

        values:
          formValues,

        errors,

        categories:
          CATEGORY_ORDER,

        previewStats,
      },
    );
};

const getCreatePostPage = (
  req,
  res,
) =>
  renderPostForm(
    req,
    res,
    {
      mode: "create",
      values: {
        dateAdded:
          toDateInputValue(
            new Date(),
          ),
        status: "draft",
        category: "Guide",
        readTime: 5,
      },
    },
  );

const getPostEditPage = (
  req,
  res,
) => {
  const post =
    blogModel.getPostById(
      req.params.id,
    );

  if (!post) {
    return res
      .status(404)
      .send(
        "Blog post not found.",
      );
  }

  if (
    post.author.id !==
    BLOG_DEVELOPMENT_ACTOR.id
  ) {
    return res
      .status(403)
      .send(
        "You can edit only the development actor's posts.",
      );
  }

  return renderPostForm(
    req,
    res,
    {
      mode: "edit",
      post,
    },
  );
};

const createPost = (
  req,
  res,
  next,
) => {
  try {
    const values =
      normalisePostInput(
        req.body,
      );

    const errors =
      validatePost(
        values,
        {
          draft:
            values.status ===
            "draft",
        },
      );

    if (
      Object.keys(errors)
        .length > 0
    ) {
      return renderPostForm(
        req,
        res,
        {
          mode: "create",

          values: {
            ...req.body,
            status:
              values.status,
          },

          errors,

          status: 422,
        },
      );
    }

    const post =
      blogModel.createPost(
        values,
        BLOG_DEVELOPMENT_ACTOR,
      );

    return res.redirect(
      `/blog/${encodeURIComponent(
        post.id,
      )}`,
    );
  } catch (error) {
    return next(error);
  }
};

const updatePost = (
  req,
  res,
  next,
) => {
  try {
    const existing =
      blogModel.getPostById(
        req.params.id,
      );

    if (!existing) {
      return res
        .status(404)
        .send(
          "Blog post not found.",
        );
    }

    if (
      existing.author.id !==
      BLOG_DEVELOPMENT_ACTOR.id
    ) {
      return res
        .status(403)
        .send(
          "You cannot edit this post.",
        );
    }

    const status =
      req.body.status ||
      existing.status;

    const values =
      normalisePostInput(
        req.body,
        status,
      );

    const errors =
      validatePost(
        values,
        {
          draft:
            status ===
            "draft",
        },
      );

    if (
      Object.keys(errors)
        .length > 0
    ) {
      return renderPostForm(
        req,
        res,
        {
          mode: "edit",

          post:
            existing,

          values: {
            ...req.body,
            status,
          },

          errors,

          status: 422,
        },
      );
    }

    const result =
      blogModel.updatePost(
        existing.id,
        BLOG_DEVELOPMENT_ACTOR.id,
        {
          ...values,

          image: {
            url:
              values.imageUrl,

            listUrl:
              values.imageUrl,

            alt:
              values.imageAlt,

            caption:
              values.imageCaption,

            listCaption:
              values.imageCaption,
          },
        },
      );

    if (!result.ok) {
      return res
        .status(
          result.reason ===
            "forbidden"
            ? 403
            : 404,
        )
        .send(
          "Blog post could not be updated.",
        );
    }

    return res.redirect(
      `/blog/${encodeURIComponent(
        result.post.id,
      )}`,
    );
  } catch (error) {
    return next(error);
  }
};

const saveDraft = (
  req,
  res,
  next,
) => {
  req.body.status = "draft";

  return updatePost(
    req,
    res,
    next,
  );
};

const publishPost = (
  req,
  res,
  next,
) => {
  req.body.status =
    "published";

  return updatePost(
    req,
    res,
    next,
  );
};

const deletePost = (
  req,
  res,
  next,
) => {
  try {
    const result =
      blogModel.deletePost(
        req.params.id,
        BLOG_DEVELOPMENT_ACTOR.id,
      );

    if (!result.ok) {
      return res
        .status(
          result.reason ===
            "forbidden"
            ? 403
            : 404,
        )
        .send(
          "Blog post could not be deleted.",
        );
    }

    blogCommentModel.deleteCommentsByPostId(
      req.params.id,
    );

    return res.redirect(
      "/blog/my-posts",
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  addComment,
  addReply,
  createPost,
  deleteComment,
  deletePost,
  getBlogPage,
  getBlogViewPage,
  getCreatePostPage,
  getMyPostsPage,
  getPostEditPage,
  publishPost,
  saveDraft,
  toggleCommentLike,
  updatePost,
};