import {
  ChartBar,
  CheckCircle,
  Envelope,
  House,
  List,
  MagnifyingGlass,
  MapPin,
  UserCircle,
  UsersThree,
  User,
  UserGear,
  X,
  SignOut,
} from "phosphor-react";
import { useState } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { LogoNamed } from "../../components";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../features/authSlice.js";
import { toastSuccess } from "../../utils.jsx";

const SupersuperadminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const currentRoute = useLocation().pathname;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get user from Redux store
  const user = useSelector((state) => state.auth?.user);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    dispatch(logout());
    toastSuccess("Logged out successfully");
    navigate("/login");
  };

  const handleMouseEnter = (e, text) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      text,
      x: rect.right + 10, // 10px offset from the icon
      y: rect.top + (rect.height / 2) // Center vertically
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, text: '', x: 0, y: 0 });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed shadow-md top-0 left-0 h-full 
        bg-gradient-to-b from-[#255261] to-[#007da6] 
        p-8 flex flex-col justify-between transition-all duration-300 
        ${isSidebarOpen ? "w-80" : "w-0 sm:w-20"}
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full sm:-translate-x-[calc(100%-5rem)]"}
        z-50`}
      >
        <div className="flex flex-col h-[60%] justify-between">
          <div>
            <div className="w-full flex justify-between items-center mb-12 ml-[-7.5px]">
              {isSidebarOpen ? (
                <>
                  <LogoNamed theme="dark" />
                  <button 
                    onClick={toggleSidebar}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </>
              ) : (
                <button 
                  onClick={toggleSidebar}
                  className="text-white hover:text-gray-200 transition-colors flex justify-center translate-x-1 sm:block hidden"
                  onMouseEnter={(e) => handleMouseEnter(e, "Toggle Sidebar")}
                  onMouseLeave={handleMouseLeave}
                >
                  <List size={20} weight="bold" />
                </button>
              )}
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col items-center text-white mb-4">
                <UserCircle size={80} weight="fill" className="mb-2" />
                <p className="text-white text-sm mb-2">Superadmin</p>
                <p className="text-3xl font-extrabold mb-2">{user?.name || 'Loading...'}</p>
                <p className="text-white text-sm text-center">
                  {user?.email || 'Loading...'}
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          {isSidebarOpen ? (
            <nav className="flex flex-col text-white gap-y-1 ml-[-8px]">
              {[
                // {
                //   to: "/superadmin/dashboard",
                //   icon: <House weight="fill" size={20} />,
                //   label: "Dashboard",
                // },
                {
                  to: "/superadmin/users",
                  icon: <User weight="fill" size={20} />,
                  label: "Users",
                },
                {
                  to: "/superadmin/admins",
                  icon: <UserGear weight="fill" size={20} />,
                  label: "Admins",
                },
              ].map(({ to, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center py-3 px-3 gap-x-3 rounded-xl hover:bg-white/10 transition-all duration-200 ${
                      isActive ? "bg-white/20 font-extrabold" : ""
                    }`
                  }
                >
                  {icon}
                  <p className="text-lg">{label}</p>
                </NavLink>
              ))}
            </nav>
          ) : (
            <nav className="flex flex-col text-white gap-y-1 items-center sm:flex hidden">
              {[
                {
                  to: "/superadmin/users",
                  icon: <User weight="fill" size={24} />,
                  label: "Users",
                },
                {
                  to: "/superadmin/admins",
                  icon: <UserGear weight="fill" size={24} />,
                  label: "Admins",
                },
              ].map(({ to, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center justify-center w-12 h-12 rounded-xl hover:bg-white/10 transition-all duration-200 ${
                      isActive ? "bg-white/20" : ""
                    }`
                  }
                  onMouseEnter={(e) => handleMouseEnter(e, label)}
                  onMouseLeave={handleMouseLeave}
                >
                  {icon}
                </NavLink>
              ))}
            </nav>
          )}
        </div>

        {/* Logout button - now shows in both states */}
        <div className={`py-3 ${isSidebarOpen ? "px-3" : "px-0"}`}>
          {isSidebarOpen ? (
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="font-bold text-white text-lg hover:text-red-300 transition-all duration-200"
            >
              Logout
            </button>
          ) : (
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="flex justify-center text-white hover:text-red-300 transition-all duration-200 translate-x-[-4px] sm:block hidden"
              onMouseEnter={(e) => handleMouseEnter(e, "Logout")}
              onMouseLeave={handleMouseLeave}
            >
              <SignOut size={22} weight="fill" />
            </button>
          )}
        </div>
      </aside>

      {/* Remove the overlay when sidebar is collapsed */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/10 bg-opacity-40 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Tooltip */}
      {tooltip.show && !isSidebarOpen && (
        <div
          className="fixed z-50 px-2 py-1 text-sm text-white bg-gray-800 rounded shadow-lg"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateY(-50%)'
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <dialog id="logout_modal" className="modal" open={showLogoutModal}>
        <div className="modal-box text-primary">
          <p className="font-bold text-3xl mb-4 text-error">Confirm Logout</p>
          <p className="py-4 text-lg">Are you sure you want to logout?</p>
          <div className="modal-action">
            <button 
              className="btn btn-primary btn-ghost"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-error"
              onClick={() => {
                setShowLogoutModal(false);
                handleLogout();
              }}
            >
              Logout
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setShowLogoutModal(false)}>close</button>
        </form>
      </dialog>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-auto w-full">
        {/* Top navbar */}
        <div className="bg-transparent w-full px-7 py-6 bg-neutral-content flex justify-between items-center relative z-30">
          <div className="flex items-center gap-4">
            <button
              className="btn btn-square btn-ghost hover:bg-gray-200"
              onClick={toggleSidebar}
            >
              <List size={23} />
            </button>
          </div>

          <div className="flex items-center gap-x-4">
            {/* <div className="relative flex items-center">
              <input
                className="bg-gray-200 text-primary px-4 py-2 pr-10 rounded-2xl focus:outline-none"
                placeholder="Search here..."
              />
              <MagnifyingGlass className="absolute right-4" size={16} />
            </div>
            <Link>
              <Envelope size={25} />
            </Link> */}
          </div>
        </div>

        <section
          className={`px-6 py-4 bg-neutral-content ${
            currentRoute === "/superadmin/dashboard"
              ? "md:pt-[75px] md:mt-[-64px]"
              : "md:pt-[18px] md:mt-[-64px]"
          } md:pl-6 lg:pl-8 text-primary ${
            !isSidebarOpen ? "sm:ml-20" : ""
          }`}
        >
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default SupersuperadminLayout;
