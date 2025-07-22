import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
import Footer from "../Footer/Footer";
import "./TourPackages.css";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const TourPackages = () => {
  const [packages, setPackages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    people: "",
  });

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/tours`);
        setPackages(res.data);
      } catch (error) {
        console.error("Failed to fetch tour packages:", error);
      }
    };
    fetchPackages();
  }, []);

  const handleBookClick = (pkg) => {
    setSelectedPackage(pkg);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedPackage(null);
    setFormData({ name: "", phone: "", date: "", people: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const booking = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      date: formData.date,
      people: formData.people,
      package: selectedPackage?.title || "Unknown Package",
    };

    try {
      await axios.post(`${BASE_URL}/api/bookings`, booking);
      alert("✅ Booking submitted successfully!");
      handleClose();
    } catch (err) {
      console.error("Booking failed:", err);
      alert("❌ Failed to submit booking. Please try again.");
    }
  };

  return (
    <div className="tour-packages-wrapper">
      {/* Hero Section */}
      <div className="tour-hero d-flex align-items-center justify-content-center text-white text-center">
        <div className="overlay"></div>
        <h1 className="display-4 fw-bold position-relative z-1">Explore Our Tour Packages</h1>
      </div>

      {/* Tour Packages */}
      <Container className="py-5">
        <Row className="g-4">
          {packages.map((pkg) => (
            <Col md={6} key={pkg.key}>
              <Card className="h-100 shadow-sm rounded-4 overflow-hidden">
                <Card.Img
                  variant="top"
                  src={`${BASE_URL}${pkg.image}`}
                  alt={pkg.title}
                  style={{ height: "240px", objectFit: "cover" }}
                  onError={(e) => (e.target.src = "/fallback-image.jpg")}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fw-bold">{pkg.title}</Card.Title>
                  <Card.Text>{pkg.description}</Card.Text>
                  <h5 className="text-success fw-semibold">₹ {pkg.price}</h5>
                  <Button
                    onClick={() => handleBookClick(pkg)}
                    className="mt-auto btn btn-primary rounded-pill"
                  >
                    Book Now →
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Booking Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Book: {selectedPackage?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Your Name</Form.Label>
              <Form.Control
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                required
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Travel Date</Form.Label>
              <Form.Control
                required
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>No. of People</Form.Label>
              <Form.Control
                required
                type="number"
                min="1"
                name="people"
                value={formData.people}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Button variant="success" type="submit" className="w-100">
              Confirm Booking
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Footer />
    </div>
  );
};

export default TourPackages;
