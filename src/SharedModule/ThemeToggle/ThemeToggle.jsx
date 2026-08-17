import React, { useContext } from "react";
import { motion } from "framer-motion";
import { FiSun, FiMoon } from "react-icons/fi";
import { ThemeCtx } from "../../Context/ThemeContext/ThemeCtx";
import "./themeToggle.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeCtx);
  const isDark = theme === "dark";

  return (
    <motion.button
      className="theme-toggle"
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
    >
      {isDark ? <FiSun size={17} /> : <FiMoon size={17} />}
    </motion.button>
  );
}
