import { useEffect, useState } from "react";

export default function Payment() {
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [bookingId, setBookingId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("hotelproToken");

  useEffect(() => {
    async function loadPaymentData() {
      if (!token) {
        setMessage("Please login to view payments.");
        setLoading(false);
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [bookingResponse, paymentResponse] = await Promise.all([
          fetch("http://localhost:5000/api/bookings/my", { headers }),
          fetch("http://localhost:5000/api/payments/my", { headers }),
        ]);

        const bookingData = await bookingResponse.json();
        const paymentData = await paymentResponse.json();

        if (!bookingResponse.ok) {
          throw new Error(bookingData.message || "Could not load bookings.");
        }

        if (!paymentResponse.ok) {
          throw new Error(paymentData.message || "Could not load payments.");
        }

        setBookings(Array.isArray(bookingData) ? bookingData : []);
        setPayments(Array.isArray(paymentData) ? paymentData : []);
      } catch (error) {
        setMessage(error.message || "Could not connect to the backend.");
      } finally {
        setLoading(false);
      }
    }

    loadPaymentData();
  }, []);

  async function handlePaymentRequest(e) {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    if (!bookingId) {
      setMessage("Please select a booking.");
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/payments/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookingId,
            amount: numericAmount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create payment record.");
      }

      setMessage(
        data.message ||
          "Payment record created. Status is pending; no money was charged."
      );

      const refreshed = await fetch("http://localhost:5000/api/payments/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const refreshedData = await refreshed.json();

      if (refreshed.ok && Array.isArray(refreshedData)) {
        setPayments(refreshedData);
      }

      setBookingId("");
      setAmount("");
    } catch (error) {
      setMessage(error.message || "Payment request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading payment details...</p>;

  return (
    <div className="section">
      <h2>HotelPro Payments</h2>
      <p>Manage payment records for your hotel bookings.</p>

      {message && <p role="status">{message}</p>}

      <form className="auth-form" onSubmit={handlePaymentRequest}>
        <label>Select booking</label>
        <select
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
          required
        >
          <option value="">Choose a booking</option>
          {bookings.map((booking) => (
            <option key={booking._id} value={booking._id}>
              {(booking.roomType || "Room") +
                " — " +
                (booking.checkIn || "").slice(0, 10)}
            </option>
          ))}
        </select>

        <label>Amount (₹)</label>
        <input
          type="number"
          min="1"
          step="0.01"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Create Payment Record"}
        </button>
      </form>

      <h3>Payment History</h3>

      {payments.length === 0 ? (
        <p>No payment records found.</p>
      ) : (
        <div className="room-list">
          {payments.map((payment) => (
            <div className="room-card" key={payment._id}>
              <p>
                <strong>Amount:</strong> ₹{payment.amount}
              </p>
              <p>
                <strong>Status:</strong> {payment.status || "Pending"}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {payment.createdAt
                  ? new Date(payment.createdAt).toLocaleDateString()
                  : "Not available"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
