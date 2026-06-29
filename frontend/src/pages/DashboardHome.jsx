//for ngo

import React, { useState, useEffect } from 'react';
import './DashboardHome.css'; 
import { FaPlus, FaRegCommentDots } from 'react-icons/fa';
import { Link } from 'react-router-dom';


const API_URL = "https://ashrafskillbridge.onrender.com/api";

function DashboardHome() {
  
    const [stats, setStats] = useState(null);
    const [recentApps, setRecentApps] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

  
    useEffect(() => {
        const loadNgoDashboard = async () => {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem('authToken');

            if (!token) {
                setError("Not authorized. Please log in.");
                setIsLoading(false);
                return;
            }

            try {
               
                const response = await fetch(`${API_URL}/users/dashboard-ngo`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch dashboard data');
                }
                
                console.log("NGO Dashboard data received:", data);
                setStats(data.stats);
                setRecentApps(data.recentApplications || []); 

            } catch (err) {
                console.error("Error loading NGO dashboard:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        loadNgoDashboard();
    }, []);
    if (isLoading) {
        return <div className="loading-message">Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

   
    return (
        <div className='main'>
           
            <h1>Main Dashboard Overview</h1> 
            
          
            <div className='container-top'>
                <div className='head'>
                    <h1>Overview</h1>
                </div>
            
                <div className='first'>
                   
                    <p>{stats?.activeOpportunities || 0}</p> 
                    <h2>Active Opportunities</h2>
                </div>
                <div className='sec'>
                    <p>{stats?.applicationsReceived || 0}</p>
                    <h2>Applications Received</h2>
                </div>
                <div className='third'>
                    <p>{stats?.activeVolunteers || 0}</p>
                    <h2>Active Volunteers</h2>
                </div>
                <div className='forth'>
                    <p>{stats?.pendingApplications || 0}</p>
                    <h2>Pending Applications</h2>
                </div>
            </div>

         
            <div className='container-middle'>
                <div className='head'>
                    <h1>Recent Applications</h1>
                </div>
                
             
                {recentApps.length > 0 ? (
                    recentApps.map(app => (
                        <div className='first-application' key={app._id}>
                          
                            <h3>{app.volunteer?.name || 'Unknown Applicant'}</h3> 
                            <label>Applied for:</label>
                            <p>{app.opportunity?.title || 'Unknown Opportunity'}</p>
                            <div className='desc'>
                             
                                <p>{app.volunteer?.bio || 'No bio provided.'}</p>
                            </div>
                        </div>
                    ))
                ) : (
                
                    <p style={{ padding: '10px', textAlign: 'center' }}>
                        No recent pending applications found.
                    </p>
                )}
            </div>

            
            <div className='container-last'>
                <div className='head'>
                    <h1>Quick Actions</h1>
                </div>
                <div className='action'>
                   
                    <Link to='/dashboard/home/create' className='create'>
                        <FaPlus className='action-box' />
                        <h2>Create New Oppurtunity</h2>
                    </Link>

                   
                    <Link to='/dashboard/messages' className='view-msg'>
                        <FaRegCommentDots className='action-box' />
                        <h2>View Messages</h2>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default DashboardHome;

