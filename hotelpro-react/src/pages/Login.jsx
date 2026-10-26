
import { useState } from "react";

export default function Login({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      let endpoint = isSignup ? "signup" : "login";
      let body = form;

      if (isForgotPassword) {
        endpoint = "dev-reset-password";
        body = {
          email: form.email,
          newPassword,
        };
      }

      const response = await fetch(
        `http://localhost:5000/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

const contentType = response.headers.get("content-type") || "";

if (!contentType.includes("application/json")) {
  const text = await response.text();
  throw new Error(
    `Expected a JSON response from the backend. HTTP ${response.status}. Response: ${text.slice(0, 100)}`
  );
}

const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      if (isForgotPassword) {
        setMessage(
"Password reset successful! Please log in with your new password."
        );
        setIsForgotPassword(false);
        setIsSignup(false);
        setForm({ name: "", email: form.email, password: "" });
        setNewPassword("");
        return;
      }

      localStorage.setItem("hotelproToken", data.token);
      localStorage.setItem("hotelproUser", JSON.stringify(data.user));

      setMessage(data.message || "Login successful!");
      setForm({ name: "", email: "", password: "" });

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    } catch (error) {
      setMessage(error.message || "Server connection failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>
          {isForgotPassword
            ? "Reset Password"
            : isSignup
              ? "Create Account"
              : "Welcome Back"}
        </h2>

        <p>HotelPro Hotel Management</p>

        {isSignup && !isForgotPassword && (
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
        />

        {!isForgotPassword && (
          <input
            type="password"
            name="password"
            placeholder="Password (minimum 8 characters)"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />
        )}

        {isForgotPassword && (
          <input
            type="password"
            placeholder="New Password (minimum 8 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
          />
        )}

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : isForgotPassword
              ? "Reset Password"
              : isSignup
                ? "Sign Up"
                : "Login"}
        </button>

        {!isSignup && !isForgotPassword && (
          <p>
            <button
              type="button"
              className="auth-toggle"
              onClick={() => {
                setIsForgotPassword(true);
                setMessage("");
                setNewPassword("");
              }}
            >
              Forgot Password?
            </button>
          </p>
        )}

        {message && <p role="status">{message}</p>}

        <p>
          {isForgotPassword
            ? "Remember your password? "
            : isSignup
              ? "Already have an account? "
              : "New to HotelPro? "}

          <button
            type="button"
            className="auth-toggle"
            onClick={() => {
              setIsForgotPassword(false);
              setIsSignup(!isSignup);
              setMessage("");
              setNewPassword("");
            }}
          >
            {isForgotPassword
              ? "Back to Login"
              : isSignup
                ? "Login"
                : "Create Account"}
          </button>
        </p>
      </form>
    </div>
  );
}