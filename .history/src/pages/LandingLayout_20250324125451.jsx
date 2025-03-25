import React from "react";
import { Outlet } from "react-router-dom";

const LandingLayout = () => {
  return (
    <>
      <div className="font-bold">Hello</div>
      <Outlet />
    </>
  );
};

export default LandingLayout;
