import React, { useEffect, useState } from 'react';
import axios from 'axios';

const blocks = ['img1', 'img2', 'img3', 'img4', 'img5', 'img6'];
const MAX_SIZE_MB = 15;

// ✅ Consistent base URL from .env
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const GalleryAdmin = () => {
  const [gallery, setGallery] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const [titles, setTitles] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/gallery`);
      const dataMap = {};
      const titleMap = {};
      res.data.forEach((item) => {
        dataMap[item.block] = item;
        titleMap[item.block] = item.title || '';
      });
      setGallery(dataMap);
      setTitles(titleMap);
    } catch (err) {
      console.error('❌ Failed to load gallery:', err);
      setError('Failed to fetch gallery data.');
    }
  };

  const handleFileChange = (e, block) => {
    const file = e.target.files[0];
    if (file && file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`❌ File too large. Max allowed size is ${MAX_SIZE_MB}MB.`);
      return;
    }
    setSelectedFiles((prev) => ({ ...prev, [block]: file }));
  };

  const handleTitleChange = (e, block) => {
    setTitles((prev) => ({ ...prev, [block]: e.target.value }));
  };

  const uploadImage = async (block) => {
    const file = selectedFiles[block];
    const title = titles[block]?.trim();
    const existingTitle = gallery[block]?.title?.trim() || '';

    if (!file && title === existingTitle) {
      alert('⚠️ No changes detected.');
      return;
    }

    const formData = new FormData();
    if (file) formData.append('image', file);
    formData.append('block', block);
    formData.append('title', title);

    try {
      const res = await axios.post(`${BASE_URL}/api/gallery/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('✅ Upload success:', res.data);
      fetchGallery();
      setSelectedFiles((prev) => ({ ...prev, [block]: null }));
    } catch (err) {
      console.error('❌ Upload failed:', err.response?.data || err.message);
      alert(`Upload failed: ${err.response?.data?.error || 'Server error'}`);
    }
  };

  const deleteImage = async (block) => {
    const confirm = window.confirm(`Are you sure you want to delete ${block}?`);
    if (!confirm) return;

    try {
      await axios.delete(`${BASE_URL}/api/gallery/${block}`);
      fetchGallery();
    } catch (err) {
      console.error('❌ Delete failed:', err);
      alert('Failed to delete image.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Gallery Management</h2>
      {error && <p className="text-danger text-center">{error}</p>}
      <div className="row">
        {blocks.map((block) => (
          <div className="col-md-6 col-lg-4 mb-4" key={block}>
            <div className="card shadow-sm">
              {gallery[block]?.image ? (
                <img
                  src={`${BASE_URL}/uploads/gallery/${gallery[block].image}`}
                  className="card-img-top"
                  alt={block}
                  style={{ height: '200px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `${process.env.PUBLIC_URL}/fallback-image.jpg`;
                  }}
                />
              ) : (
                <div
                  className="card-img-top d-flex align-items-center justify-content-center bg-light"
                  style={{ height: '200px', fontSize: '1.5rem', color: '#ccc' }}
                >
                  No Image
                </div>
              )}
              <div className="card-body">
                <h5 className="card-title text-uppercase">{block}</h5>

                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Enter title"
                  value={titles[block] || ''}
                  onChange={(e) => handleTitleChange(e, block)}
                />

                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => handleFileChange(e, block)}
                />

                <div className="d-flex justify-content-between mt-3">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => uploadImage(block)}
                    disabled={
                      !selectedFiles[block] &&
                      titles[block]?.trim() === (gallery[block]?.title?.trim() || '')
                    }
                  >
                    {gallery[block] ? 'Update' : 'Upload'}
                  </button>

                  {gallery[block] && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteImage(block)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryAdmin;
