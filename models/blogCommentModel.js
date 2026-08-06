"use strict";

const crypto =
  require("crypto");

const {
  comments:
  seedComments,
} = require("../data/blog");

const clone = (value) => {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(
    JSON.stringify(value),
  );
};

/*
 * Runtime copy of the seed comments.
 */
const comments =
  seedComments.map(clone);

const clean = (value) =>
  String(value || "")
    .trim();

const getMutableComment = (
  commentId,
) =>
  comments.find(
    (comment) =>
      comment.id ===
      clean(commentId),
  ) || null;

const buildAuthor = (
  user = {},
) => ({
  id:
    clean(user.id),

  name:
    clean(
      user.name ||
      user.username ||
      "User",
    ),

  initials:
    clean(
      user.initials ||
      "U",
    ),
});

const getLikedBy = (
  comment,
) =>
  Array.isArray(
    comment.likedBy,
  )
    ? comment.likedBy
    : [];

const decorateComment = (
  comment,
  currentUserId,
) => {
  const likedBy =
    getLikedBy(comment);

  return {
    ...clone(comment),

    likedBy:
      clone(likedBy),

    likeCount:
      likedBy.length,

    likedByCurrentUser:
      Boolean(
        currentUserId &&
        likedBy.includes(
          clean(
            currentUserId,
          ),
        ),
      ),
  };
};

const getCommentsByPostId = (
  postId,
  currentUserId = null,
) => {
  const id =
    clean(postId);

  const activeComments =
    comments.filter(
      (comment) =>
        comment.postId ===
        id &&
        comment.status ===
        "active",
    );

  const roots =
    activeComments
      .filter(
        (comment) =>
          !comment
            .parentCommentId,
      )
      .sort(
        (commentA, commentB) =>
          new Date(
            commentB
              .createdAt,
          ).getTime() -
          new Date(
            commentA
              .createdAt,
          ).getTime(),
      );

  return roots.map(
    (root) => {
      const replies =
        activeComments
          .filter(
            (comment) =>
              comment
                .parentCommentId ===
              root.id,
          )
          .sort(
            (
              replyA,
              replyB,
            ) =>
              new Date(
                replyA
                  .createdAt,
              ).getTime() -
              new Date(
                replyB
                  .createdAt,
              ).getTime(),
          )
          .map(
            (reply) =>
              decorateComment(
                reply,
                currentUserId,
              ),
          );

      return {
        ...decorateComment(
          root,
          currentUserId,
        ),

        replyCount:
          replies.length,

        replies,
      };
    },
  );
};

const countCommentsByPostId = (
  postId,
) => {
  const id =
    clean(postId);

  return comments.filter(
    (comment) =>
      comment.postId ===
      id &&
      comment.status ===
      "active",
  ).length;
};

const addComment = (
  postId,
  user,
  content,
) => {
  const id =
    clean(postId);

  const author =
    buildAuthor(user);

  const cleanContent =
    clean(content);

  if (
    !id ||
    !author.id ||
    !cleanContent
  ) {
    return {
      ok: false,
      reason:
        "invalid-input",
    };
  }

  const now =
    new Date()
      .toISOString();

  const comment = {
    id:
      crypto.randomUUID(),

    postId:
      id,

    parentCommentId:
      null,

    author,

    content:
      cleanContent,

    likedBy: [],

    createdAt:
      now,

    updatedAt:
      now,

    status:
      "active",
  };

  comments.push(
    comment,
  );

  return {
    ok: true,
    comment:
      clone(comment),
  };
};

const addReply = (
  postId,
  parentCommentId,
  user,
  content,
) => {
  const id =
    clean(postId);

  const parent =
    getMutableComment(
      parentCommentId,
    );

  const author =
    buildAuthor(user);

  const cleanContent =
    clean(content);

  if (
    !id ||
    !author.id ||
    !cleanContent
  ) {
    return {
      ok: false,
      reason:
        "invalid-input",
    };
  }

  if (
    !parent ||
    parent.postId !== id ||
    parent.status !==
    "active"
  ) {
    return {
      ok: false,
      reason:
        "parent-not-found",
    };
  }

  /*
   * Only one visible reply level.
   * Replying to a reply attaches the
   * new reply to the original root.
   */
  const rootId =
    parent.parentCommentId ||
    parent.id;

  const now =
    new Date()
      .toISOString();

  const reply = {
    id:
      crypto.randomUUID(),

    postId:
      id,

    parentCommentId:
      rootId,

    author,

    content:
      cleanContent,

    likedBy: [],

    createdAt:
      now,

    updatedAt:
      now,

    status:
      "active",
  };

  comments.push(
    reply,
  );

  return {
    ok: true,
    reply:
      clone(reply),
  };
};

const toggleLike = (
  postId,
  commentId,
  userId,
) => {
  const id =
    clean(postId);

  const actorId =
    clean(userId);

  if (!actorId) {
    return {
      ok: false,
      reason:
        "user-required",
    };
  }

  const comment =
    getMutableComment(
      commentId,
    );

  if (
    !comment ||
    comment.postId !== id ||
    comment.status !==
    "active"
  ) {
    return {
      ok: false,
      reason:
        "comment-not-found",
    };
  }

  if (
    !Array.isArray(
      comment.likedBy,
    )
  ) {
    comment.likedBy =
      [];
  }

  const existingIndex =
    comment.likedBy
      .indexOf(
        actorId,
      );

  let liked;

  if (
    existingIndex === -1
  ) {
    comment.likedBy
      .push(
        actorId,
      );

    liked = true;
  } else {
    comment.likedBy
      .splice(
        existingIndex,
        1,
      );

    liked = false;
  }

  comment.updatedAt =
    new Date()
      .toISOString();

  return {
    ok: true,
    liked,

    likeCount:
      comment.likedBy
        .length,
  };
};

const deleteComment = (
  postId,
  commentId,
  actorId,
  postOwnerId,
) => {
  const id =
    clean(postId);

  const comment =
    getMutableComment(
      commentId,
    );

  if (
    !comment ||
    comment.postId !== id
  ) {
    return {
      ok: false,
      reason:
        "comment-not-found",
    };
  }

  const actor =
    clean(actorId);

  const canDelete =
    actor &&
    (
      comment.author.id ===
      actor ||
      clean(postOwnerId) ===
      actor
    );

  if (!canDelete) {
    return {
      ok: false,
      reason:
        "forbidden",
    };
  }

  const idsToDelete =
    new Set([
      comment.id,
    ]);

  /*
   * Deleting a root comment also
   * removes its direct replies.
   */
  if (
    !comment
      .parentCommentId
  ) {
    comments.forEach(
      (item) => {
        if (
          item
            .parentCommentId ===
          comment.id
        ) {
          idsToDelete.add(
            item.id,
          );
        }
      },
    );
  }

  for (
    let index =
      comments.length - 1;
    index >= 0;
    index -= 1
  ) {
    if (
      idsToDelete.has(
        comments[index].id,
      )
    ) {
      comments.splice(
        index,
        1,
      );
    }
  }

  return {
    ok: true,
  };
};

const deleteCommentsByPostId = (
  postId,
) => {
  const id =
    clean(postId);

  let deletedCount =
    0;

  for (
    let index =
      comments.length - 1;
    index >= 0;
    index -= 1
  ) {
    if (
      comments[index]
        .postId === id
    ) {
      comments.splice(
        index,
        1,
      );

      deletedCount += 1;
    }
  }

  return {
    ok: true,
    deletedCount,
  };
};

module.exports = {
  addComment,
  addReply,
  countCommentsByPostId,
  deleteComment,
  deleteCommentsByPostId,
  getCommentsByPostId,
  toggleLike,
};