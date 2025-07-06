const AdminModel = require("../Models/model.admin");
const SuperAdminModel = require("../Models/model.superadmin");
const EmployeeModel = require("../Models/model.employee");

const models = {
  SUPERADMIN: SuperAdminModel,
  ADMIN: AdminModel,
  EMPLOYEE: EmployeeModel,
};

const CheckAuth = async (req, res, next) => {
  try {
    const sessionUser = req.session?.user;

    if (!sessionUser || !sessionUser.role || !sessionUser._id) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const model = models[sessionUser.role];

    if (!model) {
      return res.status(403).json({ success: false, message: "Invalid role" });
    }

    const user = await model
      .findOne({
        _id: sessionUser._id,
      })
      .populate("role");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    req.user = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error("Session auth error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = CheckAuth;
