import React, { useEffect, useState } from "react";
import axios from "axios";

const GalleryAdmin = () => {
  const [gallery, setGallery] = useState([]);
  const [previews, setPreviews] = useState({});

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await axios.get("https://kerala-travel-2.onrender.com/api/gallery");
      setGallery(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleInputChange = (e, block) => {
    const { name, value, files } = e.target;
    setGallery((prev) =>
      prev.map((item) =>
        item.block === block
          ? {
              ...item,
              [name]: name === "image" ? files[0] : value,
            }
          : item
      )
    );

    if (name === "image" && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({
          ...prev,
          [block]: reader.result,
        }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleUpdate = async (block) => {
    const item = gallery.find((g) => g.block === block);
    const formData = new FormData();
    formData.append("title", item.title);
    if (item.image instanceof File) {
      formData.append("image", item.image);
    }

    try {
      await axios.put(
        `https://kerala-travel-2.onrender.com/api/gallery/${block}`,
        formData
      );
      alert(`${block} updated successfully.`);
      fetchGallery();
    } catch (err) {
      console.error(`Update failed for ${block}:`, err);
      alert(`Failed to update ${block}`);
    }
  };

  return (
    <div className="gallery-admin p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Gallery</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gallery.map((item) => (
          <div
            key={item.block}
            className="p-4 border rounded-xl shadow bg-white"
          >
            <h3 className="text-lg font-semibold capitalize mb-2">
              {item.block}
            </h3>

            <img
              src={previews[item.block] || item.image}
              alt={item.title}
              className="w-full h-48 object-cover mb-3 rounded"
            />

            <input
              type="text"
              name="title"
              value={item.title}
              onChange={(e) => handleInputChange(e, item.block)}
              className="border p-2 w-full mb-2 rounded"
              placeholder="Title"
            />

            <input
              type="file"
              name="image"
              onChange={(e) => handleInputChange(e, item.block)}
              className="mb-2"
            />

            <button
              onClick={() => handleUpdate(item.block)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Update
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryAdmin;
