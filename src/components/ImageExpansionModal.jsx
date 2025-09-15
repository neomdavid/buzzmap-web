import React from "react";
import { X } from "phosphor-react";

const ImageExpansionModal = ({ isOpen, onClose, image }) => {
  if (!isOpen || !image) return null;

  return (
    <dialog id="image-expansion-modal" className="modal z-[1000]" open={isOpen}>
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
      <form method="dialog" className="modal-backdrop z-[995]">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default ImageExpansionModal;
