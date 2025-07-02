const jwt = require("jsonwebtoken");
const AdminModel = require("../Models/model.admin");
const SuperAdminModel = require("../Models/model.superadmin");
const EmployeeModel = require("../Models/model.employee");

const models = {
  SUPERADMIN: SuperAdminModel,
  ADMIN: AdminModel,
  EMPLOYEE: EmployeeModel,
};

const CheckAuth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const model = models[decoded.role];
    if (!model) return res.status(403).json({ message: "Invalid role" });

    const user = await model.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = { ...user.toObject(), role: decoded.role };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = CheckAuth
