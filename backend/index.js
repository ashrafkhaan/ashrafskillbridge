const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth.js');
const userRoutes = require('./routes/user.js');
const opportunityRoutes = require('./routes/opportunity.js');
const applicationRoutes = require('./routes/application.js');
const messageRoutes = require('./routes/message.js');
const notificationRoutes = require('./routes/notificationRoutes.js');

const jwt = require('jsonwebtoken');
const User = require('./models/user.js');
const Message = require('./models/message.js');
const Notification = require('./models/Notification.js');

const app = express();
const PORT = process.env.PORT || 8080;

const MONGO_URL = process.env.MONGO_URL;

const http = require('http');
const { Server } = require("socket.io");

if (!MONGO_URL) {
    console.error("FATAL ERROR: MONGO_URL is not defined in .env file.");
    process.exit(1);
}

main()
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch(err => {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.use(cors({
    origin: "https://ashrafskillbridge.vercel.app",
    credentials: true,
}));

app.use(express.json());

app.use('/uploads', express.static('uploads'));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/messages', messageRoutes);

app.use('/api/notifications', notificationRoutes);

app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000",
            "https://ashrafskillbridge.vercel.app"
        ],
        methods: ["GET", "POST"]
    }
});



// 1. Create a specific namespace for /api
const apiSocket = io.of("/api");


apiSocket.use(async(socket, next) => {
    const token = socket.handshake.auth.token;
    const secret = process.env.JWT_SECRET;

    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }

    try {
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }
        socket.user = user;
        next();
    } catch (err) {
        return next(new Error('Authentication error: Token is invalid'));
    }
});

// This maps a userId to their unique socket.id
// const userSocketMap = {};

// // 3. Attach connection listener to the namespace
// apiSocket.on('connection', (socket) => {
//   const userId = socket.user._id.toString();
//   console.log(`User connected to /api namespace: ${socket.user.name} (Socket ID: ${socket.id})`);

//   userSocketMap[userId] = socket.id;

//   // Listen for the 'sendMessage' event
//   socket.on('sendMessage', async ({ receiver_id, content }) => {
//     try {
//       const sender_id = socket.user._id;

//       // 1. Create and save the message to the database
//       const newMessage = await Message.create({
//         sender_id,
//         receiver_id,
//         content
//       });

//       // Populate the sender info
//       const populatedMessage = await Message.findById(newMessage._id).populate('sender_id', 'name avatarUrl role');

//       // 2. Find the recipient's socket ID
//       const receiverSocketId = userSocketMap[receiver_id];

//       // --- START OF NEW NOTIFICATION LOGIC ---

//       // 3. Create the Notification in the Database
//       const newNotification = await Notification.create({
//         recipient: receiver_id,
//         sender: sender_id, 
//         content: `New message from ${socket.user.name}`,
//         link: '/messages', // Link to your chat page
//         read: false
//       });

//       // ---  END OF NEW NOTIFICATION LOGIC ---

//       // 4. If the recipient is online, send them BOTH events
//       if (receiverSocketId) {
//         // Send the Chat Message
//         apiSocket.to(receiverSocketId).emit('receiveMessage', populatedMessage);

//         //  Send the Notification (triggers the Toast and Bell)
//         apiSocket.to(receiverSocketId).emit('newNotification', newNotification);
//       }

//       // 5. Send the message back to the sender (so it appears in their chat window)
//       socket.emit('receiveMessage', populatedMessage);

//     } catch (error) {
//       console.error('Error handling message:', error);
//       socket.emit('chatError', { message: 'Failed to send message.' });
//     }
//   });

//   // Handle user disconnection
//   socket.on('disconnect', () => {
//     console.log(`User disconnected from /api: ${socket.user.name}`);
//     delete userSocketMap[userId];
//   });
// });

// -----------------------------------------------------
// 1. Change userSocketMap to store SETS of IDs
// -----------------------------------------------------
const userSocketMap = new Map(); // Using a Map is cleaner

apiSocket.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`User connected: ${socket.user.name} (Socket ID: ${socket.id})`);

    // --- A. ADD SOCKET TO THE SET ---
    if (!userSocketMap.has(userId)) {
        userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId).add(socket.id);


    socket.on('sendMessage', async({ receiver_id, content }) => {
        try {
            const sender_id = socket.user._id;


            const newMessage = await Message.create({ sender_id, receiver_id, content });
            const populatedMessage = await Message.findById(newMessage._id).populate('sender_id', 'name avatarUrl role');


            const newNotification = await Notification.create({
                recipient: receiver_id,
                sender: sender_id,
                content: `New message from ${socket.user.name}`,
                link: '/messages',
                read: false
            });

            // --- B. SEND TO ALL SOCKETS FOR THIS USER ---
            // Get the Set of socket IDs for the receiver
            const receiverSockets = userSocketMap.get(receiver_id.toString());

            if (receiverSockets) {

                receiverSockets.forEach(socketId => {
                    // Emit Chat Message
                    apiSocket.to(socketId).emit('receiveMessage', populatedMessage);
                    // Emit Notification
                    apiSocket.to(socketId).emit('newNotification', newNotification);
                });
            }

            // Send back to sender
            socket.emit('receiveMessage', populatedMessage);

        } catch (error) {
            console.error('Error handling message:', error);
            socket.emit('chatError', { message: 'Failed to send message.' });
        }
    });


    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.name}`);

        if (userSocketMap.has(userId)) {
            const userSockets = userSocketMap.get(userId);
            userSockets.delete(socket.id); // Remove only this specific connection

            // If user has no more windows open, delete them from map
            if (userSockets.size === 0) {
                userSocketMap.delete(userId);
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server (with WebSockets) is running on http://localhost:${PORT}`);
});