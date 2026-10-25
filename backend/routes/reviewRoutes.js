
const express = require("express");
const mongoose = require("mongoose");

const Review = require("../models/Review");
const Booking = require("../models/Booking");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// GET: Show all reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Fetch reviews error:", error.message);
    res.status(500).json({
      message: "Unable to fetch reviews.",
    });
  }
});

// POST: Save a review for the logged-in user's own booking
router.post("/", protect, async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({
        message: "Please select a valid booking.",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5.",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found in your account.",
      });
    }

    const existingReview = await Review.findOne({
      booking: booking._id,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(409).json({
        message: "You have already reviewed this booking.",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      booking: booking._id,
      rating: numericRating,
      comment: typeof comment === "string" ? comment.trim() : "",
    });

    const savedReview = await Review.findById(review._id)
      .populate("user", "name");

    res.status(201).json({
      message: "Review submitted successfully!",
      review: savedReview,
    });
  } catch (error) {
    console.error("Create review error:", error.message);

    res.status(500).json({
      message: "Unable to save review.",
    });
  }
});

module.exports = router;
