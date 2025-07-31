import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ContactList from "./contact/ContactList";
import "./AdminDashboard.css";
import AdminTourBookings from "./booking/AdminTourBooking";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <h2> Dashboard Overview</h2>
            <p>Welcome to the Kerala Travel Admin Panel. Use the sidebar to manage banners, gallery, and contact submissions.</p>
          </>
        );
      case "contact":
        return <ContactList />;
      case "AdminTourBookings":
        return <AdminTourBookings />;

      default:
        return <p>Invalid Tab</p>;
    }
  };

  return (
    <div className="admin-dashboard d-flex" style={{ minHeight: "100vh" }}>
      <div className="sidebar bg-dark text-white p-3" style={{ minWidth: "220px" }}>
        <h4 className="text-center">Kerala Travel</h4>
        <ul className="nav flex-column mt-4">
          {[
            { label: " Dashboard", key: "dashboard" },
            { label: " Contact Submissions", key: "contact" },

            , { label: " Tour Bookings", key: "AdminTourBookings" }
          ].map((item) => (
            <li className="nav-item" key={item.key}>
              <button
                className={`nav-link text-white btn btn-link ${activeTab === item.key ? "fw-bold text-warning" : ""}`}
                onClick={() => setActiveTab(item.key)}
              >
                {item.label}
              </button>
            </li>
          ))}
          <li className="nav-item mt-4">
            <button className="btn btn-outline-light w-100" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </div>


      <div className="main-content flex-grow-1 bg-light">
        <div className="navbar bg-white shadow-sm d-flex justify-content-between align-items-center p-3">
          <div></div>
          <h5
            className="mb-0"
            style={{ cursor: "pointer" }}
            onClick={() =>
              alert(`Name: ${user?.name || "Admin"}\nEmail: ${user?.email || "admin@example.com"}`)
            }
          >
            {user?.name || "Admin"}
          </h5>
        </div>

        <div className="p-4">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
