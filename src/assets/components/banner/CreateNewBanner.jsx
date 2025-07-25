import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Image,
  Alert,
} from 'react-bootstrap';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/banner`;

const CreateNewBanner = () => {
  const [formData, setFormData] = useState({
    img1Heading: '',
    img1Subheading: '',
    img2Heading: '',
    img2Subheading: '',
    img3Heading: '',
    img3Subheading: '',
  });

  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({});
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('success');
  const [loading, setLoading] = useState(false);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];
    if (!file) return;

    const isValidType = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
    const isValidSize = file.size <= 15* 1024 * 1024; // 5MB

    if (!isValidType) {
      setVariant('danger');
      setMessage('❌ Only JPG, JPEG, or PNG files are allowed.');
      return;
    }

    if (!isValidSize) {
      setVariant('danger');
      setMessage('❌ File too large. Max 15MB allowed.');
      return;
    }

    setFiles((prev) => ({ ...prev, [name]: file }));
    setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => data.append(key, val));
    Object.entries(files).forEach(([key, file]) => data.append(key, file));

    try {
      const response = await axios.post(API_URL, data);
      setVariant('success');
      setMessage(response.data?.message || '✅ Banner uploaded successfully!');
      setFormData({
        img1Heading: '',
        img1Subheading: '',
        img2Heading: '',
        img2Subheading: '',
        img3Heading: '',
        img3Subheading: '',
      });
      setFiles({});
      setPreviews({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setVariant('danger');
      setMessage(err.response?.data?.error || '❌ Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Card className="p-4 shadow-sm">
        <h3 className="mb-4 fw-bold">Upload New Banner</h3>

        {message && <Alert variant={variant}>{message}</Alert>}

        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          {[1, 2, 3].map((i) => {
            const imgKey = `img${i}`;
            return (
              <Row key={i} className="mb-4 border-bottom pb-3">
                <Col md={12}>
                  <h5 className="mb-3">Image {i}</h5>
                </Col>

                <Col md={3} sm={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Choose Image</Form.Label>
                    <Form.Control
                      type="file"
                      name={imgKey}
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={3} sm={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Heading</Form.Label>
                    <Form.Control
                      type="text"
                      name={`${imgKey}Heading`}
                      placeholder={`Heading ${i}`}
                      value={formData[`${imgKey}Heading`]}
                      onChange={handleTextChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={3} sm={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Subheading</Form.Label>
                    <Form.Control
                      type="text"
                      name={`${imgKey}Subheading`}
                      placeholder={`Subheading ${i}`}
                      value={formData[`${imgKey}Subheading`]}
                      onChange={handleTextChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={3} sm={6} className="d-flex align-items-center justify-content-center">
                  {previews[imgKey] ? (
                    <Image
                      src={previews[imgKey]}
                      rounded
                      fluid
                        onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/fallback-image.jpg';
                      }}
                      alt={`Preview ${imgKey}`}
                      style={{ maxHeight: '100px', objectFit: 'cover' }}

                    
                    />
                  ) : (
                    <span className="text-muted">No preview</span>
                  )}
                </Col>
              </Row>
            );
          })}

          <div className="text-end">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Banner'}
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default CreateNewBanner;
