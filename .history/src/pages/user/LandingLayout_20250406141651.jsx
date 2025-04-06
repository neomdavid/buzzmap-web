import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../../components";
import { NavLink, useLocation } from "react-router-dom";

const LandingLayout = () => {
  return (
    <div className="pt-23 relative">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default LandingLayout;
