
function StaffDashboard({ setActiveTab }) {
  const tasks = [
    {
      title: "Room Management",
      description: "Check room availability.",
      tab: "Rooms",
      icon: "🛏️",
    },
    {
      title: "Guest Bookings",
      description: "View your booking page.",
      tab: "My Bookings",
      icon: "📋",
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
        <p className="eyebrow">HOTEL OPERATIONS</p>
        <h1>Staff Dashboard</h1>
        <p>Quick access to everyday hotel operations.</p>
      </div>

      <div className="room-grid">
        {tasks.map((task) => (
          <article className="room-card" key={task.title}>
            <div className="room-info">
              <span style={{ fontSize: "30px" }}>{task.icon}</span>
              <h2>{task.title}</h2>
              <p>{task.description}</p>

              <button
                className="primary-btn"
                onClick={() => setActiveTab(task.tab)}
              >
                Open {task.title}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default StaffDashboard;
