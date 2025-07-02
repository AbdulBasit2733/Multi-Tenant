const express = require("express");
const router = express.Router();
const CheckAuth = require("../Middleware/checkAuth");
const AdminModel = require("../Models/model.admin");
const SuperAdminModel = require("../Models/model.superadmin");
const EmployeeModel = require("../Models/model.employee");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authorize = require("../Middleware/authorize");

const models = {
  ADMIN: AdminModel,
};

router.post("/superadmin-signup", async (req, res) => {
  console.log(req.body);

  const { name, domain, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await SuperAdminModel.findOne({ email });
    if (superAdmin) {
      return res.status(404).json({ message: "SuperAdmin Already Exists" });
    }

    const newUser = await SuperAdminModel.create({
      name,
      email,
      domain,
      password: hashedPassword,
      role: "SUPERADMIN",
    });

    res.status(201).json({
      success: true,
      message: `Superadmin registered successfully`,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role },
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error });
  }
});

router.post("/signup", async (req, res) => {
  const { name, email, password, role, adminId } = req.body;
  console.log(req.headers);

  // const domain = req.headers.origin || req.headers.host;
  const domain = "zaheer.icrm.com";
  console.log("Domain", domain);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await SuperAdminModel.findOne({ domain });
    if (!superAdmin) {
      return res
        .status(404)
        .json({ message: "SuperAdmin not found for domain" });
    }

    const Model = models[role];
    if (!Model || role === "SUPERADMIN") {
      return res.status(400).json({ message: "Invalid or restricted role" });
    }

    const newUser = await Model.create({
      name,
      email,
      password: hashedPassword,
      ...(role === "ADMIN" && { superAdminId: superAdmin._id }),
    });

    res.status(201).json({
      success: true,
      message: `${role} registered successfully`,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role },
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    for (const role in models) {
      console.log(role);
      const Model = models[role];
      const user = await Model.findOne({ email });

      if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });

        return res
          .cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
          })
          .json({
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role,
            },
          });
      }
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
});

router.post(
  "/create-employee",
  CheckAuth,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const adminId = req.user;
      const { name, email, roleId, password } = req.body;
      const isEmployee = await EmployeeModel.findOne({
        adminId: adminId,
        email,
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
        role:roleId,
        password:hashedPassword
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

router.get("/me", CheckAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
