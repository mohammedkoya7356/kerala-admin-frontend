import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Card, Col, Row, Container } from 'react-bootstrap';
import './AboutAdmin.css';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/about`;

const AboutAdmin = () => {
  const [aboutData, setAboutData] = useState(null);
  const [heading, setHeading] = useState('');
  const [paragraph, setParagraph] = useState('');
  const [bgFile, setBgFile] = useState(null);
  const [cardTitles, setCardTitles] = useState({});
  const [cardFiles, setCardFiles] = useState({});
  const [cardData, setCardData] = useState([null, null]);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const res = await axios.get(API_URL);
      const data = res.data;
      setAboutData(data);
      setHeading(data.heading || '');
      setParagraph(data.paragraph || '');
      setCardData(data.cards?.length === 2 ? data.cards : [null, null]);
    } catch (err) {
      console.error('Error fetching about data:', err.message);
    }
  };

  const handleHeadingSave = async () => {
    try {
      await axios.put(`${API_URL}/heading`, { heading: heading.trim() });
      fetchAboutData();
      alert('✅ Heading updated');
    } catch (err) {
      console.error('Error saving heading:', err.message);
    }
  };

  const handleParagraphSave = async () => {
    try {
      await axios.put(`${API_URL}/paragraph`, { paragraph: paragraph.trim() });
      fetchAboutData();
      alert('✅ Paragraph updated');
    } catch (err) {
      console.error('Error saving paragraph:', err.message);
    }
  };

  const handleBackgroundUpload = async () => {
    if (!bgFile) return alert('Please select a background image');
    if (bgFile.size > 15 * 1024 * 1024) {
      return alert('❌ Max 15MB allowed.');
    }

    const formData = new FormData();
    formData.append('background', bgFile);

    try {
      await axios.put(`${API_URL}/background`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchAboutData();
      setBgFile(null);
      alert('✅ Background image uploaded');
    } catch (err) {
      console.error('Upload failed:', err.message);
      alert('❌ Upload failed');
    }
  };

  const handleCardSave = async (index) => {
    const formData = new FormData();
    const title = cardTitles[index]?.trim() || cardData[index]?.title || 'Untitled';
    formData.append('title', title);

    if (cardFiles[index]) {
      formData.append('image', cardFiles[index]);
    }

    try {
      await axios.post(`${API_URL}/card/${index}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchAboutData();
      setCardFiles((prev) => ({ ...prev, [index]: null }));
      alert(`✅ Card ${index + 1} updated`);
    } catch (err) {
      console.error(`Card ${index} save failed:`, err.message);
    }
  };

  const handleCardDelete = async (index) => {
    try {
      await axios.delete(`${API_URL}/card/${index}`);
      fetchAboutData();
      alert(`🗑️ Card ${index + 1} deleted`);
    } catch (err) {
      console.error(`Card ${index} delete failed:`, err.message);
    }
  };

  const getFullImagePath = (path) => {
    if (!path) return null;
    return `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
  };

  return (
    <Container className="py-4">
      <h2>🛠️ Manage About Section</h2>

      {/* Heading */}
      <Form.Group className="mb-3">
        <Form.Label>Heading</Form.Label>
        <Form.Control
          type="text"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
        />
        <Button className="mt-2" onClick={handleHeadingSave}>
          Save Heading
        </Button>
      </Form.Group>

      {/* Paragraph */}
      <Form.Group className="mb-3">
        <Form.Label>Paragraph</Form.Label>
        <Form.Control
          as="textarea"
          rows={5}
          value={paragraph}
          onChange={(e) => setParagraph(e.target.value)}
        />
        <Button className="mt-2" onClick={handleParagraphSave}>
          Save Paragraph
        </Button>
      </Form.Group>

      {/* Background Image Upload */}
      <Form.Group className="mb-4">
        <Form.Label>Background Image</Form.Label>
        {aboutData?.backgroundImage && (
          <div className="mb-2">
            <img
              src={getFullImagePath(aboutData.backgroundImage)}
              alt="Background"
              style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '10px' }}
              onError={(e) => (e.target.src = '/fallback-image.jpg')}
            />
          </div>
        )}
        <Form.Control
          type="file"
          accept="image/*"
          onChange={(e) => setBgFile(e.target.files[0])}
        />
        <Button className="mt-2" onClick={handleBackgroundUpload}>
          Upload Background
        </Button>
      </Form.Group>

      {/* Cards Section */}
      <h4 className="mt-4">Cards</h4>
      <Row>
        {[0, 1].map((idx) => {
          const card = cardData[idx] || {};
          return (
            <Col key={idx} sm={6} md={4} className="mb-4">
              <Card>
                {card.image && (
                  <Card.Img
                    variant="top"
                    src={getFullImagePath(card.image)}
                    style={{ height: '180px', objectFit: 'cover' }}
                    onError={(e) => (e.target.src = '/fallback-image.jpg')}
                  />
                )}
                <Card.Body>
                  <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={cardTitles[idx] ?? card.title ?? ''}
                      onChange={(e) =>
                        setCardTitles((prev) => ({ ...prev, [idx]: e.target.value }))
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mt-2">
                    <Form.Label>Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setCardFiles((prev) => ({ ...prev, [idx]: e.target.files[0] }))
                      }
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    className="mt-2"
                    onClick={() => handleCardSave(idx)}
                  >
                    Save Card
                  </Button>
                  {card.image && (
                    <Button
                      variant="danger"
                      className="mt-2 ms-2"
                      onClick={() => handleCardDelete(idx)}
                    >
                      Delete
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default AboutAdmin;
