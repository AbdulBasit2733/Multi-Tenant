const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  superAdminId: { type: mongoose.Schema.Types.ObjectId, ref: "SuperAdmin" },
  name: String,
  email: { type: String, unique: true },
  role: {
    type: String,
    default: "ADMIN",
  },
  password: String,
});
const AdminModel = mongoose.model("Admin", AdminSchema);
module.exports = AdminModel;
