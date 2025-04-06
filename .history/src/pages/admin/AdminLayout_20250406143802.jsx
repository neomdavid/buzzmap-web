import { UserCircle } from "phosphor-react";
import { LogoNamed } from "../../components";

const AdminLayout = () => {
  return (
    <main className="flex ">
      <aside className="fixed flex flex-col top-0 bottom-0 w-90 shadow-sm py-8 px-8">
        <div className="w-full flex justify-center ml-[-8px]">
          <LogoNamed />
        </div>
        <div className="flex flex-col w-full items-center justify-center text-primary">
          <UserCircle size={80} weight="fill" className="mb-2" />
          <p>Jane Doe</p>
          <p>janedoe@admin.buzzmap.com</p>
        </div>
      </aside>
      <section className="text-8xl text-black ml-90">hello</section>
    </main>
  );
};

export default AdminLayout;
