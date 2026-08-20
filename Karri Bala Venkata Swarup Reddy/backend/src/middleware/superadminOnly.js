module.exports = function superadminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const isSuperAdmin =
    req.user.role === 'superadmin' ||
    req.user.email === 'swarupchiru@gmail.com' ||
    (process.env.ADMIN_EMAIL && req.user.email === process.env.ADMIN_EMAIL);

  if (!isSuperAdmin) {
    return res.status(403).json({ message: 'Super Admin privileges required to access Admin Management.' });
  }

  next();
};
