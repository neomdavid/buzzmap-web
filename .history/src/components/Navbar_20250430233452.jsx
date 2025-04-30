import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react"; // For Hamburger menu
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/authSlice.js";
import { toastSuccess } from "../utils.jsx";
import { IconCaretDownFilled, IconUserCircle } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoNamed } from "./";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state
  const [scrolled, setScrolled] = useState(false); // Scroll detection state
  const currentRoute = useLocation().pathname;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user from Redux store
  const userFromStore = useSelector((state) => state.auth?.user);
  const user = userFromStore || { name: "Guest" };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
    document.body.style.overflow = isOpen ? "auto" : "hidden"; // Prevent scrolling when menu is open
  };

  const renderLinks = (isDrawer = false) => (
    <motion.div
      className={`flex ${
        isDrawer ? "flex-col gap-y-6" : "gap-x-8"
      } items-center`}
    >
      {navLinks.map((link) => (
        <div key={link.name} className="group relative">
          <NavLink
            to={link.to}
            onClick={() => {
              setIsOpen(false);
              document.body.style.overflow = "auto";
            }}
            className={({ isActive }) =>
              `${
                isActive
                  ? currentRoute.startsWith("/mapping")
                    ? "text-secondary"
                    : "text-accent"
                  : currentRoute.startsWith("/mapping")
                  ? "text-white hover:text-secondary"
                  : "text-primary hover:text-accent"
              } font-medium text-lg transition-colors duration-300`
            }
          >
            {link.name}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />
          </NavLink>
        </div>
      ))}
    </motion.div>
  );

  const renderProfile = (darkMode = false, isMobile = false) => (
    <div
      className={`dropdown dropdown-end z-[10000] ${
        isMobile ? "absolute inset-x-0 top-16" : ""
      }`}
    >
      <div
        tabIndex="0"
        role="button"
        className={`flex border rounded-full p-2.5 gap-1 items-center hover:cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] ${
          darkMode
            ? "border-gray-400 hover:border-white"
            : "border-gray-300 hover:border-primary"
        } ${isMobile ? "w-full justify-center" : ""}`}
      >
        <span
          className={`text-lg font-medium ${
            darkMode ? "text-white" : "text-primary"
          }`}
        >
          {user.name.split(" ")[0]}
        </span>
        <div
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <IconCaretDownFilled size={15} stroke={2} />
        </div>
      </div>
      <ul
        tabIndex="0"
        className={`dropdown-content mt-2.5 bg-primary text-white rounded-xl z-[10000] shadow-lg transition-all duration-200 ${
          isMobile ? "w-full" : "w-120"
        }`}
      >
        <div className="p-6 flex flex-col gap-1">
          <div className="w-full flex justify-center mb-3">
            <IconUserCircle size={63} className="text-white" />
          </div>
          <p className="text-center font-bold text-2xl">{user.name}</p>
          <p className="text-center font-light text-white/80 text-xl">
            {user.email}
          </p>
        </div>
        <hr className="border-gray-600 my-2" />
        <button
          onClick={() => {
            dispatch(logout());
            toastSuccess("Logged out successfully");
            navigate("/home");
          }}
          className="w-full text-center hover:bg-error/90 p-4 text-lg hover:cursor-pointer transition-all duration-300 rounded-md hover:scale-[1.02] active:scale-[0.98]"
        >
          Logout
        </button>
      </ul>
    </div>
  );

  const renderLoginButton = (darkMode = false, isMobile = false) => (
    <button
      onClick={() => navigate("/login")}
      className={`font-medium py-2.5 px-6 rounded-lg border-2 transition-all duration-300 text-lg hover:cursor-pointer hover:scale-[1.05] active:scale-[0.95] ${
        darkMode
          ? "text-white border-white hover:bg-white hover:text-primary"
          : "text-primary border-primary hover:bg-primary hover:text-white"
      } ${isMobile ? "w-full" : ""}`}
    >
      Login
    </button>
  );

  const baseClass = `z-50 fixed top-0 left-0 right-0 flex justify-between items-center px-6 py-3 lg:px-12 transition-all duration-300 ${
    currentRoute === "/mapping"
      ? "bg-primary text-white"
      : scrolled
      ? "bg-white/90 backdrop-blur-sm shadow-sm"
      : "bg-transparent"
  }`;

  if (currentRoute === "/mapping") {
    return (
      <nav className={`${baseClass} bg-primary text-white`}>
        <div className="hover:scale-[1.05] transition-transform duration-200">
          <LogoNamed theme="dark" />
        </div>
        <div className="hidden md:flex items-center gap-x-8">
          {renderLinks()}
          {user.name !== "Guest"
            ? renderProfile(true)
            : renderLoginButton(true)}
        </div>
        <button
          className="md:hidden text-white transition-transform duration-200 hover:scale-110 active:scale-90"
          onClick={toggleDrawer}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 md:hidden z-40 transition-opacity duration-300">
            <div className="absolute top-0 left-0 w-full bg-primary px-6 py-6 flex flex-col gap-y-6 animate-slide-down">
              {renderLinks(true)}
              <div className="pt-4 w-full">
                {user.name !== "Guest"
                  ? renderProfile(true, true)
                  : renderLoginButton(true, true)}
              </div>
            </div>
          </div>
        )}
      </nav>
    );
  } else if (/^\/mapping\/.+$/.test(currentRoute)) {
    return (
      <nav className="z-50 fixed right-6 top-6 text-white text-md bg-primary/90 backdrop-blur-sm py-3 px-6 rounded-2xl shadow-lg flex items-center gap-x-8 transition-all duration-300 hover:scale-[1.02]">
        {renderLinks()}
        {user.name !== "Guest" ? renderProfile(true) : renderLoginButton(true)}
      </nav>
    );
  } else {
    return (
      <nav className={baseClass}>
        <div className="hover:scale-[1.05] transition-transform duration-200">
          <LogoNamed />
        </div>
        <div className="hidden md:flex items-center gap-x-8">
          {renderLinks()}
          {user.name !== "Guest" ? renderProfile() : renderLoginButton()}
        </div>
        <button
          className="md:hidden text-primary transition-transform duration-200 hover:scale-110 active:scale-90"
          onClick={toggleDrawer}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 md:hidden z-40 transition-opacity duration-300">
            <div className="absolute top-0 left-0 w-full bg-white/95 backdrop-blur-sm px-6 py-6 flex flex-col gap-y-6 animate-slide-down">
              {renderLinks(true)}
              <div className="pt-4 w-full">
                {user.name !== "Guest" ? renderProfile() : renderLoginButton()}
              </div>
            </div>
          </div>
        )}
      </nav>
    );
  }
};

export default Navbar;
