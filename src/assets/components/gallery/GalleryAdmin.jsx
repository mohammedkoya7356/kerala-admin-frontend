import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GalleryAdmin = () => {
  const [gallery, setGallery] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const BASE_URL = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:5000';

  // Fetch gallery images
  const fetchGallery = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/gallery`);
      setGallery(res.data);
    } catch (err) {
      console.error('Error fetching gallery:', err);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Handle file selection
  const handleFileChange = (block, file) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [block]: file,
    }));
  };

  // Upload image to server
  const uploadImage = async (block) => {
    const file = selectedFiles[block];
    if (!file) return alert('Please select an image to upload.');

    const formData = new FormData();
    formData.append('block', block);
    formData.append('image', file);

    console.log("▶ Uploading to:", `${BASE_URL}/api/gallery/upload`);

    try {
      const res = await axios.post(`${BASE_URL}/api/gallery/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ Upload success:', res.data);
      fetchGallery();
      setSelectedFiles((prev) => ({ ...prev, [block]: null }));
    } catch (err) {
      console.error('❌ Upload failed:', err);
      alert(`Upload failed: ${err.response?.data?.error || err.message}`);
    }
  };

  // Delete image
  const deleteImage = async (block) => {
    try {
      await axios.delete(`${BASE_URL}/api/gallery/${block}`);
      fetchGallery();
    } catch (err) {
      console.error('Error deleting image:', err);
      alert('Delete failed.');
    }
  };

  return (
    <div className="gallery-admin p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Gallery</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => {
          const block = `img${i + 1}`;
          const imageBlock = gallery.find((item) => item.block === block);

          return (
            <div key={block} className="border p-4 rounded shadow bg-white">
              <h3 className="font-semibold mb-2 capitalize">{block}</h3>

              {imageBlock?.imageUrl ? (
                <img
                  src={imageBlock.imageUrl}
                  alt={`Gallery ${block}`}
                  className="w-full h-48 object-cover mb-2 rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/fallback-image.jpg';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-600 mb-2">
                  No image
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(block, e.target.files[0])}
                className="mb-2"
              />

              <div className="flex space-x-2">
                <button
                  onClick={() => uploadImage(block)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Upload
                </button>
                <button
                  onClick={() => deleteImage(block)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GalleryAdmin;
