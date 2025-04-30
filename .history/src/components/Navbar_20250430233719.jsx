import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/authSlice.js";
import { toastSuccess } from "../utils.jsx";
import { ChevronDown, User } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const currentRoute = useLocation().pathname;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user from Redux store
  const user = useSelector((state) => state.auth?.user) || { name: "Guest" };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [currentRoute]);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    document.body.style.overflow = isOpen ? "auto" : "hidden";
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    toastSuccess("Logged out successfully");
    navigate("/");
    setDropdownOpen(false);
  };

  // Navigation links
  const navLinks = [
    { name: "Home", to: "/" },
    { name: "Features", to: "/features" },
    { name: "Pricing", to: "/pricing" },
    { name: "Contact", to: "/contact" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink
              to="/"
              className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
            >
              YourLogo
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors ${
                    isActive ? "text-blue-600 border-b-2 border-blue-600" : ""
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {/* User dropdown */}
            {user.name !== "Guest" ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>{user.name}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Login
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-40 pt-16">
            <div className="bg-white rounded-lg shadow-lg mx-4 p-4">
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.to}
                    className={({ isActive }) =>
                      `px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors ${
                        isActive ? "text-blue-600 bg-blue-50 rounded" : ""
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}

                {user.name !== "Guest" ? (
                  <>
                    <div className="px-3 py-2 flex items-center space-x-2">
                      <User size={18} />
                      <span>{user.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 text-left text-gray-700 hover:text-blue-600 font-medium transition-colors"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
                  >
                    Login
                  </button>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
