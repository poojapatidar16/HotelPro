
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/rooms";

const emptyForm = {
  roomNumber: "",
  roomType: "Standard Room",
  pricePerNight: "",
  capacity: "1",
  description: "",
  image: "",
  status: "Available",
  amenities: "",
};

async function readResponse(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      "The server returned an invalid response. Check that the backend is running on port 5000."
    );
  }
}

function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadRooms() {
    setLoading(true);

    try {
      const response = await fetch(API_URL);
      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load rooms.");
      }

      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRooms();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const token = localStorage.getItem("hotelproToken");

    if (!token) {
      setMessage("Please log in with an Admin account.");
      return;
    }

    if (!form.roomNumber.trim()) {
      setMessage("Please enter a room number.");
      return;
    }

    if (form.pricePerNight === "" || Number(form.pricePerNight) < 0) {
      setMessage("Please enter a valid price.");
      return;
    }

    if (form.capacity === "" || Number(form.capacity) < 1) {
      setMessage("Capacity must be at least 1.");
      return;
    }

    const payload = {
      ...form,
      roomNumber: form.roomNumber.trim(),
      pricePerNight: Number(form.pricePerNight),
      capacity: Number(form.capacity),
      amenities: form.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    setSaving(true);

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.error
            ? `${data.message || "Could not save room"}: ${data.error}`
            : data.message || "Could not save room."
        );
      }

      setMessage(
        editingId
          ? "Room updated successfully."
          : "Room added successfully."
      );

      resetForm();
      await loadRooms();
    } catch (error) {
      setMessage(error.message || "Could not connect to the server.");
    } finally {
      setSaving(false);
    }
  }

  function startEditing(room) {
    setEditingId(room._id);

    setForm({
      roomNumber: room.roomNumber || "",
      roomType: room.roomType || "Standard Room",
      pricePerNight: String(room.pricePerNight ?? ""),
      capacity: String(room.capacity ?? 1),
      description: room.description || "",
      image: room.image || "",
      status: room.status || "Available",
      amenities: (room.amenities || []).join(", "),
    });

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteRoom(id) {
    if (!window.confirm("Are you sure you want to delete this room?")) {
      return;
    }

    const token = localStorage.getItem("hotelproToken");

    if (!token) {
      setMessage("Please log in with an Admin account.");
      return;
    }

    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Could not delete room.");
      }

      if (editingId === id) {
        resetForm();
      }

      setMessage("Room deleted successfully.");
      await loadRooms();
    } catch (error) {
      setMessage(error.message || "Could not connect to the server.");
    }
  }

  return (
    <main style={styles.page}>
      <h1>Room Management</h1>
      <p>Manage room inventory, prices, amenities, and availability.</p>

      {message && (
        <p role="status" style={styles.message}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.formTitle}>
          {editingId ? "Edit Room" : "Add New Room"}
        </h2>

        <label style={styles.label}>
          Room Number
          <input
            name="roomNumber"
            value={form.roomNumber}
            onChange={handleChange}
            required
          />
        </label>

        <label style={styles.label}>
          Room Type
          <select
            name="roomType"
            value={form.roomType}
            onChange={handleChange}
          >
            {[
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
            ].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Price Per Night
          <input
            name="pricePerNight"
            type="number"
            min="0"
            step="0.01"
            value={form.pricePerNight}
            onChange={handleChange}
            required
          />
        </label>

        <label style={styles.label}>
          Capacity
          <input
            name="capacity"
            type="number"
            min="1"
            step="1"
            value={form.capacity}
            onChange={handleChange}
            required
          />
        </label>

        <label style={styles.label}>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </label>

        <label style={styles.label}>
          Image URL
          <input
            name="image"
            type="url"
            value={form.image}
            onChange={handleChange}
            placeholder="https://example.com/room.jpg"
          />
        </label>

        <label style={styles.label}>
          Amenities (comma-separated)
          <input
            name="amenities"
            value={form.amenities}
            onChange={handleChange}
            placeholder="Wi-Fi, Air conditioning, TV"
          />
        </label>

        <label style={styles.label}>
          Room Status
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </label>

        <div style={styles.actions}>
          <button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingId
                ? "Update Room"
                : "Add Room"}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h2>All Rooms ({rooms.length})</h2>

      {loading ? (
        <p>Loading rooms...</p>
      ) : rooms.length === 0 ? (
        <p>No rooms found. Add your first room above.</p>
      ) : (
        <div style={styles.list}>
          {rooms.map((room) => (
            <article key={room._id} style={styles.card}>
              <h3>Room {room.roomNumber}</h3>
              <p>{room.roomType}</p>
              <p>Price: ₹{room.pricePerNight} per night</p>
              <p>Capacity: {room.capacity}</p>
              <p>Status: {room.status}</p>
              <p>
                Amenities: {(room.amenities || []).join(", ") || "None"}
              </p>

              <div style={styles.actions}>
                <button
                  type="button"
                  onClick={() => startEditing(room)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => deleteRoom(room._id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

const styles = {
  page: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    marginBottom: "30px",
  },
  formTitle: {
    gridColumn: "1 / -1",
    margin: 0,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  message: {
    padding: "10px",
    background: "#f1f5f9",
    borderRadius: "6px",
  },
  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  list: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  card: {
    padding: "18px",
    border: "1px solid #ddd",
    borderRadius: "10px",
  },
};

export default AdminRooms;
