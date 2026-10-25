
function AdminDashboard({ setActiveTab }) {
  const actions = [
    {
      title: "Manage Rooms",
      description: "View available hotel rooms.",
      tab: "Rooms",
      icon: "🛏️",
    },
    {
      title: "View Bookings",
      description: "Check guest reservations.",
      tab: "My Bookings",
      icon: "📋",
    },
    {
      title: "Payments",
      description: "Open payment records.",
      tab: "Payments",
      icon: "💳",
    },
    {
      title: "Guest Reviews",
      description: "Read guest feedback.",
      tab: "Reviews",
      icon: "⭐",
    },
  ];

  return (
    <section className="rooms-page">
      <div className="rooms-heading">
        <p className="eyebrow">HOTEL MANAGEMENT</p>
        <h1>Admin Dashboard</h1>
        <p>Quick access to your HotelPro management pages.</p>
      </div>

      <div className="room-grid">
        {actions.map((action) => (
          <article className="room-card" key={action.title}>
            <div className="room-info">
              <span style={{ fontSize: "30px" }}>{action.icon}</span>
              <h2>{action.title}</h2>
              <p>{action.description}</p>

              <button
                className="primary-btn"
                onClick={() => setActiveTab(action.tab)}
              >
                Open {action.title}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AdminDashboard;
