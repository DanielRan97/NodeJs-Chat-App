const socket = io();

let roomsArry = [];
let roomsSide = true;


//Elements
const $roomsList = document.querySelector('#roomslist');
const $roomsListUl = document.querySelector('#roomListUl');
const $showRoomsButton = document.querySelector('#showRoomsButton');
const $joinToRoomInput = document.getElementById('joinToRoomInput');

//Functions
socket.on('sendRooms', (rooms) => {
     roomsArry = [];
     roomsArry = rooms.rooms;
    if(roomsArry === []){
        return
    }
    getRooms();
});

const getRooms = () => { 
    $roomsListUl.innerHTML = '';
    roomsArry.forEach(room => {
    $roomsListUl.innerHTML += `<button type="button" id="selectRoomButton" 
    onclick="selectRoom('${room}')">${room}</button>`;
        }
        )}

$showRoomsButton.addEventListener('click', () => {
    if(roomsSide === true){
    roomsSide= false;
    roomsArry = [];
    $roomsListUl.innerHTML = '';
    }else{
    roomsSide = true
    socket.emit('getRooms');  
}
});

function selectRoom(roomName){

    $joinToRoomInput.value = roomName;
}









