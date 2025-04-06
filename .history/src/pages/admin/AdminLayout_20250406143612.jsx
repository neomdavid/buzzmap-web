import { UserCircle } from "phosphor-react";
import { LogoNamed } from "../../components";

const AdminLayout = () => {
  return (
    <main className="flex ">
      <aside className="fixed flex flex-col top-0 bottom-0 w-90 shadow-sm py-8 px-8">
        <div className="w-full flex justify-center ml-[-8px]">
          <LogoNamed />
        </div>
        <div className="flex w-full justify-center">
          <UserCircle size={70} />
        </div>
      </aside>
      <section className="text-8xl text-black ml-90">hello</section>
    </main>
  );
};

export default AdminLayout;
