const userModel = require("../models/userModel");
const passwordResetModel = require("../models/passwordResetModel");
const { generateTempPassword, hashPassword, verifyPassword } = require("../utils/passwordUtils");

const getLoginPage = (req, res) => {
  res.render("shared/login", { error: null });
};

const postLogin = (req, res) => {
  const { email, password } = req.body;
  const user = email ? userModel.findUserByEmail(email) : null;

  if (!user || !verifyPassword(password || "", user.passwordHash)) {
    return res.render("shared/login", { error: "Incorrect email or password." });
  }

  if (user.status === "blocked") {
    return res.render("shared/login", { error: "This account has been blocked. Please contact support." });
  }

  req.session.user = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  };

  if (user.requiresPasswordChange) {
    return res.redirect("/shared/reset-password");
  }

  return res.redirect(user.role === "admin" ? "/shared/admin" : "/shared/profile");
};

const postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/shared/login");
  });
};

const getRegisterPage = (req, res) => {
  res.render("shared/register");
};

const getForgotPasswordPage = (req, res) => {
  res.render("shared/forgot_password", { submitted: false });
};

const postForgotPassword = (req, res) => {
  const { email } = req.body;
  const trimmedEmail = (email || "").trim();

  if (trimmedEmail) {
    const user = userModel.findUserByEmail(trimmedEmail);
    if (user) {
      passwordResetModel.createRequest(user.email);
    }
  }

  res.render("shared/forgot_password", { submitted: true });
};

const getResetPasswordPage = (req, res) => {
  if (!req.session.user) {
    return res.redirect("/shared/login");
  }
  res.render("shared/reset_password", { error: null });
};

const postResetPassword = (req, res) => {
  if (!req.session.user) {
    return res.redirect("/shared/login");
  }

  const { newPassword, confirmNewPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.render("shared/reset_password", { error: "Password must be at least 8 characters long." });
  }

  if (newPassword !== confirmNewPassword) {
    return res.render("shared/reset_password", { error: "Passwords do not match." });
  }

  const updatedUser = userModel.updateUser(req.session.user.id, {
    passwordHash: hashPassword(newPassword),
    requiresPasswordChange: false,
  });

  if (!updatedUser) {
    return res.redirect("/shared/login");
  }

  res.redirect(updatedUser.role === "admin" ? "/shared/admin" : "/shared/profile");
};

const getProfilePage = (req, res) => {
  res.render("shared/profile");
};

const getAdminPage = (req, res) => {
  res.render("shared/admin/admin", {
    pendingRequests: passwordResetModel.getPendingRequests(),
    resolvedRequests: passwordResetModel.getResolvedRequests(),
  });
};

const postResolvePasswordReset = (req, res) => {
  const { requestId } = req.params;
  const request = passwordResetModel.findRequestById(requestId);

  if (request && request.status === "pending") {
    const user = userModel.findUserByEmail(request.email);

    if (user) {
      const tempPassword = generateTempPassword();
      userModel.updateUser(user.id, {
        passwordHash: hashPassword(tempPassword),
        requiresPasswordChange: true,
      });
      passwordResetModel.resolveRequest(requestId, tempPassword);
    } else {
      passwordResetModel.rejectRequest(requestId);
    }
  }

  res.redirect("/shared/admin");
};

const postRejectPasswordReset = (req, res) => {
  const { requestId } = req.params;
  passwordResetModel.rejectRequest(requestId);
  res.redirect("/shared/admin");
};

const getSitemapPage = (req, res) => {
  res.render("shared/sitemap");
};

module.exports = {
  getLoginPage,
  postLogin,
  postLogout,
  getRegisterPage,
  getForgotPasswordPage,
  postForgotPassword,
  getResetPasswordPage,
  postResetPassword,
  getProfilePage,
  getAdminPage,
  postResolvePasswordReset,
  postRejectPasswordReset,
  getSitemapPage,
};
