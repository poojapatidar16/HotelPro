
const express = require("express");
const mongoose = require("mongoose");
const Room = require("../models/Room");
const {
  protect,
  allowRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

// Get one room
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch room" });
  }
});

// Add a new room - Admin only
router.post("/", protect, allowRoles("Admin"), async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({
      message: "Could not create room",
      error: error.message,
    });
  }
});

// Update a room - Admin only
router.put("/:id", protect, allowRoles("Admin"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({
      message: "Room updated successfully",
      room,
    });
  } catch (error) {
    res.status(400).json({
      message: "Could not update room",
      error: error.message,
    });
  }
});

// Delete a room - Admin only
router.delete("/:id", protect, allowRoles("Admin"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({
      message: "Room deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete room" });
  }
});

module.exports = router;
