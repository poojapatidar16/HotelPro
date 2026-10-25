
import { useEffect, useState } from "react";

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
        setError(
          err.message || "Unable to connect to the backend."
        );
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
        <h1>Our Rooms</h1>
        <p>Choose a comfortable room for your next stay.</p>
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
          {rooms.map((room) => (
            <article className="room-card" key={room._id}>
              <div className="room-info">
                <span className="room-category">
                  {room.roomType || "Hotel Room"}
                </span>

                <h2>
                  {room.name || `${room.roomType || "Standard"} Room`}
                </h2>

                <p>
                  Room Number: {room.roomNumber || room.number || "N/A"}
                </p>

                <p>
                  Price: ₹{room.pricePerNight ?? room.price ?? "N/A"} / night
                </p>

                <p>
                  Capacity: {room.capacity ?? room.maxGuests ?? 2} guests
                </p>

                <p>
                  Status: {room.status || "Available"}
                </p>

                <button
                  className="primary-btn"
                  onClick={() => onBook && onBook(room)}
                  disabled={
                    room.status &&
                    room.status.toLowerCase() !== "available"
                  }
                >
                  Book Now
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Rooms;
