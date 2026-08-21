"use strict";

(() => {
  const CREATE_DRAFT_KEY =
    "langco.giftcard.create.v3";

  const CREATE_PROGRESS_KEY =
    "langco.giftcard.create.progress.v3";

  const body =
    document.body;

  const form =
    document.getElementById(
      "gift-card-form",
    );

  const redeemInput =
    document.getElementById(
      "gift-code",
    );

  const savedView =
    body?.dataset
      .giftcardSavedView === "true";

  const reviewMode =
    body?.dataset
      .giftcardReview === "true";

  const hasServerErrors =
    body?.dataset
      .giftcardServerErrors === "true";

  if (redeemInput) {
    redeemInput.addEventListener(
      "input",
      () => {
        redeemInput.value =
          redeemInput.value
            .toUpperCase()
            .replace(/\s+/g, "");
      },
    );
  }

  document
    .querySelectorAll(
      "[data-giftcard-delete]",
    )
    .forEach((deleteForm) => {
      deleteForm.addEventListener(
        "submit",
        (event) => {
          const confirmed =
            window.confirm(
              "Delete this gift card? This action cannot be undone.",
            );

          if (!confirmed) {
            event.preventDefault();
          }
        },
      );
    });

  /*
   * Successful create/update redirects to a saved gift view.
   * Clear stale create/edit Web Storage there.
   */
  if (savedView) {
    try {
      localStorage.removeItem(
        CREATE_DRAFT_KEY,
      );

      localStorage.removeItem(
        CREATE_PROGRESS_KEY,
      );

      for (
        let index =
          localStorage.length - 1;
        index >= 0;
        index -= 1
      ) {
        const key =
          localStorage.key(index);

        if (
          key &&
          key.startsWith(
            "langco.giftcard.edit.",
          )
        ) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      /* Storage is optional. */
    }
  }

  if (!form) {
    return;
  }

  const STEP_IDS = [
    "gift-type",
    "delivery-type",
    "design",
    "amount",
    "details",
  ];

  const stepSections =
    STEP_IDS
      .map((stepId) =>
        document.getElementById(
          stepId,
        ))
      .filter(Boolean);

  const mode =
    form.dataset.giftcardMode ||
    "create";

  const giftcardId =
    form.dataset.giftcardId || "";

  const draftKey =
    mode === "edit"
      ? `langco.giftcard.edit.${giftcardId}.v3`
      : CREATE_DRAFT_KEY;

  const progressKey =
    mode === "edit"
      ? `langco.giftcard.edit.${giftcardId}.progress.v3`
      : CREATE_PROGRESS_KEY;

  const allControls = () =>
    Array.from(form.elements).filter(
      (control) =>
        control.name &&
        control.type !== "submit" &&
        control.type !== "button",
    );

  const controlsByName = (name) =>
    Array.from(form.elements).filter(
      (control) =>
        control.name === name,
    );

  const firstControl = (name) =>
    controlsByName(name)[0] ||
    null;

  const valueOf = (name) => {
    const controls =
      controlsByName(name);

    if (!controls.length) {
      return "";
    }

    if (
      controls[0].type === "radio"
    ) {
      return (
        controls.find(
          (control) =>
            control.checked,
        )?.value || ""
      );
    }

    return controls[0].value;
  };

  const todayIso = () => {
    const now = new Date();

    const local =
      new Date(
        now.getTime() -
        now.getTimezoneOffset() *
        60 *
        1000,
      );

    return local
      .toISOString()
      .slice(0, 10);
  };

  const getFieldContainer = (
    control,
  ) =>
    control?.closest(".field") ||
    control?.closest(
      ".amount-field",
    ) ||
    null;

  const clearFieldError = (
    control,
  ) => {
    if (!control) {
      return;
    }

    control.removeAttribute(
      "aria-invalid",
    );

    getFieldContainer(control)
      ?.querySelector(
        ".client-form-error",
      )
      ?.remove();
  };

  const showFieldError = (
    control,
    message,
  ) => {
    if (!control) {
      return;
    }

    const container =
      getFieldContainer(control);

    if (!container) {
      return;
    }

    let error =
      container.querySelector(
        ".client-form-error",
      );

    if (!error) {
      error =
        document.createElement(
          "span",
        );

      error.className =
        "client-form-error";

      error.setAttribute(
        "role",
        "alert",
      );

      container.append(error);
    }

    error.textContent = message;

    control.setAttribute(
      "aria-invalid",
      "true",
    );
  };

  const showStepError = (
    stepId,
    message,
  ) => {
    const section =
      document.getElementById(
        stepId,
      );

    if (!section) {
      return;
    }

    let error =
      section.querySelector(
        ".client-step-error",
      );

    if (!message) {
      error?.remove();
      return;
    }

    if (!error) {
      error =
        document.createElement(
          "p",
        );

      error.className =
        "client-step-error";

      error.setAttribute(
        "role",
        "alert",
      );

      const nextArea =
        section.querySelector(
          ".section-next",
        );

      if (nextArea) {
        nextArea.before(error);
      } else {
        section
          .querySelector(
            ".section-shell",
          )
          ?.append(error);
      }
    }

    error.textContent = message;
  };

  const setGroupEnabled = (
    selector,
    enabled,
  ) => {
    document
      .querySelectorAll(
        `${selector} input,
         ${selector} select,
         ${selector} textarea`,
      )
      .forEach((control) => {
        control.disabled = !enabled;

        if (!enabled) {
          control.required = false;
          clearFieldError(control);
        }
      });
  };

  const setRequired = (
    name,
    required,
  ) => {
    controlsByName(name).forEach(
      (control) => {
        if (!control.disabled) {
          control.required =
            required;
        }

        if (!required) {
          clearFieldError(control);
        }
      },
    );
  };

  const updateConditionalState =
    () => {
      const giftType =
        valueOf("giftType");

      const deliveryType =
        valueOf("deliveryType");

      const emailTiming =
        valueOf("emailTiming");

      const honour =
        giftType ===
        "donation-in-honour";

      const digital =
        deliveryType ===
        "digital";

      const printable =
        deliveryType ===
        "printable";

      const physical =
        deliveryType ===
        "physical";

      setGroupEnabled(
        ".digital-fields",
        digital,
      );

      setGroupEnabled(
        ".printable-fields",
        printable,
      );

      setGroupEnabled(
        ".physical-fields",
        physical,
      );

      setRequired(
        "causeCategory",
        honour,
      );

      setRequired(
        "recipientEmail",
        digital,
      );

      setRequired(
        "emailTiming",
        digital,
      );

      setRequired(
        "emailDeliveryDate",
        digital &&
          emailTiming ===
            "Schedule delivery",
      );

      setRequired(
        "printFormat",
        printable,
      );

      setRequired(
        "paperSize",
        printable,
      );

      setRequired(
        "downloadFormat",
        printable,
      );

      [
        "recipientPhone",
        "streetAddress",
        "district",
        "city",
      ].forEach((name) => {
        setRequired(
          name,
          physical,
        );
      });

      [
        "emailDeliveryDate",
        "physicalDeliveryDate",
      ].forEach((name) => {
        const input =
          firstControl(name);

        if (input) {
          input.min =
            todayIso();
        }
      });
    };

  const getValidationMessage = (
    control,
  ) => {
    if (
      !control ||
      control.disabled
    ) {
      return "";
    }

    const name =
      control.name;

    const value =
      String(
        control.value || "",
      ).trim();

    if (
      !control.required &&
      !value
    ) {
      return "";
    }

    if (
      name === "quantity"
    ) {
      const number =
        Number(value);

      if (
        !Number.isInteger(number) ||
        number < 1 ||
        number > 20
      ) {
        return (
          "Quantity must be between 1 and 20."
        );
      }
    }

    if (
      name === "amountPerCard"
    ) {
      const number =
        Number(value);

      if (
        !Number.isFinite(number) ||
        number < 5 ||
        number > 10000
      ) {
        return (
          "Amount must be between $5 and $10,000."
        );
      }
    }

    if (
      name === "recipientName"
    ) {
      if (
        value.length < 2 ||
        value.length > 60
      ) {
        return (
          "Recipient name must be 2–60 characters."
        );
      }
    }

    if (
      name === "senderName"
    ) {
      if (
        value.length < 2 ||
        value.length > 60
      ) {
        return (
          "Your name must be 2–60 characters."
        );
      }
    }

    if (name === "message") {
      if (
        value.length < 5 ||
        value.length > 280
      ) {
        return (
          "Message must be 5–280 characters."
        );
      }
    }

    if (
      name === "causeNote" &&
      value.length > 180
    ) {
      return (
        "Cause note cannot exceed 180 characters."
      );
    }

    if (
      name === "recipientPhone"
    ) {
      const digits =
        value.replace(/\D/g, "");

      if (
        digits.length < 7 ||
        digits.length > 15
      ) {
        return (
          "Enter a valid phone number."
        );
      }
    }

    if (
      (
        name ===
        "emailDeliveryDate" ||
        name ===
        "physicalDeliveryDate"
      ) &&
      value &&
      value < todayIso()
    ) {
      return (
        "Choose today or a future date."
      );
    }

    if (
      control.required &&
      !value
    ) {
      return (
        "This field is required."
      );
    }

    if (
      !control.checkValidity()
    ) {
      return (
        control.validationMessage ||
        "Check this field."
      );
    }

    return "";
  };

  const validateControl = (
    control,
    showError = true,
  ) => {
    if (
      !control ||
      control.type === "radio" ||
      control.disabled
    ) {
      return true;
    }

    const message =
      getValidationMessage(
        control,
      );

    if (message) {
      if (showError) {
        showFieldError(
          control,
          message,
        );
      }

      return false;
    }

    clearFieldError(control);
    return true;
  };

  const validateRadioGroup = (
    name,
    stepId,
    message,
  ) => {
    const valid =
      Boolean(valueOf(name));

    showStepError(
      stepId,
      valid ? "" : message,
    );

    return valid;
  };

  const validateStep = (
    stepId,
  ) => {
    updateConditionalState();

    if (
      stepId === "gift-type"
    ) {
      return validateRadioGroup(
        "giftType",
        stepId,
        "Choose a gift type before continuing.",
      );
    }

    if (
      stepId ===
      "delivery-type"
    ) {
      return validateRadioGroup(
        "deliveryType",
        stepId,
        "Choose a delivery method before continuing.",
      );
    }

    if (stepId === "design") {
      return validateRadioGroup(
        "designType",
        stepId,
        "Choose a design before continuing.",
      );
    }

    const names =
      stepId === "amount"
        ? [
          "quantity",
          "amountPerCard",
        ]
        : [
          "recipientName",
          "senderName",
          "message",
          "causeCategory",
          "causeNote",
          "recipientEmail",
          "emailTiming",
          "emailDeliveryDate",
          "printFormat",
          "paperSize",
          "downloadFormat",
          "recipientPhone",
          "physicalDeliveryDate",
          "streetAddress",
          "district",
          "city",
          "postalCode",
        ];

    let valid = true;

    names.forEach((name) => {
      controlsByName(name)
        .forEach((control) => {
          if (
            !validateControl(
              control,
              true,
            )
          ) {
            valid = false;
          }
        });
    });

    return valid;
  };

  const validateAllSteps =
    () => {
      for (
        const stepId of STEP_IDS
      ) {
        if (
          !validateStep(stepId)
        ) {
          return {
            valid: false,
            stepId,
          };
        }
      }

      return {
        valid: true,
        stepId: null,
      };
    };

  const saveProgress = (
    stepId,
  ) => {
    try {
      localStorage.setItem(
        progressKey,
        stepId,
      );
    } catch {
      /* Storage is optional. */
    }
  };

  const revealThrough = (
    targetStepId,
    {
      scroll = false,
      persist = true,
    } = {},
  ) => {
    const targetIndex =
      STEP_IDS.indexOf(
        targetStepId,
      );

    if (targetIndex < 0) {
      return;
    }

    stepSections.forEach(
      (section, index) => {
        section.classList.toggle(
          "is-revealed",
          index <= targetIndex,
        );
      },
    );

    if (persist) {
      saveProgress(
        targetStepId,
      );
    }

    if (scroll) {
      document
        .getElementById(
          targetStepId,
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }
  };

  const serializeForm = () => {
    const data = {};

    allControls().forEach(
      (control) => {
        if (
          control.type ===
          "radio"
        ) {
          if (control.checked) {
            data[control.name] =
              control.value;
          }

          return;
        }

        data[control.name] =
          control.value;
      },
    );

    return data;
  };

  const saveDraft = () => {
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify(
          serializeForm(),
        ),
      );
    } catch {
      /* Storage is optional. */
    }
  };

  const restoreDraft = () => {
    if (
      reviewMode ||
      hasServerErrors
    ) {
      return;
    }

    try {
      const raw =
        localStorage.getItem(
          draftKey,
        );

      if (!raw) {
        return;
      }

      const data =
        JSON.parse(raw);

      Object.entries(data)
        .forEach(
          ([name, savedValue]) => {
            const controls =
              controlsByName(name);

            if (!controls.length) {
              return;
            }

            if (
              controls[0].type ===
              "radio"
            ) {
              controls.forEach(
                (control) => {
                  control.checked =
                    control.value ===
                    String(
                      savedValue,
                    );
                },
              );

              return;
            }

            controls[0].value =
              String(
                savedValue ?? "",
              );
          },
        );
    } catch {
      try {
        localStorage.removeItem(
          draftKey,
        );
      } catch {
        /* Ignore. */
      }
    }
  };

  const getSavedProgress =
    () => {
      try {
        const saved =
          localStorage.getItem(
            progressKey,
          );

        return STEP_IDS.includes(
          saved,
        )
          ? saved
          : "gift-type";
      } catch {
        return "gift-type";
      }
    };

  /*
   * Do not allow a saved progress value or URL hash such as #details
   * to bypass incomplete prerequisite steps.
   *
   * The returned step is the furthest step the user is allowed to see
   * from the data currently in the form.
   */
  const getMaximumAllowedStep =
    () => {
      if (!valueOf("giftType")) {
        return "gift-type";
      }

      if (!valueOf("deliveryType")) {
        return "delivery-type";
      }

      if (!valueOf("designType")) {
        return "design";
      }

      const quantity =
        Number(
          valueOf("quantity"),
        );

      const amount =
        Number(
          valueOf(
            "amountPerCard",
          ),
        );

      const amountIsValid =
        Number.isInteger(
          quantity,
        ) &&
        quantity >= 1 &&
        quantity <= 20 &&
        Number.isFinite(
          amount,
        ) &&
        amount >= 5 &&
        amount <= 10000;

      if (!amountIsValid) {
        return "amount";
      }

      return "details";
    };

  const clampRequestedStep =
    (requestedStep) => {
      const requestedIndex =
        STEP_IDS.indexOf(
          requestedStep,
        );

      const maximumStep =
        getMaximumAllowedStep();

      const maximumIndex =
        STEP_IDS.indexOf(
          maximumStep,
        );

      if (requestedIndex < 0) {
        return maximumStep;
      }

      return STEP_IDS[
        Math.min(
          requestedIndex,
          maximumIndex,
        )
      ];
    };

  const updateLivePreview =
    () => {
      const quantity =
        Number(
          valueOf("quantity"),
        ) || 0;

      const amount =
        Number(
          valueOf(
            "amountPerCard",
          ),
        ) || 0;

      const money =
        new Intl.NumberFormat(
          "en-US",
          {
            style: "currency",
            currency: "USD",
          },
        );

      const total =
        document.querySelector(
          "[data-giftcard-total]",
        );

      if (total) {
        total.textContent =
          money.format(
            quantity * amount,
          );
      }

      const previewAmount =
        document.querySelector(
          "[data-preview-amount]",
        );

      const previewRecipient =
        document.querySelector(
          "[data-preview-recipient]",
        );

      const previewSender =
        document.querySelector(
          "[data-preview-sender]",
        );

      const previewMessage =
        document.querySelector(
          "[data-preview-message]",
        );

      if (previewAmount) {
        previewAmount.textContent =
          money.format(amount);
      }

      if (previewRecipient) {
        const name =
          String(
            valueOf(
              "recipientName",
            ) || "",
          ).trim();

        previewRecipient.textContent =
          `For ${name || "Recipient"
          }`;
      }

      if (previewSender) {
        const name =
          String(
            valueOf(
              "senderName",
            ) || "",
          ).trim();

        previewSender.textContent =
          `From ${name || "Sender"
          }`;
      }

      if (previewMessage) {
        const message =
          String(
            valueOf("message") ||
            "",
          ).trim();

        previewMessage.textContent =
          message ||
          "Your message will appear here.";
      }
    };

  document
    .querySelectorAll(
      "[data-giftcard-next]",
    )
    .forEach((nextButton) => {
      nextButton.addEventListener(
        "click",
        (event) => {
          event.preventDefault();

          const currentSection =
            nextButton.closest(
              ".flow-section",
            );

          const targetId =
            nextButton
              .getAttribute("href")
              ?.slice(1);

          if (
            !currentSection ||
            !targetId
          ) {
            return;
          }

          if (
            !validateStep(
              currentSection.id,
            )
          ) {
            return;
          }

          revealThrough(
            targetId,
            {
              scroll: true,
            },
          );
        },
      );
    });

  document.addEventListener(
    "input",
    (event) => {
      const control =
        event.target;

      if (
        !control ||
        control.form !== form
      ) {
        return;
      }

      updateConditionalState();
      updateLivePreview();

      if (
        control.type !== "radio"
      ) {
        validateControl(
          control,
          true,
        );
      }

      saveDraft();
    },
  );

  document.addEventListener(
    "change",
    (event) => {
      const control =
        event.target;

      if (
        !control ||
        control.form !== form
      ) {
        return;
      }

      updateConditionalState();
      updateLivePreview();

      if (
        control.type === "radio"
      ) {
        if (
          control.name ===
          "giftType"
        ) {
          showStepError(
            "gift-type",
            "",
          );
        }

        if (
          control.name ===
          "deliveryType"
        ) {
          showStepError(
            "delivery-type",
            "",
          );
        }

        if (
          control.name ===
          "designType"
        ) {
          showStepError(
            "design",
            "",
          );
        }
      } else {
        validateControl(
          control,
          true,
        );
      }

      saveDraft();
    },
  );

  form.addEventListener(
    "submit",
    (event) => {
      const result =
        validateAllSteps();

      if (!result.valid) {
        event.preventDefault();

        revealThrough(
          result.stepId,
          {
            scroll: true,
          },
        );

        return;
      }

      saveDraft();
    },
  );

  document
    .querySelectorAll(
      "[data-giftcard-review-edit]",
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        (event) => {
          event.preventDefault();

          revealThrough(
            "details",
            {
              scroll: true,
            },
          );
        },
      );
    });

  /*
   * A real form reset must reset both the fields AND the wizard state.
   * Previously form.reset() did not remove .is-revealed, localStorage
   * progress, or the #details hash.
   */
  form.addEventListener(
    "reset",
    () => {
      window.requestAnimationFrame(
        () => {
          try {
            localStorage.removeItem(
              draftKey,
            );

            localStorage.removeItem(
              progressKey,
            );
          } catch {
            /* Storage is optional. */
          }

          allControls().forEach(
            (control) => {
              clearFieldError(
                control,
              );
            },
          );

          STEP_IDS.forEach(
            (stepId) => {
              showStepError(
                stepId,
                "",
              );
            },
          );

          document
            .getElementById(
              "review",
            )
            ?.classList
            .remove(
              "is-revealed",
            );

          /*
           * Remove #details/#amount/etc. so a reload cannot reopen
           * later steps after Reset.
           */
          const cleanUrl =
            `${window.location.pathname}`;

          window.history.replaceState(
            {},
            "",
            cleanUrl,
          );

          updateConditionalState();
          updateLivePreview();

          revealThrough(
            "gift-type",
            {
              scroll: true,
              persist: false,
            },
          );
        },
      );
    },
  );

  restoreDraft();
  updateConditionalState();
  updateLivePreview();

  /*
   * Server-side errors take priority over stored progress.
   */
  const firstServerError =
    document.querySelector(
      ".gift-card-form .form-error",
    );

  const serverErrorStep =
    firstServerError
      ?.closest(
        ".flow-section",
      )
      ?.id;

  if (
    serverErrorStep &&
    STEP_IDS.includes(
      serverErrorStep,
    )
  ) {
    revealThrough(
      serverErrorStep,
      {
        persist: false,
      },
    );
  } else if (reviewMode) {
    revealThrough(
      "details",
      {
        persist: false,
      },
    );

    window.requestAnimationFrame(
      () => {
        document
          .getElementById(
            "review",
          )
          ?.scrollIntoView({
            block: "start",
          });
      },
    );
  } else {
    const requestedHash =
      window.location.hash
        .slice(1);

    const savedStep =
      getSavedProgress();

    const requestedTarget =
      STEP_IDS.includes(
        requestedHash,
      )
        ? requestedHash
        : savedStep;

    /*
     * Hash/localStorage may REQUEST a later step, but prerequisite
     * validation decides how far the page may actually reveal.
     */
    const target =
      clampRequestedStep(
        requestedTarget,
      );

    revealThrough(
      target,
      {
        persist: false,
      },
    );

    /*
     * If #details was invalid because earlier information is missing,
     * remove the stale hash instead of continually reopening it.
     */
    if (
      requestedHash &&
      target !==
      requestedHash
    ) {
      window.history.replaceState(
        {},
        "",
        window.location.pathname,
      );
    }

    if (
      STEP_IDS.includes(
        requestedHash,
      ) &&
      target ===
      requestedHash
    ) {
      window.requestAnimationFrame(
        () => {
          document
            .getElementById(
              target,
            )
            ?.scrollIntoView({
              block: "start",
            });
        },
      );
    }
  }

  /* =========================================
     CUSTOM CAUSE DROPDOWN
     Mirrors the blog "Sort stories" dropdown so
     both selects look and behave the same way.
  ========================================= */

  const causeSelect =
    document.getElementById(
      "cause-category",
    );

  const causeControl =
    document.querySelector(
      "[data-cause-dropdown-control]",
    );

  const causeButton =
    document.querySelector(
      "[data-cause-dropdown-button]",
    );

  const causeLabel =
    document.querySelector(
      "[data-cause-dropdown-label]",
    );

  const causeMenu =
    document.querySelector(
      "[data-cause-dropdown-menu]",
    );

  const causeOptions = [
    ...document.querySelectorAll(
      "[data-cause-dropdown-option]",
    ),
  ];

  if (
    causeSelect &&
    causeControl &&
    causeButton &&
    causeLabel &&
    causeMenu &&
    causeOptions.length
  ) {
    const closeCauseDropdown = () => {
      causeControl.classList.remove(
        "is-open",
      );

      causeButton.setAttribute(
        "aria-expanded",
        "false",
      );

      causeMenu.hidden = true;
    };

    const openCauseDropdown = () => {
      causeControl.classList.add(
        "is-open",
      );

      causeButton.setAttribute(
        "aria-expanded",
        "true",
      );

      causeMenu.hidden = false;
    };

    const toggleCauseDropdown = () => {
      if (causeMenu.hidden) {
        openCauseDropdown();
      } else {
        closeCauseDropdown();
      }
    };

    const updateCauseDropdown = (
      value,
    ) => {
      const selectedOption =
        causeOptions.find(
          (option) =>
            option.dataset
              .causeDropdownOption ===
            value,
        );

      causeLabel.textContent =
        selectedOption
          ?.querySelector("span")
          ?.textContent
          .trim() ||
        "Select a cause";

      causeOptions.forEach(
        (option) => {
          const isSelected =
            option.dataset
              .causeDropdownOption ===
            value;

          option.classList.toggle(
            "is-selected",
            isSelected,
          );

          option.setAttribute(
            "aria-selected",
            String(isSelected),
          );
        },
      );
    };

    /*
     * Keep the button's error state in sync with the hidden
     * select, since shared validation sets aria-invalid on
     * the (now hidden) select rather than the visible button.
     */
    const syncCauseInvalidState = () => {
      if (
        causeSelect.getAttribute(
          "aria-invalid",
        ) === "true"
      ) {
        causeButton.setAttribute(
          "aria-invalid",
          "true",
        );
      } else {
        causeButton.removeAttribute(
          "aria-invalid",
        );
      }
    };

    new MutationObserver(
      syncCauseInvalidState,
    ).observe(causeSelect, {
      attributes: true,
      attributeFilter: [
        "aria-invalid",
      ],
    });

    causeButton.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();

        toggleCauseDropdown();
      },
    );

    causeOptions.forEach(
      (option) => {
        option.addEventListener(
          "click",
          (event) => {
            event.stopPropagation();

            const value =
              option.dataset
                .causeDropdownOption;

            if (!value) {
              return;
            }

            /*
             * Update the hidden real select so existing
             * validation/preview/draft logic keeps working
             * unchanged.
             */
            causeSelect.value =
              value;

            causeSelect.dispatchEvent(
              new Event(
                "change",
                {
                  bubbles: true,
                },
              ),
            );

            updateCauseDropdown(
              value,
            );

            closeCauseDropdown();

            causeButton.focus();
          },
        );
      },
    );

    document.addEventListener(
      "click",
      (event) => {
        if (
          !causeControl.contains(
            event.target,
          )
        ) {
          closeCauseDropdown();
        }
      },
    );

    document.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Escape" &&
          !causeMenu.hidden
        ) {
          closeCauseDropdown();

          causeButton.focus();
        }
      },
    );

    /*
     * A native form reset clears the hidden select back to
     * its default; mirror that onto the custom dropdown too.
     */
    form?.addEventListener(
      "reset",
      () => {
        window.requestAnimationFrame(
          () => {
            updateCauseDropdown(
              causeSelect.value,
            );

            syncCauseInvalidState();
          },
        );
      },
    );

    updateCauseDropdown(
      causeSelect.value,
    );

    syncCauseInvalidState();
  }
})();