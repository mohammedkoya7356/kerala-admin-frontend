import React, { useEffect, useState } from 'react';
import { Form, Button, Card, Col, Row, Container, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setAboutData(res.data);
      setHeading(res.data.heading || '');
      setParagraph(res.data.paragraph || '');

      const titles = {};
      (res.data.cards || []).forEach((card, idx) => {
        titles[idx] = card.title;
      });
      setCardTitles(titles);
    } catch (err) {
      console.error('Error fetching about data:', err);
      setError('Failed to load About data.');
    } finally {
      setLoading(false);
    }
  };

  const handleHeadingSave = async () => {
    try {
      await axios.put(`${API_URL}/heading`, { heading: heading.trim() });
      fetchAboutData();
      alert('✅ Heading updated');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to update heading.');
    }
  };

  const handleParagraphSave = async () => {
    try {
      await axios.put(`${API_URL}/paragraph`, { paragraph: paragraph.trim() });
      fetchAboutData();
      alert('✅ Paragraph updated');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to update paragraph.');
    }
  };

  const handleBackgroundUpload = async () => {
    if (!bgFile) return alert('Select a file.');
    if (bgFile.size > 15 * 1024 * 1024) return alert('Max 15MB allowed.');

    const formData = new FormData();
    formData.append('background', bgFile);

    try {
      await axios.put(`${API_URL}/background`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchAboutData();
      setBgFile(null);
      alert('✅ Background image updated');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to upload background image.');
    }
  };

  const handleCardSave = async (index) => {
    const formData = new FormData();
    formData.append('title', cardTitles[index]?.trim() || '');

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
      console.error(err);
      alert(`❌ Failed to update card ${index + 1}`);
    }
  };

  const handleCardDelete = async (index) => {
    if (!window.confirm(`Are you sure you want to delete card ${index + 1}?`)) return;

    try {
      await axios.delete(`${API_URL}/card/${index}`);
      fetchAboutData();
      alert(`🗑️ Card ${index + 1} deleted`);
    } catch (err) {
      console.error(err);
      alert('❌ Failed to delete card.');
    }
  };

  if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const cards = aboutData?.cards || [];

  return (
    <Container className="py-4">
      <h2>Manage About Section</h2>

      {/* Heading */}
      <Form.Group className="mb-3">
        <Form.Label>Heading</Form.Label>
        <Form.Control
          type="text"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
        />
        <Button className="mt-2" onClick={handleHeadingSave}>Update Heading</Button>
      </Form.Group>

      {/* Paragraph */}
      <Form.Group className="mb-3">
        <Form.Label>Paragraph</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          value={paragraph}
          onChange={(e) => setParagraph(e.target.value)}
        />
        <Button className="mt-2" onClick={handleParagraphSave}>Update Paragraph</Button>
      </Form.Group>

      {/* Background Image */}
      <Form.Group className="mb-4">
        <Form.Label>Background Image</Form.Label>
        {aboutData?.backgroundImage && (
          <div className="mb-2">
            <img
              src={`${BASE_URL}${aboutData.backgroundImage}`}
              alt="Background"
              style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '10px' }}
            />
          </div>
        )}
        <Form.Control
          type="file"
          accept="image/*"
          onChange={(e) => setBgFile(e.target.files[0])}
        />
        <Button className="mt-2" onClick={handleBackgroundUpload}>
          Update Background
        </Button>
      </Form.Group>

      {/* Cards */}
      <h4 className="mt-4">Cards</h4>
      <Row>
        {[0, 1].map((idx) => {
          const card = cards[idx] || {};
          return (
            <Col key={idx} sm={6} md={4} className="mb-4">
              <Card>
                {card.image && (
                  <Card.Img
                    variant="top"
                    src={`${BASE_URL}${card.image}`}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <Form.Group className="mb-2">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={cardTitles[idx] ?? ''}
                      onChange={(e) =>
                        setCardTitles((prev) => ({ ...prev, [idx]: e.target.value }))
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setCardFiles((prev) => ({ ...prev, [idx]: e.target.files[0] }))
                      }
                    />
                  </Form.Group>

                  <Button onClick={() => handleCardSave(idx)} variant="primary" className="me-2">
                    Update
                  </Button>

                  {card.image && (
                    <Button variant="danger" onClick={() => handleCardDelete(idx)}>
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
