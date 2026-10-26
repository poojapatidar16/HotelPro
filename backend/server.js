
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Import routes
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const staffRoutes = require("./routes/staffRoutes");

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/staff", staffRoutes);

// Temporary diagnostic route:
// Check whether requests reach server.js
app.patch("/api/bookings/:id/check-in", (req, res) => {
  res.json({
    message: "Temporary server.js check-in route reached",
    bookingId: req.params.id,
  });
});

// Temporary diagnostic route:
// Show registered booking routes
app.get("/api/bookings/debug-routes", (req, res) => {
  res.json(
    bookingRoutes.stack
      .filter((layer) => layer.route)
      .map((layer) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }))
  );
});

// Test routes
app.get("/api/bookings/test", (req, res) => {
  res.json({ message: "Booking route is working!" });
});

app.get("/test-booking", (req, res) => {
  res.json({ message: "Correct server.js is running!" });
});

app.get("/", (req, res) => {
  res.send("HotelPro Backend is running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    message: "HotelPro API is working",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Not connected",
  });
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing in .env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(
        `HotelPro backend running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
}

startServer();
