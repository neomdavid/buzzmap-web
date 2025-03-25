import React from "react";
import { Outlet } from "react-router-dom";

const LandingLayout = () => {
  return (
    <>
      <div className="text-4xl text-primary bg-">Hello</div>
      <Outlet />
    </>
  );
};

export default LandingLayout;
