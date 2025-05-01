import {
  FormPublicPost,
  FormDengueAlert,
  FormCoordinationRequest,
} from "../../components";

const CEA = () => {
  return (
    <main className="flex flex-col w-full">
      <p className="flex justify-center text-5xl font-extrabold mb-10 text-center md:justify-start md:text-left md:w-[48%] ">
        Community Engagement and Awareness
      </p>

      <section className="flex flex-col">
        {/* First Row - Two Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-8">
          <FormPublicPost />
          <FormDengueAlert />
        </div>
        <div className="w-full">
          <FormCoordinationRequest />
        </div>

        {/* Second Row - Coordination Request Form */}
      </section>
    </main>
  );
};

export default CEA;
