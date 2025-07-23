import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AboutAdmin = () => {
  const [heading, setHeading] = useState('');
  const [paragraph, setParagraph] = useState('');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [backgroundPreview, setBackgroundPreview] = useState('');
  const [cardTitles, setCardTitles] = useState({});
  const [cardImages, setCardImages] = useState({});
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = `${import.meta.env.VITE_API_URL}/api/about`;

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const res = await axios.get(API_URL);
        const data = res.data;

        setHeading(data?.heading || '');
        setParagraph(data?.paragraph || '');
        setBackgroundPreview(data?.backgroundImage || '');

        const safeCards = Array.isArray(data?.cards) ? data.cards.filter(Boolean) : [];

        const titles = {};
        const images = {};
        safeCards.forEach((card, index) => {
          titles[index] = card.title || '';
          images[index] = card.image || '';
        });

        setCardTitles(titles);
        setCardImages(images);
        setCards(safeCards);
      } catch (err) {
        console.error('Error fetching about data:', err);
        setError('Failed to load About section.');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, [API_URL]);

  const handleBackgroundChange = (e) => {
    const file = e.target.files[0];
    setBackgroundImage(file);
    setBackgroundPreview(URL.createObjectURL(file));
  };

  const handleCardImageChange = (e, index) => {
    const file = e.target.files[0];
    setCardImages((prev) => ({
      ...prev,
      [index]: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('heading', heading);
    formData.append('paragraph', paragraph);
    if (backgroundImage) {
      formData.append('backgroundImage', backgroundImage);
    }

    cards.forEach((_, index) => {
      formData.append(`cards[${index}][title]`, cardTitles[index] || '');
      if (cardImages[index] instanceof File) {
        formData.append(`cards[${index}][image]`, cardImages[index]);
      }
    });

    try {
      const res = await axios.put(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('About section updated successfully!');
    } catch (err) {
      console.error('Error updating About section:', err);
      alert('Update failed!');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-4">
      <h2>About Admin Panel</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Heading */}
        <div className="mb-3">
          <label className="form-label">Heading</label>
          <input
            type="text"
            className="form-control"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
          />
        </div>

        {/* Paragraph */}
        <div className="mb-3">
          <label className="form-label">Paragraph</label>
          <textarea
            className="form-control"
            rows="4"
            value={paragraph}
            onChange={(e) => setParagraph(e.target.value)}
          />
        </div>

        {/* Background Image */}
        <div className="mb-3">
          <label className="form-label">Background Image</label>
          <input type="file" className="form-control" onChange={handleBackgroundChange} />
          {backgroundPreview && (
            <img
              src={backgroundPreview}
              alt="Preview"
              style={{ width: '100%', marginTop: '10px', maxHeight: '250px', objectFit: 'cover' }}
            />
          )}
        </div>

        {/* Cards */}
        <h5>Cards</h5>
        {cards.map((_, index) => (
          <div key={index} className="mb-4 border p-3 rounded">
            <div className="mb-2">
              <label className="form-label">Card {index + 1} Title</label>
              <input
                type="text"
                className="form-control"
                value={cardTitles[index] || ''}
                onChange={(e) =>
                  setCardTitles({ ...cardTitles, [index]: e.target.value })
                }
              />
            </div>
            <div>
              <label className="form-label">Card {index + 1} Image</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => handleCardImageChange(e, index)}
              />
              {cardImages[index] && !(cardImages[index] instanceof File) && (
                <img
                  src={cardImages[index]}
                  alt={`Card ${index + 1}`}
                  style={{ width: '100%', marginTop: '10px', maxHeight: '200px', objectFit: 'cover' }}
                />
              )}
            </div>
          </div>
        ))}

        <button type="submit" className="btn btn-success mt-3">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default AboutAdmin;
