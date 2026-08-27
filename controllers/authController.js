"use strict";

const userModel = require("../models/userModel");

const {
  validateLogin,
  validateRegistration,
} = require("../validators/authValidators");

const {
  safeRedirectPath,
} = require("../middlewares/authMiddleware");

const {
  buildLoginView,
} = require("../utils/loginViewModel");

const removeSensitiveValues = (
  values = {}
) => ({
  firstname: values.firstname || "",
  lastname: values.lastname || "",
  username: values.username || "",
  email: values.email || "",
  gender: values.gender || "",
  description: values.description || "",
  terms: values.terms || "",
});

const getRedirectTarget = (
  req,
  fallback = "/"
) =>
  safeRedirectPath(
    req.body?.redirect ||
    req.query?.redirect,
    fallback
  );

const renderLogin = (
  res,
  {
    status = 200,
    values = {},
    errors = {},
    redirect = "/",
  } = {}
) =>
  res.status(status).render(
    "shared/login",
    buildLoginView({
      values,
      errors,
      redirect,
    })
  );

const establishSession = (
  req,
  res,
  next,
  user,
  redirectTarget
) => {
  req.session.regenerate(
    (regenerateError) => {
      if (regenerateError) {
        return next(
          regenerateError
        );
      }

      req.session.user = {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        initials: user.initials,
        role: user.role,
        avatar: user.avatar,
      };

      return req.session.save(
        (saveError) => {
          if (saveError) {
            return next(saveError);
          }

          return res.redirect(
            user.requiresPasswordChange
              ? "/shared/reset-password"
              : redirectTarget
          );
        }
      );
    }
  );
};

const getLoginPage = (
  req,
  res
) => {
  const redirect =
    getRedirectTarget(req);

  if (req.currentUser) {
    return res.redirect(
      redirect
    );
  }

  const errors =
    req.query.blocked === "1"
      ? {
        form:
          "This account has been blocked.",
      }
      : {};

  return renderLogin(res, {
    redirect,
    errors,
  });
};

const getRegisterPage = (
  req,
  res
) => {
  if (req.currentUser) {
    return res.redirect("/");
  }

  return res.render(
    "shared/register",
    {
      values: {},
      errors: {},
      redirect:
        getRedirectTarget(req),
    }
  );
};

const login = async (
  req,
  res,
  next
) => {
  try {
    const {
      values,
      errors,
    } = validateLogin(
      req.body
    );

    const redirect =
      getRedirectTarget(req);

    if (
      Object.keys(errors)
        .length
    ) {
      return renderLogin(
        res,
        {
          status: 422,
          values: {
            email:
              values.email,
          },
          errors,
          redirect,
        }
      );
    }

    const result =
      await userModel.authenticate(
        values.email,
        values.password
      );

    if (!result.ok) {
      const messages = {
        deactivated:
          "This account has been deactivated.",
        blocked:
          "This account has been blocked.",
      };

      return renderLogin(
        res,
        {
          status: 401,
          values: {
            email:
              values.email,
          },
          errors: {
            form:
              messages[
              result.reason
              ] ||
              "The email or password is incorrect.",
          },
          redirect,
        }
      );
    }

    return establishSession(
      req,
      res,
      next,
      result.user,
      redirect
    );
  } catch (error) {
    return next(error);
  }
};

const register = async (
  req,
  res,
  next
) => {
  try {
    const {
      values,
      errors,
    } =
      validateRegistration(
        req.body
      );

    const redirect =
      getRedirectTarget(req);

    if (
      Object.keys(errors)
        .length
    ) {
      return res
        .status(422)
        .render(
          "shared/register",
          {
            values:
              removeSensitiveValues(
                values
              ),
            errors,
            redirect,
          }
        );
    }

    const result =
      await userModel.createUser(
        values
      );

    if (!result.ok) {
      const modelErrors = {};

      if (
        result.reason ===
        "email-exists"
      ) {
        modelErrors.email =
          "An account already uses this email.";
      }

      if (
        result.reason ===
        "username-exists"
      ) {
        modelErrors.username =
          "This username is already taken.";
      }

      return res
        .status(409)
        .render(
          "shared/register",
          {
            values:
              removeSensitiveValues(
                values
              ),
            errors:
              modelErrors,
            redirect,
          }
        );
    }

    return establishSession(
      req,
      res,
      next,
      result.user,
      redirect
    );
  } catch (error) {
    return next(error);
  }
};

const logout = (
  req,
  res,
  next
) => {
  req.session.destroy(
    (error) => {
      if (error) {
        return next(error);
      }

      res.clearCookie(
        "langco.sid"
      );

      return res.redirect("/");
    }
  );
};

module.exports = {
  getLoginPage,
  getRegisterPage,
  login,
  register,
  logout,
};