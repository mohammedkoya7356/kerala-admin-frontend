import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AboutAdmin = () => {
  const [heading, setHeading] = useState('');
  const [paragraph, setParagraph] = useState('');
  const [cardTitles, setCardTitles] = useState({});
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = `${import.meta.env.VITE_API_URL}/api/about`;

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const R = await axios.get(API_URL);

        setHeading(R.data?.heading || '');
        setParagraph(R.data?.paragraph || '');

        const safeCards = Array.isArray(R.data?.cards)
          ? R.data.cards.filter(card => card && typeof card.title === 'string')
          : [];

        const titles = {};
        safeCards.forEach((card, index) => {
          titles[index] = card.title || '';
        });

        setCardTitles(titles);
        setCards(safeCards);

      } catch (err) {
        console.error('Error fetching about data:', err);
        setError('Failed to load About section.');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, [API_URL]); // ✅ ONLY this useEffect is needed

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container">
      <h2>About Admin Panel</h2>
      <form>
        <div className="mb-3">
          <label className="form-label">Heading</label>
          <input
            type="text"
            className="form-control"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Paragraph</label>
          <textarea
            className="form-control"
            rows="4"
            value={paragraph}
            onChange={(e) => setParagraph(e.target.value)}
          />
        </div>

        <h5>Card Titles</h5>
        {cards.map((card, index) => (
          <div className="mb-3" key={index}>
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
        ))}

        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default AboutAdmin;
