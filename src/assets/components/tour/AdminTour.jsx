import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const AdminTour = () => {
  const [tours, setTours] = useState({});
  const [updatedData, setUpdatedData] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const [previewImages, setPreviewImages] = useState({});

  const tourKeys = ["card1", "card2"];

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/tours`);
        const tourMap = {};
        res.data.forEach((tour) => {
          tourMap[tour.key] = tour;
        });
        setTours(tourMap);
        setUpdatedData(tourMap);
      } catch (err) {
        console.error("Error fetching tours:", err);
        alert("Failed to load tour packages");
      }
    };

    fetchTours();
  }, []);

  const handleChange = (key, field, value) => {
    setUpdatedData((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleFileChange = (key, file) => {
    setSelectedFiles((prev) => ({ ...prev, [key]: file }));
    if (file) {
      setPreviewImages((prev) => ({
        ...prev,
        [key]: URL.createObjectURL(file),
      }));
    }
  };

  const handleSave = async (key) => {
    const tourData = updatedData[key];
    if (!tourData?.title?.trim() || !tourData?.description?.trim() || !tourData?.price) {
      alert("Please fill in all fields before saving.");
      return;
    }

    const formData = new FormData();
    formData.append("title", tourData.title.trim());
    formData.append("description", tourData.description.trim());
    formData.append("price", tourData.price);

    if (selectedFiles[key]) {
      formData.append("image", selectedFiles[key]);
    }

    try {
      await axios.put(`${BASE_URL}/api/tours/${key}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(`✅ Tour ${key} updated successfully!`);
      window.location.reload();
    } catch (err) {
      console.error(`Error updating ${key}:`, err.response?.data || err.message);
      alert("❌ Update failed");
    }
  };

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Manage Tour Packages</h2>
      <Row className="g-4">
        {tourKeys.map((key) => (
          <Col md={6} key={key}>
            <Card className="p-3 shadow-sm">
              <Card.Img
                variant="top"
                src={
                  previewImages[key]
                    ? previewImages[key]
                    : tours[key]?.image?.startsWith("http")
                    ? tours[key].image
                    : `${BASE_URL}${tours[key]?.image}`
                }
                style={{ height: "220px", objectFit: "cover" }}
                onError={(e) => (e.target.src = "/fallback-image.jpg")}
              />
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={updatedData[key]?.title || ""}
                      onChange={(e) => handleChange(key, "title", e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={updatedData[key]?.description || ""}
                      onChange={(e) => handleChange(key, "description", e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Price (INR)</Form.Label>
                    <Form.Control
                      type="number"
                      value={updatedData[key]?.price || ""}
                      onChange={(e) => handleChange(key, "price", e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Change Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(key, e.target.files[0])}
                    />
                  </Form.Group>

                  <Button
                    variant="success"
                    onClick={() => handleSave(key)}
                    className="w-100 rounded-pill"
                  >
                    Update
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default AdminTour;
