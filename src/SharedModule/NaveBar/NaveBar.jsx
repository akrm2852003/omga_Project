import React, { useContext, useState } from "react";
import { UserContext } from "../../Context/AuthContext/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function NavBar({ toggleSidebar }) {
  const { userName, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <>
      {/* ======== Desktop NavBar - يظهر فقط فوق 768px ======== */}
      <nav className="navbar-custom navbar-expand-lg d-none d-md-flex align-items-center mx-2 px-3">
        

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

      {/* ======== Mobile: أيقونة ثابتة على اليمين ======== */}
      <div className="d-md-none">
        {/* الأيقونة الثابتة */}
        <button
          className="mobile-nav-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <FaUserCircle size={26} color="#fff" />
        </button>

        {/* الـ Dropdown Menu */}
        {menuOpen && (
          <>
            {/* overlay شفاف لما تضغط برا يقفل */}
            <div
              className="mobile-nav-overlay"
              onClick={() => setMenuOpen(false)}
            />
            <div className="mobile-nav-menu">
              {/* زرار السايد بار */}
              <button
                className="mobile-nav-item"
                onClick={() => {
                  toggleSidebar();
                  setMenuOpen(false);
                }}
              >
                <i className="fa-solid fa-bars me-2"></i>
                القائمة
              </button>

              {/* اسم المستخدم */}
              <div className="mobile-nav-user">
                <FaUserCircle size={20} className="me-2" />
                {userName || "Guest"}
              </div>

              {/* Logout */}
              <button className="mobile-nav-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
