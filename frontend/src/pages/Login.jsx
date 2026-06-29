import React, { useState } from 'react';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';

import logo from '../assets/images/logo.png';
import google from '../assets/images/google.png';
import facebook from '../assets/images/facebook.png';
import apple from '../assets/images/apple.png';
import loginPic from '../assets/images/Home.jpg'; 

const API_URL = "https://ashrafskillbridge.onrender.com/api";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();       //reads data from backend

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            console.log("Login successful:", data);

            if (data.token) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userRole', data.role);
            }

            navigate('/dashboard');

        } catch (err) {
            console.error("Login error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-form-section">
                <div className="login-form-wrapper">
                    <div className="logo-container">
                        <img src={logo} alt="SkillBridge Logo" className="logo-image" />
                    </div>

                    <h2 className='login-title'>Login</h2>

                    {error && <p className="error-message">{error}</p>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">User Name or Email</label>
                            <input
                                type="text"
                                className="form-control"
                                id="email"
                                placeholder="Enter your username or email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-options">
                            <div className="remember-me">
                                <input type="checkbox" id="rememberMe" disabled={isLoading} />
                                <label htmlFor="rememberMe">Remember me</label>
                            </div>
                            <a className='forgot-password-link' href="#">Forgot Password?</a>
                        </div>

                        <div className="login-btn-container">
                            <button type="submit" className="login-btn" disabled={isLoading}>
                                {isLoading ? 'Logging in...' : 'Login'}
                            </button>
                        </div>
                    </form>

                    <p className='or-divider'>OR</p>

                    <div className="social-icon-container">
                        <img src={google} alt="google" className="social-icon" />
                        <img src={facebook} alt="facebook" className="social-icon" />
                        <img src={apple} alt="apple" className="social-icon" />
                    </div>

                    <div className="registration-options">
                        <p>Don't have an account?</p>
                        <div className="links">
                            <Link to="/register" className="register-link">Register as NGO</Link>
                            <Link to="/volunteer" className="register-link">Register as Volunteer</Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="login-image-section">
                <img src={loginPic} alt="Volunteers" className="login-side-image" />
                <div className="overlay-content">
                    <p>Join SkillBridge to connect with NGOs and volunteering opportunities</p>
                </div>
            </div>
        </div>
    );
}

export default Login;
