const express = require("express");
const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get payment history for the logged-in user
router.get("/my", protect, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("booking")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error("Fetch payments error:", error.message);
    res.status(500).json({ message: "Unable to fetch payment history." });
  }
});

// Create a pending payment record (no money is charged)
router.post("/create", protect, async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    const numericAmount = Number(amount);

    if (!bookingId || !mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({ message: "Please select a valid booking." });
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Enter a valid payment amount." });
    }

    // Ensure the booking belongs to the logged-in user
    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found in your account.",
      });
    }

    const payment = await Payment.create({
      user: req.user._id,
      booking: booking._id,
      amount: numericAmount,
      status: "Pending",
    });

    res.status(201).json({
      message: "Pending payment record created. No money was charged.",
      payment,
    });
  } catch (error) {
    console.error("Create payment error:", error.message);
    res.status(500).json({ message: "Unable to create payment record." });
  }
});

module.exports = router;
