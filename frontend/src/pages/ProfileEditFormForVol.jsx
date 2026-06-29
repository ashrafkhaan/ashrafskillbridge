import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileEditFormForVol.css';
import { FaEdit, FaArrowLeft } from 'react-icons/fa';
import defaultAvatar from '../assets/images/pic.png';

const API_URL = "https://ashrafskillbridge.onrender.com";

function ProfileEditFormForVol() {

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        location: '',
        bio: '',
        skills: [],
        avatarUrl: defaultAvatar
    });

    const [currentSkill, setCurrentSkill] = useState('');
    const [skillsList, setSkillsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imagePreview, setImagePreview] = useState(defaultAvatar);
    const [avatarFile, setAvatarFile] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem('authToken');

            if (!token) {
                setError("Not authorized. Please log in.");
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/users/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch profile data');
                }

                setFormData({
                    name: data.name || '',
                    username: data.username || '',
                    email: data.email || '',
                    location: data.location || '',
                    bio: data.bio || '',
                    skills: data.skills || [],
                    avatarUrl: data.avatarUrl || defaultAvatar
                });
                setImagePreview(data.avatarUrl || defaultAvatar);
                setSkillsList(data.skills || []);

            } catch (err) {
                setError(err.message);
                console.error("Fetch profile error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSkill = () => {
        const trimmedSkill = currentSkill.trim();
        if (trimmedSkill && !skillsList.includes(trimmedSkill)) {
            setSkillsList([...skillsList, trimmedSkill]);
            setCurrentSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setSkillsList(skillsList.filter(skill => skill !== skillToRemove));
    };

    const handleImageChange = (e) => {
        console.log(e);
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('authToken');

        if (!token) {
            setError("Not authorized. Please log in again.");
            setIsLoading(false);
            return;
        }

        // ✅ Use FormData for file + text
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('location', formData.location);
        formDataToSend.append('bio', formData.bio);
        formDataToSend.append('skills', JSON.stringify(skillsList));

        // Add image file (only if selected)
        const fileInput = document.getElementById('avatar-upload');
        if (fileInput && fileInput.files[0]) {
            formDataToSend.append('avatar', fileInput.files[0]);
        }

        try {
            const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formDataToSend // ✅ No JSON header
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to update profile');

            console.log('Profile updated successfully:', data);
            navigate('/dashboard/profile-vol');

        } catch (err) {
            console.error("Update Profile Error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
        };


        const handleRemoveAvatar = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return alert('Not authorized');

        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/users/profile/avatar`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to remove avatar');

            setImagePreview(defaultAvatar);
            setFormData(prev => ({ ...prev, avatarUrl: defaultAvatar }));
            alert('Photo removed successfully');
        } catch (err) {
            console.error('Remove avatar error:', err);
            alert(err.message);
        } finally {
            setIsLoading(false);
        }
        };

    if (isLoading && !formData.email) {
        return <div className="loading-message">Loading form...</div>;
    }

    return (
        <div className="profile-edit-page">
            <div className="page-header-back">
                <button onClick={() => navigate(-1)} className="back-arrow-btn">
                    <FaArrowLeft />
                </button>
                <h1>Edit Profile</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="profile-edit-card">

                    {error && <p className="error-message">{error}</p>}

                    <div className="avatar-edit-section">
                        <img src={imagePreview} alt="Avatar" className="avatar-preview" />

                        <div className="avatar-buttons-row">
                            {/* Change Photo */}
                            <label htmlFor="avatar-upload" className="avatar-edit-label">
                            <FaEdit />
                            <span>Change Photo</span>
                            </label>
                            <input
                            type="file"
                            id="avatar-upload"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            disabled={isLoading}
                            />

                            {/* Remove Photo */}
                            {imagePreview !== defaultAvatar && (
                            <button
                                type="button"
                                className="remove-avatar-btn"
                                onClick={handleRemoveAvatar}
                                disabled={isLoading}
                            >
                                Remove Photo
                            </button>
                            )}
                        </div>
                    </div>



                    <div className="form-fields-grid">
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter your username"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                disabled={true}
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="location">Location</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Enter your location"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group span-2">
                            <label htmlFor="bio">About (Bio)</label>
                            <textarea
                                id="bio"
                                name="bio"
                                rows="4"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell us a little about yourself..."
                                disabled={isLoading}
                            ></textarea>
                        </div>

                        <div className="form-group span-2">
                            <label htmlFor="skillInput">Skills</label>
                            <div className="skill-input-group">
                                <input
                                    type="text"
                                    id="skillInput"
                                    placeholder="e.g., Web Development"
                                    value={currentSkill}
                                    onChange={(e) => setCurrentSkill(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="add-skill-btn"
                                    onClick={handleAddSkill}
                                    disabled={isLoading}
                                >
                                    Add
                                </button>
                            </div>
                            <div className="skill-tags-list">
                                {skillsList.map((skill, index) => (
                                    <div key={index} className="skill-tag">
                                        <span>{skill}</span>
                                        <button type="button" onClick={() => handleRemoveSkill(skill)}>
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-footer-buttons">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate('/dashboard/profile-vol')}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="create-btn" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default ProfileEditFormForVol;
