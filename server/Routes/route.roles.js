const authorize = require("../Middleware/authorize");
const CheckAuth = require("../Middleware/checkAuth");
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

router.get("/mine", CheckAuth, authorize("ADMIN"), async (req, res) => {
  try {
    const roles = await Role.find({ adminId: req.user._id });
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching roles", error });
  }
});

module.exports = router;
