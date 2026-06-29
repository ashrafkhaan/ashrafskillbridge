import React, { useState, useEffect, useRef } from 'react';
import './MsgForNgo.css'; 
import { FaSearch, FaArrowLeft } from 'react-icons/fa';
import { BsThreeDotsVertical, BsPlusCircle } from 'react-icons/bs';
import { FiSend } from 'react-icons/fi';
import io from 'socket.io-client'; 

const API_URL = "https://ashrafskillbridge.onrender.com/api";
const SOCKET_URL = "https://ashrafskillbridge.onrender.com/api";

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
    const senderType = isSender ? 'ngo' : 'volunteer'; 
    
    return (
        <div className={`msg-message-bubble-wrapper ${senderType}`}>
            <div className="msg-message-bubble">
                <p>{message.content}</p>
                <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        </div>
    );
};


function MsgForNgo() {
    const [myId, setMyId] = useState(null); 
    const [conversations, setConversations] = useState([]); 
    const [selectedChat, setSelectedChat] = useState(null); 
    const [messages, setMessages] = useState([]); 
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showChatList, setShowChatList] = useState(true); // For mobile view toggle
    
    const [socket, setSocket] = useState(null);

    const chatBodyRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError("Not authorized. Please log in.");
            setIsLoading(false);
            return;
        }

        // Create the new socket connection *inside* useEffect
        const newSocket = io(SOCKET_URL, {
            auth: {
                token: token // Use the token from storage
            },
            autoConnect: true
        });

        setSocket(newSocket);

        newSocket.on('connect_error', (err) => {
            console.error('Socket Connection Error:', err.message);
            setError(`Chat Error: ${err.message}. Try logging in again.`);
        });

        newSocket.on('connect', () => {
            console.log('Socket connected successfully:', newSocket.id);
        });

        return () => {
            console.log("Disconnecting socket...");
            newSocket.disconnect();
        };
    }, []); 

    useEffect(() => {
        // This logic is fine, it fetches the chat list
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
        
        if (!socket || !myId || !selectedChat) {
            return; 
        }

        function onReceiveMessage(newMessage) {
            console.log("Received new message:", newMessage);

            // 2. Get the STRING IDs from the message object (THE FIX)
            const senderId = newMessage.sender_id?._id || newMessage.sender_id;
            const receiverId = newMessage.receiver_id?._id || newMessage.receiver_id;

            const currentChatPartnerId = selectedChat._id;

            if (
                (senderId === myId && receiverId === currentChatPartnerId) ||
                (senderId === currentChatPartnerId && receiverId === myId)
            ) {
                setMessages(prevMessages => [...prevMessages, newMessage]);
            }
        }
        
        socket.on('receiveMessage', onReceiveMessage);
        socket.on('chatError', (error) => {
            setError(error.message || 'A chat error occurred');
        });

        // Cleanup
        return () => {
            socket.off('receiveMessage', onReceiveMessage);
            socket.off('chatError');
        };

    
    }, [socket, selectedChat, myId]);
   
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        // On mobile, hide chat list when a chat is selected
        if (window.innerWidth <= 768) {
            setShowChatList(false);
        }
    };

    const handleBackToList = () => {
        setShowChatList(true);
        // Optionally clear selected chat on mobile
        // setSelectedChat(null);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === "" || !selectedChat || !socket) return;

        console.log(`Sending message to: ${selectedChat.name}`);
        
        socket.emit('sendMessage', {
            receiver_id: selectedChat._id,
            content: newMessage
        });

        setNewMessage(""); // Clear the input
    };


    return (
        <div className="msg-container">
            
            {/* Chat List Section */}
            <div className={`msg-left ${showChatList ? 'show' : 'hide'}`}>
                <h1>Messages</h1>
                <div className="msg-search">
                    <FaSearch className="msg-search-icon" />
                    <input placeholder="Search conversations" className="msg-search-input"></input>
                </div>
                
                <div className="msg-chat-list">
                    {error && <p className="msg-no-chats error-message">{error}</p>}
                    
                    {isLoading && conversations.length === 0 && <p className="msg-no-chats">Loading chats...</p>}
                    
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
                       !isLoading && !error && <p className="msg-no-chats">No recent chats</p>
                    )}
                </div>
            </div>
            
            {/* Chat Section */}
            <div className={`msg-right ${!showChatList ? 'show' : 'hide'}`}>
                {selectedChat ? (
                    <>
                        <div className="msg-top">
                            {/* Back button for mobile */}
                            <button className="msg-back-btn" onClick={handleBackToList}>
                                <FaArrowLeft />
                            </button>
                            
                            <img 
                                src={selectedChat.avatarUrl || `https://placehold.co/100x100/eaf2f8/3498db?text=${selectedChat.name[0]}`} 
                                alt="avatar" 
                                className="msg-header-avatar" 
                            />
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
                        
                        <form className="msg-input-container" onSubmit={handleSendMessage}>
                            <button type="button" className="msg-plus-btn">
                                <BsPlusCircle />
                            </button>
                            <input 
                                className="msg-input" 
                                placeholder="Type your message"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" className="msg-send-btn">
                                <FiSend />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="msg-no-chat-selected">
                        <h2>{isLoading ? 'Loading...' : (error ? error : 'Select a chat to start messaging')}</h2>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MsgForNgo;