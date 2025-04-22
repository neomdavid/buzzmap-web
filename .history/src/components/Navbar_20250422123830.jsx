import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { navLinks } from "../utils";
import LogoNamed from "./LogoNamed";
import { Menu, X, UserCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { IconCaretDownFilled, IconUserCircle } from "@tabler/icons-react";

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

  const renderProfile = (darkMode = false) => (
    <>
      <div className="dropdown dropdown-end">
        <div
          tabindex="0"
          role="button"
          class="flex border-1 border-gray-300 rounded-full p-3 gap-1 items-center"
        >
          <span
            className={`text-sm font-semibold  ${
              darkMode ? "text-white" : "text-primary"
            }`}
          >
            {user.name}
          </span>
          <IconCaretDownFilled size={15} stroke={2} />
        </div>
        <ul
          tabindex="0"
          className="dropdown-content menu bg-primary text-white rounded-xl z-1 w-120 p-8 shadow-sm flex flex-col justify-center"
        >
          <IconUserCircle fill="true" className="bg-white" />
          <p className="text-center font-bold text-2xl">{user.name}</p>
          <p className="text-center font-light text-white text-lg">
            {user.email}
          </p>
        </ul>
      </div>
    </>
  );

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
