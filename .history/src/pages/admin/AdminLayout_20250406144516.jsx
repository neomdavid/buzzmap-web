import { House, UserCircle } from "phosphor-react";
import { LogoNamed } from "../../components";
import { NavLink } from "react-router-dom";

const AdminLayout = () => {
  return (
    <main className="flex ">
      <aside className="fixed flex flex-col top-0 bottom-0 w-90 shadow-sm py-8 px-8">
        <div className="w-full flex justify-center ml-[-8px]">
          <LogoNamed />
        </div>
        <div className="flex flex-col w-full items-center justify-center text-primary">
          <UserCircle size={80} weight="fill" className="mb-2" />
          <p className="text-3xl font-extrabold">Jane Doe</p>
          <p className="text-gray-500">janedoe@admin.buzzmap.com</p>
        </div>
        <nav className="flex flex-col justify-center w-full">
          <NavLink className="flex items-center bg-red-100 py-3 px-3 gap-x-4">
            <House weight="fill" size={20} />
            <p>Dashboard</p>
          </NavLink>
        </nav>
      </aside>
      <section className="text-8xl text-black ml-90">hello</section>
    </main>
  );
};

export default AdminLayout;
