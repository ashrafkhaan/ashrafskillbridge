import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileForVolunteer.css'; 
import defaultAvatar from '../assets/images/pic.png';

const API_URL = "https://ashrafskillbridge.onrender.com";

function ProfileForVolunteer() {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken'); 

      if (!token) {
        setError("Not authorized. Please log in.");
        setIsLoading(false);
        return; 
      }

      try {
        console.log("Fetching profile data from API...");
        
        const response = await fetch(`${API_URL}/users/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}` 
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch profile data');
        }
        
        console.log("Profile data received:", data);
        setProfileData(data); 

      } catch (err) {
        console.error("Error loading profile:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
    
  }, []);

  const handleEditClick = () => {
 
    navigate('/dashboard/profile-vol/edit-vol'); 
  };

  if (isLoading) {
    return <div className="loading-message">Loading Profile...</div>;
  }
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  if (!profileData) {
    return <div className="error-message">Could not load profile data.</div>;
  }

  return (
    <div className="profile-page-container">
      <h1 className="profile-page-title">Profile</h1>

      <div className="profile-card">
        
        <div className="profile-card-header-centered">
          <img src={profileData.avatarUrl || defaultAvatar} alt="Avatar" className="profile-avatar" />
          <div className="profile-user-info-centered">
            <h2>{profileData.name}</h2> 
            <p className="profile-role">{profileData.role}</p> 
          </div>
        </div>

        <div className="profile-card-body-rows">
          
          <div className="info-row">
            <label>Email</label>
            <p>{profileData.email || 'Not specified'}</p>
          </div>
          
          <div className="info-row">
            <label>Location</label>
            <p>{profileData.location || 'Not specified'}</p>
          </div>
          
          
          <div className="info-row">
            <label>About</label>
            <p>{profileData.bio || 'No bio provided.'}</p>
          </div>
          
          <div className="info-row">
            <label>Skills</label>
            <p>
              {profileData.skills && profileData.skills.length > 0 
                ? profileData.skills.join(', ') 
                : 'No skills listed.'}
            </p>
          </div>

        </div>

       
        <div className="profile-card-footer">
          <button className="edit-button" onClick={handleEditClick}>
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileForVolunteer;
