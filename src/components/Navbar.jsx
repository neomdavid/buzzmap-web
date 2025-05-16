import { useState } from "react";
import { NavLink, useLocation, useNavigate, matchPath } from "react-router-dom";
import { navLinks } from "../utils";
import { LogoNamed } from "./";
import { Menu, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/authSlice.js";
import { toastSuccess } from "../utils.jsx";
import { IconCaretDownFilled, IconUserCircle } from "@tabler/icons-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentRoute = useLocation().pathname;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user from Redux store
  const userFromStore = useSelector((state) => state.auth?.user);
  let user;
  if (userFromStore && userFromStore.role === "user") {
    user = userFromStore;
  } else {
    user = { name: "Guest" };
  }
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
          onClick={() => setIsOpen(false)}
          className={({ isActive }) =>
            `${
              isActive
                ? currentRoute.startsWith("/mapping") ||
                  /^\/buzzline\/\w+/.test(currentRoute)
                  ? "text-secondary"
                  : "text-accent"
                : currentRoute.startsWith("/mapping") ||
                  /^\/buzzline\/\w+/.test(currentRoute)
                ? "text-white"
                : "text-primary"
            } font-semibold text-lg`
          }
        >
          {link.name}
        </NavLink>
      ))}
    </div>
  );

  const renderProfile = (darkMode = false) => (
    <div className="dropdown dropdown-end z-[10000]">
      <div
        tabIndex="0"
        role="button"
        className="flex border-1 border-gray-300 rounded-full p-3 gap-1 items-center hover:cursor-pointer hover:border-2 hover:border-gray-200 transition-all duration-200"
      >
        <span
          className={`text-lg font-semibold ${
            darkMode ? "text-white" : "text-primary"
          }`}
        >
          {user.name}
        </span>
        <IconCaretDownFilled size={15} stroke={2} />
      </div>
      <ul
        tabIndex="0"
        className="dropdown-content mt-2.5 menu bg-primary text-white rounded-xl z-[10000] w-120 shadow-md flex flex-col justify-center"
      >
        <div className="p-6 flex flex-col gap-1">
          <div className="w-full flex justify-center mb-3">
            <IconUserCircle size={63} className="text-white" />
          </div>
          <p className="text-center font-bold text-2xl">{user.name}</p>
          <p className="text-center font-light text-white text-xl">
            {user.email}
          </p>
        </div>
        <hr className="text-gray-400 mt-[-2px] mb-2" />
        <button
          onClick={() => {
            dispatch(logout());
            toastSuccess("Logged out successfully");
            navigate("/home");
          }}
          className="w-full text-center hover:bg-error p-4 text-lg hover:cursor-pointer transition-all duration-300 rounded-md"
        >
          Logout
        </button>
      </ul>
    </div>
  );

  const renderLoginButton = (darkMode = false) => (
    <button
      onClick={() => navigate("/login")}
      className={`font-semibold py-2 px-4 rounded-lg border transition-all duration-300 text-lg hover:cursor-pointer ${
        darkMode
          ? "text-white border-white hover:bg-white hover:text-primary"
          : "text-primary border-primary hover:bg-primary hover:text-white"
      }`}
    >
      Login
    </button>
  );

  const baseClass =
    "z-50 fixed top-0 left-0 right-0 flex justify-between items-center px-6 py-4 lg:px-10";

  if (currentRoute === "/mapping" || /^\/buzzline\/\w+/.test(currentRoute)) {
    return (
      <nav className={`${baseClass} bg-primary text-white`}>
        <LogoNamed theme="dark" />
        <div className="hidden md:flex items-center gap-x-6">
          {renderLinks()}
          {user.name !== "Guest"
            ? renderProfile(true)
            : renderLoginButton(true)}
        </div>
        <button className="md:hidden text-white" onClick={toggleDrawer}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-primary px-6 py-4 flex flex-col gap-y-4 md:hidden">
            {renderLinks(true)}
            {user.name !== "Guest"
              ? renderProfile(true)
              : renderLoginButton(true)}
          </div>
        )}
      </nav>
    );
  } else if (/^\/mapping\/.+$/.test(currentRoute)) {
    return (
      <nav className="z-50 fixed right-6 top-6 text-white text-md bg-primary py-3.5 px-6 rounded-2xl shadow-md flex items-center gap-x-6">
        {renderLinks()}
        {user.name !== "Guest" ? renderProfile(true) : renderLoginButton(true)}
      </nav>
    );
  } else {
    return (
      <nav className={`${baseClass} bg-white shadow-sm`}>
        <LogoNamed />
        <div className="hidden md:flex items-center gap-x-6">
          {renderLinks()}
          {user.name !== "Guest" ? renderProfile() : renderLoginButton()}
        </div>
        <button className="md:hidden text-primary" onClick={toggleDrawer}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-white px-6 py-4 flex flex-col gap-y-4 md:hidden shadow-md">
            {renderLinks(true)}
            {user.name !== "Guest" ? renderProfile() : renderLoginButton()}
          </div>
        )}
      </nav>
    );
  }
};

export default Navbar;
