const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const chalk = require('chalk');
const Filter = require('bad-words')
const {generateLocationMessage, generateMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUserInRoom, users } = require('./utils/users');
const {returnRooms, addRoom, removeRoom} = require('./utils/rooms');

const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const pulicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(pulicDirectoryPath));

io.on('connection', (socket) => {
  
    console.log(chalk.bold.white.inverse('New Websocket connection'));
   
    socket.on('join', (option, callback) => {
        const {error, user} = addUser({ id:socket.id, ...option });

        if(error){
            return callback(error);
        }

        socket.join(user.room);

       
    socket.emit('message', generateMessage(`${user.room}-room`,`Welcome to the chat ${user.username}`));

    socket.broadcast.to(user.room).emit('message', generateMessage(`${user.room}-room`,`${user.username} has joined`));
    io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUserInRoom(user.room)
    })
    addRoom(user.room);
    io.emit('sendRooms', {
        rooms: returnRooms()
    });

    callback();

    });

    socket.on('sendMessage', (message,callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();

        if(filter.isProfane(message)){
            return callback('Profane is not allowed!')
        }
        io.to(user.room).emit('message', generateMessage(user.username,message));
        callback();
    });
   
    socket.on('sendLocation', (location,callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://www.google.com/maps?q=${location.lat},${location.long}`));
        callback('Location shared');
    });

    socket.on('getRooms', () => {
        io.emit('sendRooms', {
            rooms: returnRooms()
        }
        )}
       );

    socket.on('disconnect', () => {
      const user = removeUser(socket.id);
      if(user){
        
        removeRoom(user.room);
        io.to(user.room).emit('message', generateMessage(`${user.room}-room`,`${user.username} has left`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
      }
    });
    io.emit('sendRooms', {
        rooms: returnRooms()
    })
});

server.listen(port, () => {
    console.log(chalk.green.bold.inverse(`Server is up on ${port}`));
});