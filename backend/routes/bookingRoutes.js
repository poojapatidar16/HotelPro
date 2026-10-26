
const express = require("express");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const { protect, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Create booking: logged-in users only
router.post("/", protect, async (req, res) => {
  try {
    const { name, email, checkIn, checkOut, roomType, guests } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !checkIn ||
      !checkOut ||
      !roomType ||
      guests === undefined
    ) {
      return res.status(400).json({
        message: "Please fill in all booking fields.",
      });
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const guestCount = Number(guests);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate
    ) {
      return res.status(400).json({
        message: "Check-out date must be after check-in date.",
      });
    }

    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 4) {
      return res.status(400).json({
        message: "Guests must be between 1 and 4.",
      });
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

// Update booking status: Admin only
router.patch("/:id/status", protect, allowRoles("Admin"), async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Confirmed", "Cancelled"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Confirmed or Cancelled.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking ID." });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    booking.status = status;
    await booking.save();

    res.json({
      message: `Booking ${status.toLowerCase()} successfully.`,
      booking,
    });
  } catch (error) {
    console.error("Booking status update error:", error.message);
    res.status(500).json({
      message: "Failed to update booking status.",
    });
  }
});

/* Customer: Modify an existing booking */
router.patch("/:id/modify", protect, async (req, res) => {
  try {
    const { checkIn, checkOut, guests, roomType } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking ID." });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (!["Pending", "Confirmed"].includes(booking.status)) {
      return res.status(400).json({
        message: "Only pending or confirmed bookings can be modified.",
      });
    }

    const newCheckIn = new Date(checkIn ?? booking.checkIn);
    const newCheckOut = new Date(checkOut ?? booking.checkOut);
    const newGuests = Number(guests ?? booking.guests);

    if (
      Number.isNaN(newCheckIn.getTime()) ||
      Number.isNaN(newCheckOut.getTime()) ||
      newCheckOut <= newCheckIn
    ) {
      return res.status(400).json({
        message: "Check-out date must be after check-in date.",
      });
    }

    if (!Number.isInteger(newGuests) || newGuests < 1 || newGuests > 4) {
      return res.status(400).json({
        message: "Guests must be between 1 and 4.",
      });
    }

    if (roomType !== undefined && !String(roomType).trim()) {
      return res.status(400).json({ message: "Please select a valid room type." });
    }

    booking.checkIn = newCheckIn;
    booking.checkOut = newCheckOut;
    booking.guests = newGuests;

    if (roomType !== undefined) {
      booking.roomType = String(roomType).trim();
    }

    await booking.save();

    res.json({
      message: "Booking updated successfully.",
      booking,
    });
  } catch (error) {
    console.error("Modify booking error:", error.message);
    res.status(500).json({ message: "Unable to modify booking." });
  }
});

/* Customer: Cancel their own booking */
router.patch("/:id/cancel", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking ID." });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (!["Pending", "Confirmed"].includes(booking.status)) {
      return res.status(400).json({
        message: "This booking can no longer be cancelled.",
      });
    }

    booking.status = "Cancelled";
    await booking.save();

    res.json({
      message: "Booking cancelled successfully.",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error.message);
    res.status(500).json({ message: "Unable to cancel booking." });
  }
});

/* Admin or Staff: Check in a guest */
router.patch(
  "/:id/check-in",
  protect,
  allowRoles("Admin", "Staff"),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid booking ID." });
      }

      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      if (booking.status !== "Confirmed") {
        return res.status(400).json({
          message: "Only confirmed bookings can be checked in.",
        });
      }

      booking.status = "Checked In";
      await booking.save();

      res.json({ message: "Guest checked in successfully.", booking });
    } catch (error) {
      console.error("Check-in error:", error.message);
      res.status(500).json({ message: "Unable to check in guest." });
    }
  }
);

/* Admin or Staff: Check out a guest */
router.patch(
  "/:id/check-out",
  protect,
  allowRoles("Admin", "Staff"),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid booking ID." });
      }

      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      if (booking.status !== "Checked In") {
        return res.status(400).json({
          message: "Only checked-in guests can be checked out.",
        });
      }

      booking.status = "Checked Out";
      await booking.save();

      res.json({ message: "Guest checked out successfully.", booking });
    } catch (error) {
      console.error("Check-out error:", error.message);
      res.status(500).json({ message: "Unable to check out guest." });
    }
  }
);

module.exports = router;
