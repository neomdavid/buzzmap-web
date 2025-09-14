import React, { useRef, useEffect } from "react";
import { IconX, IconQrcode } from "@tabler/icons-react";

const InstallAppModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);

  // Replace this with your actual APK download URL
  const apkDownloadUrl = "https://your-domain.com/buzzmap-app.apk";

  // QR code data - you can use a QR code generator service or library
  const qrCodeData = apkDownloadUrl;

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
      <div className="modal-box bg-white rounded-3xl shadow-3xl w-11/12 max-w-2xl max-h-[95vh] p-12 relative">
        <button
          className="absolute top-6 right-6 text-2xl font-semibold hover:text-gray-500 hover:cursor-pointer"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <IconQrcode size={40} className="text-white" />
            </div>
            <h2 className="text-4xl tracking-wide font-bold text-primary mb-3">
              Install BuzzMap Mobile App
            </h2>
            <p className="text-lg text-gray-600">
              Scan the QR code with your phone to download our mobile app
            </p>
          </div>

          <div className="space-y-6">
            {/* <div className="bg-info/10 border border-info/30 rounded-2xl p-6">
              <p className="font-bold text-lg text-primary mb-6 text-center">
                Scan QR Code with your phone:
              </p> */}

            {/* QR Code placeholder - you can replace this with a real QR code component */}
            <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center min-h-[250px]">
              <div className="text-center">
                <IconQrcode size={120} className="text-primary mx-auto mb-6" />
                <p className="text-lg font-semibold text-gray-700 mb-3">
                  QR Code for APK Download
                </p>
                <p className="text-sm text-gray-500 break-all bg-gray-50 p-3 rounded-lg">
                  {apkDownloadUrl}
                </p>
              </div>
              {/* </div> */}
            </div>

            <div className="bg-info/10 border border-info/30 rounded-2xl p-6">
              <p className="font-bold text-lg text-primary mb-4">
                Installation Instructions:
              </p>
              <ol className="text-base text-gray-700 text-left space-y-2">
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </span>
                  <span>Scan the QR code with your phone camera</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </span>
                  <span>
                    Enable "Install from Unknown Sources" in your phone settings
                  </span>
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
