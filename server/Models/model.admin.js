const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  role:{
    type:String,
    default:"ADMIN"
  },
  password: String,
  superAdminId: { type: mongoose.Schema.Types.ObjectId, ref: "SuperAdmin" },
});
const AdminModel = mongoose.model("Admin", AdminSchema);
module.exports = AdminModel;
