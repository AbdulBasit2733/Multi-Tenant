const mongoose = require("mongoose");

const SuperAdminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  role: {
    type: String,
    default: "SUPERADMIN",
  },
  domain: {
    type: String,
    unique: true,
  },
  password: String,
});

const SuperAdminModel = mongoose.model("Superadmin", SuperAdminSchema);

module.exports = SuperAdminModel;
