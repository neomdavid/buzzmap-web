import { LogoNamed } from "../../components";

const AdminLayout = () => {
  return (
    <main className="flex ">
      <aside className="fixed top-0 bottom-0 w-90 shadow-sm py-8 px-8">
        <LogoNamed textSize="text-[30px]" />
      </aside>
      <section className="text-8xl text-black ml-90">hello</section>
    </main>
  );
};

export default AdminLayout;
