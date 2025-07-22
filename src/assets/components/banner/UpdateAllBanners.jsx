import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const UpdateAllBanners = () => {
  const { id: bannerId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    img1Heading: '',
    img1Subheading: '',
    img2Heading: '',
    img2Subheading: '',
    img3Heading: '',
    img3Subheading: ''
  });

  const [images, setImages] = useState({
    img1: null,
    img2: null,
    img3: null
  });

  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('success');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bannerId || bannerId.length !== 24) {
      setMessage('❌ Invalid banner ID in URL.');
      setVariant('danger');
      return;
    }

    const fetchBanner = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/banner`);
        const banner = res.data.find(b => b._id === bannerId);
        if (!banner) {
          setMessage('❌ Banner not found.');
          setVariant('danger');
          return;
        }

        setForm({
          img1Heading: banner.img1.heading,
          img1Subheading: banner.img1.subheading,
          img2Heading: banner.img2.heading,
          img2Subheading: banner.img2.subheading,
          img3Heading: banner.img3.heading,
          img3Subheading: banner.img3.subheading
        });
      } catch (err) {
        setMessage('❌ Failed to fetch banner data.');
        setVariant('danger');
      }
    };

    fetchBanner();
  }, [bannerId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      setMessage('❌ Invalid file type. Only JPG, JPEG, PNG allowed.');
      setVariant('danger');
      return;
    }

    if (file.size > maxSize) {
      setMessage('❌ File too large. Max 5MB allowed.');
      setVariant('danger');
      return;
    }

    setImages(prev => ({ ...prev, [name]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    Object.entries(images).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });

    try {
      const res = await axios.put(`${API_BASE}/api/banner/${bannerId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(res.data.message || '✅ Banner updated successfully!');
      setVariant('success');
      setTimeout(() => navigate('/admin'), 1500);
    } catch (error) {
      setMessage(error.response?.data?.error || '❌ Update failed.');
      setVariant('danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: '700px' }}>
      <h3 className="mb-3">Update All Banner Blocks</h3>

      {message && <Alert variant={variant}>{message}</Alert>}

      <Form onSubmit={handleSubmit} encType="multipart/form-data">
        {[1, 2, 3].map((num) => (
          <div key={num} className="mb-4 border-bottom pb-3">
            <h5>Image {num}</h5>

            <Form.Group className="mb-2">
              <Form.Control
                type="text"
                name={`img${num}Heading`}
                value={form[`img${num}Heading`]}
                onChange={handleInputChange}
                placeholder={`Heading ${num}`}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Control
                type="text"
                name={`img${num}Subheading`}
                value={form[`img${num}Subheading`]}
                onChange={handleInputChange}
                placeholder={`Subheading ${num}`}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="file"
                name={`img${num}`}
                onChange={handleImageChange}
                accept="image/*"
              />
            </Form.Group>
          </div>
        ))}

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Update All Banners'}
        </Button>
      </Form>
    </Container>
  );
};

export default UpdateAllBanners;
