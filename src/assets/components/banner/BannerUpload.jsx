import React, { useState } from 'react';
import { createBanner } from '../services/bannerService';
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  Alert,
  Image,
  Spinner,
} from 'react-bootstrap';

const BannerUpload = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      setVariant('danger');
      setMessage('❌ Invalid file type. Only JPG, JPEG, PNG allowed.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (file.size > maxSize) {
      setVariant('danger');
      setMessage('❌ File too large. Max 5MB allowed.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      await createBanner(data);
      setVariant('success');
      setMessage('✅ Banner uploaded successfully!');
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
    } catch (err) {
      setVariant('danger');
      setMessage(err.response?.data?.error || '❌ Upload failed.');
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
                      onChange={handleChange}
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
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col
                  md={3}
                  sm={6}
                  className="d-flex align-items-center justify-content-center"
                >
                  {previews[imgKey] ? (
                    <Image
                      src={previews[imgKey]}
                      rounded
                      fluid
                      alt={`Preview ${imgKey}`}
                      style={{ maxHeight: '100px', objectFit: 'cover' }
                      }
                      
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
              {loading ? <Spinner animation="border" size="sm" /> : 'Upload Banner'}
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default BannerUpload;
