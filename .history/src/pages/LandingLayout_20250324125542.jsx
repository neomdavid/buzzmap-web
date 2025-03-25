import React from "react";
import { Outlet } from "react-router-dom";

const LandingLayout = () => {
  return (
    <>
      <div className="text-primary">Hello</div>
      <Outlet />
    </>
  );
};

export default LandingLayout;
