import { FormPublicPost, FormDengueAlert } from "../../components";
const CEA = () => {
  return (
    <main className="flex flex-col w-full max-w-7xl mx-auto p-4 md:p-6">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center md:text-left text-gray-800">
        Community Engagement and Awareness
      </h1>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormDengueAlert />
        <FormPublicPost />
      </section>
    </main>
  );
};

export default CEA;
