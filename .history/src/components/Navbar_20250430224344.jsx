import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { navLinks } from "../utils";
import { LogoNamed } from "./";
import { Menu, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/authSlice.js";
import { toastSuccess } from "../utils.jsx";
import { IconCaretDownFilled, IconUserCircle } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  const toggleDrawer = () => setIsOpen(!isOpen);

  const renderLinks = (isDrawer = false) => (
    <motion.div
      className={`flex ${
        isDrawer ? "flex-col gap-y-6" : "gap-x-8"
      } items-center`}
      initial={isDrawer ? { opacity: 0 } : false}
      animate={isDrawer ? { opacity: 1 } : false}
      transition={{ duration: 0.3 }}
    >
      {navLinks.map((link, index) => (
        <motion.div
          key={link.name}
          initial={{ y: isDrawer ? -20 : 0, opacity: isDrawer ? 0 : 1 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: isDrawer ? index * 0.1 : 0 }}
        >
          <NavLink
            to={link.to}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `${
                isActive
                  ? currentRoute.startsWith("/mapping")
                    ? "text-secondary"
                    : "text-accent"
                  : currentRoute.startsWith("/mapping")
                  ? "text-white hover:text-secondary"
                  : "text-primary hover:text-accent"
              } font-medium text-lg transition-colors duration-300 relative group`
            }
          >
            {link.name}
            <motion.span
              className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"
              initial={{ width: 0 }}
              animate={{ width: isActive ? "100%" : 0 }}
            />
          </NavLink>
        </motion.div>
      ))}
    </motion.div>
  );

  const renderProfile = (darkMode = false) => (
    <motion.div
      className="dropdown dropdown-end z-[10000]"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        tabIndex="0"
        role="button"
        className={`flex border rounded-full p-2.5 gap-1 items-center hover:cursor-pointer transition-all duration-300 ${
          darkMode
            ? "border-gray-400 hover:border-white"
            : "border-gray-300 hover:border-primary"
        }`}
      >
        <span
          className={`text-lg font-medium ${
            darkMode ? "text-white" : "text-primary"
          }`}
        >
          {user.name.split(" ")[0]}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <IconCaretDownFilled size={15} stroke={2} />
        </motion.div>
      </div>
      <motion.ul
        tabIndex="0"
        className="dropdown-content mt-2.5 menu bg-primary text-white rounded-xl z-[10000] w-120 shadow-lg"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-6 flex flex-col gap-1">
          <motion.div
            className="w-full flex justify-center mb-3"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <IconUserCircle size={63} className="text-white" />
          </motion.div>
          <p className="text-center font-bold text-2xl">{user.name}</p>
          <p className="text-center font-light text-white/80 text-xl">
            {user.email}
          </p>
        </div>
        <hr className="border-gray-600 my-2" />
        <motion.button
          onClick={() => {
            dispatch(logout());
            toastSuccess("Logged out successfully");
            navigate("/home");
          }}
          className="w-full text-center hover:bg-error/90 p-4 text-lg hover:cursor-pointer transition-all duration-300 rounded-md"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Logout
        </motion.button>
      </motion.ul>
    </motion.div>
  );

  const renderLoginButton = (darkMode = false) => (
    <motion.button
      onClick={() => navigate("/login")}
      className={`font-medium py-2.5 px-6 rounded-lg border-2 transition-all duration-300 text-lg hover:cursor-pointer ${
        darkMode
          ? "text-white border-white hover:bg-white hover:text-primary"
          : "text-primary border-primary hover:bg-primary hover:text-white"
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Login
    </motion.button>
  );

  const baseClass = `z-50 fixed top-0 left-0 right-0 flex justify-between items-center px-6 py-3 lg:px-12 transition-all duration-300 ${
    scrolled && !currentRoute.startsWith("/mapping")
      ? "bg-white/90 backdrop-blur-sm shadow-sm"
      : "bg-transparent"
  }`;

  if (currentRoute === "/mapping") {
    return (
      <nav className={`${baseClass} bg-primary text-white`}>
        <motion.div whileHover={{ scale: 1.05 }}>
          <LogoNamed theme="dark" />
        </motion.div>
        <div className="hidden md:flex items-center gap-x-8">
          {renderLinks()}
          {user.name !== "Guest"
            ? renderProfile(true)
            : renderLoginButton(true)}
        </div>
        <motion.button
          className="md:hidden text-white"
          onClick={toggleDrawer}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </motion.button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute top-full left-0 w-full bg-primary px-6 py-6 flex flex-col gap-y-6 md:hidden"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderLinks(true)}
              <div className="pt-4">
                {user.name !== "Guest"
                  ? renderProfile(true)
                  : renderLoginButton(true)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    );
  } else if (/^\/mapping\/.+$/.test(currentRoute)) {
    return (
      <motion.nav
        className="z-50 fixed right-6 top-6 text-white text-md bg-primary/90 backdrop-blur-sm py-3 px-6 rounded-2xl shadow-lg flex items-center gap-x-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {renderLinks()}
        {user.name !== "Guest" ? renderProfile(true) : renderLoginButton(true)}
      </motion.nav>
    );
  } else {
    return (
      <nav className={baseClass}>
        <motion.div whileHover={{ scale: 1.05 }}>
          <LogoNamed />
        </motion.div>
        <div className="hidden md:flex items-center gap-x-8">
          {renderLinks()}
          {user.name !== "Guest" ? renderProfile() : renderLoginButton()}
        </div>
        <motion.button
          className="md:hidden text-primary"
          onClick={toggleDrawer}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </motion.button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-sm px-6 py-6 flex flex-col gap-y-6 md:hidden shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderLinks(true)}
              <div className="pt-4">
                {user.name !== "Guest" ? renderProfile() : renderLoginButton()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    );
  }
};

export default Navbar;
