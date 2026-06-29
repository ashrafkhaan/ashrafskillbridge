import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './OppurtunityForVol.css'; 

const API_URL = "https://ashrafskillbridge.onrender.com/api";

const OpportunityCard = ({ opp, onApply }) => {
  return (
    <div className="opp-card-volunteer">
      <div className="card-header-volunteer">
        <h3>{opp.title}</h3>
        <span className={`status-badge-volunteer status-${opp.status}`}>{opp.status}</span>
      </div>
      
      <span className="ngo-id-volunteer">{opp.ngo?.organization_name || 'NGO'}</span>
      <p className="description-volunteer">{opp.description}</p>
      
      <div className="tags-container-volunteer">
        {opp.required_skills?.map((skill, index) => (
          <span key={index} className="skill-tag-volunteer">{skill}</span>
        ))}
      </div>
      
      <div className="details-row-volunteer">
        <span>{opp.location}</span>
        <span>{opp.duration}</span>
      </div>

      <div className="card-footer-volunteer">
        <Link to={`/dashboard/find-opportunities/${opp._id}`} className="view-details-link-volunteer">
          View details &gt;
        </Link>
        <button className="apply-btn-volunteer" onClick={() => onApply(opp._id)}>
          Apply
        </button>
      </div>
    </div>
  );
};

function OpportunityForVol() {
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    skills: '',
    location: '',
    status: 'open'
  });

  // Fetch all opportunities once
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
        const response = await fetch(`${API_URL}/opportunities`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Failed to fetch opportunities');

        setAllOpportunities(data.opportunities || []);
        setFilteredOpportunities(data.opportunities || []);
      } catch (err) {
        console.error("Error loading opportunities:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadOpportunities();
  }, []);

  // Apply filters locally whenever filters change
  useEffect(() => {
    let filtered = [...allOpportunities];

    // Filter by skills
    if (filters.skills.trim()) {
      const skillLower = filters.skills.toLowerCase();
      filtered = filtered.filter(opp =>
        opp.required_skills?.some(skill => skill.toLowerCase().includes(skillLower))
      );
    }

    // Filter by location
    if (filters.location.trim()) {
      const locLower = filters.location.toLowerCase();
      filtered = filtered.filter(opp =>
        opp.location?.toLowerCase().includes(locLower)
      );
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(opp => opp.status === filters.status);
    }

    setFilteredOpportunities(filtered);
  }, [filters, allOpportunities]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ skills: '', location: '', status: 'open' });
  };

  const handleApplyClick = async (opportunityId) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${API_URL}/applications/apply/${opportunityId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to apply');
      alert('Application successful!');
    } catch (err) {
      console.error("Error applying:", err);
      setError(err.message);
    }
  };

  return (
    <div className="opportunity-page-volunteer">
      <div className="page-header-volunteer">
        <h2>Your Opportunities</h2>
        <p>Find opportunities that match your skills and interests</p>
      </div>

      <div className="filter-container-volunteer">
        <div className="filter-inputs-volunteer">
          <div className="form-group-volunteer">
            <label htmlFor="skills">Skills</label>
            <input
              type="text"
              id="skills"
              name="skills"
              placeholder="Search Skills"
              value={filters.skills}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group-volunteer">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="Search locations"
              value={filters.location}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group-volunteer">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <button className="reset-btn-volunteer" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>

        <div className="suggestion-tags-volunteer">
          <span onClick={() => setFilters(prev => ({ ...prev, skills: 'web development' }))} className="suggestion-tag-volunteer">web development</span>
          <span onClick={() => setFilters(prev => ({ ...prev, skills: 'translation' }))} className="suggestion-tag-volunteer">Translation</span>
          <span onClick={() => setFilters(prev => ({ ...prev, skills: 'marketing' }))} className="suggestion-tag-volunteer">Marketing</span>
          <span onClick={() => setFilters(prev => ({ ...prev, location: 'new york' }))} className="suggestion-tag-volunteer">New York</span>
          <span onClick={() => setFilters(prev => ({ ...prev, location: 'remote' }))} className="suggestion-tag-volunteer">Remote</span>
          <span onClick={() => setFilters(prev => ({ ...prev, location: 'chicago' }))} className="suggestion-tag-volunteer">Chicago</span>
        </div>
      </div>

      <div className="list-container-volunteer">
        {isLoading && <div className="loading-message">Loading opportunities...</div>}
        {error && <div className="error-message">{error}</div>}

        {!isLoading && !error && (
          <div className="card-list-volunteer">
            {filteredOpportunities.length > 0 ? (
              filteredOpportunities.map(opp => (
                <OpportunityCard
                  key={opp._id}
                  opp={opp}
                  onApply={handleApplyClick}
                />
              ))
            ) : (
              <p>No opportunities found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OpportunityForVol;
