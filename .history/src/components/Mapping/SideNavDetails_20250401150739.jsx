const SideNavDetails = () => {
  return (
    <aside
      className="flex flex-col justify-around items-center text-center py-4 text-white z-10000000 absolute bottom-0 h-[100vh] bg-primary w-[28vw] shadow-[10px_0px_10px_rgba(0,0,0,0.3)] px-5 
md:w-[35vw]   max-w-[370px] "
    >
      <div className="flex flex-col items-center">
        <LogoNamed theme="dark" iconSize="h-11 w-11" textSize="text-[30px]" />
        <CustomDropDown
          options={["Quezon City", "Manila", "Makati", "Pasig"]}
          onSelect={(value) => console.log("Selected location:", value)}
          className="mt-4 text-sm mb-4"
          fillColor="white"
        />
        <img
          src={UPBuilding}
          className="w-full object-cover rounded-2xl mb-4 md:h-[20vh]"
        />
        <p className="text-[27px] mr-4 ml-1 mb-3 tracking-wide leading-8 md:text-[23px]">
          Department of Chemical Engineering, University of the Philippines
          Diliman
        </p>
        <p className="text-[14px] font-light mr-4 ml-1 md:text-[12px]">
          J3X8+6Q6 University of the Philippines Diliman, T.H. Pardo de Tavera
          St, Extension, Quezon City, Metro Manila
        </p>
      </div>
      <div className="flex flex-col  ">
        <p className="text-[16px] font-semibold mb-2 md:text-[14px]">
          Number of Community Reports: 100
        </p>
        <div className="flex flex-col text-[14px]  ml-[-2px] font-light md:text-[13px]">
          <p>🦟 50 Breeding Sites Identified</p>
          <p>🏥 30 Confirmed Dengue Cases</p>
          <p>🕵️ 20 Suspected Cases Reported</p>
        </div>
      </div>
      <div className="flex flex-col items-center mx-2 gap-y-4 text-[12px] text-primary">
        <SecondaryButton
          text="Report a Dengue Case"
          className="h-[25%] w-full"
        />
        <SecondaryButton
          text="View Reports by the Community"
          className="h-[25%] w-full"
        />
        <SecondaryButton text="Prevention Tips" className="h-[25%] w-full" />
      </div>
      <div className="flex flex-col text-sm text-center font-light mx-4">
        <p>
          Heads up! Your data helps power community safety insights. Learn how
          we protect it in our
        </p>
        <p className="font-semibold italic underline">
          Privacy & Data Disclaimer.
        </p>
      </div>
    </aside>
  );
};

export default SideNavDetails;
