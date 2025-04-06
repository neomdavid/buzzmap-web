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
} from "phosphor-react";
import { LogoNamed } from "../../components";
import { NavLink, Link } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="drawer md:drawer-open">
      {/* Checkbox toggle for mobile */}
      <input id="admin-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main content area */}
      <div className="drawer-content flex flex-col">
        {/* Top navbar */}
        <div className="navbar w-full px-7 py-6 border-b bg-white">
          <div className="flex-none md:hidden">
            <label
              htmlFor="admin-drawer"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <List size={23} />
            </label>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-x-4">
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

        {/* Page content */}
        <section className="px-6 py-4">
          {/* Your routed page will be rendered here */}
          Content goes here
        </section>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-40">
        <label
          htmlFor="admin-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>

        <aside className="w-80 bg-white min-h-full p-8 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col h-[60%] justify-between">
            <div>
              <div className="w-full flex justify-center mb-12">
                <LogoNamed />
              </div>
              <div className="flex flex-col items-center text-primary mb-4">
                <UserCircle size={80} weight="fill" className="mb-2" />
                <p className="text-3xl font-extrabold">Jane Doe</p>
                <p className="text-gray-500 text-sm text-center">
                  janedoe@admin.buzzmap.com
                </p>
              </div>
            </div>

            {/* Sidebar Navigation */}
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
                  to: "/admin/mapping",
                  icon: <MapPin weight="fill" size={20} />,
                  label: "Dengue Mapping",
                },
                {
                  to: "/admin/reports",
                  icon: <CheckCircle weight="fill" size={20} />,
                  label: "Reports Verification",
                },
                {
                  to: "/admin/community",
                  icon: <UsersThree weight="fill" size={30} />,
                  label: "Community Engagement & Awareness",
                },
              ].map(({ to, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center py-3 px-3 gap-x-3 rounded-xl hover:bg-gray-100 transition-all duration-200 ${
                      isActive ? "text-primary font-extrabold" : "text-gray-500"
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
            <Link className="font-bold text-gray-500 text-lg hover:text-red-400 transition-all duration-200">
              Logout
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminLayout;
