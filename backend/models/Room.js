
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
    },

    roomType: {
      type: String,
      required: true,
      enum: [
        "Standard Room",
        "Deluxe Room",
        "Superior Room",
        "Executive Room",
        "Family Room",
        "Single Room",
        "Double Room",
        "Twin Room",
        "Suite Room",
        "Junior Suite",
        "Connecting Room",
        "Presidential Suite",
      ],
    },

    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    description: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Available", "Occupied", "Maintenance"],
      default: "Available",
    },

    amenities: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
