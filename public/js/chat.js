const socket = io();

//Elemntes
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTamplate = document.querySelector('#location-message-template').innerHTML;
const sideBarTemplate = document.querySelector('#side-bar-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    //New message
    const $newMessage = $messages.lastElementChild;

    //height of the new message
    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin ;

    //Visible height
    const visibleHeight = $messages.offsetHeight;

    //Hieght of messages container
    const containerHieght = $messages.scrollHeight;

    //Hoe far have i scroll
    const scrollOffSet =  $messages.scrollTop + visibleHeight;

    if(containerHieght - newMessageHeight <= scrollOffSet){
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        messagecreatedAt: moment(message.createdAt).format('H:mm')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('locationMessage', (message) => {
 
    const html = Mustache.render(locationMessageTamplate, {
        username:message.username,
        url: message.url,
        locationcreatedAt: moment(message.createdAt).format('H:mm')
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('roomData',({room,users}) => {
    const html = Mustache.render(sideBarTemplate,{
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
  
    $messageFormButton.setAttribute('disabled', 'disabled');//disable form button
   
    const message = e.target.elements.clientMessage.value;
    socket.emit('sendMessage', message,(error) => {
        $messageFormButton.removeAttribute('disabled');//enable form button
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if(error){
            return console.error(error);
        }

    });
    
});

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by yout browser!');
    }

    $sendLocationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((location) =>{
        const position = {
            lat: location.coords.latitude,
            long: location.coords.longitude
        } 
        socket.emit('sendLocation', position, (msg) => {
            $sendLocationButton.removeAttribute('disabled');
        })
    })
});

socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error);
        location.href = '/';
    }
});