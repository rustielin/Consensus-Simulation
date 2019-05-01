from flask_socketio import SocketIO, emit, join_room, leave_room, send
from flask import Flask, request, render_template

import sys

app = Flask(__name__)

socketio = SocketIO(app)

DEFL_INST = 'abc123' # default simulation instance
power_map = {}
power_map[DEFL_INST] = 0 # TODO: will have to adjust everyone's power on new nodes

@app.route('/')
def index():
    power = request.args.get('power')

    # TODO: find a better way to do this
    defl_fail = 'Invalid voting power, specify FLOAT leq 1: hostname?power=0.001'

    try: # invalid power
        if not power: # no power
            return defl_fail
        power = float(power)
        if power >= 1:
            return defl_fail
    except ValueError:
        return defl_fail

    return render_template('index.html', title='Home', power=power)

@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    response.headers['Cache-Control'] = 'public, max-age=0'
    return response

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
    print("Got peers call, sending to " + recipient + " with data " + str(peers))
    emit('peers', peers, room=recipient)

@socketio.on('join')
def handle_join(room):
    join_room(room)
    # send(id + ' has entered the room.', room=room)

@socketio.on('propagate_blockchain')
def handle_propagate_blockchain(blockchain):
    '''
    Basically just a message handler. Forwards the entire blockchain between nodes
    '''
    emit('received_blockchain', blockchain, broadcast=True)


@socketio.on('message')
def handle_message(data):
    print(data)
    id = data['id']
    message = data['message']
    room = data['room']
    emit('message', id + ": " + message, room=room)

if __name__ == '__main__':
    socketio.run(app)
