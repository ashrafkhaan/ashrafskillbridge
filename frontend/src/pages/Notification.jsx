import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheck } from 'react-icons/fa';
import './Notification.css';
import { io } from 'socket.io-client';

import { toast } from 'react-toastify';



const API_URL = "https://ashrafskillbridge.onrender.com/api";
const SOCKET_URL = "https://ashrafskillbridge.onrender.com/api";

function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) return; 

        const newSocket = io(SOCKET_URL, {
            auth: { token },
            autoConnect: true
        });
        setSocket(newSocket);

        newSocket.on('connect', () => console.log('Notification socket connected.'));
        newSocket.on('connect_error', (err) => console.error('Notify Socket Error:', err.message));

        return () => newSocket.disconnect();
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            try {
                const res = await fetch(`${API_URL}/notifications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setNotifications(data.notifications || []);
                    setUnreadCount(data.unreadCount || 0);
                } else {
                    throw new Error(data.error || 'Failed to fetch notifications');
                }
            } catch (error) {
                console.error(error.message);
            }
        };
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (!socket) return; 

        socket.on('newNotification', (newNotification) => {
            console.log('New notification received:', newNotification);
            
            setNotifications(prev => [newNotification, ...prev]);
            // 2. Increment unread count
            setUnreadCount(prev => prev + 1);

          
            toast.info(newNotification.content, {
                onClick: () => {
                    navigate(newNotification.link); // Make it clickable
                    setIsOpen(false); // Close dropdown if open
                },
                autoClose: 5000 // Close after 5 seconds
            });
            // ------------------------------------------------
        });

        // Clean up listener
        return () => {
            socket.off('newNotification');
        };
    }, [socket, navigate]); 

    
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    
    const handleMarkAsRead = async (id) => {
        const notification = notifications.find(n => n._id === id);
        // If it's already read, do nothing
        if (notification && notification.read) return;

        // Optimistically update UI
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1)); // Prevent going below 0

        const token = localStorage.getItem('authToken');
        try {
            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = (notif) => {
        handleMarkAsRead(notif._id);
        navigate(notif.link);
        setIsOpen(false);
    };

    return (
        <div className="notification-bell" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="bell-button">
                <FaBell />
                {unreadCount > 0 && (
                    <span className="unread-badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">
                        <h3>Notifications</h3>
                    </div>
                    <div className="notification-list">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <div 
                                    key={notif._id} 
                                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notif)}
                                >
                                    <p className="notif-content">{notif.content}</p>
                                    <span className="notif-time">
                                        {formatTimeAgo(notif.createdAt)}
                                    </span>
                                    {!notif.read && (
                                        <button 
                                            className="mark-read-btn" 
                                            title="Mark as read"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Stop click from navigating
                                                handleMarkAsRead(notif._id);
                                            }}
                                        >
                                            <FaCheck />
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="notification-item-empty">
                                <p>No notifications yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
  
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
}

export default Notification;