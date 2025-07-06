module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (
      !allowedRoles.includes(
        typeof req.user.role === "string" ? req.user.role : req.user?.role?.name
      )
    ) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
