import React, { useEffect, useState } from "react";
import { ThemeCtx } from "./ThemeCtx";

function getInitialTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  // 🆕 طلب مستخدم صريح: خلي شكل الابليكيشن زي omga-grader-react - ده افتراضيًا
  // ثيم فاتح بس (مفيش وضع غامق خالص هناك) - فبقى هو الافتراضي هنا كمان، والغامق
  // فضل موجود كاختيار يدوي بس (زرار ThemeToggle) مش الحالة الافتراضية.
  return "light";
}

export default function ThemeContextProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return (
    <ThemeCtx.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}
