/**
 * Admin authorization middleware
 * Checks if authenticated user has role === 'admin'
 */
export const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied: Administrator privileges required'
  });
};

export const adminOnly = authorizeAdmin;
export const isAdmin = authorizeAdmin;
export default authorizeAdmin;
