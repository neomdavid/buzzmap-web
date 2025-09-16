import React, { useEffect, useRef } from "react";
import { X } from "phosphor-react";

const ImageExpansionModal = ({ isOpen, onClose, image }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialogEl = dialogRef.current;
    if (!dialogEl) return;

    if (isOpen && image) {
      // Use native modal top-layer so it appears above any other dialog
      if (!dialogEl.open) {
        try {
          dialogEl.showModal();
        } catch (e) {
          // Fallback if already open
        }
      }
    } else if (dialogEl.open) {
      dialogEl.close();
    }

    return () => {
      if (dialogEl && dialogEl.open) dialogEl.close();
    };
  }, [isOpen, image]);

  return (
    <dialog ref={dialogRef} id="image-expansion-modal" className="modal">
      <div className="modal-box w-auto max-w-[90vw] max-h-[90vh] p-2 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4  text-primary">
          <div className="flex items-center gap-4">
            <p className="text-2xl font-extrabold">Image Preview</p>
          </div>
          <button
            className="btn btn-circle btn-ghost btn-sm text-primary hover:bg-white/20"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Image Container */}
        <div className="relative flex items-center justify-center">
          {/* Main Image */}
          <div className="flex items-center justify-center p-4">
            <img
              src={image}
              alt="Expanded view"
              className="w-auto h-auto max-w-[calc(90vw-3rem)] max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default ImageExpansionModal;
