from flask_socketio import SocketIO, emit, join_room, leave_room, send
from flask import Flask, request, render_template

import sys

app = Flask(__name__)

socketio = SocketIO(app)

power_map = {} # track aggregate power in each

# recalculate the total power in a simulation instance
def update_power_map(sim_id, node_id, power):
    if sim_id not in power_map:
        power_map[sim_id] = {}
    power_map[sim_id][node_id] = power

# return the total voting power in a simulation instance
def get_total_sim_power(sim_id):
    if sim_id not in power_map:
        return -1
    return sum(power_map[sim_id].values())

@app.route('/')
def index():
    power = request.args.get('power')
    sim_id = request.args.get('sim_id')

    # # TODO: find a better way to do this
    # defl_fail = 'Invalid voting power, specify FLOAT leq 1: hostname?power=0.001'

    # try: # invalid power
    #     if not power: # no power
    #         return defl_fail
    #     power = float(power)
    #     if power >= 1:
    #         return defl_fail
    # except ValueError:
    #     return defl_fail

    return render_template('index.html', title='Home', power=power, sim_id=sim_id)

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
    # emit('user_join', id, broadcast=True)

@socketio.on('disconnect')
def on_disconnect():
    """
    Mainly want to remove entries in power map
    """
    print("DISCONNECTING: " + str(request.sid))

    sim_ids = set() # keep a set of affected simulations
    for sim_id in power_map: # search the power map for membership in simulations
        d = power_map[sim_id]
        if request.sid in d:
            sim_ids.add(sim_id)
            del power_map[sim_id][request.sid]

    print("AFFECTED SIMS: ")
    print(sim_ids)

    for sim in sim_ids:
        emit('power_update', get_total_sim_power(sim), broadcast=True, room=sim)


@socketio.on('peers')
def handle_peers(data):
    recipient = data['recipient']
    peers = data['peers']
    simulation_id = data['simulation_id']
    print("Got peers call, sending to " + recipient + "of sim_id: " + str(simulation_id) + "  with data " + str(peers))
    emit('peers', peers, room=recipient)

@socketio.on('join_sim_id')
def handle_sim_join(data):
    vot_pwr = float(data['voting_power'])
    simulation_id = data['simulation_id']
    join_room(simulation_id)
    emit('user_join', request.sid, broadcast=True, room=simulation_id)
    update_power_map(simulation_id, request.sid, vot_pwr)
    emit('power_update', get_total_sim_power(simulation_id), broadcast=True, room=simulation_id)

@socketio.on('propose_blockchain')
def handle_propose_blockchain(data):
    '''
    Routes proposed blockchain to all the peers of of a node.
    '''
    print("HANDLING PROPOSE BLOCKCHAIN")
    blockchain = data['blockchain']
    peers = data['peers']
    print(blockchain, peers)
    for peer in peers:
        # Send to each peer individiually.
        emit('received_blockchain', blockchain, room=peer)

@socketio.on('propagate_blockchain')
def handle_propagate_blockchain(blockchain):
    '''
    Basically just a message handler. Forwards the entire blockchain between nodes
    '''
    emit('received_blockchain', blockchain, broadcast=True)

@socketio.on('message')
def handle_message(data):
    id = data['id']
    message = data['message']
    room = data['room']
    emit('message', id + ": " + message, room=room)


if __name__ == '__main__':
    socketio.run(app)
