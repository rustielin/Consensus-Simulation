console.log('Hello!!')
var socket_init = false

// var socket = io();
// $('form').submit(e => {
//     e.preventDefault(); // prevents page reloading
//     socket.emit('message', $('#m').val());
//     $('#m').val('');
//     return false;
// });
// socket.on('user_join', msg => {
//     $('#users').append($('<li>').text(msg));
// });
// socket.on('message', msg => {
//     $('#messages').append($('<li>').text(msg));
// });

var peers = []
var messages = []

$(function () {

    console.log("JQUERY LOAD");
    var socket = io();


    socket.on('user_join', msg => { // when new node joins, send it your peers
        console.log('id: ' + socket.id)
            
        if (socket.id !== msg) {
            console.log('sending peers to ' + msg);
            socket.emit('peers', {'recipient': msg, 'peers': peers.concat([socket.id])});
            peers.push(msg);
            $('#users').html(peers.join('<br>'))
        } else {
            $('#id').text(socket.id);
            $('#users').text(msg);
        }

        console.log(peers);
    });

    socket.on('message', msg => { // accepting general message from other node
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('peers', msg => { // accepting peers list from other node
        console.log('got new peers BEFORE FILTER')
        console.log(msg)
        let difference = msg.filter(x => peers.indexOf(x) < 0);
        console.log(difference);
        updateGraph(difference);
        peers.push.apply(peers, difference);
        console.log('got new peers AFTER FILTER')
        console.log(peers)
        $('#users').html(peers.join('<br>'))

    });

    // register the callback later
    $('form#form-id').submit(e => {
        e.preventDefault(); // prevents page reloading
        var room = $('input#input-id').val();
        console.log('GOT ROOM: ' + room);
        var socket = io();
        socket.emit('join', room)
        // socket.emit('', '' + socket.id + ': ' + $('#m').val());

        socket.on('message', msg => { // accepting general message from other node
          $('#messages').append($('<li>').text(msg));
        });

        // register the callback later
        $('form#form-message').submit(e => {
            e.preventDefault(); // prevents page reloading
            var m_obj = {
              id: socket.id,
              message: $('input#input-message').val(),
              room: room
            };
            socket.emit('message', m_obj);
            $('input#input-message').val('');
            return false;
        });

        return false;
    });
});