import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import "./ProfileEditFormForNgo.css";

import defaultAvatar from "../assets/images/pic.png";

const API_URL = "https://ashrafskillbridge.onrender.com/api";

function ProfileEditFormForNgo() {
  const [formData, setFormData] = useState({
    organization_name: "",
    organization_description: "",
    website_url: "",
    name: "",
    username: "",
    email: "",
    location: "",
    avatarUrl: defaultAvatar,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(defaultAvatar);

  const navigate = useNavigate();

  // Fetch NGO profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("Not authorized. Please log in.");
        setIsLoading(false);
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch profile");

        const user = data.user || data;
        setFormData({
          organization_name: user.organization_name || "",
          organization_description: user.organization_description || "",
          website_url: user.website_url || "",
          name: user.name || "",
          username: user.username || "",
          email: user.email || "",
          location: user.location || "",
          avatarUrl: user.avatarUrl || defaultAvatar,
        });

        setImagePreview(user.avatarUrl || defaultAvatar);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image selection
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Upload to Cloudinary
    const form = new FormData();
    form.append("avatar", file);

    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image");

      setFormData((prev) => ({ ...prev, avatarUrl: data.user.avatarUrl }));
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Failed to upload image. Try again.");
      setImagePreview(formData.avatarUrl || defaultAvatar);
    }
  };

  // Remove image
  const handleRemoveImage = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(`${API_URL}/users/profile/avatar`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove image");

      setImagePreview(defaultAvatar);
      setFormData((prev) => ({ ...prev, avatarUrl: defaultAvatar }));
    } catch (err) {
      console.error("Remove image error:", err);
      alert("Failed to remove image. Try again.");
    }
  };

  // Submit updated profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem("authToken");

    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      alert("Profile updated successfully!");
      navigate("/dashboard/profile");
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !formData.email) return <div className="loading-message">Loading form...</div>;

  return (
    <form onSubmit={handleSubmit} className="profile-form-container">
      {error && <p className="error-message">{error}</p>}

      <div className="container">
        {/* LEFT SIDE */}
        <div className="container-left">
          {/* Profile Picture */}
          <div className="form-pic">
            <img src={imagePreview} alt="profile Avatar" className="avatar-preview" />
          </div>

          {/* Avatar Buttons */}
            <div className="avatar-buttons-wrapper">
            <label className="avatar-edit-btn" htmlFor="avatar-upload">
                <FaEdit /> Change
            </label>
            <button type="button" className="avatar-remove-btn" onClick={handleRemoveImage}>
                Remove
            </button>
            </div>


          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            disabled={isLoading}
          />

          {/* ORGANIZATION INPUTS */}
          <div className="form">
            <label htmlFor="organization_name">Organisation</label>
            <input
              type="text"
              name="organization_name"
              id="organization_name"
              value={formData.organization_name}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="form">
            <label htmlFor="organization_description">Description</label>
            <textarea
              name="organization_description"
              id="organization_description"
              value={formData.organization_description}
              onChange={handleChange}
              rows={2}
              disabled={isLoading}
            />
          </div>

          <div className="form">
            <label htmlFor="website_url">Website</label>
            <input
              type="url"
              name="website_url"
              id="website_url"
              value={formData.website_url}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="container-right">
          <div className="form">
            <label htmlFor="name">Full Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} disabled={isLoading} />
          </div>

          <div className="form">
            <label htmlFor="username">Username</label>
            <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} disabled={isLoading} />
          </div>

          <div className="form">
            <label htmlFor="email">Email</label>
            <input type="email" name="email" id="email" value={formData.email} readOnly disabled />
          </div>

          <div className="form">
            <label htmlFor="location">Location</label>
            <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} disabled={isLoading} />
          </div>

          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default ProfileEditFormForNgo;
