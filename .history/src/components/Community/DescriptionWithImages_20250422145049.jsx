import { useRef } from "react";

function DescriptionWithImages({
  description,
  setDescription,
  selectedImages,
  setSelectedImages,
}) {
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col p-2 gap-2">
      <div className="flex justify-between items-center">
        <p className="font-bold">Description</p>

        <label className="btn btn-sm btn-outline cursor-pointer">
          📷 Add Images
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
      </div>

      <textarea
        className="p-2 rounded-md resize-none"
        rows={4}
        placeholder="What did you see? Is there anything you'd like to share?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>

      {selectedImages.length > 0 && (
        <div className="mt-2">
          <p className="font-semibold mb-1">Selected Images:</p>
          <ul className="p-2 rounded-md flex flex-wrap gap-2">
            {selectedImages.map((file, index) => (
              <li
                key={index}
                className="flex bg-base-200 items-center gap-2 bg-base-100 p-2 rounded shadow text-sm"
              >
                <span>{file.name}</span>
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
}

export default DescriptionWithImages;
