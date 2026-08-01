module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.session.user) {
      return next();
    }
    req.flash('error', 'Please log in to view that resource');
    res.redirect('/auth/login');
  },
  ensureAdmin: function (req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
      return next();
    }
    req.flash('error', 'Access denied. Admin only.');
    res.redirect('/');
  }
};
