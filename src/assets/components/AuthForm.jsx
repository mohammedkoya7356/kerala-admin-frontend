import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './AuthForm.css';
import 'animate.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// ✅ API base URL from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AuthForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/auth/login`, form);
      console.log("Login Response:", res.data);

      const { token, user } = res.data;

      if (!user || !user.role) {
        throw new Error("Invalid user data returned from server.");
      }

      if (user.role !== "admin") {
        setError("Access denied: Only admins can log in.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      alert("✅ Welcome Admin!");
      navigate("/admin");
    } catch (err) {
      console.error("Login Error:", err);
      const message = err.response?.data?.message || err.message || "Login failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate__animated animate__fadeIn d-flex align-items-center justify-content-center vh-100 bg-light">
      <form
        className="p-4 shadow rounded bg-white"
        onSubmit={handleSubmit}
        style={{ minWidth: "350px", maxWidth: "400px", width: "100%" }}
        noValidate
      >
        <h3 className="text-center mb-4">Admin Login</h3>

        <div className="form-group mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            autoFocus
            type="email"
            id="email"
            name="email"
            className="form-control"
            placeholder="admin@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            className="form-control"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <div className="form-check mt-2">
            <input
              type="checkbox"
              className="form-check-input"
              id="showPasswordCheckbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label className="form-check-label" htmlFor="showPasswordCheckbox">
              Show Password
            </label>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login as Admin"}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
