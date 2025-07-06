const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required:true
  },
  name: String,
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required:true
  },
  email: { type: String, unique: true },
  password: String,
});

const EmployeeModel = mongoose.model("Employee", EmployeeSchema);
module.exports = EmployeeModel
