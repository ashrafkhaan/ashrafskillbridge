import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Applications.css'; 
import { FaPlus, FaChevronDown } from 'react-icons/fa';


const API_URL = "https://ashrafskillbridge.onrender.com";

const ApplicationCard = ({ app, onUpdateStatus }) => {
    
   
    if (!app.opportunity || !app.volunteer) {
        return (
            <div className="application-card-error">
                <p>This application contains orphaned data (the original opportunity or volunteer may have been deleted) and cannot be displayed.</p>
                <span className="status-display">Status: <span className={app.status}>{app.status}</span></span>
            </div>
        );
    }
    
  
    return (
        <div className="application-card">
            <h3>{app.opportunity.title}</h3>

            <span className="applicant-name">Applicant: {app.volunteer.name}</span>
            <span className="applicant-email">{app.volunteer.email}</span>
            
            <p className="description">{app.opportunity.description}</p>

            <div className="tags-container">
                <span className="skill-tag-header">Skills Required:</span>
                
                {(app.opportunity.required_skills || []).map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                ))}
            </div>

            <div className="details-row">
                <span>{app.opportunity.location}</span>
                <span>{app.opportunity.duration}</span>
            </div>

            <div className="tags-container applicant-skills">
                <span className="skill-tag-header">Applicant's Skills:</span>
              
                {(app.volunteer.skills || []).length > 0 ? (
                    (app.volunteer.skills || []).map((skill, index) => (
                        <span key={index} className="skill-tag-match">{skill}</span>
                    ))
                ) : (
                    <span>No skills listed</span>
                )}
            </div>

           
            {app.status === 'pending' && (
                <div className="action-buttons">
                    <button 
                        className="btn-reject" 
                        onClick={() => onUpdateStatus(app._id, 'rejected')}>
                        Reject
                    </button>
                    <button 
                        className="btn-accept"
                        onClick={() => onUpdateStatus(app._id, 'accepted')}>
                        Accept
                    </button>
                </div>
            )}

            
            {app.status !== 'pending' && (
                <div className="status-display">
                    Status: <span className={app.status}>{app.status}</span>
                </div>
            )}

            <Link to={`/dashboard/applications/${app._id}`} className="view-details-link">
                View details &gt;
            </Link>
        </div>
    );
};

function Applications() {
    const [allApplications, setAllApplications] = useState([]); 
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const navigate = useNavigate();

    useEffect(() => {
        const loadApplications = async () => {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem('authToken');

            if (!token) {
                setError("Not authorized. Please log in.");
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/applications/ngo`, { 
                   headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch applications');
                }
                
                setAllApplications(data.applications || []);
                setFilteredApplications(
                    (data.applications || []).filter(app => app.status === 'pending')
                );

            } catch (err) {
                console.error("Error loading applications:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        loadApplications();
    }, []); 

    useEffect(() => {
        if (activeTab === 'all') {
            setFilteredApplications(allApplications);
        } else {
            setFilteredApplications(
                allApplications.filter(app => app.status === activeTab)
            );
        }
    }, [activeTab, allApplications]);

    const handleUpdateStatus = async (appId, newStatus) => {
        const token = localStorage.getItem('authToken');
        setAllApplications(prevApps => 
            prevApps.map(app => 
                app._id === appId ? { ...app, status: newStatus } : app
            )
        );

        try {
            const response = await fetch(`${API_URL}/applications/${appId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update status');
            }
            console.log("Application status updated:", data);

        } catch (err) {
            console.error("Error updating status:", err);
            setError("Failed to update status. Please refresh.");
            setAllApplications(prevApps => 
                prevApps.map(app => 
                    app._id === appId ? { ...app, status: 'pending' } : app
                )
            );
        }
    };
    
    const pendingCount = allApplications.filter(app => app.status === 'pending').length;
    const acceptedCount = allApplications.filter(app => app.status === 'accepted').length;
    const rejectedCount = allApplications.filter(app => app.status === 'rejected').length;

    return (
        <div className="opportunities-page">

            <div className="page-header">
                <div className="header-text">
                    <h1>Recieved Applications</h1>
                </div>
                <Link to="/dashboard/home/create" className="create-btn">
                    <FaPlus /> <span>Create New Opportunity</span>
                </Link>
            </div>

            <div className="filter-bar">
                <div className="tabs">
                    <button
                        className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending ({pendingCount})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'accepted' ? 'active' : ''}`}
                        onClick={() => setActiveTab('accepted')}
                    >
                        Accepted ({acceptedCount})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rejected')}
                    >
                        Rejected ({rejectedCount})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All ({allApplications.length})
                    </button>
                </div>
            </div>

            <div className="application-list-section">
                <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Applications</h2>

                {isLoading && <div className="loading-message">Loading applications...</div>}
                {error && <div className="error-message">{error}</div>}

                {!isLoading && !error && (
                    <div className="card-list">
                        {filteredApplications.length > 0 ? (
                            filteredApplications.map(app => (
                                <ApplicationCard 
                                    key={app._id} 
                                    app={app} 
                                    onUpdateStatus={handleUpdateStatus} 
                                />
                            ))
                        ) : (
                            <p>No {activeTab} applications found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Applications;
