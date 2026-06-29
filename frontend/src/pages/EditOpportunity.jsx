import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditOpportunity.css";


const API_URL = "https://ashrafskillbridge.onrender.com/api";

const EditOpportunity = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    duration: "",
    required_skills: "",
    status: "open",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load existing opportunity
  useEffect(() => {
    const loadOpportunity = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch(`${API_URL}/opportunities/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch");

        setFormData({
          title: data.opportunity.title,
          description: data.opportunity.description,
          location: data.opportunity.location,
          duration: data.opportunity.duration,
          required_skills: data.opportunity.required_skills?.join(", ") || "",
          status: data.opportunity.status,
        });
      } catch (err) {
        console.error("Error loading opportunity:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadOpportunity();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    const updatedData = {
      ...formData,
      required_skills: formData.required_skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const response = await fetch(`${API_URL}/opportunities/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update");

      alert("Opportunity updated successfully!");
      navigate("/dashboard/home"); // redirect back to opportunities list
    } catch (err) {
      console.error("Error updating opportunity:", err);
      alert("Update failed. Try again.");
    }
  };

  if (isLoading) return <p>Loading opportunity details...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="opportunity-container">
      <h1>Edit Opportunity</h1>

      <form className="opportunity-form" onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          required
        />

        <label>Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />

        <label>Duration</label>
        <input
          type="text"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
        />

        <label>Required Skills (comma separated)</label>
        <input
          type="text"
          name="required_skills"
          value={formData.required_skills}
          onChange={handleChange}
          placeholder="e.g., JavaScript, React, Node.js"
        />

        <label>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>

        <button type="submit" className="btn-accept">
          Update Opportunity
        </button>
      </form>
    </div>

    
  );
};

export default EditOpportunity;
