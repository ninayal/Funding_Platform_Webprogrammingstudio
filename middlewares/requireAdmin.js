const requireAdmin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/shared/login");
  }

  if (req.session.user.role !== "admin") {
    return res.status(403).send("403 - Forbidden");
  }

  next();
};

module.exports = requireAdmin;
