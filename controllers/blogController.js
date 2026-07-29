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
  normalisePostInput,
  validateCommentContent,
  validatePost,
} = require(
  "../validators/blogValidators",
);

const {
  requestWantsJson,
} = require(
  "../middlewares/authMiddleware",
);

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

const getCurrentUser = (
  req,
) =>
  req.currentUser ||
  null;

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

const getSharedViewData = (
  req,
) => {
  const currentUser =
    getCurrentUser(req);

  return {
    currentUser,

    currentUserId:
      currentUser?.id ||
      null,

    myPostCount:
      currentUser
        ? blogModel.countPostsByAuthorId(
            currentUser.id,
          )
        : 0,
  };
};

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
    ...getSharedViewData(req),

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
        ...getSharedViewData(
          req,
        ),

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
        req.currentUser.id,
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
      req.currentUser,
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
        req.currentUser.id,
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
        req.currentUser,
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
        req.currentUser.id,
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
        req.currentUser.id,
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
        req.currentUser.id,
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
          req.currentUser.id,
        )
        .map((post) =>
          preparePostForView(
            req,
            post,
          ),
        );

    return res.render(
      "blog/my_posts",
      {
        ...getSharedViewData(
          req,
        ),
        pageTitle:
          "My Blog Posts",
        posts,
      },
    );
  } catch (error) {
    return next(error);
  }
};

const getCreatePostPage = (
  req,
  res,
) =>
  res.render(
    "blog/post_edit",
    {
      ...getSharedViewData(
        req,
      ),

      pageTitle:
        "Create Post",

      formMode: "create",

      post: null,

      values: {},

      errors: {},

      categories:
        CATEGORY_ORDER,
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
    req.currentUser.id
  ) {
    return res
      .status(403)
      .send(
        "You cannot edit another user's post.",
      );
  }

  return res.render(
    "blog/post_edit",
    {
      ...getSharedViewData(
        req,
      ),

      pageTitle:
        "Edit Post",

      formMode: "edit",

      post:
        preparePostForView(
          req,
          post,
        ),

      values: {},

      errors: {},

      categories:
        CATEGORY_ORDER,
    },
  );
};

const sendPostErrors = (
  res,
  errors,
) =>
  res.status(422).json({
    ok: false,
    message:
      "Blog post validation failed.",
    errors,
  });

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
      return sendPostErrors(
        res,
        errors,
      );
    }

    const post =
      blogModel.createPost(
        values,
        req.currentUser,
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
      return sendPostErrors(
        res,
        errors,
      );
    }

    const result =
      blogModel.updatePost(
        existing.id,
        req.currentUser.id,
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
        req.currentUser.id,
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