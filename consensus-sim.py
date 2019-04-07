from app import app
from flask_socketio import SocketIO, emit, join_room, leave_room, send
from flask import request

import sys

socketio = SocketIO(app)

@socketio.on('connect')
def on_connect():
    print("Connected")
    id = request.sid
    print("id: " + id)
    emit('user_join', id, broadcast=True)

@socketio.on('peers')
def handle_peers(data):
    recipient = data['recipient']
    peers = data['peers']
    print("Got peers call, sending to " + recipient)
    emit('peers', peers, room=recipient)

@socketio.on('join')
def handle_join(room):
    join_room(room)
    # send(id + ' has entered the room.', room=room)

@socketio.on('message')
def handle_message(data):
    print(data)
    id = data['id']
    message = data['message']
    room = data['room']
    emit('message', id + ": " + message, room=room)

if __name__ == '__main__':
    socketio.run(app)
