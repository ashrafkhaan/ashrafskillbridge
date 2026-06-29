import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './DashboardHomeForvol.css'; 

const API_URL = "https://ashrafskillbridge.onrender.com/api";

const OpportunityCard = ({ opp }) => (
  <div className="opportunity-preview-card">
    <div className="card-header">
      <h3>{opp.title}</h3>
      <span className={`status-badge status-${opp.status}`}>{opp.status}</span>
    </div>

    <span className="ngo-id">{opp.ngo?.organization_name || 'NGO'}</span> 
    <p className="description">{opp.description}</p>

    <div className="tags-container">
      {opp.required_skills?.map((skill, index) => (
        <span key={index} className="skill-tag">{skill}</span>
      ))}
    </div>

    <Link to={`/dashboard/find-oppurt`} className="view-details-link">
      View details &gt;
    </Link>
  </div>
);

function DashboardHomeForvol() {
  const [stats, setStats] = useState({});
  const [volunteerSkills, setVolunteerSkills] = useState([]);
  const [opportunities, setOpportunities] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  //  Fetch dashboard stats & volunteer data
  useEffect(() => {
    const loadStatsAndSkills = async () => {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError("Not authorized. Please log in.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/dashboard`, { 
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch dashboard data');
        }

        setStats(data.stats || {});
        setVolunteerSkills(data.skills || []); 
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatsAndSkills();
  }, []);

  // Fetch opportunities
  useEffect(() => {
    const fetchOpportunities = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const response = await fetch(`${API_URL}/opportunities`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        let allOpps = data.opportunities || [];

        allOpps = allOpps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        
        const matches = [];
        const others = [];

        for (const opp of allOpps) {
          const hasMatch = opp.required_skills?.some(skill =>
            volunteerSkills.includes(skill)
          );
          if (hasMatch) matches.push(opp);
          else others.push(opp);
        }

       
        const selected = matches.slice(0, 2);
        if (selected.length < 2) {
          selected.push(...others.slice(0, 2 - selected.length));
        }

        setOpportunities(selected);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
      }
    };
    fetchOpportunities();
  }, [volunteerSkills]);


  if (isLoading) return <div className="loading-message">Loading Dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="volunteer-home-main">
      <h1>Dashboard</h1>
      
      {/* Impact Stats Section */}
      <div className="dashboard-section-card">
        <h2 className="card-title">Your Impact</h2>
        <div className="impact-card-grid">
          <div className="impact-card stat-blue">
            <p>{stats.applications || 0}</p>
            <h2>Applications</h2>
          </div>
          <div className="impact-card stat-green">
            <p>{stats.accepted || 0}</p>
            <h2>Accepted</h2>
          </div>
          <div className="impact-card stat-pending">
            <p>{stats.pending || 0}</p>
            <h2>Pending</h2>
          </div>
          <div className="impact-card stat-yellow">
            <p>{stats.skills || 0}</p>
            <h2>Skills</h2>
          </div>
        </div>
      </div>

      {/* Recommended Opportunities Section */}
      <div className="dashboard-section-card">
        <div className="card-header">
          <h2 className="card-title">Recommended Opportunities</h2>
          <Link to="/dashboard/find-opportunities" className="view-all-link">View All</Link>
        </div>
        <p className="card-subtitle">
          Based on your skills, here are the latest opportunities that might interest you.
        </p>

        <div className="opportunity-list">
          {opportunities.length > 0 ? (
            opportunities.map(opp => (
              <OpportunityCard key={opp._id} opp={opp} />
            ))
          ) : (
            <p className="no-messages">No opportunities found.</p>
          )}
        </div>

        <div className="browse-all-container">
          <Link to="/dashboard/find-oppurt" className="browse-all-btn">
            Browse All Opportunities
          </Link>
        </div>
      </div>

      {/* Recent Messages Section */}
      <div className="dashboard-section-card">
        <div className="card-header">
          <h2 className="card-title">Recent Messages</h2>
        </div>
        <p className="no-messages">No recent messages</p>
        <Link to="/dashboard/messages" className="view-all-btn">
          View All Messages
        </Link>
      </div>
    </div>
  );
}

export default DashboardHomeForvol;