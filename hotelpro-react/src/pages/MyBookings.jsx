import { useEffect, useState } from "react";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchBookings() {
      const token = localStorage.getItem("hotelproToken");

      if (!token) {
        setMessage("Please login to view your bookings.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/bookings/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load bookings.");
        }

        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        setMessage(error.message || "Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  if (loading) return <p>Loading your bookings...</p>;

  return (
    <div className="section">
      <h2>My Bookings</h2>

      {message && <p role="status">{message}</p>}

      {!message && bookings.length === 0 && (
        <p>You have no bookings yet.</p>
      )}

      <div className="room-list">
        {bookings.map((booking) => (
          <div className="room-card" key={booking._id}>
            <h3>{booking.roomType || "Hotel Room"}</h3>
            <p><strong>Guest:</strong> {booking.name}</p>
            <p><strong>Check-in:</strong> {booking.checkIn?.slice(0, 10)}</p>
            <p><strong>Check-out:</strong> {booking.checkOut?.slice(0, 10)}</p>
            <p><strong>Guests:</strong> {booking.guests}</p>
            <p><strong>Status:</strong> {booking.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
