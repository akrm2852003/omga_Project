import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/logo.png";
import "./authLayout.css";

export default function AuthLayout() {
  const location = useLocation();

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <Link className="auth-visual-brand" to="/">
          <img src={logo} alt="OmGa AI" />
          <span>OmGa AI</span>
        </Link>

        <div className="auth-visual-quote">
          <h1>مدرّسك الخصوصي متاح 24 ساعة</h1>
          <p>
            اسأل في أي وقت، صوّر واجبك، واستلم شرح فوري بأسلوبك المفضّل —
            في الكيمياء والفيزياء والأحياء والعربي والإنجليزي.
          </p>
        </div>
      </div>

      <div className="auth-form-area">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
