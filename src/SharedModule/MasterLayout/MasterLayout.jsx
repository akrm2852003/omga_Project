import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../SideBar/SideBar";
import NavBar from "../NaveBar/NaveBar";

export default function MasterLayout() {
  return (
    <div className="d-flex vh-100 overflow-hidden  ">
      {/* Sidebar */}
      <div className="">
        <SideBar />
      </div>

      {/* Main Content */}
      <div className="d-flex flex-column w-100 h-100 overflow-hidden  m-3">
        <NavBar />

        {/* Chat or other content */}
        <div className="flex-grow-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
