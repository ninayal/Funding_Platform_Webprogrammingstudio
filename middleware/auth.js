function requireLogin(req, res, next) {
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }
    next();
  }
  
  function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).render('shared/403', { title: 'Access Denied' });
    }
    next();
  }
  
  function requireUnlocked(req, res, next) {
    if (req.session.user && req.session.user.isLocked) {
      req.session.destroy();
      return res.redirect('/auth/login');
    }
    next();
  }
  
  module.exports = { requireLogin, requireAdmin, requireUnlocked };