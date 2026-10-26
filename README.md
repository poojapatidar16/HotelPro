# 🏨 HotelPro — Hotel Management System

HotelPro is a full-stack hotel management web application designed to simplify hotel operations, room management, and guest bookings.

## ✨ Features

- 🔐 User authentication and login
- 🛏️ Room management
- 📅 Booking management
- 👥 Guest and booking information
- 🧾 Admin dashboard
- ✅ Booking status management
- 🏨 Check-in and check-out functionality
- 💳 Payment and staff management API modules

*Note: Feature availability may depend on the current implementation and configuration.*

## 🛠️ Tech Stack

**Frontend**
- React.js
- JavaScript
- CSS
- Vite

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB
- Mongoose

**Tools**
- Git and GitHub
- Visual Studio Code
- npm

## 📁 Project Structure

```text
HotelPro/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── hotelpro-react/
│   ├── src/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── ...
│   └── package.json
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/poojapatidar16/HotelPro.git
cd HotelPro
```

### 2. Set up the frontend

```bash
cd hotelpro-react
npm install
npm run dev
```

Open the local URL shown in your terminal.

### 3. Set up the backend

Open another terminal from the project root:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder and configure your environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend:

```bash
node server.js
```

The backend should run at `http://localhost:5000` if port 5000 is available.

## 🔒 Environment Variables

Never commit your `.env` file, database credentials, or secret keys to GitHub. Keep them private and configure them separately when deploying the application.

## 🚀 Deployment

The frontend and backend need to be deployed and configured to communicate with each other before the application can be accessed publicly.

**Live Demo:** _Add your deployed website URL here._

## 👩‍💻 Author

**Pooja Patidar**

GitHub: [poojapatidar16](https://github.com/poojapatidar16)

## 📄 License

This project is available for learning and educational purposes. Add a formal license if you intend to specify reuse and distribution permissions.
