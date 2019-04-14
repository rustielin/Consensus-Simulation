console.log('Hello!!')


var peers = []
var messages = []
var heartBeats = [] // tbh make a peer object and store all in metadata

var updatePeers = () => {
  $('#peers').html('TOTAL: ' + peers.length + '<br>' + peers.join('<br>'))
  updateGraph(peers);
}

$(function () {

    console.log("JQUERY LOAD");
    var socket = io();

    socket.on('user_join', msg => { // when new node joins, send it your peers
        console.log('id: ' + socket.id);
        console.log('other id: ' + msg);
        if (socket.id !== msg) { // new node joined, so seed dialing procedure here
            console.log('sending peers to ' + msg);
            socket.emit('peers', {'recipient': msg, 'peers': peers.concat([socket.id])});
        } else { // self
            $('#id').text(socket.id);
        }
        peers.push(msg);
        updatePeers();
    });

    socket.on('message', msg => { // accepting general message from other node
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('peers', msg => { // accepting peers list from other node
        console.log('Peers call');
        let difference = msg.filter(x => peers.indexOf(x) < 0);
        peers.push.apply(peers, difference);
        console.log('got filtered peers')
        console.log(peers)
        updatePeers();
      });

    socket.on('received_blockchain', msg => {
    // when server sends blockchain from another client 

        // if proposing block, need to take current copy of the blockchain
        // call create block
        // publish it to all of my peers
        
        console.log('Propagating block');
        propogateBlock(msg);
        // at the same time, be accepting new chains 
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
