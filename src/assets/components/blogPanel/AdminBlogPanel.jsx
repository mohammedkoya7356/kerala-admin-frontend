import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Button, Form, Spinner } from "react-bootstrap";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const AdminBlogPanel = () => {
  const [blogs, setBlogs] = useState([]);
  const [formData, setFormData] = useState({ title: "", description: "", img: null });
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/blogs`);
      setBlogs(res.data);
    } catch (err) {
      console.error("Error fetching blogs", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "img") {
      const file = files[0];
      if (file && file.size > 15 * 1024 * 1024) {
        alert("Image too large. Please upload a file smaller than 15MB.");
        return;
      }
      setFormData((prev) => ({ ...prev, img: file }));
      if (file) setPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      return alert("Please fill in both title and description.");
    }

    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    if (formData.img) form.append("img", formData.img);

    try {
      setIsSubmitting(true);
      const url = editingId
        ? `${BASE_URL}/api/blogs/${editingId}`
        : `${BASE_URL}/api/blogs`;
      const method = editingId ? axios.put : axios.post;

      await method(url, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFormData({ title: "", description: "", img: null });
      setEditingId(null);
      setPreview("");
      fetchBlogs();
    } catch (err) {
      console.error("Failed to submit blog:", err.response?.data || err.message);
      alert("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (blog) => {
    setFormData({ title: blog.title, description: blog.description, img: null });
    setEditingId(blog._id);
    setPreview(`${BASE_URL}${blog.img}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/blogs/${id}`);
      fetchBlogs();
    } catch (err) {
      console.error("Failed to delete blog", err);
    }
  };

  return (
    <Container className="py-4">
      <h3 className="mb-4">Manage Travel Blogs</h3>

      {/* Blog Form */}
      <Form onSubmit={handleSubmit} encType="multipart/form-data">
        <Row className="g-3">
          <Col md={4}>
            <Form.Group controlId="formImage">
              <Form.Label>Blog Image</Form.Label>
              <Form.Control
                type="file"
                name="img"
                accept="image/*"
                onChange={handleInputChange}
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-2"
                  style={{ width: "100%", borderRadius: "8px" }}
                  onError={(e) => (e.target.src = "/fallback.jpg")}
                />
              )}
            </Form.Group>
          </Col>

          <Col md={8}>
            <Form.Group controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formDesc" className="mt-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="mt-3"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Submitting..."
                : editingId
                ? "Update Blog"
                : "Create Blog"}
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Blog List */}
      <hr className="my-4" />
      <Row className="g-4">
        {blogs.map((blog) => (
          <Col md={4} key={blog._id}>
            <Card className="h-100 shadow-sm">
              <Card.Img
                variant="top"
                src={`${BASE_URL}${blog.img}`}
                onError={(e) => (e.target.src = "/fallback-image.jpg")}
                style={{ height: "200px", objectFit: "cover" }}
              />
              <Card.Body>
                <Card.Title>{blog.title}</Card.Title>
                <Card.Text>{blog.description}</Card.Text>
              </Card.Body>
              <Card.Footer className="d-flex justify-content-between">
                <Button variant="outline-primary" size="sm" onClick={() => handleEdit(blog)}>
                  Edit
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(blog._id)}>
                  Delete
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default AdminBlogPanel;
