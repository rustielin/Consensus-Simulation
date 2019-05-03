console.log('Hello!!!!!!!!!!@@@@@@@@@@')


var peers = []
var messages = []
var heartBeats = [] // tbh make a peer object and store all in metadata

const DEFL_VOT_POWER = 0.5

NODE_ID = 'invalid_id'

var updatePeers = () => {
  $('#peers').html('TOTAL: ' + peers.length + '<br>' + peers.join('<br>'))
  updateGraph(peers);
}

var addPeers = (new_peers) => {
    let difference = new_peers.filter(x => peers.indexOf(x) < 0);
    peers.push.apply(peers, difference);
}

$(function () {

    // var this_js_script = $('script[src*=comm]');
    // console.log('POWER GOTTEN: ' + this_js_script.attr('data-power'))

    console.log("JQUERY LOAD");
    register_socketio_callbacks();
    register_form_callbacks(); // jquery callbacks call socketio functions

});

// TODO: messy, but consensus also needs socket lmao
var register_consensus_worker = (socket) => {
    console.log("CONSENUS STARTINGGGG")

    // all nodes spinning until they can propose (see blockchain.js)
    var worker = new Worker('/static/js/worker.js');
    worker.addEventListener('message', function(e) {
        console.log(e.data);
    });
    worker.postMessage({start_worker: {
        id: NODE_ID,
        voting_power: DEFL_VOT_POWER
    }}); // DEFL

    // when server sends blockchain from another client
    socket.on('received_blockchain', msg => {

        // if proposing block, need to take current copy of the blockchain
        // call create block
        // publish it to all of my peers

        console.log('Propagating block');
        worker.postMessage({propogate_block: {
            blockchain: msg
        }});
        socket.emit('propagate_blockchain', msg); // at the same time, be accepting new chains
    });

    // worker.postMessage('stop_worker')
    // console.log('STOPPED WORKER')
}

/**
 * Handle HTML form calls, via jquery
 */
var register_form_callbacks = () => {
    // register the callback later
    $('form#form-join').submit(e => {
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
            // e.preventDefault(); // prevents page reloading
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
}

/**
 * Just all the socket.on(****) calls
 */
var register_socketio_callbacks = () => {
    var socket = io();

    socket.on('user_join', msg => { // when new node joins, send it your peers
        console.log('id: ' + socket.id);
        console.log('other id: ' + msg);
        if (socket.id !== msg) { // new node joined, so seed dialing procedure here
            console.log('sending peers to ' + msg);
            socket.emit('peers', {'recipient': msg, 'peers': peers});
        } else { // self
            $('#id').text(socket.id);
            NODE_ID = socket.id; // CAN ONLY GET HERE???
            register_consensus_worker(socket);
        }
        addPeers([msg]);
        updatePeers();
        console.log("GOT USER_JOIN PEERS: ", peers);
    });

    socket.on('message', msg => { // accepting general message from other node
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('peers', msg => { // accepting peers list from other node
        console.log('Peers call');
        console.log('Before filter')
        console.log(peers)
        let difference = msg.filter(x => peers.indexOf(x) < 0);
        peers.push.apply(peers, difference);
        console.log('got filtered peers')
        console.log(peers)
        updatePeers();
      });
}
