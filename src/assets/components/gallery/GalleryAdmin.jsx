import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GalleryAdmin = () => {
  const [gallery, setGallery] = useState([]);
  const [previews, setPreviews] = useState({});
  const [formData, setFormData] = useState({});

  const fetchGallery = async () => {
    try {
      const res = await axios.get('https://kerala-travel-2.onrender.com/api/gallery');
      setGallery(res.data);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleInputChange = (block, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [block]: {
        ...prev[block],
        [field]: value,
      },
    }));
  };

  const handleImageChange = (block, file) => {
    setPreviews((prev) => ({
      ...prev,
      [block]: URL.createObjectURL(file),
    }));
    handleInputChange(block, 'image', file);
  };

  const handleUpdate = async (block) => {
    const data = new FormData();
    if (formData[block]?.title) data.append('title', formData[block].title);
    if (formData[block]?.image) data.append('image', formData[block].image);

    try {
      await axios.put(`https://kerala-travel-2.onrender.com/api/gallery/${block}`, data);
      alert(`Block ${block} updated successfully`);
      fetchGallery();
    } catch (err) {
      console.error(`Update failed for ${block}:`, err);
      alert(`Failed to update ${block}`);
    }
  };

  const handleDelete = async (block) => {
    try {
      await axios.delete(`https://kerala-travel-2.onrender.com/api/gallery/${block}`);
      alert(`Block ${block} deleted successfully`);
      fetchGallery();
    } catch (err) {
      console.error(`Delete failed for ${block}:`, err);
      alert(`Failed to delete ${block}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Manage Gallery Images</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gallery.map((item) => (
          <div key={item.block} className="border p-4 rounded shadow">
            <h3 className="font-semibold mb-2 capitalize">Block: {item.block}</h3>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Title:</label>
              <input
                type="text"
                defaultValue={item.title}
                onChange={(e) => handleInputChange(item.block, 'title', e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(item.block, e.target.files[0])}
                className="w-full"
              />
              <img
                src={previews[item.block] || item.image}
                alt={`Preview ${item.block}`}
                className="mt-2 w-full h-40 object-cover rounded"
              />
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => handleUpdate(item.block)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Update
              </button>
              <button
                onClick={() => handleDelete(item.block)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryAdmin;
