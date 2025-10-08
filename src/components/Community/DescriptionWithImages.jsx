import { useState } from "react";
import { toastWarn } from "../../utils.jsx";

const DescriptionWithImages = ({
  images,
  onImageChange,
  description,
  onDescriptionChange,
}) => {
  const [fileError, setFileError] = useState("");

  // Define accepted image file types (JPG, PNG only)
  const acceptedImageTypes = ["image/jpeg", "image/jpg", "image/png"];

  const DESCRIPTION_MAX = 500;

  const validateFileType = (file) => {
    return acceptedImageTypes.includes(file.type);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFileError(""); // Clear previous errors

    if (files.length + images.length > 4) {
      toastWarn("You can only upload a maximum of 4 images.");
      return;
    }

    // Validate each file type
    const invalidFiles = files.filter((file) => !validateFileType(file));

    if (invalidFiles.length > 0) {
      const invalidFileNames = invalidFiles.map((file) => file.name).join(", ");
      const errorMessage = `The following files are not supported: ${invalidFileNames}. Only JPG and PNG files are allowed.`;
      setFileError(errorMessage);
      toastWarn(errorMessage);
      return;
    }

    // If all files are valid, add them
    onImageChange([...images, ...files]);
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImageChange(updatedImages);
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= DESCRIPTION_MAX) {
      onDescriptionChange(value);
    } else {
      // Hard-cap input and warn once per overflow action
      onDescriptionChange(value.slice(0, DESCRIPTION_MAX));
      toastWarn(`Description is limited to ${DESCRIPTION_MAX} characters.`);
    }
  };

  return (
    <div className="flex flex-col p-2 gap-2 ml-16">
      <div className="flex justify-between items-center">
        <span className="label-text mb-1 text-primary font-bold">
          Description
        </span>

        {/* Image Picker */}
        <label className="btn btn-md btn-outline cursor-pointer">
          📷 Add Images
          <input
            type="file"
            accept="image/jpeg,image/png"
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
        onChange={handleDescriptionChange}
        maxLength={DESCRIPTION_MAX}
      ></textarea>
      <div className="text-xs text-gray-500 self-end mt-[-6px]">
        {description?.length || 0}/{DESCRIPTION_MAX}
      </div>

      {/* File type information and error display */}
      <div className="text-sm text-gray-600">
        <p className="font-semibold">Upload guidelines</p>
        <ul className="list-disc ml-5">
          <li>Accepted types: JPG, PNG</li>
          <li>Up to 4 images; keep each under ~2MB</li>
          <li>Show the site clearly; avoid blurry images</li>
        </ul>
      </div>

      {/* Error message display */}
      {fileError && (
        <div className="alert alert-error text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{fileError}</span>
        </div>
      )}

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
