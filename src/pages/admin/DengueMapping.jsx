import { DengueMap } from "@/components";

import { MapPinLine ,Circle, CheckCircle } from "phosphor-react";

const DengueMapping = () => {
  return (
    <main className="flex flex-col w-full ">
        <p className="flex justify-center text-5xl font-extrabold mb-12  text-center md:justify-start md:text-left md:w-[48%] ">
        Dengue Mapping
      </p>
      <div className="flex h-[50vh] mb-4">
        <DengueMap/>
      </div>
      <p className="text-left text-primary text-lg font-extrabold flex items-center gap-2 mb-3">
        <div className="text-success">
          <MapPinLine  size={16} />
        </div>
        Click on a Barangay to view details
      </p>
      <div className="grid grid-cols-10">
        <div className="col-span-4 border-2 border-error rounded-2xl flex flex-col p-4 gap-1">
          <p className="text-center font-semibold text-base-content">Selected Barangay - Dengue Overview</p>
          <p className="text-center font-bold text-error text-4xl mb-2 ">Barangay Holy Spirit</p>
          <p className="text-center font-semibold text-error text-lg uppercase mb-2 ">HIGH RISK AREA</p>
          <div className="w-[90%] mx-auto flex flex-col text-black gap-2">
            <p className=""><span className="font-bold">Status: </span> 30% Increase in Cases</p>
            <p className=""><span className="font-bold">Total Cases (Month): </span>  20</p>
            <p className=""><span className="font-bold">Recent Reports: </span>  </p>
            <div className="w-[80%] mx-auto mt-1">
              <div className="flex gap-2 items-center">
                <div><Circle size={16} color="red" weight="fill" /></div>
                <p><span className="font-semibold">March 3: </span> 2 new cases</p>
              </div>
              <div className="flex gap-2 items-center">
                <div><Circle size={16} color="red" weight="fill" /></div>
                <p><span className="font-semibold">March 3: </span> 1 new case</p>
              </div>
            </div>
            <p className=""><span className="text-primary font-bold">Interventions in Progress: </span>  </p>
            <div className="w-[80%] mx-auto mt-1">
              <div className="flex gap-2 items-start">
                <div className="text-success mt-[2px]"><CheckCircle size={16} /></div>
                <p><span className="font-semibold">March 10: </span> Package Intervention Scheduled</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="bg-primary rounded-full text-white px-4 py-1 text-[11px] hover:bg-primary/80 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer">
              View Full Report
            </button>
          </div>
        </div>
        <div className="col-span-6"></div>
      </div>
    </main>
  );
};

export default DengueMapping;
