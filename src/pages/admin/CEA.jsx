import {
  FormPublicPost,
  FormDengueAlert,
  FormCoordinationRequest,AdminPostsTable,AlertsTable
} from "../../components";
import { useGetAllAdminPostsQuery, useGetAllAlertsQuery } from "../../api/dengueApi";
import { useSelector } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import { useMemo, useRef } from "react";
import { useDeleteAdminPostMutation, useUpdateAdminPostMutation } from "../../api/dengueApi";
import { useState } from "react";

const EditAlertModal = ({ alert, onClose, onSave }) => {
  const [form, setForm] = useState(alert);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="modal">
      <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
        <input name="severity" value={form.severity} onChange={handleChange} />
        {/* ...other fields... */}
        <button type="submit">Save</button>
        <button onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

const CEA = () => {
  const token = useSelector((state) => state.auth.token);

  // Pass token in headers for adminPosts (if your baseQuery doesn't do this automatically)
  const { data: adminPosts, isLoading: loadingPosts } = useGetAllAdminPostsQuery(undefined, {
    skip: !token,
  });
  const { data: alerts, isLoading: loadingAlerts } = useGetAllAlertsQuery();
  console.log("alerts", alerts, "loadingAlerts", loadingAlerts);
  

  return (
    <main className="flex flex-col w-full  z-10000">
      <p className="flex justify-center text-5xl font-extrabold mb-10 text-center md:justify-start md:text-left md:w-[48%] ">
        Community Engagement and Awareness
      </p>

      <section className="flex flex-col">
        {/* First Row - Two Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-8">
          <FormPublicPost />
          <FormDengueAlert />
        </div>
        {/* <div>
          <FormCoordinationRequest />
        </div> */}
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

      {/* Admin Posts Table */}
   
    </main>
  );
};

export default CEA;
