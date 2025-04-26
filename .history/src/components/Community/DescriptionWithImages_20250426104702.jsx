import { useState } from "react";
import { toastWarn } from "../../utils.jsx";

const DescriptionWithImages = ({
  images,
  onImageChange,
  description,
  onDescriptionChange,
}) => {
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 4) {
      toastWarn("You can only upload a maximum of 4 images.");
      return;
    }
    onImageChange([...images, ...files]);
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImageChange(updatedImages);
  };

  return (
    <div className="flex flex-col p-2 gap-2 ml-16">
      <div className="flex justify-between items-center">
        <p className="font-bold text-xl">
          📝 Description <span className="text-error">*</span>
        </p>

        {/* Image Picker */}
        <label className="btn btn-md btn-outline cursor-pointer">
          📷 Add Images
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
      </div>

      {/* Textarea for description */}
      <textarea
        className="p-2 textarea textarea-bordered resize-none text-base w-full"
        rows={4}
        placeholder="What did you see? Is there anything you'd like to share?"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
      ></textarea>

      {/* Preview selected images */}
      {images.length > 0 && (
        <div className="mt-2">
          <p className="font-semibold mb-1">📸 Selected Images:</p>
          <ul className="p-2 rounded-md flex flex-wrap gap-2">
            {images.map((file, index) => (
              <li
                key={index}
                className="flex items-center gap-2 bg-base-100 p-2 rounded shadow text-sm"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-12 w-16 object-cover rounded"
                />
                <span className="truncate max-w-[100px]">{file.name}</span>
                <button
                  onClick={() => removeImage(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DescriptionWithImages;
