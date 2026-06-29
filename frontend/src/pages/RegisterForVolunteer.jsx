import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './RegisterForVolunteer.css'; 

import logo from '../assets/images/logo.png';
import sideImage from '../assets/images/Home.jpg';


const API_URL = "https://ashrafskillbridge.onrender.com";

function RegisterForVolunteer() {
   
    const [formData, setFormData] = useState({
        
        name: '',
       
        username: '',
        email: '',
        password: '',
        location: '',
       
        skill: '',
        
        // bio: '',
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

       
        const skillsArray = formData.skill ? formData.skill.split(',').map(s => s.trim()).filter(s => s) : [];

        const registrationData = {
            name: formData.name, 
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: 'volunteer', 
            location: formData.location,
            skills: skillsArray, 
        };
       

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

            console.log('Volunteer registration successful:', data);
            
            
            navigate('/login');

        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='register-container'>
            
            <div className='register-form-section'>
                <div className='form-wrapper'>
                    <div className='logo-container'>
                        <img src={logo} alt="SkillBridge Logo" className='logo-image' />
                    </div>
                    <h2>Register</h2>
                    
                 
                    {error && <p className="error-message">{error}</p>} 

                    <form onSubmit={handleSubmit}>
                       
                        <div className='form-group'>
                            <label htmlFor='name'>Full Name</label> 
                            <input type='text'
                                id='name'         
                                name='name'      
                                placeholder='Enter full name'
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>
        
                        <div className='form-group'>
                            <label htmlFor='username'>User name</label>
                            <input type='text'
                                id='username'    
                                name='username'   
                                placeholder='Choose a username'
                                value={formData.username}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    
                        <div className='form-group'>
                            <label htmlFor='email'>Email</label> 
                            <input type='email'
                                id='email'       
                                name='email'      
                                placeholder='Enter your email'
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>
                       
                        <div className='form-group'>
                            <label htmlFor='password'>Password</label>
                            <div className='password-wrapper'>
                                <input type={showPassword ? 'text' : 'password'}
                                    id='password'    
                                    name='password'  
                                    placeholder='Create password'
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                               
                                <span onClick={togglePasswordVisibility} className='password-toggle-icon'> 
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>
                        <div className='form-group'>
                            <label>I am a</label>
                            <input type='text'
                                value='Volunteer'
                                readOnly
                                className='read-only-input' 
                                disabled={isLoading}
                            />
                        </div>
                        
                        <div className='form-group'>
                            <label htmlFor='location'>Location</label> 
                            <input type='text'
                                id='location'    
                                name='location'   
                                placeholder='Enter your city, state'
                                value={formData.location}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>
                       
                        <div className='form-group'>
                            <label htmlFor='skill'>Skills</label> 
                            <input type='text'
                                id='skill'        
                                name='skill'     
                                placeholder='Enter skills (comma-separated)'
                                value={formData.skill}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                             <small>Enter multiple skills separated by commas (e.g., teaching, coding, design)</small>
                        </div>

                       
                        <button type='submit' className='register-btn' disabled={isLoading}>
                             {isLoading ? 'Registering...' : 'Register'}
                        </button>
                    </form>

                    <p className='login-link'>If you already have an account! <Link to="/login">Login here</Link></p> {/* Ensure path is lowercase */}
                </div>
            </div>
          
            <div className="info-image-container">
                <div className="image-overlay-text"><p>Join SkillBridge to connect with NGOs and Volunteering opportunities</p></div>
                <img src={sideImage} alt="Volunteering" />
            </div>
            <div className="info-section">
              
            </div>
        </div>
    );
}

export default RegisterForVolunteer;


