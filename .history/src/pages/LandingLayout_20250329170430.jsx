import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components";

const LandingLayout = () => {
  return (
    <div className="pb-30 relative">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default LandingLayout;
