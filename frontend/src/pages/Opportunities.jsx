import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import './Applications.css'; // reuse same styling

const API_URL = "https://ashrafskillbridge.onrender.com";

const OpportunityCard = ({ opportunity, onDelete }) => {
  return (
    <div className="application-card">
      <h3>{opportunity.title}</h3>
      <p className="description">{opportunity.description}</p>

      <div className="tags-container">
        <span className="skill-tag-header">Required Skills:</span>
        {opportunity.required_skills?.length > 0 ? (
          opportunity.required_skills.map((skill, index) => (
            <span key={index} className="skill-tag">{skill}</span>
          ))
        ) : (
          <span>No specific skills</span>
        )}
      </div>

      <div className="details-row">
        <span>{opportunity.location}</span>
        <span>{opportunity.duration}</span>
      </div>

      <div className="status-display">
        Status: <span className={opportunity.status}>{opportunity.status}</span>
      </div>

      <div className="action-buttons">
        <Link 
          to={`/dashboard/home/edit/${opportunity._id}`} 
          className="btn-accept"
        >
          <FaEdit /> Edit
        </Link>
        <button 
          className="btn-reject" 
          onClick={() => onDelete(opportunity._id)}
        >
          <FaTrash /> Delete
        </button>
      </div>
    </div>
  );
};

function Opportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('open');
  const navigate = useNavigate();

  useEffect(() => {
    const loadOpportunities = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError("Not authorized. Please log in.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/opportunities/my`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch opportunities');
        }

        setOpportunities(data.opportunities || []);
        setFilteredOpportunities(
          (data.opportunities || []).filter(opp => opp.status === 'open')
        );
      } catch (err) {
        console.error("Error loading opportunities:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadOpportunities();
  }, []);

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredOpportunities(opportunities);
    } else {
      setFilteredOpportunities(
        opportunities.filter(opp => opp.status === activeTab)
      );
    }
  }, [activeTab, opportunities]);

  const handleDeleteOpportunity = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this opportunity?'
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`${API_URL}/opportunities/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete opportunity');
      }

      setOpportunities(prev => prev.filter(opp => opp._id !== id));
      setFilteredOpportunities(prev => prev.filter(opp => opp._id !== id));
      alert('Opportunity deleted successfully!');
    } catch (err) {
      console.error('Error deleting opportunity:', err);
      alert('Failed to delete opportunity. Try again.');
    }
  };

  const openCount = opportunities.filter(o => o.status === 'open').length;
  const closedCount = opportunities.filter(o => o.status === 'closed').length;

  return (
    <div className="opportunities-page">
      <div className="page-header">
        <div className="header-text">
          <h1>Posted Opportunities</h1>
        </div>
        <Link to="/dashboard/home/create" className="create-btn">
          <FaPlus /> <span>Create New Opportunity</span>
        </Link>
      </div>

      <div className="filter-bar">
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'open' ? 'active' : ''}`}
            onClick={() => setActiveTab('open')}
          >
            Open ({openCount})
          </button>
          <button
            className={`tab-btn ${activeTab === 'closed' ? 'active' : ''}`}
            onClick={() => setActiveTab('closed')}
          >
            Closed ({closedCount})
          </button>
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({opportunities.length})
          </button>
        </div>
      </div>

      <div className="application-list-section">
        <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Opportunities</h2>

        {isLoading && <div className="loading-message">Loading opportunities...</div>}
        {error && <div className="error-message">{error}</div>}

        {!isLoading && !error && (
          <div className="card-list">
            {filteredOpportunities.length > 0 ? (
              filteredOpportunities.map(opp => (
                <OpportunityCard
                  key={opp._id}
                  opportunity={opp}
                  onDelete={handleDeleteOpportunity}
                />
              ))
            ) : (
              <p>No {activeTab} opportunities found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Opportunities;
