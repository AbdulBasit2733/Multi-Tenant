const authorize = require("../Middleware/authorize");
const CheckAuth = require("../Middleware/checkAuth");
const EmployeeModel = require("../Models/model.employee");
const RoleModel = require("../Models/model.role");
const express = require("express");
const router = express.Router();

router.post("/create", CheckAuth, authorize("ADMIN"), async (req, res) => {
  const adminId = req.user;
  const { name, permissions } = req.body;
  try {
    const role = await RoleModel.create({
      adminId: adminId,
      name,
      permissions,
    });
    res.status(201).json({ success: true, data: role });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error creating role", error });
  }
});

router.get("/all-roles", CheckAuth, authorize("ADMIN"), async (req, res) => {
  try {
    const adminId = req.user._id;
    const roles = await RoleModel.find({ adminId: adminId });
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching roles", error });
  }
});

router.post(
  "/user-assign-role",
  CheckAuth,
  authorize("ADMIN"),
  async (req, res) => {
    const adminId = req.user._id;
    try {
      const { userId, roleId } = req.body;
      const isRole = await RoleModel.findOne({
        adminId: adminId,
        _id: roleId,
      });
      if (!isRole) {
        return res.status(400).json({
          success: false,
          message: "Role Not Found",
        });
      }
      const isEmployeeHasRole = await EmployeeModel.findOne({
        adminId: adminId,
        _id: userId,
        role: roleId,
      });

      await EmployeeModel.findOneAndUpdate(
        {
          adminId: adminId,
          _id: isEmployeeHasRole._id,
        },
        {
          role: roleId,
        }
      );
      res.status(200).json({
        success: true,
        message: "Assign Successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

module.exports = router;
