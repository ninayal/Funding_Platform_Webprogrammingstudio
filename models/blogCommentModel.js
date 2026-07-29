"use strict";

const crypto = require(
  "crypto",
);

const comments = [
  {
    id: "comment-dev-1",
    postId:
      "developer-mission",

    parentCommentId: null,

    author: {
      id:
        "user-mai-nguyen",
      name:
        "Mai Nguyễn",
      initials: "MN",
    },

    content:
      "I appreciate the distinction between documenting uncertainty and filling information gaps with marketing language.",

    likedBy: [
      "user-huy-ba",
    ],

    createdAt:
      "2026-07-06T11:15:00.000Z",

    updatedAt:
      "2026-07-06T11:15:00.000Z",

    status: "active",
  },

  {
    id: "reply-dev-1",
    postId:
      "developer-mission",

    parentCommentId:
      "comment-dev-1",

    author: {
      id: "user-huy-ba",
      name: "Huy Ba",
      initials: "HB",
    },

    content:
      "That distinction was one of the main design priorities.",

    likedBy: [],

    createdAt:
      "2026-07-06T12:00:00.000Z",

    updatedAt:
      "2026-07-06T12:00:00.000Z",

    status: "active",
  },

  {
    id: "comment-dev-2",
    postId:
      "developer-mission",

    parentCommentId: null,

    author: {
      id:
        "user-trung-kien",
      name:
        "Trung Kiên",
      initials: "TK",
    },

    content:
      "Maker-controlled profiles with editorial support could help preserve accurate information.",

    likedBy: [],

    createdAt:
      "2026-07-06T15:30:00.000Z",

    updatedAt:
      "2026-07-06T15:30:00.000Z",

    status: "active",
  },

  {
    id: "comment-dev-3",
    postId:
      "developer-mission",

    parentCommentId: null,

    author: {
      id: "user-an-vy",
      name: "An Vy",
      initials: "AV",
    },

    content:
      "The relationship between traditional products and charitable support makes the platform more meaningful.",

    likedBy: [],

    createdAt:
      "2026-07-07T08:20:00.000Z",

    updatedAt:
      "2026-07-07T08:20:00.000Z",

    status: "active",
  },

  {
    id:
      "comment-bat-trang-1",

    postId: "bat-trang",

    parentCommentId: null,

    author: {
      id:
        "user-phuong-linh",
      name:
        "Phương Linh",
      initials: "PL",
    },

    content:
      "This is why village names should not be treated as a single aesthetic category.",

    likedBy: [],

    createdAt:
      "2026-06-29T10:00:00.000Z",

    updatedAt:
      "2026-06-29T10:00:00.000Z",

    status: "active",
  },
];

const clone = (value) =>
  JSON.parse(
    JSON.stringify(value),
  );

const clean = (value) =>
  String(value || "").trim();

const getMutableComment = (
  commentId,
) =>
  comments.find(
    (comment) =>
      comment.id ===
      clean(commentId),
  ) || null;

const buildAuthor = (
  user,
) => ({
  id: clean(user.id),
  name: clean(
    user.name ||
      user.username ||
      "User",
  ),

  initials: clean(
    user.initials ||
      "U",
  ),
});

const decorateComment = (
  comment,
  currentUserId,
) => ({
  ...clone(comment),

  likeCount:
    comment.likedBy.length,

  likedByCurrentUser:
    Boolean(
      currentUserId &&
        comment.likedBy.includes(
          currentUserId,
        ),
    ),
});

const getCommentsByPostId = (
  postId,
  currentUserId = null,
) => {
  const id = clean(postId);

  const activeComments =
    comments.filter(
      (comment) =>
        comment.postId === id &&
        comment.status ===
          "active",
    );

  const roots =
    activeComments
      .filter(
        (comment) =>
          !comment.parentCommentId,
      )
      .sort(
        (a, b) =>
          new Date(
            b.createdAt,
          ) -
          new Date(
            a.createdAt,
          ),
      );

  return roots.map(
    (root) => {
      const replies =
        activeComments
          .filter(
            (comment) =>
              comment.parentCommentId ===
              root.id,
          )
          .sort(
            (a, b) =>
              new Date(
                a.createdAt,
              ) -
              new Date(
                b.createdAt,
              ),
          )
          .map((reply) =>
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
) =>
  comments.filter(
    (comment) =>
      comment.postId ===
        clean(postId) &&
      comment.status ===
        "active",
  ).length;

const addComment = (
  postId,
  user,
  content,
) => {
  const now =
    new Date().toISOString();

  const comment = {
    id:
      crypto.randomUUID(),

    postId:
      clean(postId),

    parentCommentId: null,

    author:
      buildAuthor(user),

    content:
      clean(content),

    likedBy: [],

    createdAt: now,
    updatedAt: now,
    status: "active",
  };

  comments.push(comment);

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
  const parent =
    getMutableComment(
      parentCommentId,
    );

  if (
    !parent ||
    parent.postId !==
      clean(postId) ||
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
   * Keep only one visible reply level.
   * Replying to a reply attaches it
   * to the original parent comment.
   */
  const rootId =
    parent.parentCommentId ||
    parent.id;

  const now =
    new Date().toISOString();

  const reply = {
    id:
      crypto.randomUUID(),

    postId:
      clean(postId),

    parentCommentId:
      rootId,

    author:
      buildAuthor(user),

    content:
      clean(content),

    likedBy: [],

    createdAt: now,
    updatedAt: now,
    status: "active",
  };

  comments.push(reply);

  return {
    ok: true,
    reply: clone(reply),
  };
};

const toggleLike = (
  postId,
  commentId,
  userId,
) => {
  const comment =
    getMutableComment(
      commentId,
    );

  const actorId =
    clean(userId);

  if (
    !comment ||
    comment.postId !==
      clean(postId) ||
    comment.status !==
      "active"
  ) {
    return {
      ok: false,
      reason:
        "comment-not-found",
    };
  }

  const existingIndex =
    comment.likedBy.indexOf(
      actorId,
    );

  let liked;

  if (existingIndex === -1) {
    comment.likedBy.push(
      actorId,
    );

    liked = true;
  } else {
    comment.likedBy.splice(
      existingIndex,
      1,
    );

    liked = false;
  }

  comment.updatedAt =
    new Date().toISOString();

  return {
    ok: true,
    liked,
    likeCount:
      comment.likedBy.length,
  };
};

const deleteComment = (
  postId,
  commentId,
  actorId,
  postOwnerId,
) => {
  const comment =
    getMutableComment(
      commentId,
    );

  if (
    !comment ||
    comment.postId !==
      clean(postId)
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
      reason: "forbidden",
    };
  }

  const idsToDelete =
    new Set([
      comment.id,
    ]);

  if (
    !comment.parentCommentId
  ) {
    comments.forEach(
      (item) => {
        if (
          item.parentCommentId ===
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
  const id = clean(postId);

  for (
    let index =
      comments.length - 1;
    index >= 0;
    index -= 1
  ) {
    if (
      comments[index].postId ===
      id
    ) {
      comments.splice(
        index,
        1,
      );
    }
  }
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