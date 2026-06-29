import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './RegisterForNgo.css'; 
import logo from '../assets/images/logo.png';
import sideImage from '../assets/images/Home.jpg';

const API_URL = "https://ashrafskillbridge.onrender.com";

function RegisterForNgo() {
    
    const [formData, setFormData] = useState({
       
        name: '', 
        username: '',
        email: '',
        password: '',
        location: '',
        
        organization_name: '', 
        
        organization_description: '', 
       
        website_url: '', 
    });

    
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

 
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const registrationData = {
            ...formData,
            role: 'ngo' 
        };
       
        if (!registrationData.website_url) {
            delete registrationData.website_url;
        }

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            console.log('Registration successful:', data);
           
            navigate('/login');

        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">

            <div className="register-form-section">
                <div className="form-wrapper">
                    <div className="logo-container">
                        <img src={logo} alt="SkillBridge Logo" className="logo-image" />
                    </div>

                    <h2>Register</h2>
                    
                 
                    {error && <p className="error-message">{error}</p>} 

                    <form onSubmit={handleSubmit}>

                      
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name" 
                                placeholder="Enter your Full name or organization name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        
                       

                        
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email" 
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>

                      
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password" 
                                    placeholder="Create password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                                <span onClick={togglePasswordVisibility} className="password-toggle-icon">
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>

                       
                        <div className="form-group">
                            <label htmlFor="role">I am a</label>
                            <input
                                type="text"
                                id="role"
                                name="role-display"
                                value="NGO / Organization" 
                                readOnly
                                className="read-only-input"
                                disabled={isLoading}
                            />
                        </div>

                      
                        <div className="form-group">
                            <label htmlFor="location">Location</label>
                            <input
                                type="text"
                                id="location"
                                name="location" 
                                placeholder="eg. New york, NY"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>

                       
                        <div className="form-group">
                            <label htmlFor="organization_name">Organisation Name</label>
                            <input
                                type="text"
                                id="organization_name"
                                name="organization_name" 
                                placeholder="Enter your organisation name"
                                value={formData.organization_name}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="organization_description">Organization Description</label>
                            <textarea
                                id="organization_description"
                                name="organization_description" 
                                placeholder="Tell us About your organization's mission and goals"
                                value={formData.organization_description}
                                onChange={handleChange}
                                rows="4"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        
                        <div className="form-group">
                            <label htmlFor="website_url">Website URL</label>
                            <input
                                type="url"
                                id="website_url"
                                name="website_url" 
                                placeholder="eg. https://www.yourorganization.org"
                                value={formData.website_url}
                                onChange={handleChange}
                                disabled={isLoading} 
                                
                            />
                        </div>

                       
                        <button type="submit" className="register-btn" disabled={isLoading}>
                             {isLoading ? 'Registering...' : 'Register'}
                        </button>
                    </form>

                    <p className="login-link">
                        If you already have an account! You can <Link to="/login">Login here !</Link>
                    </p>
                </div>
            </div>

            
            <div className="info-image-container">
                <img src={sideImage} alt="Volunteering" className='info-link'/>
                <div className="image-overlay-text">
                    <p>Join SkillBridge to connect with NGOs and Volunteering opportunities</p>
                </div>
            </div>

        </div>
    );
}

export default RegisterForNgo;