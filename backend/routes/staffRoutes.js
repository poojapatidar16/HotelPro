
const express = require("express");
const Staff = require("../models/Staff");
const User = require("../models/User");
const { protect, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin: View all staff
router.get("/", protect, allowRoles("Admin"), async (req, res) => {
  try {
    const staff = await Staff.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch staff." });
  }
});

// Admin: Create staff profile for an existing user
router.post("/", protect, allowRoles("Admin"), async (req, res) => {
  try {
    const { userId, employeeId, department, designation, phone, shift } =
      req.body;

    if (!userId || !employeeId || !department || !designation) {
      return res.status(400).json({
        message: "User ID, employee ID, department and designation are required."
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const staff = await Staff.create({
      user: user._id,
      employeeId,
      department,
      designation,
      phone,
      shift
    });

    // Only an Admin can promote an account to Staff.
    user.role = "Staff";
    await user.save();

    res.status(201).json({
      message: "Staff profile created successfully.",
      staff
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This user or employee ID already has a staff record."
      });
    }

    res.status(500).json({ message: "Failed to create staff profile." });
  }
});

// Admin: Update staff status
router.patch("/:id/status", protect, allowRoles("Admin"), async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Active", "Inactive", "On Leave"].includes(status)) {
      return res.status(400).json({ message: "Invalid staff status." });
    }

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!staff) {
      return res.status(404).json({ message: "Staff record not found." });
    }

    res.json({
      message: "Staff status updated.",
      staff
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update staff status." });
  }
});

module.exports = router;
