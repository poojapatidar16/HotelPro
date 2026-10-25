
const express = require("express");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const { protect, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Create booking: logged-in users only
router.post("/", protect, async (req, res) => {
  try {
    const { name, email, checkIn, checkOut, roomType, guests } = req.body;

    if (!name?.trim() || !email?.trim() || !checkIn || !checkOut || !roomType || guests === undefined) {
      return res.status(400).json({ message: "Please fill in all booking fields." });
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const guestCount = Number(guests);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate
    ) {
      return res.status(400).json({ message: "Check-out date must be after check-in date." });
    }

    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 4) {
      return res.status(400).json({ message: "Guests must be between 1 and 4." });
    }

    const booking = await Booking.create({
      user: req.user._id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      checkIn: startDate,
      checkOut: endDate,
      roomType,
      guests: guestCount,
    });

    res.status(201).json({
      message: "Booking request saved successfully!",
      booking,
    });
  } catch (error) {
    console.error("Booking error:", error.message);
    res.status(500).json({ message: "Failed to save booking." });
  }
});

// Logged-in user's bookings
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your bookings." });
  }
});

// All bookings: Admin and Staff only
router.get("/", protect, allowRoles("Admin", "Staff"), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings." });
  }
});

module.exports = router;
