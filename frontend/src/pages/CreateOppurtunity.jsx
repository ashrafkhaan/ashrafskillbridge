import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateOppurtunity.css'; 
import { FaArrowLeft } from 'react-icons/fa'; 

const API_URL = "https://ashrafskillbridge.onrender.com";

const CreateOpportunity = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '',
        location: '',
        status: 'open'
    });

    const [currentSkill, setCurrentSkill] = useState('');
    const [skillsList, setSkillsList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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

        const opportunityData = {
            title: formData.title,
            description: formData.description,
            duration: formData.duration,
            location: formData.location,
            status: formData.status,
            required_skills: skillsList
        };

        try {
            const response = await fetch(`${API_URL}/opportunities`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(opportunityData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to create opportunity');

            navigate('/dashboard/applications');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="create-opportunity-page">
            <div className="page-header-back">
                <button className="back-arrow-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft />
                </button>
                <h1>Create New Opportunity</h1>
            </div>

            <div className="form-card">
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="e.g. Website Redesign"
                            value={formData.title}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            rows="3"
                            placeholder="Provide details about the opportunity"
                            value={formData.description}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Required Skills</label>
                        <div className="required-input-group">
                            <input
                                type="text"
                                placeholder="e.g. Web Development"
                                value={currentSkill}
                                onChange={(e) => setCurrentSkill(e.target.value)}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="add-skill-btn btn-small"
                                onClick={handleAddSkill}
                                disabled={isLoading}
                            >
                                Add
                            </button>
                        </div>
                        <div className="skills-list">
                            {skillsList.map((skill, idx) => (
                                <div key={idx} className="skill-tag">
                                    <span>{skill}</span>
                                    <button type="button" onClick={() => handleRemoveSkill(skill)}>
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="duration">Duration</label>
                            <input
                                type="text"
                                id="duration"
                                name="duration"
                                placeholder="e.g. 2–3 weeks, Ongoing"
                                value={formData.duration}
                                onChange={handleChange}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="location">Location</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                placeholder="e.g. New York, NY"
                                value={formData.location}
                                onChange={handleChange}
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            disabled={isLoading}
                        >
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    <div className="form-footer-buttons">
                        <button type="button" className="cancel-btn" onClick={() => navigate(-1)} disabled={isLoading}>
                            Cancel
                        </button>
                        <button type="submit" className="create-btn" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateOpportunity;
