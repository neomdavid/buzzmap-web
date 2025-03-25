import React from "react";
import { Outlet } from "react-router-dom";

const LandingLayout = () => {
  return (
    <>
      <div className="text-4xl">Hello</div>
      <Outlet />
    </>
  );
};

export default LandingLayout;
