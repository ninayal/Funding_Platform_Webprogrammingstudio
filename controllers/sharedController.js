const getLoginPage = (req, res) => {
  res.render("shared/login");
};

const getRegisterPage = (req, res) => {
  res.render("shared/register");
};

const getForgotPasswordPage = (req, res) => {
  res.render("shared/forgot_password");
};

const getProfilePage = (req, res) => {
  res.render("shared/profile");
};

const getAdminPage = (req, res) => {
  res.render("shared/admin/admin");
};

const getSitemapPage = (req, res) => {
  res.render("shared/sitemap");
};

module.exports = {
  getLoginPage,
  getRegisterPage,
  getForgotPasswordPage,
  getProfilePage,
  getAdminPage,
  getSitemapPage,
};
