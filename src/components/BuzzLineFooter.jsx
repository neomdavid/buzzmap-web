import { useState } from "react";
import logoLightBg from "../assets/logo_ligthbg.svg";
import logoDarkBg from "../assets/logo_darkbg.svg";

const BuzzLineFooter = () => {
  const [isTncOpen, setIsTncOpen] = useState(false);

  return (
    <footer className="flex flex-col border-t-2 border-primary w-[90%] py-12 mx-auto gap-12 text-primary">
      <div className="flex flex-col md:flex-row md:flex-wrap w-full items-center md:items-center gap-10">
        <div className="flex flex-col md:w-full lg:w-auto md:flex-row items-center md:justify-center gap-10 min-w-[220px] md:min-w-[320px] self-center">
          <img
            src={logoLightBg}
            className="w-40 min-w-[120px]"
            alt="BuzzMap logo on light background"
          />
          <img
            src={logoDarkBg}
            className="w-40 rounded-full min-w-[120px]"
            alt="BuzzMap logo on dark background"
          />
        </div>
        <div className="flex flex-col md:flex-row items-center lg:items-start   gap-6 md:gap-x-20 mx-auto lg:mx-0 lg:flex-1 lg:justify-end ">
          <div className="font-bold self-end text-md w-full text-left sm:w-auto">
            ©2025
            <br />
            <button
              type="button"
              onClick={() => setIsTncOpen(true)}
              className="font-normal underline text-nowrap hover:text-primary/80 focus:outline-none"
            >
              Terms and Conditions & Privacy Policy
            </button>
          </div>
        </div>
      </div>

      {isTncOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsTncOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 bg-white text-primary max-w-3xl w-[92%] max-h-[80vh] rounded-lg shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary/20">
              <p className="text-xl font-bold">
                Terms and Conditions & Privacy Policy
              </p>
              <button
                type="button"
                onClick={() => setIsTncOpen(false)}
                className="px-2 py-1 rounded hover:bg-primary/5"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto space-y-4 flex-1 min-h-0">
              <div>
                <p className="font-semibold">1. Acceptance of Terms</p>
                <p>
                  By accessing or using the BuzzMap application, you agree to be
                  bound by these Terms and Conditions. If you do not agree with
                  any part of these terms, you must not use the application.
                </p>
              </div>
              <div>
                <p className="font-semibold">2. User Responsibilities</p>
                <p>
                  You agree to use BuzzMap only for lawful purposes and in a way
                  that does not infringe the rights of, restrict, or inhibit
                  anyone else's use and enjoyment of the application.
                </p>
              </div>
              <div>
                <p className="font-semibold">3. Data Collection and Privacy</p>
                <p>
                  BuzzMap collects personal information to provide and improve
                  our services. By using the application, you consent to the
                  collection and use of information in accordance with our
                  Privacy Policy.
                </p>
              </div>
              <div>
                <p className="font-semibold">4. Dengue Reporting Accuracy</p>
                <p>
                  Users are responsible for providing accurate information when
                  reporting dengue cases. False or misleading reports may result
                  in account suspension.
                </p>
              </div>
              <div>
                <p className="font-semibold">5. Intellectual Property</p>
                <p>
                  All content, features, and functionality of BuzzMap are the
                  exclusive property of the developers and are protected by
                  international copyright laws.
                </p>
              </div>
              <div>
                <p className="font-semibold">6. Limitation of Liability</p>
                <p>
                  BuzzMap and its developers shall not be liable for any
                  indirect, incidental, special, consequential, or punitive
                  damages resulting from your use of or inability to use the
                  application.
                </p>
              </div>
              <div>
                <p className="font-semibold">7. Changes to Terms</p>
                <p>
                  We reserve the right to modify these terms at any time. Your
                  continued use of BuzzMap after any changes constitutes your
                  acceptance of the new terms.
                </p>
              </div>
              <div>
                <p className="font-semibold">8. Governing Law</p>
                <p>
                  These terms shall be governed by and construed in accordance
                  with the laws of the jurisdiction where the application is
                  developed.
                </p>
              </div>
              <div>
                <p className="font-semibold">Contact Information</p>
                <p>Quezon City Epidemiology & Surveillance Division (QCESD)</p>
                <p>Address: Quezon City Hall, Quezon City, Philippines</p>
                <p>Email: qcesd@quezoncity.gov.ph</p>
                <p>Phone: (02) 8928-4242</p>
                <p>Operating Hours: Monday to Friday, 8:00 AM - 5:00 PM</p>
                <p className="mt-2">
                  <span className="font-semibold">About QCESD:</span> The Quezon
                  City Epidemiology & Surveillance Division (QCESD) is dedicated
                  to protecting public health through disease surveillance,
                  outbreak investigation, and health promotion. We work
                  tirelessly to prevent and control the spread of diseases,
                  including dengue, through community education, vector control,
                  and rapid response to health threats.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-primary/20 flex justify-end">
              <button
                type="button"
                onClick={() => setIsTncOpen(false)}
                className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default BuzzLineFooter;
