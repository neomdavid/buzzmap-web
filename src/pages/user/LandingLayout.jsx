import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../../components";
import { NavLink, useLocation } from "react-router-dom";

const LandingLayout = () => {
  return (
    <div className="min-h-screen relative">
      <Navbar />
      <div className="mt-19 ">  
         <Outlet />
      </div>
   
    </div>
  );
};

export default LandingLayout;
