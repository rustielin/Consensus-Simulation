const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const cors = require('cors'); // addition we make

// Express server config and listen
const port = process.env.PORT || 5000;
const server = app.listen(port);

// SocketIO config
const io = require('socket.io').listen(server);

// provide access to static SocketIO client
app.use('/socketio', express.static(__dirname + '/node_modules/socket.io-client/dist/'));
app.use(express.static(__dirname + '/public'));



// io.on('connection', socket => {

//   io.emit('user_join', socket.id);

//   // broadcast message to everyone
//   socket.on('message', msg => { 
//     console.log('message: ' + msg);

//     // TODO: boradcast only to those directly connected
//     // TODO: don't broadcast to selt, act on local data
//     // TODO: enable nodes to replay network state
//     // TODO: probably define these message headers as enums
//     io.emit('message', msg);
//   });

//   socket.on('peers', msg => { // accepting peers list from other node
//     var recipient = msg.recipient;
//     var peers = msg.peers;
//     console.log('got peers call, sending to ' + recipient);
//     io.to(recipient).emit('peers', peers);
//   });
// });

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/register/:id', function(req, res){
  var id = req.params.id;
  console.log('got id: ' + id);
  var nsp = io.of('/' + id);
  nsp.on('connection', function(socket){
    console.log('someone connected');

    socket.on('message', msg => {
      console.log('message: ' + msg);
      nsp.emit('message', msg);
    });

  });

  res.sendFile(__dirname + '/index.html');
});

// // An api endpoint that returns a short list of items
// app.get('/api/getList', (req, res) => {
//     var list = ["item1", "item2", "item3"];
//     res.json(list);
//     console.log('Sent list of items');
// });

// app.get('/id/:id', (req, res) => {
//   console.log(req.params.id);
//   io.on('connection', function(socket){
//     console.log('a user connected');
//     // socket.join(req.params.id);
//     // io.to(req.params.id).emit('joined wow');
//   });
// });


// io.on('network_event')

console.log('App is listening on port ' + port);
