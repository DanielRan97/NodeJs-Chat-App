const {getUserInRoom} = require('./users');

const rooms = [];

const addRoom = (roomName) => {

    if(rooms.includes(roomName)){
        return 'This room is in use'
    }

    rooms.push(roomName);
}

const removeRoom = (roomName) => {
    const getUsers = getUserInRoom(roomName);

    if(getUsers.error){
        
        const index = rooms.findIndex((room) => room === roomName);

        if(index !== -1){
            return rooms.splice(index, 1)[0];
        }
    }
}

const returnRooms = () => {
    return rooms;
}


module.exports = {
    returnRooms,
    addRoom,
    removeRoom
}