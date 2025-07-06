const mongoose = require("mongoose");

const SuperAdminSchema = new mongoose.Schema({
  name: {
    type:String,
    required:true
  },
  email: { type: String, unique: true, required:true },
  role: {
    type: String,
    default: "SUPERADMIN",
    required:true
  },
  password: {
    type:String,
    required:true
  },
});

const SuperAdminModel = mongoose.model("Superadmin", SuperAdminSchema);

module.exports = SuperAdminModel;
