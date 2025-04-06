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
import { useState } from "react";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="drawer lg:drawer-open">
      {/* Toggle Checkbox (hidden but used by DaisyUI for logic) */}
      <input
        id="admin-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={isOpen}
        onChange={() => setIsOpen(!isOpen)}
      />

      {/* Page content */}
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <nav className="flex justify-between px-7 py-6">
          {/* Drawer Toggle Button (mobile only) */}
          <label
            htmlFor="admin-drawer"
            className="lg:hidden rounded-full p-3 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
          >
            <List size={23} />
          </label>

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
        </nav>

        {/* Content Slot */}
        <section className="px-4">
          {/* Your children content can go here */}
        </section>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-40">
        <label
          htmlFor="admin-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
          onClick={() => setIsOpen(false)}
        ></label>

        <aside className="w-80 bg-white shadow-sm py-8 px-8 flex flex-col justify-between">
          <div className="flex flex-col h-[60%] justify-between">
            <div>
              <div className="w-full flex justify-center ml-[-8px] mb-12">
                <LogoNamed />
              </div>
              <div className="flex flex-col w-full items-center justify-center text-primary">
                <UserCircle size={80} weight="fill" className="mb-2" />
                <p className="text-3xl font-extrabold">Jane Doe</p>
                <p className="text-gray-500 text-center text-sm">
                  janedoe@admin.buzzmap.com
                </p>
              </div>
            </div>

            <nav className="flex flex-col justify-center w-full text-primary gap-y-1">
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
                    `flex items-center py-3 px-3 gap-x-3 rounded-xl transition-all duration-200 hover:bg-gray-100 ${
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
