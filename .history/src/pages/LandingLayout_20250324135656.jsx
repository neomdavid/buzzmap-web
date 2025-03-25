import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components";

const LandingLayout = () => {
  return (
    <>
      <Navbar />
      <div className="text-primary">WEFWEFEW</div>
      <Outlet />
    </>
  );
};

export default LandingLayout;
