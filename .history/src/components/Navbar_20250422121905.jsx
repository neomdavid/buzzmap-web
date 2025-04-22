import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { navLinks } from "../utils";
import LogoNamed from "./LogoNamed";
import { Menu, X, UserCircle } from "lucide-react";
import { useSelector } from "react-redux";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentRoute = useLocation().pathname;

  // Example: get name from Redux
  const user = useSelector((state) => state.auth?.user || { name: "Guest" });

  const toggleDrawer = () => setIsOpen(!isOpen);

  const renderLinks = (isDrawer = false) => (
    <div
      className={`flex ${
        isDrawer ? "flex-col gap-y-4" : "gap-x-6"
      } items-center`}
    >
      {navLinks.map((link) => (
        <NavLink
          key={link.name}
          to={link.to}
          onClick={() => setIsOpen(false)} // Close drawer on click
          className={({ isActive }) =>
            `${
              isActive
                ? currentRoute.startsWith("/mapping")
                  ? "text-secondary"
                  : "text-accent"
                : currentRoute.startsWith("/mapping")
                ? "text-white"
                : "text-primary"
            } font-semibold`
          }
        >
          {link.name}
        </NavLink>
      ))}
    </div>
  );

  const renderProfile = (darkMode = false) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setIsProfileOpen((prev) => !prev)}
          className="flex items-center gap-x-2 focus:outline-none"
        >
          <UserCircle
            size={28}
            className={darkMode ? "text-white" : "text-primary"}
          />
          <span
            className={`text-sm font-semibold ${
              darkMode ? "text-white" : "text-primary"
            }`}
          >
            {user.name}
          </span>
        </button>

        {isProfileOpen && (
          <div
            className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg z-10 ${
              darkMode ? "bg-primary text-white" : "bg-white text-primary"
            }`}
          >
            <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs opacity-80">{user.email}</p>
            </div>
            <button
              onClick={() => {
                // Dispatch logout action here
                // dispatch(logout())
                console.log("Logged out");
              }}
              className={`w-full text-left px-4 py-2 hover:bg-opacity-10 ${
                darkMode ? "hover:bg-white" : "hover:bg-black"
              } transition-colors duration-200 text-sm`}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    );
  };

  const baseClass =
    "z-50 fixed top-0 left-0 right-0 flex justify-between items-center px-6 py-4 lg:px-10";

  if (currentRoute === "/mapping") {
    return (
      <nav className={`${baseClass} bg-primary text-white`}>
        <LogoNamed theme="dark" />
        <div className="hidden md:flex items-center gap-x-6">
          {renderLinks()}
          {renderProfile(true)}
        </div>
        <button className="md:hidden text-white" onClick={toggleDrawer}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-primary px-6 py-4 flex flex-col gap-y-4 md:hidden">
            {renderLinks(true)}
            {renderProfile(true)}
          </div>
        )}
      </nav>
    );
  } else if (/^\/mapping\/.+$/.test(currentRoute)) {
    return (
      <nav className="z-50 fixed right-6 top-6 text-white text-md bg-primary py-3.5 px-6 rounded-2xl shadow-md flex items-center gap-x-6">
        {renderLinks()}
        {renderProfile(true)}
      </nav>
    );
  } else {
    return (
      <nav className={`${baseClass} bg-white shadow-sm`}>
        <LogoNamed />
        <div className="hidden md:flex items-center gap-x-6">
          {renderLinks()}
          {renderProfile()}
        </div>
        <button className="md:hidden text-primary" onClick={toggleDrawer}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-white px-6 py-4 flex flex-col gap-y-4 md:hidden shadow-md">
            {renderLinks(true)}
            {renderProfile()}
          </div>
        )}
      </nav>
    );
  }
};

export default Navbar;
