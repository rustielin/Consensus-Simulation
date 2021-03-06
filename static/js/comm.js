
/**
 * Just all the socket.on(****) calls
 */
var register_socketio_callbacks = () => {

    console.log("Register socketio callbacks...");

    // join a room if possible

    if (voting_power && simulation_id) {
        var obj = {
            'voting_power': voting_power,
            'simulation_id': simulation_id
        };
        socket.emit('join_sim_id', obj);
    }

    socket.on('user_join', msg => { // when new node joins, send it your peers
        console.log('id: ' + socket.id);
        console.log('other id: ' + msg);
        if (socket.id !== msg) { // new node joined, so seed dialing procedure here
            console.log('sending peers to ' + msg);
            var obj = {
                'recipient': msg,
                'peers': peers,
                'simulation_id': simulation_id
            };
            socket.emit('peers', obj);
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
        console.log("Got message yea! ", msg);
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('peers', msg => { // accepting peers list from other node
        let difference = msg.filter(x => peers.indexOf(x) < 0);
        peers.push.apply(peers, difference);
        updatePeers();
      });
};

// available in the global context
var socket = io();
register_socketio_callbacks();

var peers = [];
var messages = [];
var heartBeats = []; // tbh make a peer object and store all in metadata

const DEFL_VOT_POWER = 0.5;

NODE_ID = 'invalid_id';

var updatePeers = () => {
    $('#num-peers').html('Total: ' + peers.length);
    $('#peers-list').html(peers.join('<br>'))
    updateGraph(peers);
};

var addPeers = (new_peers) => {
    let difference = new_peers.filter(x => peers.indexOf(x) < 0);
    peers.push.apply(peers, difference);
};

$(function () {

    // var this_js_script = $('script[src*=comm]');
    // console.log('POWER GOTTEN: ' + this_js_script.attr('data-power'))

    console.log("JQUERY LOAD");
    register_form_callbacks(); // jquery callbacks call socketio functions
});

// TODO: messy, but consensus also needs socket lmao
var register_consensus_worker = (socket) => {
    // all nodes spinning until they can propose (see blockchain.js)
    var worker = new Worker('/static/js/worker.js');

    worker.addEventListener('message', function(e) {
        if (typeof e.data === 'string' || e.data instanceof String) {
            console.log(e.data);
        } else if ('blockchain' in e.data) {
            var proposeData = {
                proposer: socket.id,
                blockchain: e.data.blockchain,
                peersSeen: [],
                peersToPropagate: peers
            };
            animateProposal(socket.id);
            socket.emit('propose_blockchain', proposeData);
        } else if ('updated_blockchain' in e.data) {
            // AAAH SO UGLY!
            // console.log(e.data.updated_blockchain);
            let blocks = e.data.updated_blockchain.blocks;
            var id_str = '';
            for (var i = 0; i < blocks.length; i += 1) {
                id_str += "Block " + i + ": " + blocks[i].creator + "<br>";
            }
            let latestBlockCreator = blocks[blocks.length - 1].creator;
            console.log("UPDATING BLOCKCHAIN");
            if (e.data.changed) {
                animateProposal(latestBlockCreator);
            }
            $('#blockchain-display').html(id_str);
        } else {
            console.log(e.data);
        }
    });
    worker.postMessage({start_worker: {
        id: NODE_ID,
        voting_power: voting_power,
        // peers: peers,
    }}); // DEFL
    // Not too clean, but each Worker thread needs to keep the socket/peers of the node.

    // when server sends blockchain from another client
    socket.on('received_blockchain', data => {

        // if proposing block, need to take current copy of the blockchain
        // call create block
        // publish it to all of my peers
        // my name justin
        let chain = data.blockchain;
        let proposer = data.proposer;
        var peersToExclude = data.peersSeen;
        // console.log('Propagating block...');
        // Don't propagate to peers that have already seen the block.
        let filteredPeers = peers.filter(x => peersToExclude.indexOf(x) < 0);
        // Keep track of all peers that have already been propogated to.
        peersToExclude.push.apply(peersToExclude, filteredPeers);
        let msg = {
            proposer: proposer,
            blockchain: chain,
            peersSeen: peersToExclude,
            peersToPropagate: filteredPeers
        };
        // console.log("PEERS TO EXCLUDE: ");
        // console.log(peersToExclude);
        // console.log("PEERS TO PROPAGATE: ");
        // console.log(filteredPeers);
        // console.log("CURRENT BLOCKCHAIN FOR " + NODE_ID + ": ");
        // console.log(chain);
        worker.postMessage({propagate_block: msg});
        socket.emit('propagate_blockchain', msg); // at the same time, be accepting new chains
    });

    // worker.postMessage('stop_worker')
    // console.log('STOPPED WORKER')
}

/**
 * Handle HTML form calls, via jquery
 */
var register_form_callbacks = () => {

    console.log("Registering form callbacks...");

     // register the callback later
     $('form#form-message').submit(e => {
        e.preventDefault(); // prevents page reloading
        var m_obj = {
          id: socket.id,
          message: $('input#input-message').val(),
          room: simulation_id
        };
        socket.emit('message', m_obj);
        $('input#input-message').val('');
        return false;
    });

    // // register the callback later
    // $('form#form-join').submit(e => {
    //     e.preventDefault(); // prevents page reloading
    //     var room = $('input#input-id').val();
    //     console.log('GOT ROOM: ' + room);
    //     socket.emit('join_sim_id', room)
    //     // socket.emit('', '' + socket.id + ': ' + $('#m').val());

    //     socket.on('message', msg => { // accepting general message from other node
    //       $('#messages').append($('<li>').text(msg));
    //     });

    //     return false;
    // });
}
