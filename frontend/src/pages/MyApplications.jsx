import React, { useEffect, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import './MyApplications.css';

const API_URL = "https://ashrafskillbridge.onrender.com";

const ApplicationCard = ({ app }) => {
  if (!app.opportunity) {
    return (
      <div className="application-card-error">
        <p>This application’s opportunity has been deleted.</p>
        <span className="status-display">
          Status: <span className={app.status}>{app.status}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="application-card">
      <h3>{app.opportunity.title}</h3>
      <span className="ngo-id">Location: {app.opportunity.location}</span>
      <p className="description">{app.opportunity.description}</p>

      <div className="tags-container">
        <span className="skill-tag-header">Skills Required:</span>
        {(app.opportunity.required_skills || []).length > 0 ? (
          app.opportunity.required_skills.map((skill, index) => (
            <span key={index} className="skill-tag">{skill}</span>
          ))
        ) : (
          <span>No specific skills listed</span>
        )}
      </div>

      <div className="details-row">
        <span>Duration: {app.opportunity.duration || 'N/A'}</span>
        <span>Status: <strong className={`status ${app.status}`}>{app.status}</strong></span>
      </div>

      <p className="applied-date">
        Applied on: {new Date(app.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      try {
        const response = await fetch(`${API_URL}/applications/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }

        const data = await response.json();
        const apps = data.applications || [];
        setApplications(apps);
        setFilteredApplications(apps.filter((a) => a.status === 'pending'));
      } catch (err) {
        console.error(err);
        setError('Failed to load applications.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter((a) => a.status === activeTab));
    }
  }, [activeTab, applications]);

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const acceptedCount = applications.filter((a) => a.status === 'accepted').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  if (loading) return <div className="loading-message">Loading your applications...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="opportunities-page">
      <div className="page-header">
        <div className="header-text">
          <h1>My Applications</h1>
          <p>Track the status of your volunteer applications</p>
        </div>
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
            All ({applications.length})
          </button>
        </div>
      </div>

      <div className="application-list-section">
        <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Applications</h2>

        {filteredApplications.length > 0 ? (
          <div className="card-list">
            {filteredApplications.map((app) => (
              <ApplicationCard key={app._id} app={app} />
            ))}
          </div>
        ) : (
          <p>No {activeTab} applications found.</p>
        )}
      </div>
    </div>
  );
}

export default MyApplications;
