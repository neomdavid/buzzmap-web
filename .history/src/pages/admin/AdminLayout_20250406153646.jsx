import {
  ChartBar,
  Check,
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
    <main className="flex ">
      <aside className="fixed flex flex-col top-0 bottom-0 w-90 shadow-sm py-8 px-8 justify-between ">
        <div className="flex flex-col h-[60%]  justify-between">
          <div>
            <div className="w-full flex justify-center ml-[-8px] mb-12">
              <LogoNamed />
            </div>
            <div className="flex flex-col w-full items-center justify-center text-primary">
              <UserCircle size={80} weight="fill" className="mb-2" />
              <p className="text-3xl font-extrabold">Jane Doe</p>
              <p className="text-gray-500">janedoe@admin.buzzmap.com</p>
            </div>
          </div>

          <nav className="flex flex-col justify-center w-full text-primary gap-y-1 ">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex items-center py-3 px-3 gap-x-3 rounded-xl hover:bg-gray-100 transition-all duration-200 ${
                  isActive ? " text-primary font-extrabold" : "text-gray-500"
                }`
              }
            >
              <House weight="fill" size={20} />
              <p className="text-lg">Dashboard</p>
            </NavLink>

            <NavLink
              to="/admin/analytics"
              className={({ isActive }) =>
                `flex items-center py-3 px-3 gap-x-3 rounded-xl transition-all duration-200 hover:bg-gray-100 transition-all duration-200 ${
                  isActive ? " text-primary font-extrabold" : "text-gray-500"
                }`
              }
            >
              <ChartBar weight="fill" size={20} />
              <p className="text-lg">Analytics</p>
            </NavLink>
            <NavLink
              to="/admin/analytics"
              className={({ isActive }) =>
                `flex items-center py-3 px-3 gap-x-3 rounded-xl transition-all duration-200 hover:bg-gray-100 transition-all duration-200 ${
                  isActive ? " text-primary font-extrabold" : "text-gray-500"
                }`
              }
            >
              <MapPin weight="fill" size={20} />
              <p className="text-lg ">Dengue Mapping</p>
            </NavLink>
            <NavLink
              to="/admin/analytics"
              className={({ isActive }) =>
                `flex items-center py-3 px-3 gap-x-3 rounded-xl transition-all duration-200 hover:bg-gray-100 transition-all duration-200 ${
                  isActive ? " text-primary font-extrabold" : "text-gray-500"
                }`
              }
            >
              <CheckCircle weight="fill" size={20} />

              <p className="text-lg">Reports Verification</p>
            </NavLink>
            <NavLink
              to="/admin/analytics"
              className={({ isActive }) =>
                `flex items-center py-3 px-3 gap-x-3 rounded-xl transition-all duration-200 hover:bg-gray-100 transition-all duration-200 ${
                  isActive ? " text-primary font-extrabold" : "text-gray-500"
                }`
              }
            >
              <UsersThree weight="fill" size={30} />

              <p className="text-lg leading-5.5">
                Community Engagement & Awareness
              </p>
            </NavLink>
          </nav>
        </div>
        <div className="py-3 px-3">
          <Link className="font-bold text-gray-500 text-lg font-extrabold hover:text-red-400 transition-all duration-200">
            Logout
          </Link>
        </div>
      </aside>
      <section className="absolute top-0 left-0 right-0 flex flex-col justify-center w-full">
        <nav className=" flex justify-between px-7 py-6">
          <div className="rounded-full p-3 hover:bg-gray-100 transition-all duration-200">
            <List size={23} />
          </div>

          <div className="flex items-center gap-x-4">
            <div className="relative flex items-center">
              <input
                className="bg-gray-200 text-primary px-4 py-2 pr-10 rounded-2xl  focus:outline-none"
                placeholder="Search here..."
              />
              <MagnifyingGlass className="absolute right-4" size={16} />
            </div>
            <Link>
              {" "}
              <Envelope size={25} />
            </Link>
          </div>
        </nav>
      </section>
    </main>
  );
};

export default AdminLayout;
