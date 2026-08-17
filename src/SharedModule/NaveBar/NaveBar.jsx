import React, { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiLogOut } from "react-icons/fi";
import { UserContext } from "../../Context/AuthContext/AuthContext";
import "./naveBar.css";

export default function NavBar({ toggleSidebar }) {
  const { userName, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef(null);

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

      <div className="topbar-user" ref={wrapperRef} onClick={() => setMenuOpen((p) => !p)}>
        <span className="topbar-username">{userName || "زائر"}</span>
        <div className="topbar-avatar">{initial}</div>

        <AnimatePresence>
          {menuOpen && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 1190 }}
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
              />
              <motion.div
                className="topbar-dropdown"
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <button className="topbar-dropdown-item" onClick={handleLogout}>
                  <FiLogOut size={16} />
                  تسجيل الخروج
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
