import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMenu, FiLogOut } from "react-icons/fi";
import { UserContext } from "../../Context/AuthContext/UserContext";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import "./naveBar.css";

export default function NavBar({ toggleSidebar }) {
  const { userName, logout } = useContext(UserContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  const initial = (userName || "؟").trim().charAt(0).toUpperCase();

  return (
    <nav className="topbar">
      <button className="topbar-toggle" onClick={toggleSidebar} title="القائمة">
        <FiMenu size={20} />
      </button>

      <div className="topbar-user">
        <ThemeToggle />
        <div className="topbar-avatar">{initial}</div>
        <span className="topbar-username">{userName || "زائر"}</span>

        <motion.button
          className="topbar-logout"
          onClick={handleLogout}
          whileTap={{ scale: 0.94 }}
          title="تسجيل الخروج"
        >
          <FiLogOut size={16} />
          <span className="topbar-logout-label">تسجيل الخروج</span>
        </motion.button>
      </div>
    </nav>
  );
}
