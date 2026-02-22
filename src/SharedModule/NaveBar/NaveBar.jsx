import React, { useContext } from "react";
import { UserContext } from "../../Context/AuthContext/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function NavBar({ toggleSidebar }) {
  const { userName, logout } = useContext(UserContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar-custom navbar-expand-lg d-flex align-items-center mx-2 px-3">
      {/* 🔥 زرار المينيو يظهر في الموبايل فقط */}
      <button className="btn text-light me-3 d-md-none" onClick={toggleSidebar}>
        <i className="fa-solid fa-bars"></i>
      </button>

      <a className="navbar-brand fw-bold text-light me-auto" href="#">
        Chat omGa
      </a>

      <ul className="navbar-nav ms-auto align-items-center">
        <li className="nav-item d-flex align-items-center me-3">
          <FaUserCircle size={28} className="me-2 text-light" />
          <span className="nav-link mb-0 text-light">
            {userName || "Guest"}
          </span>
        </li>

        <li className="nav-item">
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}
