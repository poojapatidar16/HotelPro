
const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    department: {
      type: String,
      enum: [
        "Reception",
        "Housekeeping",
        "Maintenance",
        "Management",
        "Food Service"
      ],
      required: true
    },
    designation: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      default: ""
    },
    shift: {
      type: String,
      enum: ["Morning", "Evening", "Night"],
      default: "Morning"
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave"],
      default: "Active"
    },
    joiningDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Staff", staffSchema);
