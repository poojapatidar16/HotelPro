
import { useEffect, useState } from "react";
import "./Rooms.css";


const roomDetails = {
  "Standard Room": {
    title: "Standard Room",
    price: 1500,
    capacity: 2,
    description: "A comfortable room for a relaxing stay.",
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
  },
  "Deluxe Room": {
    title: "Deluxe Room",
    price: 2500,
    capacity: 2,
    description: "Enjoy extra comfort in a stylish deluxe room.",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
  },
  "Superior Room": {
    title: "Superior Room",
    price: 2000,
    capacity: 2,
    description: "An upgraded room with extra comfort.",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80",
  },
  "Executive Room": {
    title: "Executive Room",
    price: 3000,
    capacity: 2,
    description: "Modern comfort for business travellers.",
    image: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=900&q=80",
  },
  "Family Room": {
    title: "Family Room",
    price: 3500,
    capacity: 4,
    description: "Extra space for families travelling together.",
    image: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=900&q=80",
  },
  "Single Room": {
    title: "Single Room",
    price: 1200,
    capacity: 1,
    description: "A cozy room for a solo guest.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
  "Double Room": {
    title: "Double Room",
    price: 1800,
    capacity: 2,
    description: "A comfortable room with a double bed.",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=80",
  },
  "Twin Room": {
    title: "Twin Room",
    price: 2000,
    capacity: 2,
    description: "A room with two separate single beds.",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80",
  },
  "Suite Room": {
    title: "Suite Room",
    price: 4000,
    capacity: 3,
    description: "A spacious suite with a separate living area.",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80",
  },
  "Junior Suite": {
    title: "Junior Suite",
    price: 3500,
    capacity: 2,
    description: "A premium room with a sitting area.",
    image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=900&q=80",
  },
  "Connecting Room": {
    title: "Connecting Room",
    price: 4500,
    capacity: 4,
    description: "Connected rooms suitable for families.",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80",
  },
  "Presidential Suite": {
    title: "Presidential Suite",
    price: 8000,
    capacity: 4,
    description: "An elegant luxury stay with premium facilities.",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80",
  },
};

function Rooms({ onBook }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRooms() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/rooms"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load rooms.");
        }

        setRooms(Array.isArray(data) ? data : data.rooms || []);
      } catch (err) {
        setError(err.message || "Unable to connect to the backend.");
      } finally {
        setLoading(false);
      }
    }

    loadRooms();
  }, []);

  return (
    <section className="rooms-page">
      <div className="rooms-heading">
        <p className="eyebrow">FIND YOUR PERFECT STAY</p>
        <h1>Discover Our Rooms</h1>
        <p>Comfort, elegance and a relaxing stay await you.</p>
      </div>

      {loading && <p>Loading rooms...</p>}

      {error && (
        <p className="error-message">
          {error}. Please make sure the backend is running.
        </p>
      )}

      {!loading && !error && rooms.length === 0 && (
        <p>No rooms are available right now.</p>
      )}

      {!loading && !error && rooms.length > 0 && (
        <div className="room-grid">
          {rooms.map((room) => {

const details = roomDetails[room.roomType] || {
  title: room.roomType,
  price: room.pricePerNight,
  capacity: room.capacity,
  description: room.description || "Enjoy a comfortable stay.",
  image: room.image,
};

            const unavailable =
              room.status &&
              room.status.toLowerCase() !== "available";

            return (
              <article className="room-card" key={room._id}>
                <div className="room-image-wrap">
                  <img
                    className="room-image"
                    src={room.image || details.image}
                    alt={details.title}
                    loading="lazy"
                  />
                  <span className="room-category">
                    {room.roomType}
                  </span>
                </div>

                <div className="room-info">
                  <h2>
                    {room.name || details.title}
                  </h2>

                  <p className="room-description">
                    {room.description || details.description}
                  </p>

                  <div className="room-meta">
                    <span>
                      <strong>Room:</strong>{" "}
                      {room.roomNumber || room.number || "N/A"}
                    </span>
                    <span>
                      <strong>Guests:</strong>{" "}
                      {room.capacity ?? details.capacity}
                    </span>
                  </div>

                  <div className="room-card-footer">
                    <p className="room-price">
                      ₹{room.pricePerNight ?? room.price ?? details.price}
                      <span> / night</span>
                    </p>

                    <button
                      className="primary-btn"
                      onClick={() => onBook && onBook(room)}
                      disabled={unavailable}
                    >
                      {unavailable ? room.status : "Book Now"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Rooms;
