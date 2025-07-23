import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';

const AboutAdmin = () => {
  const [aboutData, setAboutData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heading, setHeading] = useState('');
  const [paragraph, setParagraph] = useState('');
  const [cardTitles, setCardTitles] = useState({});

  const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/about`;
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      console.log("Fetching from:", API_URL);
      const res = await axios.get(API_URL);
      console.log("About data:", res.data);
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

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">About Page Management</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          {/* Heading Input */}
          <Form.Group className="mb-3">
            <Form.Label>Page Heading</Form.Label>
            <Form.Control
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
            />
          </Form.Group>

          {/* Paragraph Input */}
          <Form.Group className="mb-3">
            <Form.Label>Paragraph</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={paragraph}
              onChange={(e) => setParagraph(e.target.value)}
            />
          </Form.Group>

          {/* Background Image Preview */}
          <h5>Background Image Preview</h5>
          <div className="text-center mb-4">
            <img
              src={`${BASE_URL}${aboutData.backgroundImage}`}
              alt="Background"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/fallback.jpg';
              }}
              style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '10px' }}
            />
          </div>

          {/* Cards Preview */}
          <h5 className="mb-3">Cards</h5>
          <Row>
            {(aboutData.cards || []).map((card, index) => (
              <Col md={6} key={index}>
                <Card className="mb-4">
                  <Card.Img
                    variant="top"
                    src={`${BASE_URL}${card.image}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/fallback.jpg';
                    }}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Form.Group>
                      <Form.Label>Card Title</Form.Label>
                      <Form.Control
                        type="text"
                        value={cardTitles[index] || ''}
                        onChange={(e) =>
                          setCardTitles((prev) => ({
                            ...prev,
                            [index]: e.target.value,
                          }))
                        }
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* You can add a save/update button here */}
          <div className="text-center">
            <Button variant="primary" onClick={() => alert('Update functionality pending')}>
              Update About Section
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};

export default AboutAdmin;
