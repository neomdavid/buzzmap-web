import { FormPublicPost, FormDengueAlert } from "../../components";
const CEA = () => {
  return (
    <main className="flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-4  text-center md:justify-start md:text-left md:w-[48%] ">
        Community Engagement and Awareness
      </p>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormDengueAlert />
        <FormPublicPost />
      </section>
    </main>
  );
};

export default CEA;
