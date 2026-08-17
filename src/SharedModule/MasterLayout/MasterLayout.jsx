import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../SideBar/SideBar";
import NavBar from "../NaveBar/NaveBar";
import "./masterLayout.css";

export default function MasterLayout() {
  // ⚠️ متعملش AnimatePresence مفتاحها location.pathname هنا: التنقل بين
  // /home/chat/:id بيحصل تلقائي أثناء الـ SSE stream (لما notebook_id
  // جديد يوصل) — أي remount لـ ChatPage هنا هيمسح حالة الـ Stream ويبوظ
  // فيكسات الـ race-condition اللي اتعملت قبل كده. الأنيميشن هنا محصور
  // في مكونات فرعية (SideBar/NavBar/ChatPage) مش في الـ Outlet نفسه.
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const closeSidebar = () => setIsOpen(false);

  useEffect(() => {
    const handleResize = () => setIsOpen(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="master-layout">
      <SideBar isOpen={isOpen} closeSidebar={closeSidebar} />

      <div className="master-main">
        <NavBar toggleSidebar={toggleSidebar} />
        <div className="master-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
