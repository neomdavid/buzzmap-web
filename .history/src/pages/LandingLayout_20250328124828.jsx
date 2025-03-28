import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components";

const LandingLayout = () => {
  return (
    <div className="pt-[4rem]">
      {" "}
      {/* Adjust height based on your navbar */}
      <Navbar />
      <Outlet />
    </div>
  );
};

export default LandingLayout;
