import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './DashboardForNgo.css';

import logo from '../assets/images/logo.png';
import { 
  FaTachometerAlt, 
  FaSignOutAlt, 
  FaRegLightbulb, 
  FaEnvelope, 
  FaFileAlt, 
  FaUser, 
  FaBriefcase,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import Notification from './Notification.jsx';
const API_URL = "https://ashrafskillbridge.onrender.com";

function DashboardForNgo() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  //  Load logged-in NGO profile
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch profile');

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        localStorage.clear();
        navigate('/login');
      }
    };

    fetchProfile();
  }, [navigate]);

  const isActive = (path) => location.pathname.startsWith(path);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking a link (mobile)
  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        const hamburger = document.querySelector('.hamburger-menu');
        if (sidebar && !sidebar.contains(e.target) && !hamburger.contains(e.target)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  return (
    <div className="dashboard-container">
      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* ===== Sidebar ===== */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img src={logo} alt="SkillBridge Logo" className="logo" />
          </div>
          <button className="close-sidebar-btn" onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>

        <div className="sidebar-profile">
          {user ? (
            <>
              <img
                src={user.avatarUrl}
                alt="User Avatar"
                className="sidebar-avatar"
              />
              <h3 className="sidebar-profile-name">{user.name}</h3>
              <p className="sidebar-profile-role">{user.role}</p>
            </>
          ) : (
            <p className="sidebar-profile-role">Loading profile...</p>
          )}
        </div>

        <ul className="nav-list">
          <li className={isActive('/dashboard/home') ? 'active' : ''}>
            <Link to="/dashboard/home" onClick={handleLinkClick}>
              <FaTachometerAlt /> <span>Dashboard</span>
            </Link>
          </li>

          <li className={isActive('/dashboard/opportunities') ? 'active' : ''}>
            <Link to="/dashboard/opportunities" onClick={handleLinkClick}>
              <FaBriefcase /> <span>Opportunities</span>
            </Link>
          </li>

          <li className={isActive('/dashboard/applications') ? 'active' : ''}>
            <Link to="/dashboard/applications" onClick={handleLinkClick}>
              <FaFileAlt /> <span>Applications</span>
            </Link>
          </li>

          <li className={isActive('/dashboard/messages') ? 'active' : ''}>
            <Link to="/dashboard/messages" onClick={handleLinkClick}>
              <FaEnvelope /> <span>Messages</span>
            </Link>
          </li>

          <li className={isActive('/dashboard/profile') ? 'active' : ''}>
            <Link to="/dashboard/profile" onClick={handleLinkClick}>
              <FaUser /> <span>Profile</span>
            </Link>
          </li>
          <li>
            <button className="logout-button" onClick={handleLogout}>
              <FaSignOutAlt /> <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* ===== Main Content ===== */}
      <main className="main-content">
        <header className="header">
          <button className="hamburger-menu" onClick={toggleSidebar}>
            <FaBars />
          </button>
          <div className="header-right">
            <span className="ngo-badge">NGO</span>
            <Notification/>
            <img
              src={user?.avatarUrl}
              alt="Avatar"
              className="header-avatar"
            />
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardForNgo;