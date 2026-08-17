import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./notFound.css";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <motion.div
        className="not-found-code"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        404
      </motion.div>
      <h2>الصفحة اللي بتدوّر عليها مش موجودة</h2>
      <p>يمكن الرابط اتغيّر أو الصفحة اتشالت — يلا نرجعلك للرئيسية.</p>
      <motion.div whileTap={{ scale: 0.97 }}>
        <Link className="btn btn-primary" to="/">
          رجوع للرئيسية
        </Link>
      </motion.div>
    </div>
  );
}
