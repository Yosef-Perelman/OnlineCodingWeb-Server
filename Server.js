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


// 'contents' is a dictionary of codes of the code blocks
let contents = {};
// 'room' is a dictionary of users who are in a certain room
let rooms = {}
// 'mentors' is dictionary of the mentor of every open room
let mentors = {};


function getRoomSize(roomName) { return rooms[roomName] ? rooms[roomName].length : 0; }

async function getDataFromMongo(roomName) {
    try {
        console.log('Trying to pull information from mongo');
        const content = await Content.findOne({ title: roomName });

        if (content) {
            contents[roomName] = {
                initialCode: content.initialCode,
                solution: content.solution
            };
            return contents[roomName];
        } else {
            console.log('Didn\'t find the info in mongo. Check your spelling and database.' );
            return null;
        }
    } catch (err) {
        throw err;
    }
}

function originalRoomContent(roomName) {
    console.log('Removing the content from the dict because the room closed.');
    delete contents[roomName];
    delete rooms[roomName];
    delete mentors[roomName];
}


// Socket operations
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on('join', async (roomName) => {
        console.log(`\'join\' func activated. The room name is ${roomName}`);
        socket.join(roomName);

        let isMentor = false;
        if (!rooms[roomName]) {
            rooms[roomName] = [];
            mentors[roomName] = socket.id;
            isMentor = true;
        }
        rooms[roomName].push(socket.id);

        const roomSize = getRoomSize(roomName);

        if (!contents[roomName]) {
            try {
                const roomContent = await getDataFromMongo(roomName);
                if (roomContent) {
                    socket.emit('updateContent', roomContent.initialCode);
                } else {
                    socket.emit('updateContent', 'No content found for this room.');
                }
            } catch (error) {
                socket.emit('updateContent', 'An error occurred while fetching room content.');
            }
        } else {
            socket.emit('updateContent', contents[roomName].initialCode);
        }

        // Updates the new user with the current content of the editor
        socket.emit('roomInfo', { roomSize, isMentor });

        // Informs the other users that a new user has joined the room
        socket.to(roomName).emit('userJoined', { socketId: socket.id, roomSize });
    })

    socket.on('edit', (content, roomName) => {
        if (contents[roomName]) {
            contents[roomName].initialCode = content;
            io.to(roomName).emit('updateContent', content);

            if (content === contents[roomName].solution) {
                console.log('Some user found the solution.');
                io.to(roomName).emit('correctSolution');
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`User ${socket.id} left the room.`);
        for (let roomName in rooms) {
            const index = rooms[roomName].indexOf(socket.id);
            if (index !== -1) {
                rooms[roomName].splice(index, 1);
                const roomSize = getRoomSize(roomName);

                if (mentors[roomName] === socket.id) {
                    console.log('The user that left is the mentor. All the students moving to the home page.');
                    io.to(roomName).emit('mentorLeft');
                    originalRoomContent(roomName);
                } else {
                    socket.to(roomName).emit('userLeft', { socketId: socket.id, roomSize });

                    if (roomSize === 0) {
                        originalRoomContent(roomName);
                    }
                }
            }
        }
    });
});


// Configuration
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
mongoose.connect(process.env.MONGODB_URL, {}).then(() => {
    console.log('MongoDB connected');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});
