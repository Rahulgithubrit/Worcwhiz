const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const workerRoutes = require('./routes/workerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
require('dotenv').config();
const cors = require('cors');

// Create server and integrate with Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*', // Allow all origins for development (restrict this in production)
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});
global.io = io;

app.use(cors());

// Connect to database
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api', userRoutes);
app.use('/api', workerRoutes);
app.use('/api', bookingRoutes);

// Emit messages using Socket.IO
io.on('connection', (socket) => {
    console.log('A user hi connected');

    // Example: Broadcast when a new booking is created
    socket.on('newBooking', (data) => {
        io.emit('workerBooked', data);
    });

    // Event for worker status toggle
    socket.on('newWorkerStatus', (data) => {
        io.emit('workerStatusUpdated', data); // Send the updated worker status to all clients
    });

    socket.on('bookingStatusUpdated', (data) => {
        io.emit('bookingStatusUpdated', data); // Send the updated booking status to all clients
        console.log('Booking status updated:', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
const PORT = process.env.PORTS || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
