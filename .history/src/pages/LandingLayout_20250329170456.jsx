import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components";

const LandingLayout = () => {
  return (
    <div className="pt-23 relative">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default LandingLayout;
