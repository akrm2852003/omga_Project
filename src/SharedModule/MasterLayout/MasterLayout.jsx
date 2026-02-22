import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../SideBar/SideBar";
import NavBar from "../NaveBar/NaveBar";

export default function MasterLayout() {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="d-flex vh-100 overflow-hidden">
      <SideBar isOpen={isOpen} closeSidebar={closeSidebar} />

      <div className="d-flex flex-column w-100 h-100 overflow-hidden">
        <NavBar toggleSidebar={toggleSidebar} />
        <div className="flex-grow-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
