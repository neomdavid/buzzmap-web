import { Link } from "react-router-dom";
import {
  FormPublicPost,
  FormDengueAlert,
  AdminPostsTable,
  AlertsTable
} from "../../../components";

const ActivePosts = () => {
  return (
    <main className="flex flex-col w-full z-10000">
      <p className="flex justify-center text-5xl font-extrabold mb-10 text-center md:justify-start md:text-left md:w-[78%]">
        Community Engagement and Awareness
      </p>

      <section className="flex flex-col">
        {/* First Row - Two Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-8">
          <FormPublicPost />
          <FormDengueAlert />
        </div>
      </section>

      <section className="flex flex-col gap-36">
        <div className="mt-12 h-135">
          <AdminPostsTable />
        </div>

        {/* Alerts Table */}
        <div className="mt-12 h-150">
          <AlertsTable />
        </div>
      </section>
    </main>
  );
};

export default ActivePosts; 