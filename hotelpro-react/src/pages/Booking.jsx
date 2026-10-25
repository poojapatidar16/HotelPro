import { useState } from "react";

export default function Booking({ selectedRoom }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    checkIn: "",
    checkOut: "",
    guests: "1",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (!selectedRoom) {
      setMessage("Please select a room from the Rooms page first.");
      return;
    }

    if (new Date(form.checkOut) <= new Date(form.checkIn)) {
      setMessage("Check-out date must be after check-in date.");
      return;
    }

    const token = localStorage.getItem("hotelproToken");

    if (!token) {
      setMessage("Please login before making a booking.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          roomType: selectedRoom.type || selectedRoom.roomType || selectedRoom.name,
          guests: Number(form.guests),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed.");
      }

      setMessage("Booking submitted successfully!");
      setForm({
        name: "",
        email: "",
        checkIn: "",
        checkOut: "",
        guests: "1",
      });
    } catch (error) {
      setMessage(error.message || "Unable to submit booking.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Book Your Room</h2>

        {selectedRoom ? (
          <p>
            Selected room:{" "}
            {selectedRoom.name || selectedRoom.type || selectedRoom.roomType}
          </p>
        ) : (
          <p>Please select a room from the Rooms page first.</p>
        )}

        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>Check-in date</label>
        <input
          type="date"
          name="checkIn"
          min={new Date().toLocaleDateString("en-CA")}
          value={form.checkIn}
          onChange={handleChange}
          required
        />

        <label>Check-out date</label>
        <input
          type="date"
          name="checkOut"
          min={form.checkIn || new Date().toLocaleDateString("en-CA")}
          value={form.checkOut}
          onChange={handleChange}
          required
        />

        <label>Number of guests</label>
        <select
          name="guests"
          value={form.guests}
          onChange={handleChange}
          required
        >
          <option value="1">1 Guest</option>
          <option value="2">2 Guests</option>
          <option value="3">3 Guests</option>
          <option value="4">4 Guests</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Confirm Booking"}
        </button>

        {message && <p role="status">{message}</p>}
      </form>
    </div>
  );
}
