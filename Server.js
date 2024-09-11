require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Content = require('./schemas/Content');


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

let contents = {};
let rooms = {}
let mentors = {};

function getRoomSize(roomName) {
    return rooms[roomName] ? rooms[roomName].length : 0;
}

// API to fetch content from MongoDB when a client joins a room
async function fetchRoomContent(roomName) {
    console.log(`Attempting to fetch content for room: ${roomName}`);
    try {
        console.log(`Executing database query for room: ${roomName}`);
        const content = await Content.findOne({ title: roomName });
        console.log(`Database query completed for room: ${roomName}`);

        if (content) {
            console.log(`Content found for room ${roomName}:`, content);
            contents[roomName] = {
                initialCode: content.initialCode,
                solution: content.solution
            };
            return contents[roomName];
        } else {
            console.log(`No content found for room: ${roomName}`);
            return null;
        }
    } catch (err) {
        console.error(`Error in fetchRoomContent for room ${roomName}:`, err);
        console.error(`Error stack trace:`, err.stack);
        throw err;
    }
}

// Function to reset room content
function resetRoomContent(roomName) {
    console.log(`Resetting content for room: ${roomName}`);
    delete contents[roomName];
    delete rooms[roomName];
    delete mentors[roomName];
}

io.on('connection', (socket) => {
    console.log(`New client connected ${socket.id}`);

    socket.on('join', async (room_name) => {
        console.log(`room name = ${room_name}`);
        socket.join(room_name);

        let isMentor = false;
        if (!rooms[room_name]) {
            rooms[room_name] = [];
            mentors[room_name] = socket.id;
            isMentor = true;
        }
        rooms[room_name].push(socket.id);

        const roomSize = getRoomSize(room_name);

        // Fetch room content from MongoDB if not already in memory
        if (!contents[room_name]) {
            console.log(`Fetching content for room: ${room_name}`);
            try {
                const roomContent = await fetchRoomContent(room_name);
                if (roomContent) {
                    console.log(`Content successfully fetched for room: ${room_name}`);
                    socket.emit('updateContent', roomContent.initialCode);
                } else {
                    console.log(`No content found for room: ${room_name}`);
                    socket.emit('updateContent', 'No content found for this room.');
                }
            } catch (error) {
                console.error(`Error handling join for room ${room_name}:`, error);
                socket.emit('updateContent', 'An error occurred while fetching room content.');
            }
        } else {
            // Send the current content to the newly connected client
            socket.emit('updateContent', contents[room_name].initialCode);
            console.log('Sending cached content to new client:', contents[room_name].initialCode);
        }


        // Notify the new user about the current room size
        socket.emit('roomInfo', { roomSize, isMentor });

        // Notify other users in the room about the new join
        socket.to(room_name).emit('userJoined', { socketId: socket.id, roomSize });

        console.log(`Number of users in ${room_name}:`, roomSize);

    })

    // Send the current content to the newly connected client
    // socket.emit('updateContent', currentContent);
    // console.log('Sending current content to new client:', currentContent);

    socket.on('edit', (content, room_name) => {
        if (contents[room_name]) {
            contents[room_name].initialCode = content;
            console.log('Content updated for room:', room_name, content);
            io.to(room_name).emit('updateContent', content);

            // Check if the content matches the solution
            if (content === contents[room_name].solution) {
                console.log(`User in room ${room_name} found the solution!`);
                io.to(room_name).emit('correctSolution');  // Notify all users
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        for (let roomName in rooms) {
            const index = rooms[roomName].indexOf(socket.id);
            if (index !== -1) {
                rooms[roomName].splice(index, 1);
                const roomSize = getRoomSize(roomName);

                if (mentors[roomName] === socket.id) {
                    // Mentor has left, notify all users to leave
                    io.to(roomName).emit('mentorLeft');
                    resetRoomContent(roomName);
                } else {
                    socket.to(roomName).emit('userLeft', { socketId: socket.id, roomSize });

                    // Check if the room is now empty
                    if (roomSize === 0) {
                        resetRoomContent(roomName);
                    }
                }
            }
        }
    });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {}).then(() => {
    console.log('MongoDB connected');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});