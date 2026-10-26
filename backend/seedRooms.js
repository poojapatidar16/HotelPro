
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const Room = require("./models/Room");

const rooms = [
  {
    roomNumber: "101",
    roomType: "Standard Room",
    pricePerNight: 1500,
    capacity: 2,
    description: "Comfortable room with essential facilities.",
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32",
    amenities: ["WiFi", "AC", "TV"],
  },
  {
    roomNumber: "102",
    roomType: "Deluxe Room",
    pricePerNight: 2500,
    capacity: 2,
    description: "Elegant room with stylish interiors.",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427",
    amenities: ["WiFi", "AC", "TV", "Mini Fridge"],
  },
  {
    roomNumber: "103",
    roomType: "Superior Room",
    pricePerNight: 2000,
    capacity: 2,
    description: "Upgraded room with extra comfort.",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a",
    amenities: ["WiFi", "AC", "TV", "Work Desk"],
  },
  {
    roomNumber: "104",
    roomType: "Executive Room",
    pricePerNight: 3000,
    capacity: 2,
    description: "Ideal for business travellers.",
    image: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061",
    amenities: ["WiFi", "AC", "TV", "Work Desk"],
  },
  {
    roomNumber: "105",
    roomType: "Family Room",
    pricePerNight: 3500,
    capacity: 4,
    description: "Spacious room for families.",
    image: "https://images.unsplash.com/photo-1564078516393-cf04bd966897",
    amenities: ["WiFi", "AC", "TV", "Extra Beds"],
  },
  {
    roomNumber: "106",
    roomType: "Single Room",
    pricePerNight: 1200,
    capacity: 1,
    description: "Cozy room for a solo guest.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
    amenities: ["WiFi", "AC", "TV"],
  },
  {
    roomNumber: "107",
    roomType: "Double Room",
    pricePerNight: 1800,
    capacity: 2,
    description: "Room with a comfortable double bed.",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0",
    amenities: ["WiFi", "AC", "TV"],
  },
  {
    roomNumber: "108",
    roomType: "Twin Room",
    pricePerNight: 2000,
    capacity: 2,
    description: "Room with two separate single beds.",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304",
    amenities: ["WiFi", "AC", "TV"],
  },
  {
    roomNumber: "109",
    roomType: "Suite Room",
    pricePerNight: 4000,
    capacity: 3,
    description: "Luxury suite with a separate living area.",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461",
    amenities: ["WiFi", "AC", "TV", "Mini Bar"],
  },
  {
    roomNumber: "110",
    roomType: "Junior Suite",
    pricePerNight: 3500,
    capacity: 2,
    description: "Premium room with a sitting area.",
    image: "https://images.unsplash.com/photo-1591088398332-8a7791972843",
    amenities: ["WiFi", "AC", "TV", "Sitting Area"],
  },
  {
    roomNumber: "111",
    roomType: "Connecting Room",
    pricePerNight: 4500,
    capacity: 4,
    description: "Connected rooms suitable for families.",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a",
    amenities: ["WiFi", "AC", "TV", "Extra Beds"],
  },
  {
    roomNumber: "112",
    roomType: "Presidential Suite",
    pricePerNight: 8000,
    capacity: 4,
    description: "Luxury suite with premium facilities.",
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32",
    amenities: ["WiFi", "AC", "TV", "Mini Bar", "Living Area"],
  },
];

async function seedRooms() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing from backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Remove existing rooms and insert the 12 new room types.
    await Room.deleteMany({});
    await Room.insertMany(
      rooms.map((room) => ({ ...room, status: "Available" }))
    );

    console.log("Success! Added 12 different room types.");
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedRooms();
