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
let rooms = {}

function getRoomSize(roomName) {
    return rooms[roomName] ? rooms[roomName].length : 0;
}

io.on('connection', (socket) => {
    console.log(`New client connected ${socket.id}`);
    
    socket.on('join', (room_name) => {
        console.log(`room name = ${room_name}`);
        socket.join(room_name);

        if (!rooms[room_name]) {
            rooms[room_name] = [];
            // update the user that he is the mentor
        }
        rooms[room_name].push(socket.id);

        const roomSize = getRoomSize(room_name);

        // Notify the new user about the current room size
        socket.emit('roomInfo', { roomSize });

        // Notify other users in the room about the new join
        socket.to(room_name).emit('userJoined', { socketId: socket.id, roomSize });

        console.log(`Number of users in ${room_name}:`, roomSize);

    })
    
    // Send the current content to the newly connected client
    socket.emit('updateContent', currentContent);
    console.log('Sending current content to new client:', currentContent);
    
    socket.on('edit', (content) => {
        currentContent = content;
        console.log('Content updated:', currentContent);
        io.emit('updateContent', content);
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        for (let roomName in rooms) {
            const index = rooms[roomName].indexOf(socket.id);
            if (index !== -1) {
                rooms[roomName].splice(index, 1);
                const roomSize = getRoomSize(roomName);
                socket.to(roomName).emit('userLeft', { socketId: socket.id, roomSize });
            }
        }
    });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
