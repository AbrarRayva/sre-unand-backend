const checkPermission = (requiredSlug) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Grant if ADMIN role
      const hasAdminRole = Array.isArray(req.user.roles) && req.user.roles.some((r) => r.name === 'ADMIN');
      if (hasAdminRole) {
        return next();
      }

      // Collect permission slugs from roles
      const permissionSlugs = new Set();
      if (Array.isArray(req.user.roles)) {
        req.user.roles.forEach((role) => {
          if (Array.isArray(role.permissions)) {
            role.permissions.forEach((perm) => {
              if (perm && perm.slug) permissionSlugs.add(perm.slug);
            });
          }
        });
      }

      if (permissionSlugs.has(requiredSlug)) {
        return next();
      }

      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Permission check error', error: err.message });
    }
  };
};

module.exports = { checkPermission };