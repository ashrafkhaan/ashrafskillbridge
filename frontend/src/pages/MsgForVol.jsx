import React, { useState, useEffect, useRef } from 'react';

import './MsgForVol.css'; 
import { FaSearch } from 'react-icons/fa';
import { BsThreeDotsVertical, BsPlusCircle } from 'react-icons/bs';
import { FiSend } from 'react-icons/fi';
import io from 'socket.io-client';

const API_URL = "https://ashrafskillbridge.onrender.com/api";
const SOCKET_URL ="https://ashrafskillbridge.onrender.com/api";

const socket = io(SOCKET_URL, {
    auth: {
        token: localStorage.getItem('authToken')
    }
});

const ChatListItem = ({ chat, onSelectChat, selected }) => (
    <div 
        className={`msg-chat-list-item ${selected ? 'selected' : ''}`} 
        onClick={() => onSelectChat(chat)}
    >
        <img 
            src={chat.avatarUrl || `https://placehold.co/100x100/eaf2f8/3498db?text=${chat.name[0]}`} 
            alt="avatar" 
            className="msg-chat-avatar" 
        />
        <div className="msg-chat-preview">
            <div className="msg-chat-preview-header">
                <h3 className="msg-chat-name">{chat.name}</h3>
            </div>
            <p className="msg-chat-last-message">{chat.role === 'ngo' ? 'NGO' : 'Volunteer'}</p>
        </div>
    </div>
);

const MessageBubble = ({ message, currentUserId }) => {
    const isSender = message.sender_id?._id === currentUserId;
    const senderType = isSender ? 'volunteer' : 'ngo'; 
    
    return (
        <div className={`msg-message-bubble-wrapper ${senderType}`}>
            <div className="msg-message-bubble">
                <p>{message.content}</p>
                <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        </div>
    );
};

function MsgForVol() {
    const [myId, setMyId] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const chatBodyRef = useRef(null);

    // Load initial conversations (REST API)
    useEffect(() => {
        const loadData = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError("Not authorized");
                setIsLoading(false);
                return;
            }

            try {
                const [convoResponse, profileResponse] = await Promise.all([
                    fetch(`${API_URL}/messages/conversations`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${API_URL}/users/profile`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (!convoResponse.ok || !profileResponse.ok) {
                    throw new Error('Failed to load initial chat data');
                }
                
                const convoData = await convoResponse.json();
                const profileData = await profileResponse.json();

                setConversations(convoData.conversations || []);
                setMyId(profileData._id); 

                if (convoData.conversations && convoData.conversations.length > 0) {
                    setSelectedChat(convoData.conversations[0]);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Load message history when a chat is selected (REST API)
    useEffect(() => {
        const loadMessages = async () => {
            if (!selectedChat) return;
            
            setIsLoading(true); 
            const token = localStorage.getItem('authToken');
            try {
                const response = await fetch(`${API_URL}/messages/${selectedChat._id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to fetch messages');
                setMessages(data.messages || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false); 
            }
        };
        loadMessages();
    }, [selectedChat]); 

   
    useEffect(() => {
      
        if (!myId || !selectedChat) {
            return; 
        }

        function onReceiveMessage(newMessage) {
            console.log("Received new message:", newMessage);

            
            // Use optional chaining just in case, like you do in MessageBubble
            const senderId = newMessage.sender_id?._id || newMessage.sender_id;
            const receiverId = newMessage.receiver_id?._id || newMessage.receiver_id;

            // Get the ID of the person we are currently chatting with
            const currentChatPartnerId = selectedChat._id;

         
            if (
                (senderId === currentChatPartnerId && receiverId === myId) ||
                (senderId === myId && receiverId === currentChatPartnerId)
            ) {
                // This is the correct way to update state, which you already have!
                setMessages(prevMessages => [...prevMessages, newMessage]);
            }
        }
        
        socket.on('receiveMessage', onReceiveMessage);
        socket.on('chatError', (error) => {
            setError(error.message || 'A chat error occurred');
        });

        // Cleanup function
        return () => {
            socket.off('receiveMessage', onReceiveMessage);
            socket.off('chatError');
        };

    }, [selectedChat, myId, socket]); 

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
    };

    // Send message via WebSocket
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === "" || !selectedChat) return;
        
        socket.emit('sendMessage', {
            receiver_id: selectedChat._id,
            content: newMessage
        });

        setNewMessage(""); 
    };

    return (
        // 3. Use 'msg-container' class
        <div className="msg-container">
            
            <div className="msg-left">
                <h1>Messages</h1>
                <div className="msg-search">
                    <FaSearch className="msg-search-icon" />
                    <input placeholder="Search conversations" className="msg-sear"></input>
                </div>
                
                <div className="msg-chat-list">
                    {isLoading && conversations.length === 0 && <p className="msg-no-chats">Loading chats...</p>}
                    {error && <p className="msg-no-chats error-message">{error}</p>}
                    {!isLoading && conversations.length > 0 ? (
                        conversations.map(chat => ( 
                            <ChatListItem 
                                key={chat._id} 
                                chat={chat}
                                onSelectChat={handleSelectChat}
                                selected={selectedChat && chat._id === selectedChat._id}
                            />
                        ))
                    ) : (
                       !isLoading && <p className="msg-no-chats">No recent chats</p>
                    )}
                </div>
            </div>
            <div className='middle'></div>
            <div className="msg-right">
                {selectedChat ? (
                    <>
                        <div className="msg-top">
                            <img src={selectedChat.avatarUrl || `https://placehold.co/100x100/eaf2f8/3498db?text=${selectedChat.name[0]}`} alt="avatar" className="msg-header-avatar" />
                            <div className="msg-header-info">
                                <h1>{selectedChat.name}</h1>
                                <p>{selectedChat.role}</p>
                            </div>
                            <button className="msg-options-btn">
                                <BsThreeDotsVertical />
                            </button>
                        </div>
                        
                        <div className="msg-body" ref={chatBodyRef}>
                            {messages.map(msg => (
                                <MessageBubble key={msg._id || msg.id} message={msg} currentUserId={myId} />
                            ))}
                        </div>
                        
                        <form className="msg-msging" onSubmit={handleSendMessage}>
                            <button type="button" className="msg-plus" name="plus">
                                <BsPlusCircle />
                            </button>
                            <input 
                                className="msg-input" 
                                name="input" 
                                placeholder="Type your message"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" className="msg-send">
                                <FiSend />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="msg-no-chat-selected">
                        <h2>{isLoading ? 'Loading...' : 'Select a chat to start messaging'}</h2>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MsgForVol;