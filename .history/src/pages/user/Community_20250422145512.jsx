import { useState } from "react";
import { ArrowLeft } from "phosphor-react";
import profile1 from "../../assets/profile1.png";
import post1 from "../../assets/post1.jpg";
import post2 from "../../assets/post2.jpg";
import post3 from "../../assets/post3.jpg";
import post4 from "../../assets/post4.jpg";
import post5 from "../../assets/post5.jpg";

import {
  PostCard,
  CustomInput,
  Heading,
  FilterButton,
  AnnouncementCard,
  CustomSearchBar,
  SecondaryButton,
  DescriptionWithImages,
} from "../../components";

const Community = () => {
  const [showAside, setShowAside] = useState(false);
  const [city, setCity] = useState("");
  const [barangay, setBarangay] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reportType, setReportType] = useState("");

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates(`${latitude}, ${longitude}`);
      });
    }
  };
  const setNow = () => {
    const now = new Date();
    setDate(now.toISOString().split("T")[0]);
    setTime(now.toTimeString().split(" ")[0].slice(0, 5)); // HH:MM
  };

  return (
    <main className="pl-6 text-primary text-lg flex gap-x-6 max-w-[1350px] m-auto relative mt-12">
      <article className="flex-8 shadow-xl p-12 rounded-lg w-[100vw] lg:w-[65vw]">
        <CustomSearchBar />
        <section className="flex gap-x-2 font-semibold w-full mb-8">
          <FilterButton text="Popular" />
          <FilterButton text="Latest" />
          <FilterButton text="My Posts" />
        </section>
        <Heading
          text="Stay /ahead/ of dengue."
          className="text-[47px] sm:text-7xl lg:text-8xl text-center mb-4 leading-21"
        />
        <p className=" text-lg sm:text-xl sm:mt-0 text-center font-semibold text-primary mb-6">
          Real-Time Dengue Updates from the Community.
        </p>
        <section className="bg-base-200 px-8 py-5 rounded-lg mb-4">
          <p className="font-semibold text-lg text-center mb-3 lg:text-left">
            Share your experience with the Community
          </p>
          <hr className="text-accent mb-4" />
          <button
            onClick={() => document.getElementById("my_modal_4").showModal()}
            className="w-full hover:cursor-pointer"
          >
            <CustomInput profileSrc={profile1} showImagePicker={true} />
          </button>
        </section>
        {/* POST MODAL */}
        <dialog id="my_modal_4" className="modal text-lg text-primary">
          <div className="modal-box w-10/12 max-w-5xl">
            <form method="dialog">
              <button className="btn btn-sm text-3xl font-bold btn-circle btn-ghost absolute right-8 top-8.5">
                ✕
              </button>
            </form>
            <main className="p-3">
              <p className="text-4xl font-bold text-center">New Post</p>
              <hr className="text-gray-300 mt-4 mb-6" />
              <form className="flex flex-col">
                <section className="flex">
                  <div>
                    <img
                      src={profile1}
                      className="h-15 w-15 rounded-full mr-4"
                      alt="Profile"
                    />
                  </div>
                  <div className="flex flex-col w-full gap-4">
                    {/* 📍 Location */}
                    <div className="flex gap-2 w-full">
                      <p className="font-bold mt-1.5">
                        📍Location: <span className="text-error">*</span>
                      </p>
                      <div className="flex flex-1 gap-4 flex-col">
                        <div className="flex gap-2">
                          <select
                            className="flex-1 bg-base-200 px-5 py-2 rounded-full"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                          >
                            <option value="">Select City</option>
                            <option value="Taguig">Taguig</option>
                            <option value="Pasay">Pasay</option>
                            {/* Add more cities as needed */}
                          </select>

                          <select
                            className="flex-1 bg-base-200 px-5 py-2 rounded-full"
                            value={barangay}
                            onChange={(e) => setBarangay(e.target.value)}
                          >
                            <option value="">Select Barangay</option>
                            {city === "Taguig" && (
                              <>
                                <option value="Bagumbayan">Bagumbayan</option>
                                <option value="Ususan">Ususan</option>
                              </>
                            )}
                            {city === "Pasay" && (
                              <>
                                <option value="Barangay 183">
                                  Barangay 183
                                </option>
                                <option value="Barangay 201">
                                  Barangay 201
                                </option>
                              </>
                            )}
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="flex-1 bg-base-200 px-5 py-2 rounded-full"
                            placeholder="Latitude, Longitude"
                            value={coordinates}
                            onChange={(e) => setCoordinates(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={getCurrentLocation}
                            className="text-sm text-accent underline"
                          >
                            Use Current Location
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 🕑 Date & Time */}
                    <div className="flex flex-col w-full">
                      <div className="flex gap-2 items-center w-full">
                        <p className="font-bold">
                          🕑Date & Time: <span className="text-error">*</span>
                        </p>
                        <div className="flex-1 flex-col">
                          <div className="flex gap-2">
                            <input
                              type="date"
                              className="flex-1 bg-base-200 px-5 py-2 rounded-full"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                            />
                            <input
                              type="time"
                              className="flex-1 bg-base-200 px-5 py-2 rounded-full"
                              value={time}
                              onChange={(e) => setTime(e.target.value)}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={setNow}
                            className="mt-1 text-sm text-accent underline"
                          >
                            Use Current Date & Time
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ⚠️ Report Type */}
                    <div className="flex flex-col w-full">
                      <div className="flex gap-2 items-center w-full">
                        <p className="font-bold">
                          ⚠️Choose Report Type:{" "}
                          <span className="text-error">*</span>
                        </p>
                        <select
                          className="flex-1 bg-base-200 px-5 py-2 rounded-full"
                          value={reportType}
                          onChange={(e) => setReportType(e.target.value)}
                        >
                          <option value="">Choose Report Type</option>
                          <option value="Suspected Dengue Case">
                            Suspected Dengue Case
                          </option>
                          <option value="Breeding Ground Site">
                            Breeding Ground Site
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                <DescriptionWithImages />

                <div className="flex justify-end mt-6">
                  <SecondaryButton text="Share" className="h-11 w-[20%]" />
                </div>
              </form>
            </main>
          </div>
        </dialog>
        <section className="bg-base-200 px-8 py-6 rounded-lg flex flex-col gap-y-6">
          <PostCard
            profileImage={profile1}
            username="Anonymous Crocodile"
            timestamp="1 hour ago"
            location="Barangay Bagumbayan, Taguig City"
            dateTime="February 19, 2025 – 9:45 AM"
            reportType="Breeding Site Found"
            description="Discovered stagnant water in uncovered water containers behind a residential area. Mosquito larvae were visible. Urgent clean-up needed to prevent mosquito breeding."
            likes="24k"
            comments="24k"
            shares="5k"
          />

          <PostCard
            profileImage={profile1}
            username="Anonymous Hippo"
            timestamp="2 days ago"
            location="Pasay City Market Area"
            dateTime="February 17, 2025 – 3:20 PM"
            reportType="Suspected Dengue Case"
            description="Vendor reported experiencing high fever and body aches. Advised to seek medical attention. The market area has multiple potential breeding spots"
            likes="24k"
            comments="24k"
            shares="5k"
            images={[post1, post2, post3, post4, post5]}
          />
          <PostCard
            profileImage={profile1}
            username="Anonymous Crocodile"
            timestamp="1 hour ago"
            location="Barangay Bagumbayan, Taguig City"
            dateTime="February 19, 2025 – 9:45 AM"
            reportType="Breeding Site Found"
            description="Discovered stagnant water in uncovered water containers behind a residential area. Mosquito larvae were visible. Urgent clean-up needed to prevent mosquito breeding."
            likes="24k"
            comments="24k"
            shares="5k"
          />
          <PostCard
            profileImage={profile1}
            username="Anonymous Crocodile"
            timestamp="1 hour ago"
            location="Barangay Bagumbayan, Taguig City"
            dateTime="February 19, 2025 – 9:45 AM"
            reportType="Breeding Site Found"
            description="Discovered stagnant water in uncovered water containers behind a residential area. Mosquito larvae were visible. Urgent clean-up needed to prevent mosquito breeding."
            likes="24k"
            comments="24k"
            shares="5k"
          />
        </section>
      </article>

      <aside
        className={`bg-base-300 px-6 py-8 shadow-2xl rounded-sm overflow-y-scroll transition-transform duration-300 ease-in-out 
    fixed inset-y-0 right-0 w-[70vw] top-[68px] max-w-[70vw] pt-20 lg:pt-6 z-50 lg:z-0 lg:sticky lg:top-22 lg:h-[calc(100vh-1.5rem)] 
    lg:w-[35vw] lg:max-w-[450px] lg:shadow-sm ${
      showAside ? "translate-x-0" : "translate-x-full"
    } lg:translate-x-0`}
      >
        <AnnouncementCard />
        <button
          onClick={() => setShowAside(false)}
          className="absolute top-4 right-4 lg:hidden bg-primary text-white p-2 rounded-full hover:cursor-pointer hover:bg-white hover:text-primary transition-all duration-200"
        >
          <ArrowLeft size={18} className="rotate-180" />
        </button>
      </aside>

      {!showAside && (
        <button
          onClick={() => setShowAside(true)}
          className="fixed bottom-[40vh] right-[-1px] z-50 lg:hidden bg-primary text-white p-2 py-4 shadow-xl rounded-sm hover:cursor-pointer hover:bg-white hover:text-primary transition-all duration-200"
        >
          <ArrowLeft size={20} />
        </button>
      )}
    </main>
  );
};

export default Community;
