import React from "react";
import { Outlet } from "react-router-dom";

const LandingLayout = () => {
  return (
    <>
      <div>Hello</div>
      <Outlet />
    </>
  );
};

export default LandingLayout;
