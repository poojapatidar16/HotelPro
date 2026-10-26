
import { useState } from "react";
import Login from "./pages/Login";
import Booking from "./pages/Booking";
import Rooms from "./pages/Rooms";
import MyBookings from "./pages/MyBookings";
import Payment from "./pages/Payment";
import Reviews from "./pages/Reviews";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import Navbar from "./components/Navbar";
import "./App.css";
import AdminRooms from "./pages/AdminRooms";

function App() {
  const [activeTab, setActiveTab] = useState("Home");
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("hotelproUser") || "null"
      );
    } catch {
      return null;
    }
  });

  function handleBook(room) {
    setSelectedRoom(room);
    setActiveTab("Bookings");
  }

  function handleLoginSuccess(user) {
    setCurrentUser(user);
    setActiveTab("Home");
  }

  function handleLogout() {
    localStorage.removeItem("hotelproToken");
    localStorage.removeItem("hotelproUser");
    setCurrentUser(null);
    setActiveTab("Home");
  }

  function renderPage() {
    switch (activeTab) {
      case "Rooms":
        return <Rooms onBook={handleBook} />;

      case "Bookings":
        return <Booking selectedRoom={selectedRoom} />;

      case "My Bookings":
        return <MyBookings />;

      case "Payments":
        return <Payment />;

      case "Reviews":
        return <Reviews />;

      case "Login":
      
        return <Login onLoginSuccess={handleLoginSuccess} />;

        case "Manage Rooms":
  return currentUser?.role === "Admin" ? (
    <AdminRooms />
  ) : (
    <p>Please login with an Admin account to manage rooms.</p>
  );

      case "Admin":
        return currentUser?.role === "Admin" ? (
          <AdminDashboard setActiveTab={setActiveTab} />
        ) : (
          <p>Please login with an Admin account to access this page.</p>
        );

      case "Staff":
        return ["Staff", "Admin"].includes(currentUser?.role) ? (
          <StaffDashboard setActiveTab={setActiveTab} />
        ) : (
          <p>Please login with a Staff account to access this page.</p>
        );

      default:
        return (
          <section className="hero">
            <div className="hero-content">
              <p className="eyebrow">WELCOME TO HOTELPRO</p>
              <h1>
                Your Perfect Stay
                <br />
                Starts Here.
              </h1>
              <p>
                Discover comfort, luxury and unforgettable experiences.
              </p>
              <button
                className="primary-btn"
                onClick={() => setActiveTab("Rooms")}
              >
                Explore Rooms →
              </button>
            </div>
          </section>
        );
    }
  }

  return (
    <div className="app">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="section">{renderPage()}</main>

      <footer>
        <h2 className="logo">
          Hotel<span>Pro.</span>
        </h2>
        <p>Comfort, care and memorable stays.</p>
        <small>© 2026 HotelPro</small>
      </footer>
    </div>
  );
}

export default App;
