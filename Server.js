// server.js (backend)

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Store the current content in a variable
let currentContent = 'Hello World';

io.on('connection', (socket) => {
    console.log('New client connected');
    
    // Send the current content to the newly connected client
    socket.emit('updateContent', currentContent);
    console.log('Sending current content to new client:', currentContent);
    
    socket.on('edit', (content) => {
        currentContent = content;
        console.log('Content updated:', currentContent);
        io.emit('updateContent', content);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
