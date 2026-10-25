
import { useEffect, useState } from "react";

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingId, setBookingId] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("hotelproToken");

  async function loadReviews() {
    try {
      const response = await fetch("http://localhost:5000/api/reviews");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load reviews.");
      }

      setReviews(Array.isArray(data) ? data : data.reviews || []);
    } catch (error) {
      setMessage(error.message || "Could not load reviews.");
    }
  }

  async function loadBookings() {
    if (!token) return;

    try {
      const response = await fetch(
        "http://localhost:5000/api/bookings/my",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setBookings(data);
      }
    } catch (error) {
      console.error("Could not load bookings:", error);
    }
  }

  useEffect(() => {
    loadReviews();
    loadBookings();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Please login before submitting a review.");
      return;
    }

    if (!bookingId) {
      setMessage("Please select a booking.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          rating: Number(rating),
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not submit review.");
      }

      setMessage("Review submitted successfully!");
      setComment("");
      setRating("5");
      setBookingId("");
      await loadReviews();
    } catch (error) {
      setMessage(error.message || "Could not submit review.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rooms-page">
      <div className="rooms-heading">
        <p className="eyebrow">GUEST FEEDBACK</p>
        <h1>Guest Reviews</h1>
        <p>Share your experience and read what other guests say.</p>
      </div>

      <div className="room-card">
        <div className="room-info">
          <h2>Write a Review</h2>

          {!token && (
            <p>Please login to submit your review.</p>
          )}

          {token && bookings.length === 0 && (
            <p>You need a booking to submit a review.</p>
          )}

          <form onSubmit={handleSubmit}>
            <label htmlFor="reviewBooking">Select Booking</label>
            <select
              id="reviewBooking"
              value={bookingId}
              onChange={(event) => setBookingId(event.target.value)}
              required
              disabled={!token || bookings.length === 0}
            >
              <option value="">Choose your booking</option>
              {bookings.map((booking) => (
                <option key={booking._id} value={booking._id}>
                  {booking.roomType} Room — {new Date(
                    booking.checkIn
                  ).toLocaleDateString("en-IN")}
                </option>
              ))}
            </select>

            <label htmlFor="reviewRating">Rating</label>
            <select
              id="reviewRating"
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              required
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very Good</option>
              <option value="3">3 - Good</option>
              <option value="2">2 - Fair</option>
              <option value="1">1 - Poor</option>
            </select>

            <label htmlFor="reviewComment">Your Comments</label>
            <textarea
              id="reviewComment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Tell us about your stay..."
              maxLength={1000}
              rows={4}
            />

            <button
              className="primary-btn"
              type="submit"
              disabled={loading || !token || bookings.length === 0}
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </form>

          {message && <p role="status">{message}</p>}
        </div>
      </div>

      <div className="rooms-heading">
        <h2>What Our Guests Say</h2>
      </div>

      {reviews.length === 0 ? (
        <p>No reviews yet. Be the first to share your experience!</p>
      ) : (
        <div className="room-grid">
          {reviews.map((review) => (
            <article className="room-card" key={review._id}>
              <div className="room-info">
                <h3>{review.user?.name || "HotelPro Guest"}</h3>
                <p aria-label={`${review.rating} out of 5 stars`}>
                  {"★".repeat(review.rating || 0)}
                  {"☆".repeat(5 - (review.rating || 0))}
                </p>
                <p>{review.comment || "No written comment."}</p>
                <small>
                  {review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString("en-IN")
                    : ""}
                </small>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Reviews;
