
import { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API_URL = "http://localhost:5000/api/bookings";

async function readApiResponse(response) {
  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `HTTP ${response.status}: Backend returned HTML or invalid JSON. Response: ${text.slice(0, 180)}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed (HTTP ${response.status}).`
    );
  }

  return data;
}

const normalizeStatus = (status) =>
  String(status || "").trim().toLowerCase().replace(/\s+/g, " ");

export default function AdminDashboard({ setActiveTab }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  async function fetchBookings() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("hotelproToken");

      if (!token) {
        throw new Error("Please log in as Admin again.");
      }

      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await readApiResponse(response);
      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch (err) {
      setError(err.message || "Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  async function bookingAction(id, action, status) {
    setError("");
    setUpdatingId(id);

    try {
      const token = localStorage.getItem("hotelproToken");

      if (!token) {
        throw new Error("Please log in as Admin again.");
      }

      const endpoint =
        action === "status"
          ? `${API_URL}/${id}/status`
          : `${API_URL}/${id}/${action}`;

      const options = {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      if (action === "status") {
        options.body = JSON.stringify({ status });
      }

      const response = await fetch(endpoint, options);
      await readApiResponse(response);
      await fetchBookings();
    } catch (err) {
      setError(err.message || "Unable to update booking.");
    } finally {
      setUpdatingId("");
    }
  }

  const pending = bookings.filter(
    (b) => normalizeStatus(b.status) === "pending"
  ).length;

  const confirmed = bookings.filter(
    (b) => normalizeStatus(b.status) === "confirmed"
  ).length;

  const checkedIn = bookings.filter(
    (b) => normalizeStatus(b.status) === "checked in"
  ).length;

  const checkedOut = bookings.filter(
    (b) => normalizeStatus(b.status) === "checked out"
  ).length;

  const cancelled = bookings.filter(
    (b) => normalizeStatus(b.status) === "cancelled"
  ).length;

  return (
    <main className="admin-dashboard">
      <div className="admin-header">
        <div>
          <p className="admin-eyebrow">HOTELPRO MANAGEMENT</p>
          <h1>Admin Dashboard</h1>
          <p>Manage hotel bookings and operations.</p>
        </div>

        <button
          className="admin-refresh"
          onClick={fetchBookings}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <section className="admin-stats">
        <article className="admin-stat">
          <span>Total Bookings</span>
          <strong>{bookings.length}</strong>
        </article>
        <article className="admin-stat">
          <span>Pending</span>
          <strong>{pending}</strong>
        </article>
        <article className="admin-stat">
          <span>Confirmed</span>
          <strong>{confirmed}</strong>
        </article>
        <article className="admin-stat">
          <span>Checked In</span>
          <strong>{checkedIn}</strong>
        </article>
        <article className="admin-stat">
          <span>Checked Out</span>
          <strong>{checkedOut}</strong>
        </article>
        <article className="admin-stat">
          <span>Cancelled</span>
          <strong>{cancelled}</strong>
        </article>
      </section>

      <section className="admin-shortcuts">
        <button onClick={() => setActiveTab?.("Manage Rooms")}>
          Manage Rooms
        </button>
        <button onClick={() => setActiveTab?.("Payments")}>
          View Payments
        </button>
        <button onClick={() => setActiveTab?.("Reviews")}>
          Guest Reviews
        </button>
      </section>

      <section className="admin-bookings">
        <div className="admin-section-heading">
          <div>
            <h2>All Bookings</h2>
            <p>Confirm bookings and manage guest check-in/check-out.</p>
          </div>
        </div>

        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room Type</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => {
                  const status = normalizeStatus(booking.status);
                  const busy = updatingId === booking._id;

                  return (
                    <tr key={booking._id}>
                      <td>
                        {booking.name || booking.user?.name || "Guest"}
                        <br />
                        <small>
                          {booking.email || booking.user?.email || ""}
                        </small>
                      </td>

                      <td>{booking.roomType || "Room"}</td>

                      <td>
                        {booking.checkIn
                          ? new Date(booking.checkIn).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        {booking.checkOut
                          ? new Date(booking.checkOut).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        <span
                          className={`admin-status ${status.replace(/\s+/g, "-")}`}
                        >
                          {booking.status || "Pending"}
                        </span>
                      </td>

                      <td>
                        <div className="admin-actions">
                          {status === "pending" && (
                            <>
                              <button
                                className="admin-confirm"
                                disabled={busy}
                                onClick={() =>
                                  bookingAction(
                                    booking._id,
                                    "status",
                                    "Confirmed"
                                  )
                                }
                              >
                                Confirm
                              </button>

                              <button
                                className="admin-cancel"
                                disabled={busy}
                                onClick={() =>
                                  bookingAction(
                                    booking._id,
                                    "status",
                                    "Cancelled"
                                  )
                                }
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {status === "confirmed" && (
                            <button
                              className="admin-confirm"
                              disabled={busy}
                              onClick={() =>
                                bookingAction(booking._id, "check-in")
                              }
                            >
                              {busy ? "Checking In..." : "Check In"}
                            </button>
                          )}

                          {status === "checked in" && (
                            <button
                              className="admin-confirm"
                              disabled={busy}
                              onClick={() =>
                                bookingAction(booking._id, "check-out")
                              }
                            >
                              {busy ? "Checking Out..." : "Check Out"}
                            </button>
                          )}

                          {busy && <span>Updating...</span>}

                          {["cancelled", "checked out"].includes(status) && (
                            <span>-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
