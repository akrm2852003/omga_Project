import React from "react";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";
import "./authCard.css";

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <motion.div
      className="auth-card surface-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="auth-card-logo">
        <img src={logo} alt="OmGa AI" />
      </div>
      <h1>{title}</h1>
      {subtitle && <p className="auth-card-subtitle">{subtitle}</p>}
      {children}
      {footer && <div className="auth-card-footer">{footer}</div>}
    </motion.div>
  );
}
