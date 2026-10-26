
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Name, email and password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered. Please login."
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password
    });

    res.status(201).json({
      message: "Account created successfully!",
      token: createToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Signup failed." });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    res.json({
      message: "Login successful!",
      token: createToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login failed." });
  }
});

// DEVELOPMENT ONLY: Reset password for an existing account.
// Do not expose this unauthenticated route in production.
if (process.env.NODE_ENV !== "production") {
  router.post("/dev-reset-password", async (req, res) => {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword || newPassword.length < 8) {
        return res.status(400).json({
          message: "Email and a password of at least 8 characters are required."
        });
      }

      const user = await User.findOne({
        email: email.trim().toLowerCase()
      });

      if (!user) {
        return res.status(404).json({
          message: "No account found with this email. Sign up first."
        });
      }

      // Assign the plain password; the User model hashes it on save.
      user.password = newPassword;
      await user.save();

      res.json({
        message: "Password reset successfully. You can now login."
      });
    } catch (error) {
      console.error("Password reset error:", error.message);
      res.status(500).json({
        message: "Password reset failed."
      });
    }
  });
}
router.get("/test-reset", (req, res) => {
  res.json({ message: "Password reset route is registered." });
});

module.exports = router;
