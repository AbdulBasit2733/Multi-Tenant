const express = require("express");
const router = express.Router();
const CheckAuth = require("../Middleware/checkAuth");
const AdminModel = require("../Models/model.admin");
const SuperAdminModel = require("../Models/model.superadmin");
const EmployeeModel = require("../Models/model.employee");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authorize = require("../Middleware/authorize");
const RoleModel = require("../Models/model.role");

const models = {
  ADMIN: AdminModel,
};

router.post("/superadmin-signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await SuperAdminModel.findOne();
    if (superAdmin) {
      return res.status(404).json({ message: "Cannot Register" });
    }

    await SuperAdminModel.create({
      name,
      email,
      password: hashedPassword,
      role: "SUPERADMIN",
    });

    res.status(201).json({
      success: true,
      message: `Superadmin registered successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error });
  }
});
router.post("/superadmin-signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const isSuperAdmin = await SuperAdminModel.findOne({ email });
    if (!isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: "Email or password is inccorect",
      });
    }
    const isValidPassword = await bcrypt.compare(
      password,
      isSuperAdmin.password
    );

    if (!isValidPassword) {
      return res
        .status(303)
        .json({ message: "Email or password is incorrect" });
    }

    const token = jwt.sign(
      {
        _id: isSuperAdmin._id,
        role: isSuperAdmin.role,
      },
      process.env.SUPERADMIN_JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: `Superadmin registered successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error });
  }
});

router.post("/admin-signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const isSuperAdmin = await SuperAdminModel.findOne();
    if (!isSuperAdmin) {
      return res.status(300).json({
        success: false,
        message: "Cannot Register",
      });
    }

    const isAdmin = await AdminModel.findOne({
      email,
      superAdminId: isSuperAdmin._id,
    });
    if (isAdmin) {
      return res.status(200).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await AdminModel.create({
      name,
      email,
      password: hashedPassword,
      role: role || "ADMIN",
      superAdminId: isSuperAdmin._id,
    });

    res.status(201).json({
      success: true,
      message: `ADMIN registered successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error });
  }
});

router.post("/admin-signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const isAdmin = await AdminModel.findOne({ email });

    if (!isAdmin) {
      return res.status(401).json({
        success: false,
        message: "Email or password is incorrect",
      });
    }

    const isValidPassword = await bcrypt.compare(password, isAdmin.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Email or password is incorrect",
      });
    }

    // const token = jwt.sign(
    //   {
    //     _id: isAdmin._id,
    //     role: isAdmin.role,
    //   },
    //   process.env.ADMIN_JWT_SECRET,
    //   { expiresIn: "1d" }
    // );

    req.session.user = {
      _id: isAdmin._id,
      role: isAdmin.role,
    };

    res.status(200).json({
      success: true,
      message: "Signin successful",
      data: {
        _id: isAdmin._id,
        name: isAdmin.name,
        email: isAdmin.email,
        role: isAdmin.role,
      },
    });
  } catch (error) {
    console.error("Admin signin error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Internal server error.",
    });
  }
});

router.post(
  "/create-employee",
  CheckAuth,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const adminId = req.user._id;
      const { name, email, roleId, password } = req.body;
      const isRole = await RoleModel.findOne({ _id: roleId });
      if (!isRole) {
        return res.status(400).json({
          success: false,
          message: "Role is not valid",
        });
      }
      const isEmployee = await EmployeeModel.findOne({
        adminId: adminId,
        email,
        role: roleId,
      });

      if (isEmployee) {
        return res.status(400).json({
          success: false,
          message: "Employee is already present",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newEmployee = await EmployeeModel.create({
        adminId,
        name,
        email,
        role: roleId,
        password: hashedPassword,
      });
      res.status(200).json({
        success: true,
        message: "Employee Created Successfully",
        data: newEmployee,
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

router.get(
  "/all-employees",
  CheckAuth,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const adminId = req.user._id;
      const employeesList = await EmployeeModel.find({
        adminId: adminId,
      });
      if (employeesList.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No Employees Found",
        });
      }
      res.status(200).json({
        success: true,
        data: employeesList,
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

router.get("/check-auth", CheckAuth, (req, res) => {
  const user = req.user;
  console.log(user);

  res.status(200).json({
    success: true,
    message: "Authenticated",
    data: user,
  });
});

module.exports = router;
