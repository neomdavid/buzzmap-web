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
                  /^\/buzzline\/\w+/.test(currentRoute) || currentRoute === "/profile"
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
        className="flex items-center gap-2 hover:cursor-pointer"
        onClick={() => navigate('/profile')}
      >
        <img 
          src={user.profilePhotoUrl || 'https://i.ibb.co/0VvffYVH/a1c820a6453b.png'} 
          alt="profile" 
          className="w-10 h-10 rounded-full object-cover border-2 border-white"
        />
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
            <img 
              src={user.profilePhotoUrl || 'https://i.ibb.co/0VvffYVH/a1c820a6453b.png'} 
              alt="profile" 
              className="w-16 h-16 rounded-full object-cover border-2 border-white hover:cursor-pointer hover:opacity-80 transition-all duration-300"
              onClick={() => {
                navigate('/profile');
                setIsOpen(false);
              }}
            />
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

  if (currentRoute === "/mapping" || /^\/buzzline\/\w+/.test(currentRoute) || currentRoute === "/profile") {
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
          {isOpen ? <X size={28}  className="hover:cursor-pointer"/> : <Menu size={28} className="hover:cursor-pointer"/>}
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
          {isOpen ? <X size={28}  className="hover:cursor-pointer"/> : <Menu size={28} className="hover:cursor-pointer"/>}
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
