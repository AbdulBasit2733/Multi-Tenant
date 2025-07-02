const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    permissions: [
      {
        module: {
          type: String, // e.g., "vendor", "customer", "employee"
          required: true,
        },
        actions: [
          {
            type: String, // e.g., "create", "view", "update", "delete"
            required: true,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const RoleModel = mongoose.model("Role", RoleSchema);
module.exports = RoleModel;
