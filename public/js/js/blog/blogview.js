"use strict";

document.addEventListener(
  "DOMContentLoaded",
  () => {
    const detailPage =
      document.querySelector(
        "[data-blog-detail]",
      );

    if (!detailPage) {
      return;
    }

    const shareButton =
      document.querySelector(
        "[data-native-share]",
      );

    const copyButton =
      document.querySelector(
        "[data-copy-link]",
      );

    const shareFeedback =
      document.querySelector(
        "[data-share-feedback]",
      );

    const showShareFeedback = (
      message,
    ) => {
      if (!shareFeedback) {
        return;
      }

      shareFeedback.textContent =
        message;

      shareFeedback.hidden =
        false;

      window.clearTimeout(
        showShareFeedback.timeoutId,
      );

      showShareFeedback.timeoutId =
        window.setTimeout(
          () => {
            shareFeedback.hidden =
              true;
          },
          2400,
        );
    };

    const copyArticleLink =
      async () => {
        const url =
          detailPage.dataset
            .shareUrl ||
          window.location.href;

        try {
          await navigator.clipboard.writeText(
            url,
          );

          showShareFeedback(
            "Link copied",
          );

          return true;
        } catch (error) {
          window.prompt(
            "Copy this link:",
            url,
          );

          return false;
        }
      };

    shareButton?.addEventListener(
      "click",
      async () => {
        const shareData = {
          title:
            detailPage.dataset
              .shareTitle ||
            document.title,

          text:
            detailPage.dataset
              .shareText ||
            "",

          url:
            detailPage.dataset
              .shareUrl ||
            window.location.href,
        };

        if (
          typeof navigator.share ===
          "function"
        ) {
          try {
            await navigator.share(
              shareData,
            );

            showShareFeedback(
              "Share menu opened",
            );

            return;
          } catch (error) {
            /*
             * AbortError means the user
             * closed the share sheet.
             */
            if (
              error.name ===
              "AbortError"
            ) {
              return;
            }
          }
        }

        await copyArticleLink();
      },
    );

    copyButton?.addEventListener(
      "click",
      copyArticleLink,
    );

    const validateTextArea = (
      textarea,
      errorElement,
      label,
    ) => {
      const value =
        textarea.value.trim();

      let message = "";

      if (value.length < 3) {
        message =
          `${label} must contain at least 3 characters.`;
      } else if (
        value.length > 1000
      ) {
        message =
          `${label} must not exceed 1000 characters.`;
      }

      textarea.setAttribute(
        "aria-invalid",
        message
          ? "true"
          : "false",
      );

      if (errorElement) {
        errorElement.textContent =
          message;
      }

      return !message;
    };

    const commentForm =
      document.querySelector(
        "[data-comment-form]",
      );

    if (commentForm) {
      const textarea =
        commentForm.querySelector(
          "[data-comment-content]",
        );

      const count =
        commentForm.querySelector(
          "[data-comment-count]",
        );

      const errorElement =
        commentForm.querySelector(
          '[data-error-for="comment"]',
        );

      const feedback =
        commentForm.querySelector(
          "[data-comment-feedback]",
        );

      const postId =
        commentForm.dataset
          .postId || "post";

      const storageKey =
        `langco.blog.commentDraft.${postId}`;

      const updateComment = () => {
        if (!textarea) {
          return;
        }

        if (count) {
          count.textContent =
            `${textarea.value.length} / 1000`;
        }

        validateTextArea(
          textarea,
          errorElement,
          "Comment",
        );

        localStorage.setItem(
          storageKey,
          textarea.value,
        );
      };

      const query =
        new URLSearchParams(
          window.location.search,
        );

      if (
        query.get("comment") ===
        "added"
      ) {
        localStorage.removeItem(
          storageKey,
        );
      } else {
        const storedDraft =
          localStorage.getItem(
            storageKey,
          );

        if (
          storedDraft &&
          textarea &&
          !textarea.value
        ) {
          textarea.value =
            storedDraft;
        }
      }

      textarea?.addEventListener(
        "input",
        updateComment,
      );

      commentForm.addEventListener(
        "submit",
        (event) => {
          if (
            !textarea ||
            !validateTextArea(
              textarea,
              errorElement,
              "Comment",
            )
          ) {
            event.preventDefault();

            if (feedback) {
              feedback.textContent =
                "Correct the comment before posting.";
            }

            textarea?.focus();

            return;
          }

          if (feedback) {
            feedback.textContent =
              "Posting comment…";
          }
        },
      );

      updateComment();
    }

    const initialiseReplyForm = (
      form,
    ) => {
      const textarea =
        form.querySelector(
          "[data-reply-content]",
        );

      const count =
        form.querySelector(
          "[data-reply-count]",
        );

      const errorElement =
        form.querySelector(
          '[data-error-for="reply"]',
        );

      const commentId =
        form.dataset
          .commentId ||
        "comment";

      const storageKey =
        `langco.blog.replyDraft.${commentId}`;

      const updateReply = () => {
        if (!textarea) {
          return;
        }

        if (count) {
          count.textContent =
            `${textarea.value.length} / 1000`;
        }

        validateTextArea(
          textarea,
          errorElement,
          "Reply",
        );

        localStorage.setItem(
          storageKey,
          textarea.value,
        );
      };

      const query =
        new URLSearchParams(
          window.location.search,
        );

      if (
        query.get("reply") ===
        "added"
      ) {
        localStorage.removeItem(
          storageKey,
        );
      } else {
        const storedDraft =
          localStorage.getItem(
            storageKey,
          );

        if (
          storedDraft &&
          textarea &&
          !textarea.value
        ) {
          textarea.value =
            storedDraft;
        }
      }

      textarea?.addEventListener(
        "input",
        updateReply,
      );

      form.addEventListener(
        "submit",
        (event) => {
          if (
            !textarea ||
            !validateTextArea(
              textarea,
              errorElement,
              "Reply",
            )
          ) {
            event.preventDefault();
            textarea?.focus();
          }
        },
      );

      updateReply();
    };

    document
      .querySelectorAll(
        "[data-reply-form]",
      )
      .forEach(
        initialiseReplyForm,
      );

    document
      .querySelectorAll(
        "[data-reply-toggle]",
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            const controls =
              button.getAttribute(
                "aria-controls",
              );

            const panel =
              document.getElementById(
                controls,
              );

            if (!panel) {
              return;
            }

            const willOpen =
              panel.hidden;

            panel.hidden =
              !willOpen;

            button.setAttribute(
              "aria-expanded",
              String(willOpen),
            );

            if (willOpen) {
              panel
                .querySelector(
                  "[data-reply-content]",
                )
                ?.focus();
            }
          },
        );
      });

    document
      .querySelectorAll(
        "[data-reply-cancel]",
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            const panel =
              button.closest(
                "[data-reply-panel]",
              );

            if (!panel) {
              return;
            }

            panel.hidden = true;

            const panelId =
              panel.id;

            const toggle =
              document.querySelector(
                `[aria-controls="${CSS.escape(
                  panelId,
                )}"]`,
              );

            toggle?.setAttribute(
              "aria-expanded",
              "false",
            );
          },
        );
      });

    document
      .querySelectorAll(
        "[data-like-form]",
      )
      .forEach((form) => {
        form.addEventListener(
          "submit",
          async (event) => {
            event.preventDefault();

            const button =
              form.querySelector(
                "[data-like-button]",
              );

            const label =
              form.querySelector(
                "[data-like-label]",
              );

            const count =
              form.querySelector(
                "[data-like-count]",
              );

            if (button) {
              button.disabled =
                true;
            }

            try {
              const response =
                await fetch(
                  form.action,
                  {
                    method: "POST",

                    headers: {
                      Accept:
                        "application/json",
                    },
                  },
                );

              const result =
                await response.json();

              if (
                response.status ===
                  401 &&
                result.loginUrl
              ) {
                window.location.href =
                  result.loginUrl;

                return;
              }

              if (
                !response.ok ||
                !result.ok
              ) {
                throw new Error(
                  result.message ||
                    "Like could not be updated.",
                );
              }

              button?.classList.toggle(
                "is-liked",
                result.liked,
              );

              if (label) {
                label.textContent =
                  result.liked
                    ? "Liked"
                    : "Like";
              }

              if (count) {
                count.textContent =
                  String(
                    result.likeCount,
                  );
              }
            } catch (error) {
              window.alert(
                error.message ||
                  "Like could not be updated.",
              );
            } finally {
              if (button) {
                button.disabled =
                  false;
              }
            }
          },
        );
      });

    document
      .querySelectorAll(
        "[data-delete-comment-form]",
      )
      .forEach((form) => {
        form.addEventListener(
          "submit",
          (event) => {
            const confirmed =
              window.confirm(
                "Delete this comment? Replies attached to a parent comment will also be deleted.",
              );

            if (!confirmed) {
              event.preventDefault();
            }
          },
        );
      });
  },
);