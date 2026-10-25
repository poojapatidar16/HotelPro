import "./Navbar.css";

function Navbar({ activeTab, setActiveTab, currentUser, onLogout }) {
  const role = currentUser?.role || "Guest";

  const tabs = [
    "Home",
    "Rooms",
    "Bookings",
    "My Bookings",
    "Payments",
    "Reviews",
    ...(role === "Admin" ? ["Admin"] : []),
    ...(role === "Staff" || role === "Admin" ? ["Staff"] : []),
    ...(!currentUser ? ["Login"] : []),
  ];

  return (
    <nav className="navbar">
      <a
        href="#home"
        className="logo"
        onClick={(event) => {
          event.preventDefault();
          setActiveTab("Home");
        }}
      >
        Hotel<span>Pro.</span>
      </a>

      <div className="nav-links">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={
              activeTab === tab ? "nav-button active" : "nav-button"
            }
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}

        {currentUser && (
          <>
            <span className="nav-user">Hi, {currentUser.name}</span>
            <button className="nav-button" onClick={onLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;