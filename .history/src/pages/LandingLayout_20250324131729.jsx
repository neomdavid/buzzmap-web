import React from "react";
import { Outlet } from "react-router-dom";

const LandingLayout = () => {
  return (
    <>
      <div className="text-4xl bg-base-200 ">Hello</div>
      <Outlet />
    </>
  );
};

export default LandingLayout;
