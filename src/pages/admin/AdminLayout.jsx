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
  Megaphone,
} from "phosphor-react";
import { useState } from "react";
import {
  NavLink,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { LogoNamed } from "../../components";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/authSlice.js";
import { toastSuccess } from "../../utils.jsx";
import annotationPlugin from 'chartjs-plugin-annotation';
import ChartJS from 'chart.js/auto';

ChartJS.register(annotationPlugin);

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentRoute = useLocation().pathname;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const userFromStore = useSelector((state) => state.auth?.user);
  const user = userFromStore || { name: "Admin" };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`z-100 fixed shadow-md z-40 top-0 left-0 h-full w-80 bg-white  p-8 flex flex-col justify-between transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-[60%] justify-between">
          <div>
            <div className="w-full flex justify-center mb-12 ml-[-7.5px]">
              <LogoNamed />
            </div>
            <div className="flex flex-col items-center text-primary mb-4">
              <UserCircle size={80} weight="fill" className="mb-2" />
              <p className="text-3xl font-extrabold">{user.name}</p>
              <p className="text-gray-500 text-sm text-center">{user.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col text-primary gap-y-1">
            {[
              {
                to: "/admin/dashboard",
                icon: <House weight="fill" size={20} />,
                label: "Dashboard",
              },
              {
                to: "/admin/analytics",
                icon: <ChartBar weight="fill" size={20} />,
                label: "Analytics",
              },
              {
                to: "/admin/denguemapping",
                icon: <MapPin weight="fill" size={20} />,
                label: "Dengue Mapping",
              },
              {
                to: "/admin/reportsverification",
                icon: <CheckCircle weight="fill" size={20} />,
                label: "Reports Verification",
              },
              {
                to: "/admin/interventions",
                icon: <Megaphone weight="fill" size={20} />,
                label: "Interventions",
              },
              {
                to: "/admin/cea",
                icon: <UsersThree weight="fill" size={30} />,
                label: "Community Engagement & Awareness",
              },
              {
                to: "/admin/archives",
                icon: <List weight="fill" size={20} />,
                label: "Archives",
              },
            ].map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center py-3 px-3 gap-x-3 rounded-xl hover:bg-gray-100 transition-all duration-200 ${isActive ? "text-primary font-extrabold" : "text-gray-500"
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
          <Link
            onClick={() => {
              dispatch(logout());
              navigate("/");
              toastSuccess("Logged out successfully.");
            }}
            className="font-bold text-gray-500 text-lg hover:text-red-400 transition-all duration-200"
          >
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

          {/* <div className="flex items-center gap-x-4 ml-auto">
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
          </div> */}
        </div>

        <section
          className={` px-6 py-4 bg-neutral-content  ${currentRoute === "/admin/dashboard"
            ? "md:pt-[75px] md:mt-[-64px]"
            : " md:pt-[57px] md:mt-[-64px]"
            }  md:pl-6 lg:pl-8 text-primary`}
        >
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default AdminLayout;
