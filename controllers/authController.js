"use strict";

const userModel = require(
  "../models/userModel"
);

const {
  validateLogin,
  validateRegistration
} = require(
  "../validators/authValidators"
);

const {
  safeRedirectPath
} = require(
  "../middlewares/authMiddleware"
);

const {
  buildLoginView
} = require(
  "../utils/loginViewModel"
);

const removeSensitiveValues = (
  values = {}
) => ({
  firstname:
    values.firstname || "",

  lastname:
    values.lastname || "",

  username:
    values.username || "",

  email:
    values.email || "",

  gender:
    values.gender || "",

  description:
    values.description || "",

  terms:
    values.terms || ""
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
    redirect = "/"
  } = {}
) =>
  res.status(status).render(
    "shared/login",
    buildLoginView({
      values,
      errors,
      redirect
    })
  );

const getLoginPage = (
  req,
  res
) => {
  const redirectTarget =
    getRedirectTarget(req);

  if (req.currentUser) {
    return res.redirect(
      redirectTarget
    );
  }

  return renderLogin(
    res,
    {
      redirect:
        redirectTarget
    }
  );
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
        getRedirectTarget(req)
    }
  );
};

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
        username:
          user.username,
        email: user.email,
        initials:
          user.initials,
        role: user.role
      };

      return req.session.save(
        (saveError) => {
          if (saveError) {
            return next(
              saveError
            );
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

const login = (
  req,
  res,
  next
) => {
  try {
    const {
      values,
      errors
    } = validateLogin(
      req.body
    );

    const redirectTarget =
      getRedirectTarget(req);

    if (
      Object.keys(errors)
        .length > 0
    ) {
      return renderLogin(
        res,
        {
          status: 422,
          values: {
            email:
              values.email
          },
          errors,
          redirect:
            redirectTarget
        }
      );
    }

    const result =
      userModel.authenticate(
        values.email,
        values.password
      );

    if (!result.ok) {
      return renderLogin(
        res,
        {
          status: 401,
          values: {
            email:
              values.email
          },
          errors: {
            form:
              "The email or password is incorrect."
          },
          redirect:
            redirectTarget
        }
      );
    }

    return establishSession(
      req,
      res,
      next,
      result.user,
      redirectTarget
    );
  } catch (error) {
    return next(error);
  }
};

const register = (
  req,
  res,
  next
) => {
  try {
    const {
      values,
      errors
    } = validateRegistration(
      req.body
    );

    const redirectTarget =
      getRedirectTarget(req);

    if (
      Object.keys(errors)
        .length > 0
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
            redirect:
              redirectTarget
          }
        );
    }

    const result =
      userModel.createUser(
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
            redirect:
              redirectTarget
          }
        );
    }

    return establishSession(
      req,
      res,
      next,
      result.user,
      redirectTarget
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
  logout
};
