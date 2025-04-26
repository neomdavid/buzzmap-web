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
  UserSound,
} from "phosphor-react";
import { useState } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { LogoNamed } from "../../components";

const SupersuperadminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentRoute = useLocation().pathname;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`z-100000 fixed shadow-md z-40 top-0 left-0 h-full w-80 
- bg-white  
+ bg-gradient-to-b from-[#255261] to-[#007da6] 
  p-8 flex flex-col justify-between transition-transform duration-300 
  md:relative md:translate-x-0 ${
    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
  }`}
      >
        <div className="flex flex-col h-[60%] justify-between">
          <div>
            <div className="w-full flex justify-center mb-12 ml-[-7.5px]">
              <LogoNamed theme="dark" />
            </div>
            <div className="flex flex-col items-center text-white mb-4">
              <UserCircle size={80} weight="fill" className="mb-2" />
              <p className="text-3xl font-extrabold">Jane Doe</p>
              <p className="text-white text-sm text-center">
                janedoe@superadmin.buzzmap.com
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col text-white gap-y-1">
            {[
              {
                to: "/superadmin/dashboard",
                icon: <House weight="fill" size={20} />,
                label: "Dashboard",
              },
              {
                to: "/superadmin/users",
                icon: <User weight="fill" size={20} />,
                label: "Users",
              },
              {
                to: "/superadmin/admins",
                icon: <UserSound weight="fill" size={20} />,
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
        </div>

        <div className="py-3 px-3">
          <Link className="font-bold text-white text-lg hover:text-red-300 transition-all duration-200">
            Logout
          </Link>
        </div>
      </aside>

      {/* Overlay for small screens */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/10 bg-opacity-40 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Content */}
      <div className=" flex flex-1 flex-col overflow-auto w-full">
        {/* Top navbar */}
        <div className=" bg-transparent  w-full px-7 py-6  bg-neutral-content flex justify-between items-center">
          <div className="md:hidden">
            <button
              className="btn btn-square btn-ghost"
              onClick={toggleSidebar}
            >
              <List size={23} />
            </button>
          </div>

          <div className="flex items-center gap-x-4 ml-auto">
            <div className="relative flex items-center">
              <input
                className="bg-gray-200 text-primary px-4 py-2 pr-10 rounded-2xl focus:outline-none"
                placeholder="Search here..."
              />
              <MagnifyingGlass className="absolute right-4" size={16} />
            </div>
            <Link>
              <Envelope size={25} />
            </Link>
          </div>
        </div>

        <section
          className={` px-6 py-4 bg-neutral-content  ${
            currentRoute === "/superadmin/dashboard"
              ? "md:pt-[75px] md:mt-[-64px]"
              : "md:pt-[18px] md:mt-[-64px]"
          }  md:pl-6 lg:pl-8 text-primary`}
        >
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default SupersuperadminLayout;
