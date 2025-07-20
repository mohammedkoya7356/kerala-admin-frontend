import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';

// ✅ Base URL from environment
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ✅ Normalize image path for correct usage
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  const cleaned = imagePath.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${API_BASE}/${cleaned}`;
};

const BannerList = () => {
  const [banners, setBanners] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/banner`);
      setBanners(res.data);
    } catch (err) {
      console.error('Failed to fetch banners:', err);
      setMessage('❌ Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await axios.delete(`${API_BASE}/api/banner/${id}`);
      setMessage('✅ Banner deleted successfully');
      fetchBanners();
    } catch (err) {
      setMessage(err.response?.data?.error || '❌ Failed to delete banner');
    }
  };

  const handleEditFull = (id) => {
    navigate(`/admin/update-banner/${id}`);
  };

  if (loading) {
    return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Manage Banners</h3>
      </div>

      {message && (
        <Alert variant={message.startsWith('✅') ? 'success' : 'danger'}>{message}</Alert>
      )}

      {banners.length === 0 ? (
        <p className="text-muted">No banners found.</p>
      ) : (
        banners.map((banner) => (
          <Card key={banner._id} className="mb-4 shadow-sm">
            <Card.Body>
              <Row>
                {[1, 2, 3].map((i) => {
                  const blockKey = `img${i}`;
                  const block = banner[blockKey];
                  const imageUrl = getImageUrl(block?.image);

                  return (
                    <Col md={4} key={blockKey} className="mb-3">
                      <Card className="h-100">
                        {imageUrl ? (
                          <Card.Img
                            variant="top"
                            src={imageUrl}
                            height="180"
                            style={{ objectFit: 'cover' }}
                            alt={`Banner Block ${i}`}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/fallback.jpg'; // optional fallback image
                            }}
                          />
                        ) : (
                          <div
                            className="bg-light d-flex align-items-center justify-content-center text-muted"
                            style={{ height: '180px' }}
                          >
                            No image
                          </div>
                        )}
                        <Card.Body>
                          <Card.Title className="fw-semibold">{block?.heading || 'No Heading'}</Card.Title>
                          <Card.Text>{block?.subheading || 'No Subheading'}</Card.Text>
                          <Link
                            to={`/edit/${banner._id}/${blockKey}`}
                            className="btn btn-outline-primary btn-sm"
                          >
                            Edit Block {i}
                          </Link>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <Button variant="warning" onClick={() => handleEditFull(banner._id)}>
                  Edit Full Banner
                </Button>
                <Button variant="danger" onClick={() => handleDelete(banner._id)}>
                  Delete Banner
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))
      )}
    </div>
  );
};

export default BannerList;
