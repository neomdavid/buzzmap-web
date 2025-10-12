import React, { useRef, useEffect } from "react";
import { IconX, IconQrcode } from "@tabler/icons-react";
import mobileQr from "../assets/mobile_qr.png";

const InstallAppModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);

  // App download URL (Google Drive)
  const apkDownloadUrl =
    "https://drive.google.com/file/d/17qeWMdWSrnpyVHm2K5MHos50xCjScIbP/view?fbclid=IwY2xjawNYvPdleHRuA2FlbQIxMQABHjAFb63EOrqjho65H6Lv7GmHAiBGJ0odFRC1r1TOggTejo7uY8kaV6O6fxjV_aem_jPLz_kNT-GBfufb3B-ZP0A";

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.showModal();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={modalRef}
      className="modal transition-transform duration-300 ease-in-out"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box bg-white rounded-3xl shadow-3xl w-11/12 max-w-3xl max-h-[95vh] p-0 relative overflow-hidden">
        <button
          className="absolute top-5 right-5 text-2xl font-semibold hover:text-gray-500 hover:cursor-pointer z-10"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Header band (subtle) */}
        <div className="relative bg-white px-8 pt-12 pb-8 text-primary text-center border-b border-base-200">
          <div className="w-18 h-18 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <IconQrcode size={40} className="text-primary" />
          </div>
          <h2 className="text-3xl tracking-wide font-extrabold mb-2">
            Install BuzzMap Mobile App
          </h2>
          <p className="text-gray-600">
            Scan the QR code with your phone to download our mobile app
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary px-4 py-2 rounded-xl text-sm">
            <span className="font-semibold mr-[-3px]">Better experience</span>
            <span className="opacity-90">
              on your phone with offline-friendly UI
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* QR Card */}
            <div className="rounded-2xl border border-primary/20 shadow-sm p-6 flex flex-col justify-center">
              <div className="text-center">
                <img
                  src={mobileQr}
                  alt="BuzzMap mobile app QR code"
                  className="mx-auto mb-1 w-60 h-60 object-contain"
                />
                <p className="text-lg font-semibold text-primary mb-2">
                  QR Code for APK Download
                </p>
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Android Only
                </div>
                <p className="text-sm text-gray-600 ">or</p>
                <a
                  href={apkDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline bg-gray-50 p-3 rounded-lg inline-block font-medium"
                >
                  Click here to download
                </a>
              </div>
            </div>

            {/* Instructions Card */}
            <div className="rounded-2xl bg-base-100 border border-base-200 shadow-sm p-6">
              <p className="font-bold text-lg text-primary mb-4">
                Installation Steps
              </p>
              <ol className="text-base text-gray-700 text-left space-y-3">
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </span>
                  <span>
                    Scan the QR code with your phone camera or visit the link
                    below to open the download page
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </span>
                  <span>Enable "Install from Unknown Sources" in settings</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </span>
                  <span>Follow the download and installation prompts</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default InstallAppModal;
