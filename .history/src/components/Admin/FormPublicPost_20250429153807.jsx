import { useState } from "react";
import { CalendarBlank, Clock, Image, Plus, X } from "phosphor-react";

const FormPublicPost = () => {
  const [postType, setPostType] = useState("news");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postDate, setPostDate] = useState("");
  const [postTime, setPostTime] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const postTypes = [
    { id: "news", label: "News Updates" },
    { id: "prevention", label: "Prevention Tips" },
    { id: "announcement", label: "Official Announcements" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      postType,
      postTitle,
      postContent,
      postDate,
      postTime,
      images: images.length,
    });
    setPostTitle("");
    setPostContent("");
    setPostDate("");
    setPostTime("");
    setImages([]);
    setImagePreviews([]);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 8) {
      alert("Maximum 8 images allowed");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col rounded-xl overflow-hidden shadow-md border border-gray-200 bg-white h-full"
    >
      <div className="w-full bg-primary text-white text-center py-3">
        <p className="text-xl font-semibold">Public Information Posts</p>
      </div>

      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-2">
          <label className="font-medium text-primary font-semibold">
            Post Type <span className="text-error">*</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {postTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setPostType(type.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  postType === type.id
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-primary font-semibold">
            Title <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Enter post title..."
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-primary font-semibold">
            Content <span className="text-error">*</span>
          </label>
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Write your post content here..."
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none min-h-[120px]"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-medium text-primary font-semibold">
              Publish Date <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={postDate}
                onChange={(e) => setPostDate(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                required
              />
              <CalendarBlank
                className="absolute right-3 top-3.5 text-gray-500 pointer-events-none"
                size={18}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-primary font-semibold">
              Publish Time <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type="time"
                value={postTime}
                onChange={(e) => setPostTime(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                required
              />
              <Clock
                className="absolute right-3 top-3.5 text-gray-500 pointer-events-none"
                size={18}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-primary font-semibold">
            Upload Images (Max 8)
          </label>
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={images.length >= 8}
              />
              <Image size={24} className="text-gray-500" />
              <span className="text-gray-600">
                {images.length > 0
                  ? "Add more images"
                  : "Click to upload images"}
              </span>
              <Plus size={20} className="text-gray-500" />
            </label>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-error rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} className="text-white" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                      {images[index].name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex justify-center mt-4">
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dark transition-colors rounded-full font-semibold text-white py-2 px-8 text-lg shadow-md"
          >
            Publish Post
          </button>
        </div>
      </div>
    </form>
  );
};

export default FormPublicPost;
